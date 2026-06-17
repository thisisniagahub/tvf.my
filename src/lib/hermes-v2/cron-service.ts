/**
 * HERMES v2 Cron Automation Service
 * --------------------------------
 * Natural-language → cron-expression parser plus a thin persistence
 * layer over the `HermesCronJob` Prisma model.
 *
 * The actual scheduling is "fire and forget" — we persist the job and
 * expose a manual `executeJob` endpoint. In production, a Vercel Cron
 * or external scheduler would invoke `/api/hermes/cron/execute` on the
 * schedule derived from `cronExpression`.
 */

import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

// ============== Types ==============

export interface CronJobConfig {
  userId?: string
  name: string
  description: string
  schedule: string // Natural language OR cron expression
  skills: string[] // Skill IDs
  deliverTo?: 'chat' | 'notification' | 'email'
}

export interface CronJobRecord {
  id: string
  userId: string
  name: string
  description: string
  schedule: string
  cronExpression: string | null
  skills: string[]
  status: 'active' | 'paused' | 'running'
  lastRun: string | null
  nextRun: string | null
  runCount: number
  deliverTo: 'chat' | 'notification' | 'email'
  createdAt: string
  updatedAt: string
}

export interface CronExecutionResult {
  jobId: string
  success: boolean
  result: string
  deliveredTo: 'chat' | 'notification' | 'email'
  executedAt: string
}

// ============== Schedule Parsing ==============

/**
 * Parse a natural-language schedule string into a 5-field cron
 * expression. Returns `null` if the input cannot be parsed.
 *
 * Supported formats:
 *  - "every 30m" / "every 2h" / "every 6h"
 *  - "daily 9am" / "daily 9:00" / "daily 09:30"
 *  - "weekly monday 9am" / "weekly friday 14:00"
 *  - "0 9 * * *"  (raw cron expression — pass-through)
 */
export function parseSchedule(nl: string): string | null {
  if (!nl || typeof nl !== 'string') return null
  const input = nl.trim().toLowerCase()

  // --- Pass-through: already a cron expression ----------------------
  // 5 whitespace-separated fields, each composed of cron-legal chars.
  const cronField = /^[\d*/,-]+$/
  const parts = input.split(/\s+/)
  if (parts.length === 5 && parts.every((p) => cronField.test(p))) {
    return input
  }

  // --- "every Nm" / "every Nh" / "every Nd" -------------------------
  const everyMatch = input.match(/^every\s+(\d+)\s*([mhd])$/)
  if (everyMatch) {
    const n = parseInt(everyMatch[1], 10)
    const unit = everyMatch[2]
    if (unit === 'm') {
      // Every N minutes
      if (n < 1 || n > 59) return null
      return `*/${n} * * * *`
    }
    if (unit === 'h') {
      // Every N hours, on the hour
      if (n < 1 || n > 23) return null
      return `0 */${n} * * *`
    }
    // Every N days, at midnight
    if (n < 1 || n > 30) return null
    return `0 0 */${n} * *`
  }

  // --- "every minute" / "every hour" / "every day" ------------------
  if (input === 'every minute') return '* * * * *'
  if (input === 'every hour') return '0 * * * *'
  if (input === 'every day') return '0 0 * * *'

  // --- "daily HH:MM" / "daily Ham" / "daily Hpm" --------------------
  const dailyMatch = input.match(
    /^daily\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/
  )
  if (dailyMatch) {
    let hour = parseInt(dailyMatch[1], 10)
    const minute = dailyMatch[2] ? parseInt(dailyMatch[2], 10) : 0
    const meridiem = dailyMatch[3]
    if (meridiem === 'pm' && hour < 12) hour += 12
    if (meridiem === 'am' && hour === 12) hour = 0
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
    return `${minute} ${hour} * * *`
  }

  // --- "weekly <day> HH:MM(am|pm)" ----------------------------------
  const dayMap: Record<string, number> = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6,
  }
  const weeklyMatch = input.match(
    /^weekly\s+([a-z]+)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/
  )
  if (weeklyMatch) {
    const dayName = weeklyMatch[1]
    const dow = dayMap[dayName]
    if (dow === undefined) return null
    let hour = parseInt(weeklyMatch[2], 10)
    const minute = weeklyMatch[3] ? parseInt(weeklyMatch[3], 10) : 0
    const meridiem = weeklyMatch[4]
    if (meridiem === 'pm' && hour < 12) hour += 12
    if (meridiem === 'am' && hour === 12) hour = 0
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
    return `${minute} ${hour} * * ${dow}`
  }

  return null
}

/**
 * Compute the next run timestamp from a cron expression using a
 * simple iterative search. We probe minute-by-minute starting from
 * "now + 1 minute" up to 7 days ahead; if no match is found we
 * return `null`. This is intentionally simple — for full cron
 * semantics (L, W, #) the production deployment should rely on
 * Vercel Cron's scheduler.
 */
