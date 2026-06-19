export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, createCronJobSchema } from '@/lib/validation'
import {
  scheduleJob,
  getJobs,
  type CronJobConfig,
} from '@/lib/hermes-v2/cron-service'
import { requireUser } from '@/lib/auth'

/**
 * HERMES v2 Cron Automation API
 *
 * GET  /api/hermes/cron
 *      Lists cron jobs for the authenticated user (demo mode → 'demo-user').
 *
 * POST /api/hermes/cron
 *      Body: { name, description, schedule, skills?, deliverTo? }
 *      Creates a new cron job. `schedule` is parsed via the natural-language
 *      parser (`parseSchedule`). Returns the created job including the
 *      computed `cronExpression` and `nextRun` timestamp.
 *
 * The user is resolved server-side via `requireUser()` — any `userId`
 * in the body or query string is ignored to prevent cross-user access.
 *
 * All endpoints are rate-limited at the standard API tier.
 */

const DEFAULT_USER_ID = 'demo-user'

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-cron-get')
  if (limited) return limited

  try {
    // Auth: resolve the user server-side — any `userId` query param is
    // ignored to prevent cross-user access.
    const user = await requireUser()
    const userId = user.id || DEFAULT_USER_ID

    const jobs = await getJobs(userId)

    return NextResponse.json({
      userId,
      jobs,
      count: jobs.length,
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes cron GET',
      'Failed to fetch cron jobs'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-cron-post')
  if (limited) return limited

  try {
    const body = await request.json()
    const validation = validateInput(createCronJobSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { name, description, schedule, skills, deliverTo } =
      validation.data

    const user = await requireUser()
    const userId = user.id || DEFAULT_USER_ID

    const config: CronJobConfig = {
      userId,
      name,
      description,
      schedule,
      skills,
      deliverTo,
    }

    const job = await scheduleJob(config)

    logger.info('Cron job created via API', {
      jobId: job.id,
      name: job.name,
      cronExpression: job.cronExpression,
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    // Surface "could not parse schedule" errors as 400 (client error),
    // everything else as 500 via handleApiError.
    if (error instanceof Error && error.message.startsWith('Could not parse')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    const { error: msg, status } = handleApiError(
      error,
      'Hermes cron POST',
      'Failed to create cron job'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
