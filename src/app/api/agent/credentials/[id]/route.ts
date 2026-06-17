import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { credentialStore } from '@/lib/agent-v2/credential-store'

/**
 * Agent v2 — Credential Detail
 *
 * DELETE /api/agent/credentials/[id]
 *   Permanently removes a stored credential. Idempotent on the
 *   caller's side — a missing id returns 404 so the client can
 *   distinguish "already deleted" from "request failed".
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
    const { id } = await params

    // Verify existence so we can return 404 (CredentialStore's
    // deleteCredential is idempotent and would otherwise silently
    // succeed on a missing id).
    const existing = await credentialStore.getCredential(id)
    if (!existing) {
      return NextResponse.json(
        { error: `Credential not found: ${id}` },
        { status: 404 }
      )
    }

    await credentialStore.deleteCredential(id)
    logger.info('Credential deleted via API', { id })

    return NextResponse.json({ success: true, id })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Agent credentials delete',
      'Failed to delete credential'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
