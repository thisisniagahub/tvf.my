import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, agentStopSchema } from '@/lib/validation'
import { jobRegistry, serializeJob } from '@/lib/agent-v2/job-registry'
import { requireUser } from '@/lib/auth'

/**
 * Agent V2 — Task Stop API (P6-4 unified)
 *
 * POST /api/agent/stop
 *   Body: {
 *     taskId?: string,  // P6-3 — log-only audit hook
 *     jobId?: string,   // P6-4 — stop a registered VlaLoop job
 *   }
 *
 * The authenticated user is resolved server-side via `requireUser()`.
 * Any `userId` field sent in the body is silently stripped by the
 * Zod schema and ignored here to prevent cross-user impersonation.
 *
 * Two response modes:
 *
 *   1. P6-4 job mode (`jobId` present):
 *      Looks up the job in the JobRegistry and calls `loop.stop()`
 *      for a graceful shutdown after the current iteration. Returns
 *      the updated job snapshot. 404 if the job id is unknown.
 *
 *   2. P6-3 audit mode (no `jobId`):
 *      The actual cancellation is performed client-side by emitting
 *      a `stop` event on the agent-browser Socket.io socket (see
 *      `useAgentBrowser().stop()`). This endpoint just logs the
 *      stop request and returns 200 so the UI can update
 *      optimistically.
 *
 * Rate-limited at the standard API tier (no LLM calls).
 */

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'agent-stop')
  if (limited) return limited

  try {
    const body = await request.json().catch(() => ({}))
    const validation = validateInput(agentStopSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { taskId, jobId } = validation.data

    // Resolve the user server-side (demo-mode fallback is allowed —
    // stopping a job is a non-sensitive UI action). Any `userId` in
    // the body is silently stripped by the Zod schema.
    const user = await requireUser()

    // ---- P6-4 job mode ----
    if (jobId) {
      const job = jobRegistry.get(jobId)
      if (!job) {
        return NextResponse.json(
          { error: `Job not found: ${jobId}` },
          { status: 404 }
        )
      }
      const stopped = jobRegistry.stop(jobId)
      logger.info('Agent job stop requested (P6-4)', { jobId, wasRunning: stopped })
      return NextResponse.json({
        jobId,
        stopped,
        job: serializeJob(job),
      })
    }

    // ---- P6-3 audit mode ----
    logger.info('Agent task stop requested (P6-3 audit)', {
      taskId: taskId ?? 'unknown',
      userId: user.id,
    })

    return NextResponse.json({
      stopped: true,
      taskId: taskId ?? null,
      message:
        'Stop signal accepted. The agent-browser client should emit `stop` on its socket.',
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Agent stop',
      'Failed to stop agent task'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
