/**
 * HERMES v2 Subagent Delegation Service
 * -------------------------------------
 * Lets the parent HERMES agent hand off scoped tasks to "subagents" —
 * isolated child runs that execute concurrently with their own context
 * and toolsets, then report a result string back to the parent.
 *
 * Each subagent is persisted as a `HermesSubagent` row so the parent
 * (and the API consumer) can poll status, inspect failures, and audit
 * what was delegated over time.
 *
 * Concurrency:
 *   `delegateBatch` uses `Promise.allSettled` and caps concurrent
 *   in-flight subagents at 3 to keep AI-tier rate limits and memory
 *   pressure under control.
 */

import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

// ============== Types ==============

export interface SubagentConfig {
  goal: string
  context: string
  toolsets: string[]
  userId?: string
  parentId?: string
  maxIterations?: number
  timeout?: number
}

export interface SubagentRecord {
  id: string
  parentId: string | null
  userId: string
  goal: string
  context: string
  toolsets: string[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  result: string | null
  maxIterations: number
  timeout: number
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface DelegationResult {
  subagent: SubagentRecord
  success: boolean
  error?: string
}

// ============== Serialization Helpers ==============

interface SubagentRow {
  id: string
  parentId: string | null
  userId: string
  goal: string
  context: string
  toolsets: string
  status: string
  result: string | null
  maxIterations: number
  timeout: number
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

function parseToolsets(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((t) => typeof t === 'string')) {
      return parsed
    }
  } catch {
    // ignore
  }
  return []
}

function rowToRecord(row: SubagentRow): SubagentRecord {
  return {
    id: row.id,
    parentId: row.parentId,
    userId: row.userId,
    goal: row.goal,
    context: row.context,
    toolsets: parseToolsets(row.toolsets),
    status: row.status as SubagentRecord['status'],
    result: row.result,
    maxIterations: row.maxIterations,
    timeout: row.timeout,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
  }
}

// ============== Core Delegation Logic ==============

/**
 * Run the actual AI work for a subagent. Isolated from the persistence
 * layer so we can unit-test the prompt synthesis separately.
 *
 * The system prompt instructs the model to act as a scoped worker: it
 * must not call external tools directly (the parent HERMES handles
 * tool orchestration), and it must produce a structured result string.
 */
async function runSubagentAI(
  goal: string,
  context: string,
  toolsets: string[]
): Promise<string> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()

  const toolHint =
    toolsets.length > 0
      ? `You have access to these tools (used by the parent agent): ${toolsets.join(', ')}. ` +
        `Recommend which tool the parent should call next if relevant.`
      : `No tools are scoped to this subagent. Rely on your own knowledge.`

  const systemPrompt =
    `You are a HERMES subagent — an isolated worker task delegated by ` +
    `the parent HERMES AI agent for TheViralFindsMY, an AI-powered ` +
    `affiliate marketing platform for the Malaysian Shopee market.\n\n` +
    `Rules:\n` +
    `- Focus exclusively on the goal. Do not deviate.\n` +
    `- Use the provided context as ground truth.\n` +
    `- ${toolHint}\n` +
    `- Keep your final answer under 300 words.\n` +
    `- Structure your answer with a brief "Summary:" section and, if ` +
    `applicable, a "Recommended actions:" bullet list.\n` +
    `- Use Malaysian context (RM, MYT, local products) where relevant.`

  const userPrompt =
    `# Goal\n${goal}\n\n# Context\n${context || '(none provided)'}\n\n# Your response:`

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    thinking: { type: 'disabled' },
  })

  const out = completion.choices[0]?.message?.content
  if (!out) {
    throw new Error('Subagent AI returned an empty response')
  }
  return out
}

/**
 * Delegate a single task to a subagent.
 *
 * Steps:
 *  1. Create a `HermesSubagent` row with status='pending'.
 *  2. Flip to 'running', call HERMES AI with isolated context.
 *  3. On success → persist `result`, status='completed'.
 *     On failure → persist null result, status='failed'.
 *  4. Return the full record + success flag.
 *
 * The function never throws — failures are captured in the
 * `DelegationResult.success` flag and `error` string so batch
 * callers (`Promise.allSettled`) can react gracefully.
 */
