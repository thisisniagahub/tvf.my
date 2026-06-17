import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, updateCronJobSchema } from '@/lib/validation'
import {
  getJob,
  updateJobStatus,
  deleteJob,
} from '@/lib/hermes-v2/cron-service'

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
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-cron-id-get')
  if (limited) return limited

  try {
    const { id } = await params
    const job = await getJob(id)
    if (!job) {
      return NextResponse.json(
        { error: 'Cron job not found' },
        { status: 404 }
      )
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
    const { id } = await params
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
    const { id } = await params
    await deleteJob(id)

    logger.info('Cron job deleted via API', { jobId: id })

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
