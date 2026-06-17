import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import {
  getSubagent,
  cancelSubagent,
} from '@/lib/hermes-v2/delegation-service'
import { requireUser } from '@/lib/auth'

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
 *
 * The authenticated user is resolved server-side via `requireUser()`.
 * After fetching the subagent, an ownership check returns 404 if the
 * subagent's `userId` does not match the caller — so a client cannot
 * probe or cancel another user's subagents by guessing ids.
 */

/** Returns a 404 so the caller cannot distinguish "missing" from "owned
 * by someone else". */
function notFound(): NextResponse {
  return NextResponse.json({ error: 'Subagent not found' }, { status: 404 })
}

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
    // Resolve the user server-side before touching the store.
    const user = await requireUser()

    const { id } = await params
    const subagent = await getSubagent(id)
    if (!subagent || subagent.userId !== user.id) {
      return notFound()
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
    // Resolve the user server-side before touching the store.
    const user = await requireUser()

    const { id } = await params

    // Verify ownership before cancelling — fetch first, then cancel.
    // `cancelSubagent` is itself idempotent, so we do the existence /
    // ownership check up front to return the right status code.
    const existing = await getSubagent(id)
    if (!existing || existing.userId !== user.id) {
      return notFound()
    }

    const subagent = await cancelSubagent(id)
    if (!subagent) {
      return notFound()
    }

    logger.info('Subagent cancelled via API', {
      subagentId: id,
      userId: user.id,
    })

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
