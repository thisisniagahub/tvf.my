/**
 * HERMES v2 Skills Engine
 *
 * A "skill" is a markdown-encoded procedural knowledge document that HERMES
 * can inject into its system prompt when a user query matches a regex
 * `trigger`. This keeps the default system prompt small while letting the
 * agent pull in specialized expertise (e.g. affiliate product research,
 * Manglish content generation) only when relevant.
 *
 * Skills are stored in the `HermesSkill` Prisma table. Each skill tracks
 * `usageCount` and `successRate` so we can rank future auto-detection
 * results by demonstrated effectiveness.
 *
 * Vercel fallback: On Vercel serverless, SQLite is not persistent. When
 * the DB is unavailable, all skills are stored in an in-memory `Map`
 * that is lazily seeded with the four affiliate skills from
 * `src/lib/hermes-v2/seed-skills.ts` on first access. This guarantees
 * the agent can still auto-detect skills (and the seed route reports
 * success) even when no database is connected.
 */

import { db, dbAvailable, withDbFallback } from '@/lib/db'
import { logger } from '@/lib/logger'
import { SEED_SKILLS } from '@/lib/hermes-v2/seed-skills'

export interface HermesSkill {
  id: string
  name: string
  description: string
  category: string
  content: string
  trigger?: string | null
  status: string
  usageCount: number
  successRate: number
  version: number
}

export interface CreateSkillInput {
  name: string
  description: string
  category: string
  content: string
  trigger?: string
}

export interface UpdateSkillInput {
  name?: string
  description?: string
  category?: string
  content?: string
  trigger?: string | null
  status?: string
}

/** Max number of skills to inject into a single system prompt. */
const MAX_INJECTED_SKILLS = 3

/** Internal in-memory skill row (mirrors the Prisma shape we care about). */
interface InMemorySkillRow {
  id: string
  name: string
  description: string
  category: string
  content: string
  trigger: string | null
  status: string
  usageCount: number
  successRate: number
  version: number
}

