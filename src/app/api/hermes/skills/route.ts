export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, hermesSkillCreateSchema } from '@/lib/validation'
import { skillsEngine } from '@/lib/hermes-v2/skills-engine'
import { requireUser } from '@/lib/auth'

/**
 * HERMES Skills API
 *
 * GET    /api/hermes/skills?category=<cat>&status=<active|draft|archived>
 *        Lists skills, filtered by category (optional) — defaults to active
 *        status only.
 *
 * POST   /api/hermes/skills
 *        Body: { name, description, category, content, trigger? }
 *        Creates a new active skill. Returns the created skill with its id.
 *
 * The authenticated user is resolved server-side via `requireUser()`
 * (demo-mode fallback allowed) so the audit log records who created or
 * browsed skills. Skills are shared (no `userId` column on HermesSkill),
 * so no ownership check is required.
 *
 * All endpoints are rate-limited at the standard API tier.
 */

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-skills-get')
  if (limited) return limited

  try {
    const user = await requireUser()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') ?? undefined

    const skills = await skillsEngine.getAllSkills(category)

    logger.info('Skills listed via API', {
      userId: user.id,
      count: skills.length,
    })

    return NextResponse.json({
      skills,
      count: skills.length,
      filter: { category: category ?? null, status: 'active' },
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes skills GET',
      'Failed to fetch skills'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-skills-post')
  if (limited) return limited

  try {
    const user = await requireUser()
    const body = await request.json()
    const validation = validateInput(hermesSkillCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }

    const skill = await skillsEngine.createSkill(validation.data)

    logger.info('Skill created via API', {
      userId: user.id,
      id: skill.id,
      name: skill.name,
      category: skill.category,
    })

    return NextResponse.json({ skill }, { status: 201 })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes skills POST',
      'Failed to create skill'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