export function computeNextRun(cronExpr: string, from: Date = new Date()): Date | null {
  const fields = cronExpr.trim().split(/\s+/)
  if (fields.length !== 5) return null

  const parseField = (field: string, min: number, max: number): Set<number> => {
    const values = new Set<number>()
    if (field === '*') {
      for (let v = min; v <= max; v++) values.add(v)
      return values
    }
    // Handle step: "*/N"
    const stepMatch = field.match(/^\*\/(\d+)$/)
    if (stepMatch) {
      const step = parseInt(stepMatch[1], 10)
      for (let v = min; v <= max; v += step) values.add(v)
      return values
    }
    // Handle range: "1-5"
    const rangeMatch = field.match(/^(\d+)-(\d+)$/)
    if (rangeMatch) {
      const lo = parseInt(rangeMatch[1], 10)
      const hi = parseInt(rangeMatch[2], 10)
      for (let v = lo; v <= hi; v++) values.add(v)
      return values
    }
    // Handle comma list: "1,3,5"
    if (field.includes(',')) {
      for (const part of field.split(',')) {
        const n = parseInt(part, 10)
        if (!Number.isNaN(n)) values.add(n)
      }
      return values
    }
    // Single value
    const n = parseInt(field, 10)
    if (!Number.isNaN(n)) values.add(n)
    return values
  }

  const minutes = parseField(fields[0], 0, 59)
  const hours = parseField(fields[1], 0, 23)
  const doms = parseField(fields[2], 1, 31)
  const months = parseField(fields[3], 1, 12)
  const dows = parseField(fields[4], 0, 6)

  // Skip ahead in 1-minute increments, max 7 days = 10080 mins
  const cursor = new Date(from.getTime() + 60 * 1000)
  cursor.setSeconds(0, 0)
  const limit = 7 * 24 * 60
  for (let i = 0; i < limit; i++) {
    if (
      minutes.has(cursor.getUTCMinutes()) &&
      hours.has(cursor.getUTCHours()) &&
      doms.has(cursor.getUTCDate()) &&
      months.has(cursor.getUTCMonth() + 1) &&
      dows.has(cursor.getUTCDay())
    ) {
      return new Date(cursor.getTime())
    }
    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1)
  }
  return null
}

// ============== Serialization Helpers ==============

interface CronJobRow {
  id: string
  userId: string
  name: string
  description: string
  schedule: string
  cronExpression: string | null
  skills: string
  status: string
  lastRun: Date | null
  nextRun: Date | null
  runCount: number
  deliverTo: string
  createdAt: Date
  updatedAt: Date
}

