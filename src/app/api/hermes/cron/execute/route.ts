import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { requireAuth } from '@/lib/auth'
import { executeJob, getJobs } from '@/lib/hermes-v2/cron-service'

/**
 * HERMES v2 Cron — Execution Endpoint
 * ------------------------------------
 * Supports two modes:
 *
 * 1. `mode=allDue` (Vercel Cron):
 *    GET/POST /api/hermes/cron/execute?mode=allDue
 *    Authenticates via a timing-safe comparison of the `Authorization: Bearer
 *    <secret>` (or `x-cron-secret`) header against `process.env.CRON_SECRET`.
 *    Loads every active job whose `nextRun` is due, executes them in batches
 *    of at most 3 concurrently, and returns a summary `{ executed, failed,
 *    results }`. Designed to be invoked every 5 minutes by Vercel Cron.
 *
 * 2. Default mode (manual single-job execution):
 *    POST /api/hermes/cron/execute   body: { jobId }
 *    Requires a logged-in user (`requireAuth()`). Triggers `executeJob(jobId)`
 *    and returns the full execution result.
 *
 * Rate-limited at the AI tier (10 req/min) because every execution triggers
 * a chat completion against z-ai-web-dev-sdk.
 */

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(
    request,
    RATE_LIMITS.ai,
    'hermes-cron-execute'
  )
  if (limited) return limited

  try {
    const mode = request.nextUrl.searchParams.get('mode')

    // ----- Vercel Cron mode — verify CRON_SECRET ----------------------
    if (mode === 'allDue') {
      const cronSecret = process.env.CRON_SECRET
      if (!cronSecret) {
        logger.warn('CRON_SECRET not set — allDue mode disabled')
        return NextResponse.json(
          { error: 'Cron mode not configured' },
          { status: 503 }
        )
      }

      const authHeader = request.headers.get('authorization')
      const providedSecret =
        authHeader?.replace('Bearer ', '') ||
        request.headers.get('x-cron-secret')

      if (!providedSecret) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Timing-safe comparison to prevent secret extraction via timing
      // attacks. Lengths MUST match before calling timingSafeEqual (it
      // throws on length mismatch).
      const secretBuffer = Buffer.from(cronSecret)
      const providedBuffer = Buffer.from(providedSecret)
      if (
        secretBuffer.length !== providedBuffer.length ||
        !crypto.timingSafeEqual(secretBuffer, providedBuffer)
      ) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Get all due jobs across every user. `getJobs('system')` is the
      // system-level query sentinel that returns every job regardless
      // of ownership — see cron-service.ts.
      const allJobs = await getJobs('system')
      const now = new Date()
      const dueJobs = allJobs.filter(
        (j) =>
          j.status === 'active' &&
          j.nextRun &&
          new Date(j.nextRun) <= now
      )

      logger.info('Cron allDue triggered', {
        dueCount: dueJobs.length,
      })

      // Execute with max 3 concurrency — process in batches of 3 and
      // wait for each batch to settle before starting the next. This
      // bounds the concurrent AI calls so a backlog of N due jobs
      // doesn't fan out into N parallel chat completions.
      const results: Array<{
        jobId: string
        success: boolean
        error?: string
      }> = []
      const batchSize = 3

      for (let i = 0; i < dueJobs.length; i += batchSize) {
        const batch = dueJobs.slice(i, i + batchSize)
        const batchResults = await Promise.allSettled(
          batch.map(async (job) => {
            try {
              const result = await executeJob(job.id)
              return { jobId: job.id, success: result.success }
            } catch (error) {
              return {
                jobId: job.id,
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : 'Unknown',
              }
            }
          })
        )
        batchResults.forEach((r) => {
          if (r.status === 'fulfilled') results.push(r.value)
          else
            results.push({
              jobId: 'unknown',
              success: false,
              error: 'Promise rejected',
            })
        })
      }

      const executed = results.length
      const failed = results.filter((r) => !r.success).length

      logger.info('Cron allDue completed', { executed, failed })

      return NextResponse.json({ executed, failed, results })
    }

    // ----- Default mode — manual single-job execution -----------------
    const user = await requireAuth()
    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      )
    }

    const result = await executeJob(jobId)
    logger.info('Cron job executed via API', {
      userId: user.id,
      jobId: result.jobId,
      success: result.success,
    })

    return NextResponse.json({ result })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('not found')
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    if (
      error instanceof Error &&
      error.message === 'Unauthorized'
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { error: msg, status } = handleApiError(
      error,
      'Hermes cron execute',
      'Failed to execute cron job'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

/**
 * Vercel Cron issues GET requests by default. We accept GET as an alias
 * for the allDue POST handler so the Vercel scheduler can use either
 * verb — this is purely for convenience and matches the request shape
 * documented at https://vercel.com/docs/cron-jobs.
 */
export async function GET(request: NextRequest) {
  return POST(request)
}
