import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, executeCronJobSchema } from '@/lib/validation'
import { executeJob } from '@/lib/hermes-v2/cron-service'

/**
 * HERMES v2 Cron — Manual Execution Endpoint
 *
 * POST /api/hermes/cron/execute
 *      Body: { jobId }
 *      Manually triggers a cron job's execution pipeline:
 *        1. Load the job (mark status='running').
 *        2. Synthesize a HERMES AI prompt from the job's name/description/skills.
 *        3. Call z-ai-web-dev-sdk to produce a result.
 *        4. Persist lastRun/runCount/nextRun, return the result.
 *
 *      AI failures fall back to a templated summary so the cron
 *      schedule remains observable even when the upstream model is
 *      unavailable.
 *
 * Rate-limited at the AI tier (10 req/min) because each call
 * triggers a chat completion.
 */

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(
    request,
    RATE_LIMITS.ai,
    'hermes-cron-execute'
  )
  if (limited) return limited

  try {
    const body = await request.json()
    const validation = validateInput(executeCronJobSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const result = await executeJob(validation.data.jobId)

    logger.info('Cron job executed via API', {
      jobId: result.jobId,
      success: result.success,
      deliverTo: result.deliveredTo,
    })

    return NextResponse.json({ result })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    const { error: msg, status } = handleApiError(
      error,
      'Hermes cron execute',
      'Failed to execute cron job'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
