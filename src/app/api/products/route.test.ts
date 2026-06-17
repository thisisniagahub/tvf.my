import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

let ipCounter = 0
function nextIp() {
  ipCounter += 1
  return `198.51.100.${ipCounter % 250}`
}

function makeRequest(url: string, ip = nextIp()) {
  return new NextRequest(url, {
    method: 'GET',
    headers: { 'x-forwarded-for': ip },
  })
}

describe('GET /api/products', () => {
  beforeEach(() => {
    ipCounter += 1
  })

  it('returns 200 OK', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/products'))
    expect(res.status).toBe(200)
  })

  it('returns a products array', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/products'))
    const data = await res.json()
    expect(Array.isArray(data.products)).toBe(true)
    expect(data.products.length).toBeGreaterThan(0)
  })

  it('returns the count and source fields', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/products'))
    const data = await res.json()
    expect(data.count).toBe(data.products.length)
    expect(data.source).toBe('demo')
  })

  it('includes expected product fields', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/products'))
    const data = await res.json()
    const first = data.products[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('name')
    expect(first).toHaveProperty('price')
    expect(first).toHaveProperty('category')
    expect(first).toHaveProperty('commissionRate')
  })

  it('filters by category when category query param is set', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/products?category=Beauty'))
    const data = await res.json()
    expect(data.products.length).toBeGreaterThan(0)
    for (const p of data.products) {
      expect(p.category).toBe('Beauty')
    }
  })

  it('returns all categories when category=All', async () => {
    const { GET } = await import('./route')
    const allRes = await GET(makeRequest('http://localhost/api/products'))
    const allData = await allRes.json()
    const res = await GET(makeRequest('http://localhost/api/products?category=All'))
    const data = await res.json()
    expect(data.count).toBe(allData.count)
  })

  it('returns empty array for a non-existent category', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/products?category=NonExistentCategory'))
    const data = await res.json()
    expect(data.products).toEqual([])
    expect(data.count).toBe(0)
  })

  it('filters by search query (q)', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/products?q=keyboard'))
    const data = await res.json()
    expect(data.products.length).toBeGreaterThan(0)
    for (const p of data.products) {
      expect(p.name.toLowerCase()).toContain('keyboard')
    }
  })

  it('returns empty array for unmatched search query', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/products?q=zzznotfoundzzz'))
    const data = await res.json()
    expect(data.products).toEqual([])
    expect(data.count).toBe(0)
  })

  it('combines category and search filters', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/products?category=Beauty&q=wardah'))
    const data = await res.json()
    expect(data.products.length).toBeGreaterThan(0)
    for (const p of data.products) {
      expect(p.category).toBe('Beauty')
      expect(p.name.toLowerCase()).toContain('wardah')
    }
  })
})
