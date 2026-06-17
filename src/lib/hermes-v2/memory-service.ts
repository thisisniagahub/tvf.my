/**
 * HERMES v2 Memory Service
 *
 * Provides persistent memory for the HERMES AI agent across chat sessions.
 * Two memory types are supported:
 *   - 'agent': HERMES' working notes — facts, plans, observations it wants
 *     to remember about the user's business so it can give better advice.
 *   - 'user':  User-profile facts — preferences and interests we have
 *     learned (e.g. "prefers Manglish", "focused on Beauty niche").
 *
 * Memory is size-capped to keep the system prompt token budget bounded:
 *   - agent memory: 2200 chars (recent notes + summarised context)
 *   - user  memory: 1375 chars (compact profile)
 * When adding a new entry would exceed the cap, the oldest entries are
 * evicted (consolidated) until the total is under 70% of the cap.
 *
 * The Prisma schema stores `tags` as a JSON-encoded string because SQLite
 * (the current datasource connector) does not support native primitive
 * lists. This service serializes/deserializes transparently so callers
 * always work with `string[]`.
 */

import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

/** Soft cap on total characters of agent-side memory per user. */
const AGENT_MEMORY_LIMIT = 2200 // chars
/** Soft cap on total characters of user-profile memory per user. */
const USER_MEMORY_LIMIT = 1375 // chars

export interface MemoryEntry {
  id: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type MemoryType = 'agent' | 'user'

/** Parse the JSON-encoded `tags` column. Always returns a string[]. */
function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((t) => typeof t === 'string')) {
      return parsed
    }
  } catch {
    // fallthrough to empty
  }
  return []
}

/** Serialize a string[] into a JSON string for storage. */
function serializeTags(tags: string[]): string {
  return JSON.stringify(tags ?? [])
}

export class MemoryService {
  /** Fetch the most recent agent-side memories (HERMES' own notes). */
  async getAgentMemory(userId: string): Promise<MemoryEntry[]> {
    const memories = await db.agentMemory.findMany({
      where: { userId, type: 'agent' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return memories.map((m) => ({
      id: m.id,
      content: m.content,
      tags: parseTags(m.tags),
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }))
  }

  /** Fetch the most recent user-profile memories (preferences). */
  async getUserProfile(userId: string): Promise<MemoryEntry[]> {
    const memories = await db.agentMemory.findMany({
      where: { userId, type: 'user' },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    return memories.map((m) => ({
      id: m.id,
      content: m.content,
      tags: parseTags(m.tags),
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }))
  }

  /**
   * Append a new memory entry. If the new entry would push the user's
   * memory over the soft cap, the oldest entries are evicted first
   * via {@link consolidateMemory}.
   */
  async addMemory(
    userId: string,
    type: MemoryType,
    content: string,
    tags: string[] = []
  ): Promise<void> {
    const limit = type === 'agent' ? AGENT_MEMORY_LIMIT : USER_MEMORY_LIMIT
    const currentSize = await this.getMemorySize(userId, type)

    if (currentSize + content.length > limit) {
      await this.consolidateMemory(userId, type)
    }

    await db.agentMemory.create({
      data: { userId, type, content, tags: serializeTags(tags) },
    })
    logger.info('Memory added', {
      userId,
      type,
      contentLength: content.length,
    })
  }

  /** Total characters currently stored for the given user+type. */
  async getMemorySize(userId: string, type: MemoryType): Promise<number> {
    const memories = await db.agentMemory.findMany({
      where: { userId, type },
      select: { content: true },
    })
    return memories.reduce((sum, m) => sum + m.content.length, 0)
  }

  /**
   * Evict the oldest entries until total size drops under 70% of the cap.
   * Called automatically by {@link addMemory} when the cap is about to be
   * exceeded — but exposed publicly so callers can force a compaction.
   */
  async consolidateMemory(userId: string, type: MemoryType): Promise<void> {
    const limit = type === 'agent' ? AGENT_MEMORY_LIMIT : USER_MEMORY_LIMIT
    const targetSize = limit * 0.7

    const memories = await db.agentMemory.findMany({
      where: { userId, type },
      orderBy: { createdAt: 'asc' },
    })

    let currentSize = memories.reduce((sum, m) => sum + m.content.length, 0)
    const toDelete: string[] = []

    for (const m of memories) {
      if (currentSize <= targetSize) break
      toDelete.push(m.id)
      currentSize -= m.content.length
    }

    if (toDelete.length > 0) {
      await db.agentMemory.deleteMany({ where: { id: { in: toDelete } } })
      logger.info('Memory consolidated', {
        userId,
        type,
        deleted: toDelete.length,
      })
    }
  }

  /** Clear all memories for a user — optionally filtered by type. */
  async clearMemory(userId: string, type?: MemoryType): Promise<void> {
    await db.agentMemory.deleteMany({
      where: type ? { userId, type } : { userId },
    })
    logger.info('Memory cleared', { userId, type: type ?? 'all' })
  }

  /**
   * Build a compact context string for the HERMES system prompt.
   * Returns '' when no memory exists so callers can blindly concatenate.
   *
   * Output format (only sections with content are emitted):
   *
   *   ## Agent Memory (past notes)
   *   - <content>
   *   - <content>
   *
   *   ## User Profile (preferences)
   *   - <content>
   */
  async buildMemoryContext(userId: string): Promise<string> {
    const agentMemory = await this.getAgentMemory(userId)
    const userProfile = await this.getUserProfile(userId)

    let context = ''

    if (agentMemory.length > 0) {
      context += '\n\n## Agent Memory (past notes)\n'
      context += agentMemory
        .slice(0, 10)
        .map((m) => `- ${m.content}`)
        .join('\n')
    }

    if (userProfile.length > 0) {
      context += '\n\n## User Profile (preferences)\n'
      context += userProfile
        .slice(0, 5)
        .map((m) => `- ${m.content}`)
        .join('\n')
    }

    return context
  }
}

export const memoryService = new MemoryService()
