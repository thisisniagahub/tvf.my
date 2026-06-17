import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('env', () => {
  beforeEach(() => {
    // Clear the cached env so each test re-validates from process.env
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  describe('checkEnv()', () => {
    it('returns valid:true when all required env vars are set', async () => {
      vi.stubEnv('DATABASE_URL', 'file:./test.db')
      vi.stubEnv('NEXTAUTH_SECRET', 'test-secret')
      const { checkEnv } = await import('./env')
      const result = checkEnv()
      expect(result.valid).toBe(true)
      expect(result.missing).toEqual([])
    })

    it('returns valid:false when DATABASE_URL is missing', async () => {
      // Stub everything except DATABASE_URL
      vi.stubEnv('DATABASE_URL', '')
      vi.stubEnv('NEXTAUTH_SECRET', 'test-secret')
      // Clear process.env directly since vi.stubEnv with '' may not unset
      delete process.env.DATABASE_URL
      const { checkEnv } = await import('./env')
      const result = checkEnv()
      expect(result.valid).toBe(false)
      expect(result.missing).toContain('DATABASE_URL')
    })

    it('returns valid:false when NEXTAUTH_SECRET is missing', async () => {
      delete process.env.NEXTAUTH_SECRET
      vi.stubEnv('DATABASE_URL', 'file:./test.db')
      const { checkEnv } = await import('./env')
      const result = checkEnv()
      expect(result.valid).toBe(false)
      expect(result.missing).toContain('NEXTAUTH_SECRET')
    })

    it('returns valid:false when both required vars are missing', async () => {
      delete process.env.DATABASE_URL
      delete process.env.NEXTAUTH_SECRET
      const { checkEnv } = await import('./env')
      const result = checkEnv()
      expect(result.valid).toBe(false)
      expect(result.missing).toContain('DATABASE_URL')
      expect(result.missing).toContain('NEXTAUTH_SECRET')
      expect(result.missing.length).toBe(2)
    })

    it('does not flag optional vars (NEXTAUTH_URL, ZAI_API_KEY, etc.) as missing', async () => {
      delete process.env.NEXTAUTH_URL
      delete process.env.SHOPEE_AFFILIATE_APP_ID
      delete process.env.SHOPEE_AFFILIATE_API_KEY
      delete process.env.ZAI_API_KEY
      vi.stubEnv('DATABASE_URL', 'file:./test.db')
      vi.stubEnv('NEXTAUTH_SECRET', 'test-secret')
      const { checkEnv } = await import('./env')
      const result = checkEnv()
      expect(result.valid).toBe(true)
      expect(result.missing).toEqual([])
    })
  })

  describe('getEnvVarDefs()', () => {
    it('returns an array of env var definitions', async () => {
      const { getEnvVarDefs } = await import('./env')
      const defs = getEnvVarDefs()
      expect(Array.isArray(defs)).toBe(true)
      expect(defs.length).toBeGreaterThan(0)
    })

    it('includes the required DATABASE_URL definition', async () => {
      const { getEnvVarDefs } = await import('./env')
      const defs = getEnvVarDefs()
      const dbUrl = defs.find((d) => d.name === 'DATABASE_URL')
      expect(dbUrl).toBeDefined()
      if (!dbUrl) throw new Error('DATABASE_URL def missing')
      expect(dbUrl.required).toBe(true)
    })

    it('includes the required NEXTAUTH_SECRET definition', async () => {
      const { getEnvVarDefs } = await import('./env')
      const defs = getEnvVarDefs()
      const secret = defs.find((d) => d.name === 'NEXTAUTH_SECRET')
      expect(secret).toBeDefined()
      if (!secret) throw new Error('NEXTAUTH_SECRET def missing')
      expect(secret.required).toBe(true)
    })

    it('marks NEXTAUTH_URL as optional', async () => {
      const { getEnvVarDefs } = await import('./env')
      const defs = getEnvVarDefs()
      const url = defs.find((d) => d.name === 'NEXTAUTH_URL')
      expect(url).toBeDefined()
      if (!url) throw new Error('NEXTAUTH_URL def missing')
      expect(url.required).toBe(false)
      expect(url.defaultValue).toBe('http://localhost:3000')
    })

    it('marks SHOPEE_AFFILIATE_APP_ID as optional', async () => {
      const { getEnvVarDefs } = await import('./env')
      const defs = getEnvVarDefs()
      const appId = defs.find((d) => d.name === 'SHOPEE_AFFILIATE_APP_ID')
      expect(appId).toBeDefined()
      if (!appId) throw new Error('SHOPEE_AFFILIATE_APP_ID def missing')
      expect(appId.required).toBe(false)
    })

    it('marks ZAI_API_KEY as optional', async () => {
      const { getEnvVarDefs } = await import('./env')
      const defs = getEnvVarDefs()
      const zai = defs.find((d) => d.name === 'ZAI_API_KEY')
      expect(zai).toBeDefined()
      if (!zai) throw new Error('ZAI_API_KEY def missing')
      expect(zai.required).toBe(false)
    })

    it('every definition has name, required, and description fields', async () => {
      const { getEnvVarDefs } = await import('./env')
      const defs = getEnvVarDefs()
      for (const d of defs) {
        expect(typeof d.name).toBe('string')
        expect(typeof d.required).toBe('boolean')
        expect(typeof d.description).toBe('string')
        expect(d.description.length).toBeGreaterThan(0)
      }
    })

    it('returns at least 6 env var definitions', async () => {
      const { getEnvVarDefs } = await import('./env')
      const defs = getEnvVarDefs()
      expect(defs.length).toBeGreaterThanOrEqual(6)
    })
  })
})
