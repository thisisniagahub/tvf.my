import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

let ipCounter = 0
function nextIp() {
  ipCounter += 1
  return `198.51.100.${ipCounter % 250}`
}

function makeRequest(ip = nextIp()) {
  return new NextRequest('http://localhost/api/trends', {
    method: 'GET',
    headers: { 'x-forwarded-for': ip },
  })
}

describe('GET /api/trends', () => {
  beforeEach(() => {
    ipCounter += 1
  })

  it('returns 200 OK', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
  })

  it('returns categories and trends arrays', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(Array.isArray(data.categories)).toBe(true)
    expect(Array.isArray(data.trends)).toBe(true)
  })

  it('includes lastUpdated and source fields', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.lastUpdated).toBeDefined()
    expect(data.source).toBe('demo')
  })

  it('lastUpdated is a valid ISO date string', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    const d = new Date(data.lastUpdated)
    expect(d.toString()).not.toBe('Invalid Date')
    expect(Number.isNaN(d.getTime())).toBe(false)
  })

  it('each category has the expected fields', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.categories.length).toBeGreaterThan(0)
    const first = data.categories[0]
    expect(first).toHaveProperty('name')
    expect(first).toHaveProperty('emoji')
    expect(first).toHaveProperty('velocity')
    expect(first).toHaveProperty('status')
    expect(first).toHaveProperty('products')
  })

  it('each trend has the expected fields', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.trends.length).toBeGreaterThan(0)
    const first = data.trends[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('name')
    expect(first).toHaveProperty('category')
    expect(first).toHaveProperty('velocity')
    expect(first).toHaveProperty('status')
  })

  it('returns at least 8 trend categories', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.categories.length).toBeGreaterThanOrEqual(8)
  })
})