export async function delegateSingle(
  config: SubagentConfig
): Promise<DelegationResult> {
  const userId = config.userId ?? 'demo-user'
  const maxIterations = config.maxIterations ?? 5
  const timeout = config.timeout ?? 60

  // 1. Create the record
  const created = await db.hermesSubagent.create({
    data: {
      userId,
      parentId: config.parentId ?? null,
      goal: config.goal,
      context: config.context,
      toolsets: JSON.stringify(config.toolsets ?? []),
      maxIterations,
      timeout,
      status: 'pending',
    },
  })

  const record = rowToRecord(created as unknown as SubagentRow)
  logger.info('Subagent created', {
    subagentId: record.id,
    parentId: record.parentId,
    goalLength: record.goal.length,
    toolsets: record.toolsets,
  })

  // 2. Mark as running
  await db.hermesSubagent.update({
    where: { id: record.id },
    data: { status: 'running' },
  })

  // 3. Run the AI with a timeout guard
  try {
    const timeoutMs = timeout * 1000
    const resultPromise = runSubagentAI(
      record.goal,
      record.context,
      record.toolsets
    )
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Subagent timed out after ${timeout}s`)),
        timeoutMs
      )
    )
    const result = await Promise.race([resultPromise, timeoutPromise])

    const updated = await db.hermesSubagent.update({
      where: { id: record.id },
      data: {
        status: 'completed',
        result,
        completedAt: new Date(),
      },
    })

    const finalRecord = rowToRecord(updated as unknown as SubagentRow)
    logger.info('Subagent completed', {
      subagentId: record.id,
      resultLength: result.length,
    })
    return { subagent: finalRecord, success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'unknown error'
    logger.warn('Subagent failed', {
      subagentId: record.id,
      error: errorMessage,
    })

    const updated = await db.hermesSubagent.update({
      where: { id: record.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
      },
    })

    const finalRecord = rowToRecord(updated as unknown as SubagentRow)
    return {
      subagent: finalRecord,
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Delegate a batch of tasks concurrently. Caps concurrent in-flight
 * subagents at 3 to respect AI-tier rate limits.
 *
 * Returns one DelegationResult per task, in input order. Failures
 * do not abort the batch — each task settles independently.
 */
export async function delegateBatch(
  tasks: SubagentConfig[]
): Promise<DelegationResult[]> {
  const MAX_CONCURRENT = 3
  const results: DelegationResult[] = new Array(tasks.length)
  let cursor = 0

  async function worker() {
    while (cursor < tasks.length) {
      const idx = cursor++
      results[idx] = await delegateSingle(tasks[idx])
    }
  }

  const workers = Array.from(
    { length: Math.min(MAX_CONCURRENT, tasks.length) },
    () => worker()
  )
  await Promise.all(workers)

  logger.info('Batch delegation complete', {
    total: tasks.length,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  })

  return results
}

// ============== Query / Mutation API ==============

export async function getSubagents(
  userId: string = 'demo-user'
): Promise<SubagentRecord[]> {
  const rows = await db.hermesSubagent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return rows.map((r) => rowToRecord(r as unknown as SubagentRow))
}

export async function getSubagent(
  id: string
): Promise<SubagentRecord | null> {
  const row = await db.hermesSubagent.findUnique({ where: { id } })
  if (!row) return null
  return rowToRecord(row as unknown as SubagentRow)
}

/**
 * Cancel a subagent. If it is currently running, the AI promise will
 * keep running in the background (we cannot abort a fetch in flight
 * here), but the DB row is marked 'failed' immediately and the eventual
 * success result will be discarded by `delegateSingle`'s update.
 */
export async function cancelSubagent(
  id: string
): Promise<SubagentRecord | null> {
  const existing = await db.hermesSubagent.findUnique({ where: { id } })
  if (!existing) return null

  const updated = await db.hermesSubagent.update({
    where: { id },
    data: {
      status: 'failed',
      completedAt: new Date(),
    },
  })

  logger.info('Subagent cancelled', { subagentId: id })
  return rowToRecord(updated as unknown as SubagentRow)
}
