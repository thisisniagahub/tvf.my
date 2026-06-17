import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

type SearchResult = {
  type: 'product' | 'link' | 'campaign'
  id: string
  label: string
  desc: string
  page: string
  icon: string
  badge?: string
}

let ipCounter = 0
function nextIp() {
  ipCounter += 1
  return `198.18.0.${ipCounter % 250}`
}

function makeRequest(query: string, ip = nextIp()) {
  return new NextRequest(`http://localhost/api/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: { 'x-forwarded-for': ip },
  })
}

describe('GET /api/search', () => {
  beforeEach(() => {
    ipCounter += 1
  })

  it('returns 200 OK with a valid query', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('keyboard'))
    expect(res.status).toBe(200)
  })

  it('returns a results array', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('keyboard'))
    const data = await res.json()
    expect(Array.isArray(data.results)).toBe(true)
  })

  it('returns count field equal to results length', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('keyboard'))
    const data = await res.json()
    expect(data.count).toBe(data.results.length)
  })

  it('searches products by name', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('keyboard'))
    const data = await res.json()
    expect(data.results.length).toBeGreaterThan(0)
    const productResults = data.results.filter((r: SearchResult) => r.type === 'product')
    expect(productResults.length).toBeGreaterThan(0)
  })

  it('searches affiliate links by product name', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('Tudung'))
    const data = await res.json()
    const linkResults = data.results.filter((r: SearchResult) => r.type === 'link')
    expect(linkResults.length).toBeGreaterThan(0)
  })

  it('searches campaigns by name', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('Raya'))
    const data = await res.json()
    const campaignResults = data.results.filter((r: SearchResult) => r.type === 'campaign')
    expect(campaignResults.length).toBeGreaterThan(0)
  })

  it('returns empty results array for queries shorter than 2 characters', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('k'))
    const data = await res.json()
    expect(data.results).toEqual([])
  })

  it('returns empty results for an unmatched query', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('zzznotfoundzzz'))
    const data = await res.json()
    expect(data.results).toEqual([])
    expect(data.count).toBe(0)
  })

  it('returns result items with type, id, label, desc, page, and icon fields', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('keyboard'))
    const data = await res.json()
    const first = data.results[0]
    expect(first).toHaveProperty('type')
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('label')
    expect(first).toHaveProperty('desc')
    expect(first).toHaveProperty('page')
    expect(first).toHaveProperty('icon')
  })

  it('returns product results with the correct page target', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest('blender'))
    const data = await res.json()
    const productResults = data.results.filter((r: SearchResult) => r.type === 'product')
    for (const r of productResults) {
      expect(r.page).toBe('products')
    }
  })
})
