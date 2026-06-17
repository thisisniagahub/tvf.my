/**
 * Agent v2 — Encrypted Credential Store
 * -------------------------------------
 * Stores platform login credentials (Shopee / Lazada / TikTok /
 * Facebook / Instagram) for use by the agent's headless browser
 * sessions.
 *
 * SECURITY STATUS:
 *   ⚠️  The current implementation uses base64 encoding as a
 *      placeholder. Base64 is NOT encryption — it is reversible
 *      by anyone with the string. This is acceptable ONLY for the
 *      current dev/sandbox phase.
 *
 *   For production, replace `encrypt` / `decrypt` with AES-256-GCM
 *   using a server-side key managed by a secrets manager (e.g. Vault,
 *   AWS KMS, GCP KMS). The key should NEVER be committed to source
 *   control — pull it from `process.env.NEXTAUTH_SECRET` (already
 *   done here) and rotate it regularly.
 *
 *   The `CredentialStore` API is intentionally storage-agnostic —
 *   swapping the in-memory `Map` for Prisma + an encrypted column
 *   is a drop-in change that will not affect callers.
 */

import { logger } from '@/lib/logger'

const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || 'fallback-key-not-secure'

export interface StoredCredential {
  id: string
  platform: string
  username: string
  /** Encrypted at rest; decrypted only when explicitly fetched. */
  password: string
  createdAt: string
}

/** Public-safe projection (no password, even encrypted). */
export type CredentialSummary = Omit<StoredCredential, 'password'>

/**
 * Placeholder symmetric "encryption".
 *
 * TODO(prod): replace with `crypto.createCipheriv('aes-256-gcm', ...)`
 * using `ENCRYPTION_KEY` (sha256-derived) + a per-record random IV +
 * an auth tag persisted alongside the ciphertext.
 */
function encrypt(text: string): string {
  // Derive a key-dependent prefix so the ciphertext is at least
  // bound to the configured secret. (NOT real security — see header.)
  const keyTag = Buffer.from(ENCRYPTION_KEY).toString('base64').substring(0, 8)
  const payload = `${keyTag}:${text}`
  return Buffer.from(payload).toString('base64')
}

function decrypt(encrypted: string): string {
  try {
    const payload = Buffer.from(encrypted, 'base64').toString('utf-8')
    const colonIdx = payload.indexOf(':')
    if (colonIdx === -1) return ''
    // Verify the key tag matches — if not, the secret was rotated.
    const keyTag = payload.substring(0, colonIdx)
    const expectedTag = Buffer.from(ENCRYPTION_KEY).toString('base64').substring(0, 8)
    if (keyTag !== expectedTag) {
      logger.warn('Credential decrypt: key tag mismatch (rotated secret?)')
      return ''
    }
    return payload.substring(colonIdx + 1)
  } catch {
    logger.warn('Credential decrypt: malformed ciphertext')
    return ''
  }
}

export class CredentialStore {
  private store = new Map<string, StoredCredential>()

  /**
   * Persist a new credential. The password is encrypted at rest.
   * Returns the new credential id.
   */
  async storeCredential(
    platform: string,
    username: string,
    password: string
  ): Promise<string> {
    const id = `cred-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    const cred: StoredCredential = {
      id,
      platform,
      username,
      password: encrypt(password),
      createdAt: new Date().toISOString(),
    }
    this.store.set(id, cred)
    logger.info('Credential stored', { platform, username, id })
    return id
  }

  /**
   * Fetch a single credential by id, with the password decrypted.
   * Callers MUST treat the returned `password` as sensitive and
   * never log or persist it.
   */
  async getCredential(id: string): Promise<StoredCredential | null> {
    const cred = this.store.get(id)
    if (!cred) return null
    return { ...cred, password: decrypt(cred.password) }
  }

  /** All credentials for a given platform (passwords decrypted). */
  async getCredentialsByPlatform(platform: string): Promise<StoredCredential[]> {
    return Array.from(this.store.values())
      .filter((c) => c.platform === platform)
      .map((c) => ({ ...c, password: decrypt(c.password) }))
  }

  /** Remove a credential. Idempotent — deleting a missing id is a no-op. */
  async deleteCredential(id: string): Promise<void> {
    const existed = this.store.delete(id)
    if (existed) {
      logger.info('Credential deleted', { id })
    }
  }

  /**
   * List all credentials WITHOUT passwords. Safe to return from
   * public API endpoints.
   */
  async listCredentials(): Promise<CredentialSummary[]> {
    return Array.from(this.store.values()).map((c) => ({
      id: c.id,
      platform: c.platform,
      username: c.username,
      createdAt: c.createdAt,
    }))
  }
}

/** Singleton instance shared across the server runtime. */
export const credentialStore = new CredentialStore()