function rowToRecord(row: CronJobRow): CronJobRecord {
  let skills: string[] = []
  try {
    const parsed = JSON.parse(row.skills)
    if (Array.isArray(parsed)) skills = parsed.map(String)
  } catch {
    skills = []
  }
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    schedule: row.schedule,
    cronExpression: row.cronExpression,
    skills,
    status: row.status as CronJobRecord['status'],
    lastRun: row.lastRun ? row.lastRun.toISOString() : null,
    nextRun: row.nextRun ? row.nextRun.toISOString() : null,
    runCount: row.runCount,
    deliverTo: row.deliverTo as CronJobRecord['deliverTo'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

// ============== Public Service API ==============

/**
 * Create + persist a new cron job. Returns the persisted record
 * (including the parsed `cronExpression` and computed `nextRun`).
 */
export async function scheduleJob(
  config: CronJobConfig
): Promise<CronJobRecord> {
  const cronExpression = parseSchedule(config.schedule)
  if (!cronExpression) {
    throw new Error(
      `Could not parse schedule: "${config.schedule}". ` +
        'Supported formats: "every 2h", "daily 9am", "weekly monday 9am", or a 5-field cron expression.'
    )
  }
  const nextRun = computeNextRun(cronExpression) ?? undefined

  const created = await db.hermesCronJob.create({
    data: {
      userId: config.userId ?? 'demo-user',
      name: config.name,
      description: config.description,
      schedule: config.schedule,
      cronExpression,
      skills: JSON.stringify(config.skills ?? []),
      deliverTo: config.deliverTo ?? 'chat',
      nextRun,
    },
  })

  logger.info('Cron job scheduled', {
    jobId: created.id,
    name: created.name,
    cronExpression,
    nextRun: nextRun?.toISOString() ?? null,
  })

  return rowToRecord(created as unknown as CronJobRow)
}

/**
 * Mark an existing job as active and recompute its nextRun timestamp.
 * Actual cron execution would be handled by an external scheduler
 * (Vercel Cron, etc.) calling `/api/hermes/cron/execute`.
 */
export async function activateJob(jobId: string): Promise<CronJobRecord> {
  const existing = await db.hermesCronJob.findUnique({ where: { id: jobId } })
  if (!existing) throw new Error(`Cron job not found: ${jobId}`)
  if (!existing.cronExpression) {
    throw new Error('Cannot activate job without a parsed cron expression')
  }
  const nextRun = computeNextRun(existing.cronExpression) ?? undefined
  const updated = await db.hermesCronJob.update({
    where: { id: jobId },
    data: { status: 'active', nextRun },
  })
  return rowToRecord(updated as unknown as CronJobRow)
}

/**
 * Execute a cron job: load its skills, call HERMES AI with a synthesized
 * prompt, and deliver the result. This is the function an external
 * scheduler (Vercel Cron) would invoke.
 *
 * The implementation is intentionally defensive — AI failures fall back
 * to a templated summary so the cron schedule remains observable even
 * if the upstream model is unavailable.
 */
export async function executeJob(
  jobId: string
): Promise<CronExecutionResult> {
  const job = await db.hermesCronJob.findUnique({ where: { id: jobId } })
  if (!job) throw new Error(`Cron job not found: ${jobId}`)

  // Mark as running
  await db.hermesCronJob.update({
    where: { id: jobId },
    data: { status: 'running' },
  })

  let skills: string[] = []
  try {
    const parsed = JSON.parse(job.skills)
    if (Array.isArray(parsed)) skills = parsed.map(String)
  } catch {
    skills = []
  }

  const prompt =
    `You are HERMES executing a scheduled automation task.\n` +
    `Task Name: ${job.name}\n` +
    `Description: ${job.description}\n` +
    `Skills to apply: ${skills.length ? skills.join(', ') : 'general'}\n` +
    `Scheduled: ${job.schedule} (cron: ${job.cronExpression ?? 'unknown'})\n\n` +
    `Produce a concise, actionable summary for the Malaysian Shopee affiliate market. ` +
    `Keep it under 200 words. Use bullet points where appropriate.`

  let result: string
  let success: boolean
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are HERMES, an AI assistant for TheViralFindsMY — an AI-powered ' +
            'affiliate marketing platform for the Malaysian Shopee market.',
        },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    })
    result =
      completion.choices[0]?.message?.content ??
      `Scheduled task "${job.name}" executed with no output.`
    success = true
  } catch (aiError) {
    logger.warn('Cron job AI unavailable, using fallback summary', {
      jobId,
      error: aiError instanceof Error ? aiError.message : 'unknown',
    })
    result =
      `Scheduled task "${job.name}" ran at ${new Date().toISOString()}.\n` +
      `Description: ${job.description}\n` +
      `Skills: ${skills.length ? skills.join(', ') : 'none'}\n` +
      `Note: AI service was unavailable — this is a static fallback summary.`
    success = false
  }

  const now = new Date()
  const nextRun = job.cronExpression ? computeNextRun(job.cronExpression, now) ?? undefined : undefined

  await db.hermesCronJob.update({
    where: { id: jobId },
    data: {
      status: 'active',
      lastRun: now,
      nextRun,
      runCount: { increment: 1 },
    },
  })

  logger.info('Cron job executed', {
    jobId,
    name: job.name,
    success,
    runCount: job.runCount + 1,
    deliverTo: job.deliverTo,
  })

  return {
    jobId,
    success,
    result,
    deliveredTo: job.deliverTo as 'chat' | 'notification' | 'email',
    executedAt: now.toISOString(),
  }
}

/**
 * List all cron jobs for a user, newest first.
 */
export async function getJobs(userId: string = 'demo-user'): Promise<CronJobRecord[]> {
  const rows = await db.hermesCronJob.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((r) => rowToRecord(r as unknown as CronJobRow))
}

/**
 * Get a single cron job by ID.
 */
export async function getJob(jobId: string): Promise<CronJobRecord | null> {
  const row = await db.hermesCronJob.findUnique({ where: { id: jobId } })
  if (!row) return null
  return rowToRecord(row as unknown as CronJobRow)
}

/**
 * Update a cron job's status — supports 'active' | 'paused'.
 * When resuming, the nextRun timestamp is recomputed.
 */
export async function updateJobStatus(
  jobId: string,
  status: 'active' | 'paused'
): Promise<CronJobRecord> {
  const existing = await db.hermesCronJob.findUnique({ where: { id: jobId } })
  if (!existing) throw new Error(`Cron job not found: ${jobId}`)

  const nextRun =
    status === 'active' && existing.cronExpression
      ? computeNextRun(existing.cronExpression) ?? undefined
      : null

  const updated = await db.hermesCronJob.update({
    where: { id: jobId },
    data: { status, nextRun },
  })

  logger.info('Cron job status updated', { jobId, status })
  return rowToRecord(updated as unknown as CronJobRow)
}

/**
 * Delete a cron job permanently.
 */
export async function deleteJob(jobId: string): Promise<void> {
  await db.hermesCronJob.delete({ where: { id: jobId } })
  logger.info('Cron job deleted', { jobId })
}
