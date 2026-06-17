import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the z-ai-web-dev-sdk so the route never hits the real TTS service.
const mockTtsCreate = vi.fn()
vi.mock('z-ai-web-dev-sdk', () => ({
  default: {
    create: vi.fn(() =>
      Promise.resolve({
        audio: {
          tts: {
            create: mockTtsCreate,
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
  return new NextRequest('http://localhost/api/ai/voiceover', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  })
}

const validBody = {
  text: 'Hello there, this is a test voiceover script.',
}

// Mock Response-like object returned by the SDK's tts.create()
function mockTtsResponse(buffer = new ArrayBuffer(8)) {
  return {
    arrayBuffer: vi.fn(async () => buffer),
  }
}

describe('POST /api/ai/voiceover', () => {
  beforeEach(() => {
    ipCounter += 1
    mockTtsCreate.mockReset()
    mockTtsCreate.mockResolvedValue(mockTtsResponse())
  })

  it('returns 200 with audio/wav content-type when the body is valid', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('audio/wav')
  })

  it('returns a non-empty body', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    const buffer = await res.arrayBuffer()
    expect(buffer.byteLength).toBeGreaterThan(0)
  })

  it('includes Content-Length header matching the body size', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    const buffer = await res.arrayBuffer()
    expect(res.headers.get('Content-Length')).toBe(String(buffer.byteLength))
  })

  it('includes Cache-Control: no-cache header', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    expect(res.headers.get('Cache-Control')).toBe('no-cache')
  })

  it('passes the text and default voice to the SDK', async () => {
    const { POST } = await import('./route')
    await POST(makeRequest(validBody))
    expect(mockTtsCreate).toHaveBeenCalledTimes(1)
    const callArg = mockTtsCreate.mock.calls[0]?.[0]
    expect(callArg).toHaveProperty('input', validBody.text)
    expect(callArg).toHaveProperty('voice', 'tongtong')
    expect(callArg).toHaveProperty('response_format', 'wav')
  })

  it('returns 400 when text is missing', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('returns 400 when text is an empty string', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ text: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when text exceeds 1024 characters', async () => {
    const { POST } = await import('./route')
    const longText = 'a'.repeat(1025)
    const res = await POST(makeRequest({ text: longText }))
    expect(res.status).toBe(400)
  })

  it('accepts text exactly 1024 characters long', async () => {
    const { POST } = await import('./route')
    const maxText = 'a'.repeat(1024)
    const res = await POST(makeRequest({ text: maxText }))
    expect(res.status).toBe(200)
  })

  it('returns 400 when voice is an invalid enum value', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ ...validBody, voice: 'invalid-voice' }))
    expect(res.status).toBe(400)
  })

  it('accepts all valid voice enum values', async () => {
    const { POST } = await import('./route')
    const voices = ['tongtong', 'chuichui', 'xiaochen', 'jam', 'kazi', 'douji', 'luodo'] as const
    for (const voice of voices) {
      const res = await POST(makeRequest({ ...validBody, voice }))
      expect(res.status).toBe(200)
    }
  })

  it('returns 503 when the SDK throws', async () => {
    mockTtsCreate.mockRejectedValueOnce(new Error('TTS unavailable'))
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('passes the speed value to the SDK when set', async () => {
    const { POST } = await import('./route')
    await POST(makeRequest({ ...validBody, speed: 1.5 }))
    const callArg = mockTtsCreate.mock.calls[0]?.[0]
    expect(callArg).toHaveProperty('speed', 1.5)
  })

  it('uses default speed of 1.0 when not specified', async () => {
    const { POST } = await import('./route')
    await POST(makeRequest(validBody))
    const callArg = mockTtsCreate.mock.calls[0]?.[0]
    expect(callArg).toHaveProperty('speed', 1.0)
  })
})
