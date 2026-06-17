import crypto from 'crypto'
import { logger } from '@/lib/logger'

/**
 * AES-256-GCM encryption utility.
 *
 * Derives a 256-bit key from `NEXTAUTH_SECRET` using `scryptSync`. Each
 * encryption uses a random 12-byte IV (96-bit GCM standard) and a 16-byte
 * auth tag, both persisted alongside the ciphertext so decryption can
 * verify integrity.
 *
 * Serialized format (all base64):
 *   `${iv}:${tag}:${ciphertext}`
 *
 * Security properties:
 *   - Confidentiality: AES-256 cipher, key never logged.
 *   - Integrity/authenticity: GCM auth tag — any tampering with the
 *     ciphertext, IV, or tag causes `decrypt()` to throw and return ''.
 *   - Key rotation: change `NEXTAUTH_SECRET` and re-encrypt records.
 *     Decrypting an old record with the new key fails cleanly (returns '').
 *
 * The key derivation uses a fixed salt for now (per-record salts are a
 * Phase 2 enhancement — tracked in the TODO below).
 */

const SALT = 'theviralfindsmy-salt-v1' // TODO: per-record salt in Phase 2
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 12 // 96 bits (GCM standard)

function getEncryptionKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'NEXTAUTH_SECRET must be set and at least 32 characters for credential encryption'
    )
  }
  return crypto.scryptSync(secret, SALT, KEY_LENGTH)
}

/**
 * Encrypt plaintext using AES-256-GCM.
 *
 * Returns the serialized string `${iv}:${tag}:${ciphertext}` (all base64).
 * A fresh random IV is generated for every call — encrypting the same
 * plaintext twice produces different ciphertexts.
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`
}

/**
 * Decrypt AES-256-GCM ciphertext produced by {@link encrypt}.
 *
 * Returns the plaintext string, or an empty string if:
 *   - the input is malformed (not 3 colon-separated base64 parts),
 *   - the auth tag does not verify (tampered ciphertext or wrong key),
 *   - any other crypto error occurs.
 *
 * Never throws — callers can safely use this on untrusted input.
 */
export function decrypt(serialized: string): string {
  try {
    const parts = serialized.split(':')
    if (parts.length !== 3) {
      logger.warn('Decrypt: malformed ciphertext format')
      return ''
    }
    const [ivB64, tagB64, ciphertextB64] = parts
    const key = getEncryptionKey()
    const iv = Buffer.from(ivB64, 'base64')
    const tag = Buffer.from(tagB64, 'base64')
    const ciphertext = Buffer.from(ciphertextB64, 'base64')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ])
    return plaintext.toString('utf8')
  } catch (error) {
    logger.warn('Decrypt: authentication failed (tampered or wrong key)', {
      error: error instanceof Error ? error.message : 'unknown',
    })
    return ''
  }
}

/**
 * Check if a string is already encrypted (matches our `iv:tag:ciphertext`
 * format with valid base64 parts).
 *
 * Used to decide whether to re-encrypt a value (e.g. when the user
 * submits an updated plaintext apiKey for an MCP server that already
 * has an encrypted value stored).
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':')
  if (parts.length !== 3) return false
  try {
    Buffer.from(parts[0], 'base64')
    Buffer.from(parts[1], 'base64')
    Buffer.from(parts[2], 'base64')
    return true
  } catch {
    return false
  }
}
