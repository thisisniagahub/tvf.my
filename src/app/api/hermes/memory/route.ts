import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, hermesMemoryCreateSchema, hermesMemoryClearSchema } from '@/lib/validation'
import { memoryService } from '@/lib/hermes-v2/memory-service'
import { requireUser } from '@/lib/auth'

/**
 * HERMES Memory API
 *
 * GET    /api/hermes/memory
 *        Returns the user's agent memory + user-profile memory entries.
 *
 * POST   /api/hermes/memory
 *        Body: { type, content, tags? }
 *        Adds a new memory entry. Auto-consolidates when over the soft cap.
 *
 * DELETE /api/hermes/memory?type=<agent|user>
 *        Clears memories for a user (optionally filtered by type).
 *
 * The user is resolved server-side via `requireUser()` — any `userId`
 * in the body or query string is ignored to prevent cross-user access.
 * Falls back to 'demo-user' in demo mode (no login required).
 */

const DEFAULT_USER_ID = 'demo-user'

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-memory-get')
  if (limited) return limited

  try {
    // Auth: resolve the user server-side — any `userId` query param is
    // ignored to prevent cross-user access.
    const user = await requireUser()
    const userId = user.id || DEFAULT_USER_ID

    const [agentMemory, userProfile] = await Promise.all([
      memoryService.getAgentMemory(userId),
      memoryService.getUserProfile(userId),
    ])

    return NextResponse.json({
      userId,
      agentMemory,
      userProfile,
      count: agentMemory.length + userProfile.length,
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes memory GET',
      'Failed to fetch memory'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-memory-post')
  if (limited) return limited

  try {
    const body = await request.json()
    const validation = validateInput(hermesMemoryCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    const { type, content, tags } = validation.data

    // Auth: resolve the user server-side so the client cannot write to
    // another user's memory by passing a `userId` in the body.
    const user = await requireUser()
    const userId = user.id || DEFAULT_USER_ID

    await memoryService.addMemory(userId, type, content, tags ?? [])

    logger.info('Memory entry created via API', {
      userId,
      type,
      contentLength: content.length,
    })

    return NextResponse.json({
      success: true,
      userId,
      type,
      contentLength: content.length,
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes memory POST',
      'Failed to add memory'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function DELETE(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-memory-del')
  if (limited) return limited

  try {
    const { searchParams } = new URL(request.url)
    const typeParam = searchParams.get('type')

    // Auth: resolve the user server-side — any `userId` query param is
    // ignored to prevent clearing another user's memory.
    const user = await requireUser()
    const userId = user.id || DEFAULT_USER_ID

    // Validate optional type via the clear schema
    const validation = validateInput(hermesMemoryClearSchema, {
      userId,
      type: typeParam ?? undefined,
    })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }

    await memoryService.clearMemory(validation.data.userId, validation.data.type)

    logger.info('Memory cleared via API', {
      userId: validation.data.userId,
      type: validation.data.type ?? 'all',
    })

    return NextResponse.json({
      success: true,
      userId: validation.data.userId,
      cleared: validation.data.type ?? 'all',
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes memory DELETE',
      'Failed to clear memory'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
