import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the z-ai-web-dev-sdk so the route never hits the real AI service.
const mockChatCreate = vi.fn()
vi.mock('z-ai-web-dev-sdk', () => ({
  default: {
    create: vi.fn(() =>
      Promise.resolve({
        chat: {
          completions: {
            create: mockChatCreate,
          },
        },
      })
    ),
  },
}))

let ipCounter = 0
function nextIp() {
  ipCounter += 1
  return `198.51.100.${ipCounter % 250}`
}

function makeRequest(body: unknown, ip = nextIp()) {
  return new NextRequest('http://localhost/api/content/script', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  })
}

const validBody = {
  template: 'before-after',
  productName: 'Safi Balqis Sunblock',
  language: 'Manglish',
  tone: 'Excited',
  duration: '30s',
}

describe('POST /api/content/script', () => {
  beforeEach(() => {
    ipCounter += 1
    mockChatCreate.mockReset()
    mockChatCreate.mockResolvedValue({
      choices: [{ message: { content: 'AI-generated script content here!' } }],
    })
  })

  it('returns 200 with a script when the body is valid', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(typeof data.script).toBe('string')
    expect(data.script.length).toBeGreaterThan(0)
  })

  it('returns source="ai" when the SDK returns a response', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    const data = await res.json()
    expect(data.source).toBe('ai')
  })

  it('returns the AI-generated content from the SDK', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    const data = await res.json()
    expect(data.script).toBe('AI-generated script content here!')
  })

  it('returns 400 when productName is missing', async () => {
    const { POST } = await import('./route')
    const { productName: _omit, ...withoutProductName } = validBody
    const res = await POST(makeRequest(withoutProductName))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('returns 400 when template is missing', async () => {
    const { POST } = await import('./route')
    const { template: _omit, ...withoutTemplate } = validBody
    const res = await POST(makeRequest(withoutTemplate))
    expect(res.status).toBe(400)
  })

  it('returns 400 when template is an invalid enum value', async () => {
    const { POST } = await import('./route')
    const res = await POST(
      makeRequest({ ...validBody, template: 'invalid-template' })
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when language is an invalid enum value', async () => {
    const { POST } = await import('./route')
    const res = await POST(
      makeRequest({ ...validBody, language: 'Klingon' })
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when tone is an invalid enum value', async () => {
    const { POST } = await import('./route')
    const res = await POST(
      makeRequest({ ...validBody, tone: 'Sarcastic' })
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when duration is an invalid enum value', async () => {
    const { POST } = await import('./route')
    const res = await POST(
      makeRequest({ ...validBody, duration: '120s' })
    )
    expect(res.status).toBe(400)
  })

  it('falls back to a deterministic script when the SDK throws', async () => {
    mockChatCreate.mockRejectedValueOnce(new Error('AI unavailable'))
    const { POST } = await import('./route')
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.source).toBe('fallback')
    expect(data.script.length).toBeGreaterThan(0)
    // The fallback script for the "before-after" Manglish template
    // should mention the product name.
    expect(data.script).toContain(validBody.productName)
  })

  it('uses fallback script for the "unboxing" template', async () => {
    mockChatCreate.mockRejectedValueOnce(new Error('AI unavailable'))
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ ...validBody, template: 'unboxing' }))
    const data = await res.json()
    expect(data.source).toBe('fallback')
    expect(data.script.toLowerCase()).toContain('unbox')
  })

  it('passes the user message with productName to the SDK', async () => {
    const { POST } = await import('./route')
    await POST(makeRequest(validBody))
    expect(mockChatCreate).toHaveBeenCalledTimes(1)
    const callArg = mockChatCreate.mock.calls[0]?.[0] as
      | { messages: Array<{ role: string; content: string }> }
      | undefined
    if (!callArg) throw new Error('expected chat.create to be called')
    const userMsg = callArg.messages.find((m) => m.role === 'user')
    if (!userMsg) throw new Error('expected a user message')
    expect(userMsg.content).toContain(validBody.productName)
    expect(userMsg.content).toContain(validBody.template)
    expect(userMsg.content).toContain(validBody.duration)
  })
})
