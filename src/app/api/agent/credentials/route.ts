import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, credentialSchema } from '@/lib/validation'
import { credentialStore } from '@/lib/agent-v2/credential-store'

/**
 * Agent v2 — Credential Store
 *
 * GET  /api/agent/credentials       → list all stored credentials (no passwords)
 * POST /api/agent/credentials       → store a new credential
 *
 * Passwords are encrypted at rest inside the CredentialStore. The
 * list endpoint never returns passwords (not even encrypted) — only
 * id / platform / username / createdAt.
 *
 * POST is rate-limited at the AUTH tier (5 req/min) because credential
 * writes are sensitive and rare; GET is rate-limited at the standard
 * API tier.
 */

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'agent-credentials-list')
  if (limited) return limited

  try {
    const credentials = await credentialStore.listCredentials()
    logger.info('Credentials listed', { count: credentials.length })

    return NextResponse.json({ credentials, total: credentials.length })
  } catch (error) {
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
    const id = await credentialStore.storeCredential(platform, username, password)

    logger.info('Credential stored via API', { id, platform, username })

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
    const { error: msg, status } = handleApiError(
      error,
      'Agent credentials create',
      'Failed to store credential'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
