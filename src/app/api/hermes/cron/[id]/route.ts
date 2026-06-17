import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, updateCronJobSchema } from '@/lib/validation'
import {
  getJob,
  updateJobStatus,
  deleteJob,
} from '@/lib/hermes-v2/cron-service'
import { requireUser } from '@/lib/auth'

/**
 * HERMES v2 Cron Automation — Single-Job API
 *
 * GET    /api/hermes/cron/<id>
 *        Returns the single cron job record.
 *
 * PUT    /api/hermes/cron/<id>
 *        Body: { status: 'active' | 'paused' }
 *        Toggles the job's status. Resuming recomputes `nextRun`.
 *
 * DELETE /api/hermes/cron/<id>
 *        Permanently removes the job.
 *
 * All endpoints are rate-limited at the standard API tier.
 *
 * The authenticated user is resolved server-side via `requireUser()`.
 * After fetching the job, an ownership check returns 404 if the job's
 * `userId` does not match the caller — so a client cannot probe or
 * mutate another user's cron jobs by guessing ids.
 */

/** Returns a 404 so the caller cannot distinguish "missing" from "owned
 * by someone else" (same pattern the spec calls for). */
function notFound(): NextResponse {
  return NextResponse.json({ error: 'Cron job not found' }, { status: 404 })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-cron-id-get')
  if (limited) return limited

  try {
    // Resolve the user server-side before touching the store.
    const user = await requireUser()

    const { id } = await params
    const job = await getJob(id)
    if (!job || job.userId !== user.id) {
      return notFound()
    }
    return NextResponse.json({ job })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes cron GET by id',
      'Failed to fetch cron job'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-cron-id-put')
  if (limited) return limited

  try {
    // Resolve the user server-side before touching the store.
    const user = await requireUser()

    const { id } = await params

    // Verify ownership before mutating. A missing or foreign-owned
    // job returns the same 404 to avoid leaking existence.
    const existing = await getJob(id)
    if (!existing || existing.userId !== user.id) {
      return notFound()
    }

    const body = await request.json()
    const validation = validateInput(updateCronJobSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const job = await updateJobStatus(id, validation.data.status)

    logger.info('Cron job updated via API', {
      jobId: id,
      userId: user.id,
      status: job.status,
    })

    return NextResponse.json({ job })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    const { error: msg, status } = handleApiError(
      error,
      'Hermes cron PUT',
      'Failed to update cron job'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(
    request,
    RATE_LIMITS.api,
    'hermes-cron-id-del'
  )
  if (limited) return limited

  try {
    // Resolve the user server-side before touching the store.
    const user = await requireUser()

    const { id } = await params

    // Verify ownership before deleting.
    const existing = await getJob(id)
    if (!existing || existing.userId !== user.id) {
      return notFound()
    }

    await deleteJob(id)

    logger.info('Cron job deleted via API', { jobId: id, userId: user.id })

    return NextResponse.json({ success: true, id })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes cron DELETE',
      'Failed to delete cron job'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
