import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { RATE_LIMITS } from '@/lib/rate-limit'

// Mock the z-ai-web-dev-sdk module so we never hit the real network.
// The route does `const ZAI = (await import('z-ai-web-dev-sdk')).default`,
// then `ZAI.create()` returns a client with `chat.completions.create`.
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

// Mock the HERMES v2 memory + skills services so the route doesn't touch the
// real SQLite database during tests.
vi.mock('@/lib/hermes-v2/memory-service', () => ({
  memoryService: {
    buildMemoryContext: vi.fn(() => Promise.resolve('')),
    addMemory: vi.fn(() => Promise.resolve()),
  },
}))
vi.mock('@/lib/hermes-v2/skills-engine', () => ({
  skillsEngine: {
    buildSkillsContext: vi.fn(() => Promise.resolve('')),
    detectSkillIds: vi.fn(() => Promise.resolve([])),
    updateSkillUsage: vi.fn(() => Promise.resolve()),
  },
}))

// Mock the auth wrapper so the route can resolve a user without a real
// NextAuth session (getServerSession would throw outside a Next.js runtime).
vi.mock('@/lib/auth', () => ({
  requireUser: vi.fn(() =>
    Promise.resolve({
      id: 'demo-user',
      name: 'TheViralFinds',
      email: 'demo@theviralfindsmy.com',
    })
  ),
  requireAuth: vi.fn(() =>
    Promise.resolve({
      id: 'demo-user',
      name: 'TheViralFinds',
      email: 'demo@theviralfindsmy.com',
    })
  ),
}))

let ipCounter = 0
function nextIp() {
  ipCounter += 1
  return `203.0.113.${ipCounter % 250}`
}

function makeRequest(body: unknown, ip = nextIp()) {
  return new NextRequest('http://localhost/api/hermes/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/hermes/chat', () => {
  beforeEach(() => {
    ipCounter += 1
    mockChatCreate.mockReset()
    mockChatCreate.mockResolvedValue({
      choices: [{ message: { content: 'Here is your AI response.' } }],
    })
  })

  it('returns 200 with a response when the message is valid', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ message: 'What are my top products?' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(typeof data.response).toBe('string')
    expect(data.response.length).toBeGreaterThan(0)
  })

  it('returns source="ai" when the SDK returns a response', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ message: 'Hello' }))
    const data = await res.json()
    expect(data.source).toBe('ai')
  })

  it('returns the AI-generated content from the SDK', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ message: 'Hi' }))
    const data = await res.json()
    expect(data.response).toBe('Here is your AI response.')
  })

  it('returns 400 when the message is empty', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ message: '' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('returns 400 when the message is missing entirely', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('returns 400 when the message exceeds 4000 characters', async () => {
    const { POST } = await import('./route')
    const longMessage = 'a'.repeat(4001)
    const res = await POST(makeRequest({ message: longMessage }))
    expect(res.status).toBe(400)
  })

  it('accepts a message exactly 4000 characters long', async () => {
    const { POST } = await import('./route')
    const maxMessage = 'a'.repeat(4000)
    const res = await POST(makeRequest({ message: maxMessage }))
    expect(res.status).toBe(200)
  })

  it('accepts an optional history array', async () => {
    const { POST } = await import('./route')
    const res = await POST(
      makeRequest({
        message: 'Follow up',
        history: [
          { role: 'user', content: 'Hi' },
          { role: 'assistant', content: 'Hello!' },
        ],
      })
    )
    expect(res.status).toBe(200)
  })

  it('falls back to a deterministic response when the SDK throws', async () => {
    mockChatCreate.mockRejectedValueOnce(new Error('AI unavailable'))
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ message: 'Tell me about trends' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.source).toBe('fallback')
    expect(data.response.length).toBeGreaterThan(0)
  })

  it('returns 429 when the rate limit is exceeded', async () => {
    const { POST } = await import('./route')
    const ip = nextIp()
    const limit = RATE_LIMITS.ai.limit
    let lastResponse: Response | null = null
    for (let i = 0; i < limit + 1; i++) {
      lastResponse = await POST(makeRequest({ message: 'Hi' }, ip))
    }
    if (!lastResponse) throw new Error('expected a response')
    expect(lastResponse.status).toBe(429)
  })

  it('passes the system prompt and user message to the SDK', async () => {
    const { POST } = await import('./route')
    await POST(makeRequest({ message: 'How do I improve conversion?' }))
    expect(mockChatCreate).toHaveBeenCalledTimes(1)
    const callArg = mockChatCreate.mock.calls[0]?.[0] as
      | { messages: Array<{ role: string; content: string }> }
      | undefined
    if (!callArg) throw new Error('expected chat.create to be called')
    expect(callArg).toHaveProperty('messages')
    const messages = callArg.messages
    expect(messages.some((m) => m.role === 'system')).toBe(true)
    expect(messages.some((m) => m.role === 'user' && m.content.includes('conversion'))).toBe(true)
  })
})
