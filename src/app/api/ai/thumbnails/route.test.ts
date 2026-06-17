import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the z-ai-web-dev-sdk so the route never hits the real image service.
const mockImagesCreate = vi.fn()
vi.mock('z-ai-web-dev-sdk', () => ({
  default: {
    create: vi.fn(() =>
      Promise.resolve({
        images: {
          generations: {
            create: mockImagesCreate,
          },
        },
      })
    ),
  },
}))

let ipCounter = 0
function nextIp() {
  ipCounter += 1
  return `203.0.113.${ipCounter % 250}`
}

function makeRequest(body: unknown, ip = nextIp()) {
  return new NextRequest('http://localhost/api/ai/thumbnails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  })
}

const validBody = {
  productName: 'RGB Mechanical Keyboard',
  style: 'Bold' as const,
  textOverlay: 'HOT DEAL',
}

describe('POST /api/ai/thumbnails', () => {
  beforeEach(() => {
    ipCounter += 1
    mockImagesCreate.mockReset()
    mockImagesCreate.mockResolvedValue({
      data: [{ base64: 'aGVsbG8=' }], // "hello" in base64
    })
  })

  it('returns 200 with an image data URL when the body is valid', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.image).toMatch(/^data:image\/png;base64,/)
  })

  it('returns source="ai" when the SDK returns an image', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    const data = await res.json()
    expect(data.source).toBe('ai')
  })

  it('includes the prompt used for image generation in the response', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    const data = await res.json()
    expect(typeof data.prompt).toBe('string')
    expect(data.prompt).toContain(validBody.productName)
  })

  it('passes the prompt to the SDK with size 1024x1024', async () => {
    const { POST } = await import('./route')
    await POST(makeRequest(validBody))
    expect(mockImagesCreate).toHaveBeenCalledTimes(1)
    const callArg = mockImagesCreate.mock.calls[0]?.[0]
    expect(callArg).toHaveProperty('prompt')
    expect(callArg).toHaveProperty('size', '1024x1024')
  })

  it('returns 400 when productName is missing', async () => {
    const { POST } = await import('./route')
    const { productName: _omit, ...withoutProductName } = validBody
    const res = await POST(makeRequest(withoutProductName))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('returns 400 when productName is an empty string', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ ...validBody, productName: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when style is an invalid enum value', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ ...validBody, style: 'Gothic' }))
    expect(res.status).toBe(400)
  })

  it('returns 503 when the SDK throws', async () => {
    mockImagesCreate.mockRejectedValueOnce(new Error('AI unavailable'))
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toBeDefined()
    expect(data.source).toBe('fallback')
  })

  it('returns 503 when the SDK returns no base64 data', async () => {
    mockImagesCreate.mockResolvedValueOnce({ data: [] })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(503)
  })

  it('accepts an optional textOverlay field', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ productName: 'Test Product', style: 'Minimal' }))
    expect(res.status).toBe(200)
  })

  it('accepts all valid style enum values', async () => {
    const { POST } = await import('./route')
    for (const style of ['Bold', 'Minimal', 'Vibrant', 'Halal-friendly'] as const) {
      const res = await POST(makeRequest({ productName: 'P', style }))
      expect(res.status).toBe(200)
    }
  })
})
