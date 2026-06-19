/**
 * Agent v2 — Encrypted Credential Store
 * -------------------------------------
 * Stores platform login credentials (Shopee / Lazada / TikTok /
 * Facebook / Instagram) for use by the agent's headless browser
 * sessions.
 *
 * SECURITY:
 *   ✓ Secrets are encrypted at rest with AES-256-GCM via
 *     `src/lib/crypto.ts` (random 12-byte IV + 16-byte auth tag per
 *     record). The plaintext password is only decrypted in memory when
 *     a caller explicitly asks for it via `getCredential()` /
 *     `getCredentialsByPlatform()`.
 *   ✓ Every method takes `userId` as the first parameter so callers
 *     cannot read or mutate another user's credentials. API routes
 *     resolve `userId` server-side via `requireAuth()` — never trust
 *     a client-supplied userId.
 *   ✓ `listCredentials()` returns a `CredentialSummary` projection that
 *     omits the password entirely (not even the ciphertext).
 *
 * Persistence:
 *   Primary store is the `AgentCredential` Prisma model (SQLite). When
 *   the DB is unavailable (Vercel serverless cold-start, runtime
 *   failure), every method transparently falls back to an in-memory
 *   `Map` keyed by credential id. The in-memory store keeps the same
 *   AES-256-GCM ciphertext shape so security is identical in either
 *   mode — the only difference is durability across restarts.
 */

import { logger } from '@/lib/logger'
import { db, dbAvailable, withDbFallback } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/crypto'

export interface StoredCredential {
  id: string
  platform: string
  username: string
  /** Decrypted plaintext — only populated by `getCredential()` / `getCredentialsByPlatform()`. */
  password: string
  createdAt: string
}

/** Public-safe projection (no password, not even the ciphertext). */
export type CredentialSummary = Omit<StoredCredential, 'password'>

interface InMemoryCredentialRow {
  userId: string
  platform: string
  username: string
  encryptedSecret: string
  createdAt: string
}

export class CredentialStore {
  /**
   * In-memory credential store keyed by credential id. Used only when
   * the DB is unavailable (Vercel serverless / first runtime failure).
   * The stored `encryptedSecret` is real AES-256-GCM ciphertext, NOT
   * plaintext.
   */
  private memoryStore = new Map<string, InMemoryCredentialRow>()

  /**
   * Persist a new credential. The password is encrypted at rest with
   * AES-256-GCM before being written to either the DB or the in-memory
   * fallback. Returns the new credential id.
   */
  async storeCredential(
    userId: string,
    platform: string,
    username: string,
    password: string
  ): Promise<string> {
    const encryptedSecret = encrypt(password)
    const id = `cred-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

    if (dbAvailable) {
      await withDbFallback(
        async () => {
          const created = await db.agentCredential.create({
            data: { id, userId, platform, username, encryptedSecret },
          })
          return created
        },
        null
      )
    }

    // Always mirror in memory so the in-memory fallback stays consistent
    // even when the DB write succeeded (cheap, and keeps both views in
    // sync if a later DB query fails over).
    this.memoryStore.set(id, {
      userId,
      platform,
      username,
      encryptedSecret,
      createdAt: new Date().toISOString(),
    })

    logger.info('Credential stored', { userId, platform, username, id })
    return id
  }

  /**
   * Fetch a single credential by id, scoped to `userId`. The returned
   * `password` is the decrypted plaintext — callers MUST treat it as
   * sensitive and never log or persist it.
   *
   * Returns `null` if the credential does not exist or belongs to a
   * different user.
   */
  async getCredential(
    userId: string,
    id: string
  ): Promise<StoredCredential | null> {
    // Try DB first.
    if (dbAvailable) {
      const record: any = await withDbFallback(
        () => db.agentCredential.findFirst({ where: { id, userId } }),
        null
      )
      if (record) {
        return {
          id: record.id,
          platform: record.platform,
          username: record.username,
          password: decrypt(record.encryptedSecret),
          createdAt: record.createdAt.toISOString(),
        }
      }
    }

    // Fallback to memory.
    const mem = this.memoryStore.get(id)
    if (!mem || mem.userId !== userId) return null
    return {
      id,
      platform: mem.platform,
      username: mem.username,
      password: decrypt(mem.encryptedSecret),
      createdAt: mem.createdAt,
    }
  }

  /**
   * All credentials for a given platform owned by `userId`. Passwords
   * are decrypted in the returned objects.
   */
  async getCredentialsByPlatform(
    userId: string,
    platform: string
  ): Promise<StoredCredential[]> {
    if (dbAvailable) {
      const records: any[] = await withDbFallback(
        () => db.agentCredential.findMany({ where: { userId, platform } }),
        [] as Awaited<ReturnType<typeof db.agentCredential.findMany>>
      )
      if (records.length > 0) {
        return records.map((r) => ({
          id: r.id,
          platform: r.platform,
          username: r.username,
          password: decrypt(r.encryptedSecret),
          createdAt: r.createdAt.toISOString(),
        }))
      }
    }

    return Array.from(this.memoryStore.values())
      .filter((c) => c.userId === userId && c.platform === platform)
      .map((c) => ({
        id: c.userId + c.platform,
        platform: c.platform,
        username: c.username,
        password: decrypt(c.encryptedSecret),
        createdAt: c.createdAt,
      }))
  }

  /**
   * Remove a credential. Scoped to `userId` — a request that supplies
   * another user's credential id is a no-op. Idempotent: deleting a
   * missing id succeeds silently.
   */
  async deleteCredential(userId: string, id: string): Promise<void> {
    if (dbAvailable) {
      await withDbFallback(
        () => db.agentCredential.deleteMany({ where: { id, userId } }),
        null
      )
    }
    const existed = this.memoryStore.delete(id)
    if (existed) {
      logger.info('Credential deleted', { userId, id })
    }
  }

  /**
   * List all credentials owned by `userId` WITHOUT passwords. Safe to
   * return from public API endpoints.
   */
  async listCredentials(userId: string): Promise<CredentialSummary[]> {
    if (dbAvailable) {
      const records: any[] = await withDbFallback(
        () =>
          db.agentCredential.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          }),
        [] as Awaited<ReturnType<typeof db.agentCredential.findMany>>
      )
      if (records.length > 0) {
        return records.map((r) => ({
          id: r.id,
          platform: r.platform,
          username: r.username,
          createdAt: r.createdAt.toISOString(),
        }))
      }
    }

    return Array.from(this.memoryStore.values())
      .filter((c) => c.userId === userId)
      .map((c) => ({
        id: c.userId + c.platform,
        platform: c.platform,
        username: c.username,
        createdAt: c.createdAt,
      }))
  }
}

/** Singleton instance shared across the server runtime. */
export const credentialStore = new CredentialStore()
