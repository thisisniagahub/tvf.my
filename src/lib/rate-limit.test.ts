import { describe, it, expect, vi } from 'vitest'
import {
  rateLimit,
  applyRateLimit,
  getClientIp,
  RATE_LIMITS,
  type RateLimitConfig,
} from './rate-limit'

describe('rate-limit', () => {
  describe('rateLimit()', () => {
    const config: RateLimitConfig = {
      limit: 3,
      windowMs: 1000,
      keyPrefix: 'test',
    }

    it('allows the first request in a window', () => {
      const result = rateLimit('client-1', config)
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(2)
      expect(result.retryAfter).toBe(0)
    })

    it('allows requests within the limit', () => {
      rateLimit('client-2', config)
      rateLimit('client-2', config)
      const third = rateLimit('client-2', config)
      expect(third.success).toBe(true)
      expect(third.remaining).toBe(0)
    })

    it('blocks requests once the limit is exceeded', () => {
      const cfg: RateLimitConfig = { limit: 2, windowMs: 1000, keyPrefix: 'block-test' }
      rateLimit('client-3', cfg)
      rateLimit('client-3', cfg)
      const third = rateLimit('client-3', cfg)
      expect(third.success).toBe(false)
      expect(third.remaining).toBe(0)
    })

    it('returns a positive retryAfter when blocked', () => {
      const cfg: RateLimitConfig = { limit: 1, windowMs: 5000, keyPrefix: 'retry-test' }
      rateLimit('client-4', cfg)
      const second = rateLimit('client-4', cfg)
      expect(second.success).toBe(false)
      expect(second.retryAfter).toBeGreaterThan(0)
      expect(second.retryAfter).toBeLessThanOrEqual(5)
    })

    it('resets the counter after the window elapses', () => {
      vi.useFakeTimers()
      const cfg: RateLimitConfig = { limit: 2, windowMs: 1000, keyPrefix: 'reset-test' }
      rateLimit('client-5', cfg)
      rateLimit('client-5', cfg)
      const blocked = rateLimit('client-5', cfg)
      expect(blocked.success).toBe(false)

      // Advance past the window — next request should start a fresh window.
      vi.advanceTimersByTime(1100)
      const after = rateLimit('client-5', cfg)
      expect(after.success).toBe(true)
      expect(after.remaining).toBe(1)
      vi.useRealTimers()
    })

    it('tracks different identifiers independently', () => {
      const cfg: RateLimitConfig = { limit: 1, windowMs: 1000, keyPrefix: 'isolation-test' }
      const a1 = rateLimit('ip-A', cfg)
      const b1 = rateLimit('ip-B', cfg)
      const a2 = rateLimit('ip-A', cfg)
      const b2 = rateLimit('ip-B', cfg)
      expect(a1.success).toBe(true)
      expect(b1.success).toBe(true)
      expect(a2.success).toBe(false) // A is at limit
      expect(b2.success).toBe(false) // B is at limit
    })

    it('uses keyPrefix to namespace the bucket', () => {
      const cfg1: RateLimitConfig = { limit: 1, windowMs: 1000, keyPrefix: 'route-a' }
      const cfg2: RateLimitConfig = { limit: 1, windowMs: 1000, keyPrefix: 'route-b' }
      const r1 = rateLimit('same-ip', cfg1)
      const r2 = rateLimit('same-ip', cfg2)
      // Same IP but different route prefixes — both should be allowed.
      expect(r1.success).toBe(true)
      expect(r2.success).toBe(true)
    })

    it('returns the configured limit in the result', () => {
      const cfg: RateLimitConfig = { limit: 7, windowMs: 1000, keyPrefix: 'limit-field' }
      const r = rateLimit('client-6', cfg)
      expect(r.limit).toBe(7)
    })
  })

  describe('RATE_LIMITS presets', () => {
    it('exports the expected preset configuration', () => {
      expect(RATE_LIMITS.auth.limit).toBe(5)
      expect(RATE_LIMITS.api.limit).toBe(100)
      expect(RATE_LIMITS.ai.limit).toBe(10)
      expect(RATE_LIMITS.search.limit).toBe(30)
    })

    it('uses 60-second (60000ms) windows for all presets', () => {
      for (const cfg of Object.values(RATE_LIMITS)) {
        expect(cfg.windowMs).toBe(60_000)
      }
    })
  })

  describe('applyRateLimit()', () => {
    it('returns null when the request is allowed', () => {
      const req = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': 'allow-ip' },
      })
      const result = applyRateLimit(req, { limit: 10, windowMs: 1000 }, 'route-test')
      expect(result).toBeNull()
    })

    it('returns a 429 Response when the request is blocked', () => {
      const cfg = { limit: 1, windowMs: 1000 }
      const ip = 'blocked-ip'
      const req1 = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': ip },
      })
      const req2 = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': ip },
      })
      // First call allowed
      expect(applyRateLimit(req1, cfg, 'route-block-test')).toBeNull()
      // Second call blocked
      const blocked = applyRateLimit(req2, cfg, 'route-block-test')
      expect(blocked).not.toBeNull()
      if (!blocked) throw new Error('expected blocked response')
      expect(blocked.status).toBe(429)
    })

    it('includes Retry-After header on the 429 response', async () => {
      const cfg = { limit: 1, windowMs: 1000 }
      const ip = 'retry-after-ip'
      const req1 = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': ip },
      })
      const req2 = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': ip },
      })
      applyRateLimit(req1, cfg, 'route-retry-test')
      const blocked = applyRateLimit(req2, cfg, 'route-retry-test')
      if (!blocked) throw new Error('expected blocked response')
      expect(blocked.headers.get('Retry-After')).not.toBeNull()
      const body = await blocked.json()
      expect(body.error).toMatch(/too many requests/i)
      expect(body).toHaveProperty('retryAfter')
    })

    it('includes X-RateLimit-* headers on the 429 response', () => {
      const cfg = { limit: 1, windowMs: 1000 }
      const ip = 'ratelimit-headers-ip'
      const req1 = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': ip },
      })
      const req2 = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': ip },
      })
      applyRateLimit(req1, cfg, 'route-headers-test')
      const blocked = applyRateLimit(req2, cfg, 'route-headers-test')
      if (!blocked) throw new Error('expected blocked response')
      expect(blocked.headers.get('X-RateLimit-Limit')).toBe('1')
      expect(blocked.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(blocked.headers.get('X-RateLimit-Reset')).not.toBeNull()
    })

    it('returns a JSON Content-Type on the 429 response', () => {
      const cfg = { limit: 1, windowMs: 1000 }
      const ip = 'content-type-ip'
      const req1 = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': ip },
      })
      const req2 = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': ip },
      })
      applyRateLimit(req1, cfg, 'route-ctype-test')
      const blocked = applyRateLimit(req2, cfg, 'route-ctype-test')
      if (!blocked) throw new Error('expected blocked response')
      expect(blocked.headers.get('Content-Type')).toBe('application/json')
    })
  })

  describe('getClientIp()', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const req = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
      })
      expect(getClientIp(req)).toBe('1.2.3.4')
    })

    it('trims whitespace around the IP from x-forwarded-for', () => {
      const req = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '  9.9.9.9  ' },
      })
      expect(getClientIp(req)).toBe('9.9.9.9')
    })

    it('extracts IP from x-real-ip header when x-forwarded-for is missing', () => {
      const req = new Request('http://localhost/api/test', {
        headers: { 'x-real-ip': '10.0.0.1' },
      })
      expect(getClientIp(req)).toBe('10.0.0.1')
    })

    it('prefers x-forwarded-for over x-real-ip', () => {
      const req = new Request('http://localhost/api/test', {
        headers: {
          'x-forwarded-for': '1.1.1.1',
          'x-real-ip': '2.2.2.2',
        },
      })
      expect(getClientIp(req)).toBe('1.1.1.1')
    })

    it('returns "unknown" when neither header is present', () => {
      const req = new Request('http://localhost/api/test')
      expect(getClientIp(req)).toBe('unknown')
    })
  })
})
