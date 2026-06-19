export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { skillsEngine } from '@/lib/hermes-v2/skills-engine'
import { SEED_SKILLS } from '@/lib/hermes-v2/seed-skills'
import { dbAvailable } from '@/lib/db'
import { requireUser } from '@/lib/auth'

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
 * Vercel fallback: When the database is unavailable (Vercel serverless /
 * SQLite not persistent), the seed is mirrored into the in-memory
 * `skillsStore` inside the skills engine. The engine auto-seeds on first
 * access, so this route reports success either way (`mode: 'db' |
 * 'in-memory'`) — no error is ever surfaced to the caller.
 *
 * The authenticated user is resolved server-side via `requireUser()`
 * (demo-mode fallback allowed) so the audit log records who triggered
 * the seed. Skills themselves are shared (no `userId` column), so no
 * ownership check is required.
 */

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'hermes-seed')
  if (limited) return limited

  try {
    const user = await requireUser()
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

    logger.info('HERMES seed completed', {
      userId: user.id,
      created: created.length,
      skipped: skipped.length,
      mode: dbAvailable ? 'db' : 'in-memory',
    })

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: SEED_SKILLS.length,
      mode: dbAvailable ? 'db' : 'in-memory',
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
    const user = await requireUser()
    const existing = await skillsEngine.getAllSkills()
    const existingNames = new Set(existing.map((s) => s.name))

    const status = SEED_SKILLS.map((seed) => ({
      name: seed.name,
      category: seed.category,
      present: existingNames.has(seed.name),
    }))

    logger.info('HERMES seed status checked', { userId: user.id })

    return NextResponse.json({
      seeds: status,
      presentCount: status.filter((s) => s.present).length,
      totalCount: SEED_SKILLS.length,
      mode: dbAvailable ? 'db' : 'in-memory',
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