/** Generate a cuid-ish id without pulling in a dependency. */
function generateId(): string {
  return `skl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export class SkillsEngine {
  /**
   * In-memory fallback store keyed by skill id. Lazily seeded from
   * {@link SEED_SKILLS} on first access when the DB is unavailable.
   */
  private skillsStore = new Map<string, InMemorySkillRow>()

  /** Has the in-memory store been seeded yet? */
  private memorySeeded = false

  /** Lazily seed the in-memory store with the default affiliate skills. */
  private ensureMemorySeeded(): void {
    if (this.memorySeeded) return
    this.memorySeeded = true
    for (const seed of SEED_SKILLS) {
      const id = `seed_${seed.name}`
      this.skillsStore.set(id, {
        id,
        name: seed.name,
        description: seed.description,
        category: seed.category,
        content: seed.content,
        trigger: seed.trigger ?? null,
        status: 'active',
        usageCount: 0,
        successRate: 0,
        version: 1,
      })
    }
    logger.info('Skills in-memory store seeded', {
      count: SEED_SKILLS.length,
    })
  }

  /** Map a Prisma row (or in-memory row) to the public HermesSkill interface. */
  private mapSkill(s: InMemorySkillRow): HermesSkill {
    return {
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      content: s.content,
      trigger: s.trigger,
      status: s.status,
      usageCount: s.usageCount,
      successRate: s.successRate,
      version: s.version,
    }
  }

  /** Load a single skill by ID. Returns null when not found. */
  async loadSkill(skillId: string): Promise<HermesSkill | null> {
    if (!dbAvailable) {
      this.ensureMemorySeeded()
      const row = this.skillsStore.get(skillId)
      return row ? this.mapSkill(row) : null
    }

    const skill = await withDbFallback(
      () => db.hermesSkill.findUnique({ where: { id: skillId } }),
      null as Awaited<ReturnType<typeof db.hermesSkill.findUnique>> | null
    )

    if (skill) {
      return this.mapSkill({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        content: skill.content,
        trigger: skill.trigger,
        status: skill.status,
        usageCount: skill.usageCount,
        successRate: skill.successRate,
        version: skill.version,
      })
    }

    // DB miss (or DB failure with fallback) — try the in-memory store.
    this.ensureMemorySeeded()
    const row = this.skillsStore.get(skillId)
    return row ? this.mapSkill(row) : null
  }

  /** List all active skills, optionally filtered by category. */
  async getAllSkills(category?: string): Promise<HermesSkill[]> {
    if (!dbAvailable) {
      this.ensureMemorySeeded()
      const rows = Array.from(this.skillsStore.values())
        .filter((s) => s.status === 'active')
        .filter((s) => (category ? s.category === category : true))
        .sort((a, b) => b.usageCount - a.usageCount)
      return rows.map((s) => this.mapSkill(s))
    }

    const skills: any[] = await withDbFallback(
      () =>
        db.hermesSkill.findMany({
          where: { status: 'active', ...(category ? { category } : {}) },
          orderBy: { usageCount: 'desc' },
        }),
      [] as Awaited<ReturnType<typeof db.hermesSkill.findMany>>
    )

    if (skills.length > 0) {
      return skills.map((s) =>
        this.mapSkill({
          id: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          content: s.content,
          trigger: s.trigger,
          status: s.status,
          usageCount: s.usageCount,
          successRate: s.successRate,
          version: s.version,
        })
      )
    }

    // DB miss / fallback — fall through to the in-memory seeded store.
    this.ensureMemorySeeded()
    const rows = Array.from(this.skillsStore.values())
      .filter((s) => s.status === 'active')
      .filter((s) => (category ? s.category === category : true))
      .sort((a, b) => b.usageCount - a.usageCount)
    return rows.map((s) => this.mapSkill(s))
  }

  /**
   * Auto-detect skills relevant to a free-text query. Each active skill
   * whose `trigger` regex matches the query (case-insensitive) is returned.
   * Malformed trigger regexes are silently skipped (logged at debug level).
   */
  async autoDetectSkills(query: string): Promise<HermesSkill[]> {
    const allSkills = await this.getAllSkills()
    return allSkills.filter((skill) => {
      if (!skill.trigger) return false
      try {
        return new RegExp(skill.trigger, 'i').test(query)
      } catch (err) {
        logger.debug('Skill trigger regex invalid, skipping', {
          skillId: skill.id,
          name: skill.name,
          trigger: skill.trigger,
          error: err instanceof Error ? err.message : 'unknown',
        })
        return false
      }
    })
  }

  /** Create a new active skill. */
  async createSkill(data: CreateSkillInput): Promise<HermesSkill> {
    if (!dbAvailable) {
      this.ensureMemorySeeded()
      const id = generateId()
      const row: InMemorySkillRow = {
        id,
        name: data.name,
        description: data.description,
        category: data.category,
        content: data.content,
        trigger: data.trigger ?? null,
        status: 'active',
        usageCount: 0,
        successRate: 0,
        version: 1,
      }
      this.skillsStore.set(id, row)
      logger.info('Skill created (in-memory fallback)', {
        id,
        name: data.name,
      })
      return this.mapSkill(row)
    }

    const skill = await withDbFallback(
      () =>
        db.hermesSkill.create({
          data: { ...data, status: 'active' },
        }),
      null as Awaited<ReturnType<typeof db.hermesSkill.create>> | null
    )

    if (skill) {
      logger.info('Skill created', { id: skill.id, name: skill.name })
      return this.mapSkill({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        content: skill.content,
        trigger: skill.trigger,
        status: skill.status,
        usageCount: skill.usageCount,
        successRate: skill.successRate,
        version: skill.version,
      })
    }

    // DB failed — mirror into the in-memory store so callers see the write.
    this.ensureMemorySeeded()
    const id = generateId()
    const row: InMemorySkillRow = {
      id,
      name: data.name,
      description: data.description,
      category: data.category,
      content: data.content,
      trigger: data.trigger ?? null,
      status: 'active',
      usageCount: 0,
      successRate: 0,
      version: 1,
    }
    this.skillsStore.set(id, row)
    logger.info('Skill created (in-memory fallback after DB failure)', {
      id,
      name: data.name,
    })
    return this.mapSkill(row)
  }

  /** Partial update of an existing skill. Returns null if not found. */
  async updateSkill(
    skillId: string,
    data: UpdateSkillInput
  ): Promise<HermesSkill | null> {
    if (!dbAvailable) {
      this.ensureMemorySeeded()
      const row = this.skillsStore.get(skillId)
      if (!row) return null
      const updated: InMemorySkillRow = {
        ...row,
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.trigger !== undefined ? { trigger: data.trigger } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        version: row.version + 1,
      }
      this.skillsStore.set(skillId, updated)
      return this.mapSkill(updated)
    }

    try {
      const skill = await db.hermesSkill.update({
        where: { id: skillId },
        data,
      })
      return this.mapSkill({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        content: skill.content,
        trigger: skill.trigger,
        status: skill.status,
        usageCount: skill.usageCount,
        successRate: skill.successRate,
        version: skill.version,
      })
    } catch {
      // Prisma throws P2025 when the record is not found. Also handles any
      // DB connection error — fall back to the in-memory store if present.
      const row = this.skillsStore.get(skillId)
      if (!row) return null
      const updated: InMemorySkillRow = {
        ...row,
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.trigger !== undefined ? { trigger: data.trigger } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        version: row.version + 1,
      }
      this.skillsStore.set(skillId, updated)
      return this.mapSkill(updated)
    }
  }

  /**
   * Update usage stats after a skill was (or was not) used successfully.
   * `successRate` is a running average: new = (old * count + s) / (count + 1)
   */
  async updateSkillUsage(skillId: string, success: boolean): Promise<void> {
    if (!dbAvailable) {
      const row = this.skillsStore.get(skillId)
      if (!row) return
      const newCount = row.usageCount + 1
      const newSuccessRate =
        (row.successRate * row.usageCount + (success ? 1 : 0)) / newCount
      this.skillsStore.set(skillId, {
        ...row,
        usageCount: newCount,
        successRate: newSuccessRate,
      })
      return
    }

    const skill = await withDbFallback(
      () => db.hermesSkill.findUnique({ where: { id: skillId } }),
      null as Awaited<ReturnType<typeof db.hermesSkill.findUnique>> | null
    )

    if (!skill) {
      // Also check in-memory store (in case the skill was created there).
      const row = this.skillsStore.get(skillId)
      if (!row) return
      const newCount = row.usageCount + 1
      const newSuccessRate =
        (row.successRate * row.usageCount + (success ? 1 : 0)) / newCount
      this.skillsStore.set(skillId, {
        ...row,
        usageCount: newCount,
        successRate: newSuccessRate,
      })
      return
    }

    const newCount = skill.usageCount + 1
    const newSuccessRate =
      (skill.successRate * skill.usageCount + (success ? 1 : 0)) / newCount

    await withDbFallback(
      () =>
        db.hermesSkill.update({
          where: { id: skillId },
          data: { usageCount: newCount, successRate: newSuccessRate },
        }),
      null
    )
  }

  /** Permanently delete a skill. */
  async deleteSkill(skillId: string): Promise<void> {
    if (!dbAvailable) {
      this.skillsStore.delete(skillId)
      return
    }

    await withDbFallback(
      () => db.hermesSkill.delete({ where: { id: skillId } }),
      null
    )

    // Always also clear the in-memory mirror so the two stay in sync.
    this.skillsStore.delete(skillId)
  }

  /**
   * Build a markdown section for the system prompt containing the top
   * auto-detected skills for this query. Returns '' when no skills match.
   *
   * Output format:
   *
   *   ## Relevant Skills (auto-detected)
   *
   *   ### <skill name>
   *   <skill content>
   *
   *   ### <skill name>
   *   <skill content>
   */
  async buildSkillsContext(query: string): Promise<string> {
    const detected = await this.autoDetectSkills(query)
    if (detected.length === 0) return ''

    let context = '\n\n## Relevant Skills (auto-detected)\n'
    for (const skill of detected.slice(0, MAX_INJECTED_SKILLS)) {
      context += `\n### ${skill.name}\n${skill.content}\n`
    }
    return context
  }

  /** Return the list of skill IDs that matched this query (for usage tracking). */
  async detectSkillIds(query: string): Promise<string[]> {
    const detected = await this.autoDetectSkills(query)
    return detected.slice(0, MAX_INJECTED_SKILLS).map((s) => s.id)
  }
}

export const skillsEngine = new SkillsEngine()
