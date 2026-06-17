import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { skillsEngine } from '@/lib/hermes-v2/skills-engine'
import { SEED_SKILLS } from '@/lib/hermes-v2/seed-skills'

/**
 * HERMES Seed API
 *
 * POST /api/hermes/seed
 *   Idempotently seeds the four default affiliate skills into the database.
 *   For each seed skill:
 *     - If a skill with the same `name` already exists, skip it.
 *     - Otherwise, create it.
 *   Returns the list of created + skipped skill names.
 *
 * Useful for first-run setup or resetting the catalog after a db wipe.
 */

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-seed')
  if (limited) return limited

  try {
    const existing = await skillsEngine.getAllSkills()
    const existingNames = new Set(existing.map((s) => s.name))

    const created: string[] = []
    const skipped: string[] = []

    for (const seed of SEED_SKILLS) {
      if (existingNames.has(seed.name)) {
        skipped.push(seed.name)
        continue
      }
      await skillsEngine.createSkill(seed)
      created.push(seed.name)
    }

    logger.info('HERMES seed completed', { created: created.length, skipped: skipped.length })

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: SEED_SKILLS.length,
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes seed POST',
      'Failed to seed skills'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

/** GET convenience: reports whether each seed skill is present. */
export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-seed-status')
  if (limited) return limited

  try {
    const existing = await skillsEngine.getAllSkills()
    const existingNames = new Set(existing.map((s) => s.name))

    const status = SEED_SKILLS.map((seed) => ({
      name: seed.name,
      category: seed.category,
      present: existingNames.has(seed.name),
    }))

    return NextResponse.json({
      seeds: status,
      presentCount: status.filter((s) => s.present).length,
      totalCount: SEED_SKILLS.length,
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes seed GET',
      'Failed to check seed status'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
