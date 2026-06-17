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
 *
 * Vercel fallback: On Vercel serverless, SQLite is not persistent. When
 * the DB is unavailable (or a query fails at runtime), every method
 * transparently falls back to an in-memory `Map` keyed by
 * `${userId}-${type}`. The API response shape is identical so callers
 * (chat route, memory API, UI) keep working in either mode.
 */

import { db, dbAvailable, withDbFallback } from '@/lib/db'
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

/** Internal in-memory record shape (mirrors the Prisma row we care about). */
interface InMemoryMemoryRow {
  id: string
  userId: string
  type: MemoryType
  content: string
  tags: string
  createdAt: Date
  updatedAt: Date
}

/** Generate a cuid-ish id without pulling in a dependency. */
function generateId(): string {
  return `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

/** Sort newest-first by createdAt. */
function byNewest(a: InMemoryMemoryRow, b: InMemoryMemoryRow): number {
  return b.createdAt.getTime() - a.createdAt.getTime()
}

/** Sort oldest-first by createdAt (for consolidation). */
function byOldest(a: InMemoryMemoryRow, b: InMemoryMemoryRow): number {
  return a.createdAt.getTime() - b.createdAt.getTime()
}

/** Convert a Prisma row (or our in-memory row) into the public MemoryEntry. */
function toMemoryEntry(m: InMemoryMemoryRow): MemoryEntry {
  return {
    id: m.id,
    content: m.content,
    tags: parseTags(m.tags),
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }
}

export class MemoryService {
  /**
   * In-memory fallback store. Keyed by `${userId}-${type}` to mirror the
   * Prisma `(userId, type)` index. Only used when DB is unavailable.
   */
  private memoryStore = new Map<string, InMemoryMemoryRow[]>()

  /** Compute the in-memory store key for a (userId, type) pair. */
  private storeKey(userId: string, type: MemoryType): string {
    return `${userId}-${type}`
  }

  /** Fetch the most recent agent-side memories (HERMES' own notes). */
  async getAgentMemory(userId: string): Promise<MemoryEntry[]> {
    if (!dbAvailable) {
      const rows = this.memoryStore.get(this.storeKey(userId, 'agent')) ?? []
      return rows.slice().sort(byNewest).slice(0, 50).map(toMemoryEntry)
    }

    const memories = await withDbFallback(
      () =>
        db.agentMemory.findMany({
          where: { userId, type: 'agent' },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      [] as Awaited<ReturnType<typeof db.agentMemory.findMany>>
    )

    if (memories.length === 0) {
      // DB call may have fallen back — check in-memory store too.
      const rows = this.memoryStore.get(this.storeKey(userId, 'agent')) ?? []
      return rows.slice().sort(byNewest).slice(0, 50).map(toMemoryEntry)
    }

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
    if (!dbAvailable) {
      const rows = this.memoryStore.get(this.storeKey(userId, 'user')) ?? []
      return rows.slice().sort(byNewest).slice(0, 30).map(toMemoryEntry)
    }

    const memories = await withDbFallback(
      () =>
        db.agentMemory.findMany({
          where: { userId, type: 'user' },
          orderBy: { createdAt: 'desc' },
          take: 30,
        }),
      [] as Awaited<ReturnType<typeof db.agentMemory.findMany>>
    )

    if (memories.length === 0) {
      const rows = this.memoryStore.get(this.storeKey(userId, 'user')) ?? []
      return rows.slice().sort(byNewest).slice(0, 30).map(toMemoryEntry)
    }

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

    if (!dbAvailable) {
      const key = this.storeKey(userId, type)
      const rows = this.memoryStore.get(key) ?? []
      const now = new Date()
      rows.push({
        id: generateId(),
        userId,
        type,
        content,
        tags: serializeTags(tags),
        createdAt: now,
        updatedAt: now,
      })
      this.memoryStore.set(key, rows)
      logger.info('Memory added (in-memory fallback)', {
        userId,
        type,
        contentLength: content.length,
      })
      return
    }

    const created = await withDbFallback(
      () =>
        db.agentMemory.create({
          data: { userId, type, content, tags: serializeTags(tags) },
        }),
      null as Awaited<ReturnType<typeof db.agentMemory.create>> | null
    )

    if (created) {
      logger.info('Memory added', {
        userId,
        type,
        contentLength: content.length,
      })
    } else {
      // DB failed mid-write — mirror the write into in-memory store so the
      // caller's view of the world stays consistent within this process.
      const key = this.storeKey(userId, type)
      const rows = this.memoryStore.get(key) ?? []
      const now = new Date()
      rows.push({
        id: generateId(),
        userId,
        type,
        content,
        tags: serializeTags(tags),
        createdAt: now,
        updatedAt: now,
      })
      this.memoryStore.set(key, rows)
      logger.info('Memory added (in-memory fallback after DB failure)', {
        userId,
        type,
        contentLength: content.length,
      })
    }
  }

  /** Total characters currently stored for the given user+type. */
  async getMemorySize(userId: string, type: MemoryType): Promise<number> {
    if (!dbAvailable) {
      const rows = this.memoryStore.get(this.storeKey(userId, type)) ?? []
      return rows.reduce((sum, m) => sum + m.content.length, 0)
    }

    const memories = await withDbFallback(
      () =>
        db.agentMemory.findMany({
          where: { userId, type },
          select: { content: true },
        }),
      [] as { content: string }[]
    )

    const dbSize = memories.reduce((sum, m) => sum + m.content.length, 0)

    if (memories.length === 0) {
      // Possible fallback — also include any in-memory rows.
      const rows = this.memoryStore.get(this.storeKey(userId, type)) ?? []
      return rows.reduce((sum, m) => sum + m.content.length, 0)
    }
    return dbSize
  }

  /**
   * Evict the oldest entries until total size drops under 70% of the cap.
   * Called automatically by {@link addMemory} when the cap is about to be
   * exceeded — but exposed publicly so callers can force a compaction.
   */
  async consolidateMemory(userId: string, type: MemoryType): Promise<void> {
    const limit = type === 'agent' ? AGENT_MEMORY_LIMIT : USER_MEMORY_LIMIT
    const targetSize = limit * 0.7

    if (!dbAvailable) {
      const key = this.storeKey(userId, type)
      const rows = (this.memoryStore.get(key) ?? []).slice().sort(byOldest)
      let currentSize = rows.reduce((sum, m) => sum + m.content.length, 0)
      const survivors: InMemoryMemoryRow[] = []
      for (const m of rows) {
        if (currentSize <= targetSize) {
          survivors.push(m)
          continue
        }
        currentSize -= m.content.length
      }
      this.memoryStore.set(key, survivors)
      if (rows.length - survivors.length > 0) {
        logger.info('Memory consolidated (in-memory fallback)', {
          userId,
          type,
          deleted: rows.length - survivors.length,
        })
      }
      return
    }

    const memories = await withDbFallback(
      () =>
        db.agentMemory.findMany({
          where: { userId, type },
          orderBy: { createdAt: 'asc' },
        }),
      [] as Awaited<ReturnType<typeof db.agentMemory.findMany>>
    )

    if (memories.length === 0) {
      // Fall back to in-memory consolidation.
      const key = this.storeKey(userId, type)
      const rows = (this.memoryStore.get(key) ?? []).slice().sort(byOldest)
      let currentSize = rows.reduce((sum, m) => sum + m.content.length, 0)
      const survivors: InMemoryMemoryRow[] = []
      for (const m of rows) {
        if (currentSize <= targetSize) {
          survivors.push(m)
          continue
        }
        currentSize -= m.content.length
      }
      this.memoryStore.set(key, survivors)
      return
    }

    let currentSize = memories.reduce((sum, m) => sum + m.content.length, 0)
    const toDelete: string[] = []

    for (const m of memories) {
      if (currentSize <= targetSize) break
      toDelete.push(m.id)
      currentSize -= m.content.length
    }

    if (toDelete.length > 0) {
      const ok = await withDbFallback(
        () =>
          db.agentMemory.deleteMany({ where: { id: { in: toDelete } } }),
        null as Awaited<ReturnType<typeof db.agentMemory.deleteMany>> | null
      )
      if (ok) {
        logger.info('Memory consolidated', {
          userId,
          type,
          deleted: toDelete.length,
        })
      }
    }
  }

  /** Clear all memories for a user — optionally filtered by type. */
  async clearMemory(userId: string, type?: MemoryType): Promise<void> {
    if (!dbAvailable) {
      if (type) {
        this.memoryStore.delete(this.storeKey(userId, type))
      } else {
        for (const t of ['agent', 'user'] as MemoryType[]) {
          this.memoryStore.delete(this.storeKey(userId, t))
        }
      }
      logger.info('Memory cleared (in-memory fallback)', {
        userId,
        type: type ?? 'all',
      })
      return
    }

    const ok = await withDbFallback(
      () =>
        db.agentMemory.deleteMany({
          where: type ? { userId, type } : { userId },
        }),
      null as Awaited<ReturnType<typeof db.agentMemory.deleteMany>> | null
    )

    if (ok) {
      logger.info('Memory cleared', { userId, type: type ?? 'all' })
    } else {
      // DB failed — clear the in-memory mirror too so the user sees the
      // clear took effect.
      if (type) {
        this.memoryStore.delete(this.storeKey(userId, type))
      } else {
        for (const t of ['agent', 'user'] as MemoryType[]) {
          this.memoryStore.delete(this.storeKey(userId, t))
        }
      }
      logger.info('Memory cleared (in-memory fallback after DB failure)', {
        userId,
        type: type ?? 'all',
      })
    }
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
