import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { RATE_LIMITS } from '@/lib/rate-limit'

// Use a unique counter per test so each test gets its own rate-limit bucket
// (keyed by IP). This prevents cross-test contamination from the shared
// in-memory rate-limit Map.
let ipCounter = 0
function nextIp() {
  ipCounter += 1
  return `203.0.113.${ipCounter % 250}`
}

function makeRequest(ip = nextIp()) {
  return new NextRequest('http://localhost/api/dashboard', {
    method: 'GET',
    headers: { 'x-forwarded-for': ip },
  })
}

describe('GET /api/dashboard', () => {
  beforeEach(() => {
    ipCounter += 1
  })

  it('returns 200 OK', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
  })

  it('returns JSON with earnings, activities, and topProducts arrays', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.earnings)).toBe(true)
    expect(Array.isArray(data.activities)).toBe(true)
    expect(Array.isArray(data.topProducts)).toBe(true)
  })

  it('returns a stats object with the expected keys', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.stats).toBeDefined()
    expect(data.stats).toHaveProperty('totalEarnings')
    expect(data.stats).toHaveProperty('totalClicks')
    expect(data.stats).toHaveProperty('conversionRate')
    expect(data.stats).toHaveProperty('activeLinks')
  })

  it('limits topProducts to 8 items', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.topProducts.length).toBeLessThanOrEqual(8)
  })

  it('includes the earnings chart data points with date/earnings/clicks/orders', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.earnings.length).toBeGreaterThan(0)
    const first = data.earnings[0]
    expect(first).toHaveProperty('date')
    expect(first).toHaveProperty('earnings')
    expect(first).toHaveProperty('clicks')
    expect(first).toHaveProperty('orders')
  })

  it('returns 429 when rate limit is exceeded', async () => {
    const { GET } = await import('./route')
    const ip = nextIp()
    const limit = RATE_LIMITS.api.limit
    let lastResponse: Response | null = null
    for (let i = 0; i < limit + 1; i++) {
      lastResponse = await GET(makeRequest(ip))
    }
    if (!lastResponse) throw new Error('expected a response')
    expect(lastResponse.status).toBe(429)
    const body = await lastResponse.json()
    expect(body.error).toMatch(/too many requests/i)
  })

  it('includes Retry-After header on 429 responses', async () => {
    const { GET } = await import('./route')
    const ip = nextIp()
    const limit = RATE_LIMITS.api.limit
    let lastResponse: Response | null = null
    for (let i = 0; i < limit + 1; i++) {
      lastResponse = await GET(makeRequest(ip))
    }
    if (!lastResponse) throw new Error('expected a response')
    expect(lastResponse.status).toBe(429)
    expect(lastResponse.headers.get('Retry-After')).not.toBeNull()
  })

  it('returns X-RateLimit-* headers on 429 responses', async () => {
    const { GET } = await import('./route')
    const ip = nextIp()
    const limit = RATE_LIMITS.api.limit
    let lastResponse: Response | null = null
    for (let i = 0; i < limit + 1; i++) {
      lastResponse = await GET(makeRequest(ip))
    }
    if (!lastResponse) throw new Error('expected a response')
    expect(lastResponse.headers.get('X-RateLimit-Limit')).toBe(String(limit))
    expect(lastResponse.headers.get('X-RateLimit-Remaining')).toBe('0')
    expect(lastResponse.headers.get('X-RateLimit-Reset')).not.toBeNull()
  })
})
