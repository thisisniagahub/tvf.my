import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, credentialSchema } from '@/lib/validation'
import { credentialStore } from '@/lib/agent-v2/credential-store'
import { requireAuth } from '@/lib/auth'

/**
 * Agent v2 — Credential Store
 *
 * GET  /api/agent/credentials       -> list all stored credentials (no passwords)
 * POST /api/agent/credentials       -> store a new credential
 *
 * Both endpoints require a strict authenticated session (`requireAuth()`).
 * The userId is resolved server-side from the session and is passed as the
 * first argument to every `CredentialStore` method so a client cannot
 * list / create / read another user's credentials by passing `userId` in
 * the body or query.
 *
 * Passwords are encrypted at rest with AES-256-GCM inside the
 * CredentialStore. The list endpoint never returns passwords (not even
 * the ciphertext) — only id / platform / username / createdAt.
 *
 * POST is rate-limited at the AUTH tier (5 req/min) because credential
 * writes are sensitive and rare; GET is rate-limited at the standard
 * API tier.
 */

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'agent-credentials-list')
  if (limited) return limited

  try {
    const user = await requireAuth()
    const credentials = await credentialStore.listCredentials(user.id)
    logger.info('Credentials listed', {
      userId: user.id,
      count: credentials.length,
    })

    return NextResponse.json({ credentials, total: credentials.length })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { error: msg, status } = handleApiError(
      error,
      'Agent credentials list',
      'Failed to list credentials'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.auth, 'agent-credentials-create')
  if (limited) return limited

  try {
    const user = await requireAuth()

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const validation = validateInput(credentialSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { platform, username, password } = validation.data
    const id = await credentialStore.storeCredential(
      user.id,
      platform,
      username,
      password
    )

    logger.info('Credential stored via API', {
      userId: user.id,
      id,
      platform,
      username,
    })

    return NextResponse.json(
      {
        id,
        platform,
        username,
        message: 'Credential stored securely',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { error: msg, status } = handleApiError(
      error,
      'Agent credentials create',
      'Failed to store credential'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
