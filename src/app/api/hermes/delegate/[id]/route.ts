import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import {
  getSubagent,
  cancelSubagent,
} from '@/lib/hermes-v2/delegation-service'

/**
 * HERMES v2 Subagent Delegation — Single-Subagent API
 *
 * GET    /api/hermes/delegate/<id>
 *        Returns the single subagent record (status, result, timing).
 *
 * DELETE /api/hermes/delegate/<id>
 *        Cancels the subagent — marks its row as 'failed' with a
 *        `completedAt` timestamp. If the AI request is still in-flight,
 *        the eventual success result is discarded.
 *
 * All endpoints are rate-limited at the standard API tier.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(
    request,
    RATE_LIMITS.api,
    'hermes-delegate-id-get'
  )
  if (limited) return limited

  try {
    const { id } = await params
    const subagent = await getSubagent(id)
    if (!subagent) {
      return NextResponse.json(
        { error: 'Subagent not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ subagent })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes delegate GET by id',
      'Failed to fetch subagent'
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
    'hermes-delegate-id-del'
  )
  if (limited) return limited

  try {
    const { id } = await params
    const subagent = await cancelSubagent(id)
    if (!subagent) {
      return NextResponse.json(
        { error: 'Subagent not found' },
        { status: 404 }
      )
    }

    logger.info('Subagent cancelled via API', { subagentId: id })

    return NextResponse.json({ success: true, subagent })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes delegate DELETE',
      'Failed to cancel subagent'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
