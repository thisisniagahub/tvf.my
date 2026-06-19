export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { credentialStore } from '@/lib/agent-v2/credential-store'
import { requireAuth } from '@/lib/auth'

/**
 * Agent v2 — Credential Detail
 *
 * DELETE /api/agent/credentials/[id]
 *   Permanently removes a stored credential. Idempotent on the
 *   caller's side — a missing id returns 404 so the client can
 *   distinguish "already deleted" from "request failed".
 *
 * Requires a strict authenticated session (`requireAuth()`) because
 * credential mutations are sensitive. Anonymous demo-mode callers are
 * rejected with 401.
 *
 * Rate-limited at the AUTH tier because credential mutations are
 * sensitive and rare.
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(
    request,
    RATE_LIMITS.auth,
    'agent-credentials-del'
  )
  if (limited) return limited

  try {
    // Sensitive endpoint — require a real session (no demo fallback).
    const user = await requireAuth()

    const { id } = await params

    // Verify existence so we can return 404 (CredentialStore's
    // deleteCredential is idempotent and would otherwise silently
    // succeed on a missing id). Scoped to the authenticated user so
    // callers can't probe for ids that belong to someone else.
    const existing = await credentialStore.getCredential(user.id, id)
    if (!existing) {
      return NextResponse.json(
        { error: `Credential not found: ${id}` },
        { status: 404 }
      )
    }

    await credentialStore.deleteCredential(user.id, id)
    logger.info('Credential deleted via API', { userId: user.id, id })

    return NextResponse.json({ success: true, id })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { error: msg, status } = handleApiError(
      error,
      'Agent credentials delete',
      'Failed to delete credential'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
