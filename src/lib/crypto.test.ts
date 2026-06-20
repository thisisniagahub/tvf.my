import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'

/**
 * Tests for the AES-256-GCM crypto helpers.
 *
 * The crypto module reads `process.env.NEXTAUTH_SECRET` (must be >= 32 chars)
 * and derives a 256-bit key via scryptSync. We set a stable secret before all
 * tests and reset modules between sub-describes so the cached key is fresh.
 */

const TEST_SECRET = 'test-nextauth-secret-at-least-32-chars-long-aaaaaa'

describe('crypto', () => {
  beforeAll(() => {
    process.env.NEXTAUTH_SECRET = TEST_SECRET
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('encrypt()', () => {
    it('returns a string with 3 base64 parts separated by ":"', async () => {
      const { encrypt } = await import('./crypto')
      const result = encrypt('hello world')
      expect(typeof result).toBe('string')
      const parts = result.split(':')
      expect(parts.length).toBe(3)
      // Each part must be valid base64 (Buffer.from with strict base64 does
      // not throw on invalid input, but the byte length should be > 0).
      for (const part of parts) {
        expect(part.length).toBeGreaterThan(0)
        const decoded = Buffer.from(part, 'base64')
        expect(decoded.length).toBeGreaterThan(0)
      }
    })

    it('produces different ciphertexts for the same plaintext (random IV)', async () => {
      const { encrypt } = await import('./crypto')
      const a = encrypt('same plaintext')
      const b = encrypt('same plaintext')
      expect(a).not.toBe(b)
      // But both should decrypt back to the same plaintext.
      const { decrypt } = await import('./crypto')
      expect(decrypt(a)).toBe('same plaintext')
      expect(decrypt(b)).toBe('same plaintext')
    })

    it('IV part is 12 bytes (96-bit GCM standard) when decoded', async () => {
      const { encrypt } = await import('./crypto')
      const result = encrypt('payload')
      const ivB64 = result.split(':')[0]
      expect(Buffer.from(ivB64, 'base64').length).toBe(12)
    })
  })

  describe('decrypt()', () => {
    it('reverses encrypt() — round-trip preserves the plaintext', async () => {
      const { encrypt, decrypt } = await import('./crypto')
      const plaintext = 'my super secret password 123!@#'
      const encrypted = encrypt(plaintext)
      expect(decrypt(encrypted)).toBe(plaintext)
    })

    it('handles unicode / emoji plaintext correctly', async () => {
      const { encrypt, decrypt } = await import('./crypto')
      const plaintext = 'héllo wörld 🚀 emoji test 你好'
      expect(decrypt(encrypt(plaintext))).toBe(plaintext)
    })

    it('returns empty string for tampered ciphertext', async () => {
      const { encrypt, decrypt } = await import('./crypto')
      const encrypted = encrypt('hello')
      const [ivB64, tagB64, ciphertextB64] = encrypted.split(':')
      // Flip the last two chars of the ciphertext — auth tag will not verify.
      const tamperedCiphertext = ciphertextB64.slice(0, -2) + 'XX'
      const tampered = `${ivB64}:${tagB64}:${tamperedCiphertext}`
      expect(decrypt(tampered)).toBe('')
    })

    it('returns empty string for a tampered auth tag', async () => {
      const { encrypt, decrypt } = await import('./crypto')
      const encrypted = encrypt('hello')
      const [ivB64, tagB64, ciphertextB64] = encrypted.split(':')
      const tamperedTag = tagB64.slice(0, -2) + 'ZZ'
      const tampered = `${ivB64}:${tamperedTag}:${ciphertextB64}`
      expect(decrypt(tampered)).toBe('')
    })

    it('returns empty string for malformed input (wrong number of parts)', async () => {
      const { decrypt } = await import('./crypto')
      expect(decrypt('not-a-valid-format')).toBe('')
      expect(decrypt('only:two-parts')).toBe('')
      expect(decrypt('a:b:c:d')).toBe('')
      expect(decrypt('')).toBe('')
    })

    it('returns empty string for input that is not valid base64', async () => {
      const { decrypt } = await import('./crypto')
      // Three colon-separated parts, but content is not decodable as base64
      // into a valid IV/tag/ciphertext shape. createDecipheriv throws on
      // invalid IV length, which decrypt() catches and returns ''.
      expect(decrypt('!!!:???:###')).toBe('')
    })
  })

  describe('isEncrypted()', () => {
    it('returns true for a freshly encrypted value', async () => {
      const { encrypt, isEncrypted } = await import('./crypto')
      expect(isEncrypted(encrypt('test'))).toBe(true)
    })

    it('returns false for plain text without colons', async () => {
      const { isEncrypted } = await import('./crypto')
      expect(isEncrypted('hello world')).toBe(false)
      expect(isEncrypted('password123')).toBe(false)
      expect(isEncrypted('not-encrypted')).toBe(false)
    })

    it('returns false for strings with the wrong number of colon-separated parts', async () => {
      const { isEncrypted } = await import('./crypto')
      expect(isEncrypted('only-one')).toBe(false)
      expect(isEncrypted('two:parts')).toBe(false)
      expect(isEncrypted('four:parts:here:now')).toBe(false)
    })

    it('returns false for empty string', async () => {
      const { isEncrypted } = await import('./crypto')
      expect(isEncrypted('')).toBe(false)
    })
  })
})
