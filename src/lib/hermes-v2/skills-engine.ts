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
 */

import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

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

export class SkillsEngine {
  /** Load a single skill by ID. Returns null when not found. */
  async loadSkill(skillId: string): Promise<HermesSkill | null> {
    const skill = await db.hermesSkill.findUnique({ where: { id: skillId } })
    if (!skill) return null
    return this.mapSkill(skill)
  }

  /** List all active skills, optionally filtered by category. */
  async getAllSkills(category?: string): Promise<HermesSkill[]> {
    const skills = await db.hermesSkill.findMany({
      where: { status: 'active', ...(category ? { category } : {}) },
      orderBy: { usageCount: 'desc' },
    })
    return skills.map(this.mapSkill)
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
    const skill = await db.hermesSkill.create({
      data: { ...data, status: 'active' },
    })
    logger.info('Skill created', { id: skill.id, name: skill.name })
    return this.mapSkill(skill)
  }

  /** Partial update of an existing skill. Returns null if not found. */
  async updateSkill(
    skillId: string,
    data: UpdateSkillInput
  ): Promise<HermesSkill | null> {
    try {
      const skill = await db.hermesSkill.update({
        where: { id: skillId },
        data,
      })
      return this.mapSkill(skill)
    } catch {
      // Prisma throws P2025 when the record is not found.
      return null
    }
  }

  /**
   * Update usage stats after a skill was (or was not) used successfully.
   * `successRate` is a running average: new = (old * count + s) / (count + 1)
   */
  async updateSkillUsage(skillId: string, success: boolean): Promise<void> {
    const skill = await db.hermesSkill.findUnique({ where: { id: skillId } })
    if (!skill) return

    const newCount = skill.usageCount + 1
    const newSuccessRate =
      (skill.successRate * skill.usageCount + (success ? 1 : 0)) / newCount

    await db.hermesSkill.update({
      where: { id: skillId },
      data: { usageCount: newCount, successRate: newSuccessRate },
    })
  }

  /** Permanently delete a skill. */
  async deleteSkill(skillId: string): Promise<void> {
    await db.hermesSkill.delete({ where: { id: skillId } })
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

  /** Map a Prisma row to the HermesSkill interface (no transforms needed). */
  private mapSkill(s: {
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
  }): HermesSkill {
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
}

export const skillsEngine = new SkillsEngine()
