export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, hermesSkillUpdateSchema } from '@/lib/validation'
import { skillsEngine } from '@/lib/hermes-v2/skills-engine'
import { requireUser } from '@/lib/auth'

/**
 * HERMES Skill detail API
 *
 * GET    /api/hermes/skills/[id]   — fetch a single skill
 * PUT    /api/hermes/skills/[id]   — partial update (name, description,
 *                                    category, content, trigger, status)
 * DELETE /api/hermes/skills/[id]   — permanently delete
 *
 * The authenticated user is resolved server-side via `requireUser()`
 * (demo-mode fallback allowed) so the audit log records who mutated
 * the skill. Skills are shared (no `userId` column), so there is no
 * per-user ownership check.
 *
 * Returns 404 when the skill id does not exist.
 */

function notFound(): NextResponse {
  return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-skill-get')
  if (limited) return limited

  try {
    const user = await requireUser()
    const { id } = await params
    const skill = await skillsEngine.loadSkill(id)
    if (!skill) return notFound()

    logger.info('Skill fetched via API', { userId: user.id, id })
    return NextResponse.json({ skill })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes skill GET',
      'Failed to fetch skill'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-skill-put')
  if (limited) return limited

  try {
    const user = await requireUser()
    const { id } = await params
    const body = await request.json()
    const validation = validateInput(hermesSkillUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }

    // Reject empty patch objects to avoid a no-op update.
    if (Object.keys(validation.data).length === 0) {
      return NextResponse.json(
        { error: 'No fields supplied for update' },
        { status: 400 }
      )
    }

    const skill = await skillsEngine.updateSkill(id, validation.data)
    if (!skill) return notFound()

    logger.info('Skill updated via API', {
      userId: user.id,
      id,
      fields: Object.keys(validation.data),
    })
    return NextResponse.json({ skill })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes skill PUT',
      'Failed to update skill'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-skill-del')
  if (limited) return limited

  try {
    const user = await requireUser()
    const { id } = await params

    // Verify existence first so we can return a proper 404 (Prisma's
    // deleteMany would silently succeed on a missing id).
    const existing = await skillsEngine.loadSkill(id)
    if (!existing) return notFound()

    await skillsEngine.deleteSkill(id)
    logger.info('Skill deleted via API', { userId: user.id, id })
    return NextResponse.json({ success: true, id })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes skill DELETE',
      'Failed to delete skill'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
