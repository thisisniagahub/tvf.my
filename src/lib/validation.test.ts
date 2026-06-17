import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  createLinkSchema,
  createCampaignSchema,
  hermesChatSchema,
  contentScriptSchema,
  aiThumbnailsSchema,
  aiVoiceoverSchema,
  searchSchema,
  validateInput,
} from './validation'

describe('loginSchema', () => {
  it('accepts a valid email + password', () => {
    const result = loginSchema.safeParse({
      email: 'demo@theviralfindsmy.com',
      password: 'secret123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'secret123' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'demo@theviralfindsmy.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a missing email field entirely', () => {
    const result = loginSchema.safeParse({ password: 'secret123' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('accepts a valid registration (name + email + 8-char password)', () => {
    const result = registerSchema.safeParse({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      name: 'Alice',
      email: 'alice@example.com',
      password: '1234567', // 7 chars
    })
    expect(result.success).toBe(false)
  })

  it('accepts a password of exactly 8 characters', () => {
    const result = registerSchema.safeParse({
      name: 'Alice',
      email: 'alice@example.com',
      password: '12345678', // exactly 8
    })
    expect(result.success).toBe(true)
  })

  it('rejects a name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({
      name: 'A',
      email: 'alice@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Alice',
      email: 'no-at-sign',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })
})

describe('createLinkSchema', () => {
  it('accepts a valid link with required fields', () => {
    const result = createLinkSchema.safeParse({
      productId: 'p1',
      name: 'My Affiliate Link',
      url: 'https://shopee.com.my/product/123',
    })
    expect(result.success).toBe(true)
  })

  it('accepts a valid link with all optional fields', () => {
    const result = createLinkSchema.safeParse({
      productId: 'p1',
      name: 'My Link',
      url: 'https://shopee.com.my/product/123',
      category: 'Electronics',
      commission: 8.5,
      platform: 'Shopee',
      customSlug: 'my-cool-link',
      campaign: '11.11 Sale',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid URL', () => {
    const result = createLinkSchema.safeParse({
      productId: 'p1',
      name: 'My Link',
      url: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a missing productId', () => {
    const result = createLinkSchema.safeParse({
      name: 'My Link',
      url: 'https://shopee.com.my/product/123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a missing name', () => {
    const result = createLinkSchema.safeParse({
      productId: 'p1',
      url: 'https://shopee.com.my/product/123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty productId', () => {
    const result = createLinkSchema.safeParse({
      productId: '',
      name: 'My Link',
      url: 'https://shopee.com.my/product/123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects commission > 100', () => {
    const result = createLinkSchema.safeParse({
      productId: 'p1',
      name: 'My Link',
      url: 'https://shopee.com.my/product/123',
      commission: 150,
    })
    expect(result.success).toBe(false)
  })
})

describe('createCampaignSchema', () => {
  it('accepts a valid campaign', () => {
    const result = createCampaignSchema.safeParse({
      name: '11.11 Mega Sale',
      platform: 'Shopee',
      budget: 500,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a negative budget', () => {
    const result = createCampaignSchema.safeParse({
      name: 'Bad Campaign',
      platform: 'Shopee',
      budget: -10,
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty campaign name', () => {
    const result = createCampaignSchema.safeParse({
      name: '',
      platform: 'Shopee',
      budget: 100,
    })
    expect(result.success).toBe(false)
  })
})

describe('hermesChatSchema', () => {
  it('accepts a non-empty message', () => {
    const result = hermesChatSchema.safeParse({ message: 'Hello HERMES' })
    expect(result.success).toBe(true)
  })

  it('rejects an empty message', () => {
    const result = hermesChatSchema.safeParse({ message: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing message field', () => {
    const result = hermesChatSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects a message longer than 4000 characters', () => {
    const result = hermesChatSchema.safeParse({ message: 'a'.repeat(4001) })
    expect(result.success).toBe(false)
  })

  it('accepts a message of exactly 4000 characters', () => {
    const result = hermesChatSchema.safeParse({ message: 'a'.repeat(4000) })
    expect(result.success).toBe(true)
  })

  it('accepts an optional history array', () => {
    const result = hermesChatSchema.safeParse({
      message: 'Hello',
      history: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects a history array with an invalid role', () => {
    const result = hermesChatSchema.safeParse({
      message: 'Hello',
      history: [{ role: 'system', content: 'system prompt' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('contentScriptSchema', () => {
  const validInput = {
    template: 'before-after',
    productName: 'RGB Mechanical Keyboard',
    language: 'Manglish',
    tone: 'Excited',
    duration: '15s',
  }

  it('accepts a valid input with all enums set', () => {
    const result = contentScriptSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('rejects an invalid template enum value', () => {
    const result = contentScriptSchema.safeParse({
      ...validInput,
      template: 'not-a-template',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid language enum value', () => {
    const result = contentScriptSchema.safeParse({
      ...validInput,
      language: 'Spanish',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid tone enum value', () => {
    const result = contentScriptSchema.safeParse({
      ...validInput,
      tone: 'Boring',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid duration enum value', () => {
    const result = contentScriptSchema.safeParse({
      ...validInput,
      duration: '120s',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid template enum values', () => {
    const templates = ['before-after', 'unboxing', 'tutorial', 'review', 'comparison', 'story']
    for (const template of templates) {
      const result = contentScriptSchema.safeParse({ ...validInput, template })
      expect(result.success).toBe(true)
    }
  })

  it('accepts all valid language enum values', () => {
    const languages = ['Manglish', 'Bahasa Malaysia', 'English', 'Rojak']
    for (const language of languages) {
      const result = contentScriptSchema.safeParse({ ...validInput, language })
      expect(result.success).toBe(true)
    }
  })

  it('rejects an empty product name', () => {
    const result = contentScriptSchema.safeParse({ ...validInput, productName: '' })
    expect(result.success).toBe(false)
  })
})

describe('aiThumbnailsSchema', () => {
  it('accepts a valid thumbnail request', () => {
    const result = aiThumbnailsSchema.safeParse({
      productName: 'RGB Mechanical Keyboard',
      style: 'Bold',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid style enum value', () => {
    const result = aiThumbnailsSchema.safeParse({
      productName: 'Product',
      style: 'Random',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty product name', () => {
    const result = aiThumbnailsSchema.safeParse({
      productName: '',
      style: 'Bold',
    })
    expect(result.success).toBe(false)
  })
})

describe('aiVoiceoverSchema', () => {
  it('accepts a valid voiceover request with only text', () => {
    const result = aiVoiceoverSchema.safeParse({ text: 'Hello world' })
    expect(result.success).toBe(true)
  })

  it('accepts a valid voiceover request with all optional fields', () => {
    const result = aiVoiceoverSchema.safeParse({
      text: 'Hello world',
      voice: 'tongtong',
      speed: 1.5,
    })
    expect(result.success).toBe(true)
  })

  it('enforces the 1024-character text limit (accepts exactly 1024)', () => {
    const result = aiVoiceoverSchema.safeParse({ text: 'a'.repeat(1024) })
    expect(result.success).toBe(true)
  })

  it('enforces the 1024-character text limit (rejects 1025)', () => {
    const result = aiVoiceoverSchema.safeParse({ text: 'a'.repeat(1025) })
    expect(result.success).toBe(false)
  })

  it('rejects an empty text', () => {
    const result = aiVoiceoverSchema.safeParse({ text: '' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid voice enum value', () => {
    const result = aiVoiceoverSchema.safeParse({
      text: 'Hello',
      voice: 'not-a-voice',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a speed below 0.5', () => {
    const result = aiVoiceoverSchema.safeParse({
      text: 'Hello',
      speed: 0.3,
    })
    expect(result.success).toBe(false)
  })

  it('rejects a speed above 2.0', () => {
    const result = aiVoiceoverSchema.safeParse({
      text: 'Hello',
      speed: 2.5,
    })
    expect(result.success).toBe(false)
  })

  it('accepts speed at the lower bound (0.5)', () => {
    const result = aiVoiceoverSchema.safeParse({
      text: 'Hello',
      speed: 0.5,
    })
    expect(result.success).toBe(true)
  })

  it('accepts speed at the upper bound (2.0)', () => {
    const result = aiVoiceoverSchema.safeParse({
      text: 'Hello',
      speed: 2.0,
    })
    expect(result.success).toBe(true)
  })
})

describe('searchSchema', () => {
  it('accepts a query of at least 2 characters', () => {
    const result = searchSchema.safeParse({ q: 'keyboard' })
    expect(result.success).toBe(true)
  })

  it('rejects a query shorter than 2 characters', () => {
    const result = searchSchema.safeParse({ q: 'a' })
    expect(result.success).toBe(false)
  })

  it('rejects a query longer than 100 characters', () => {
    const result = searchSchema.safeParse({ q: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })
})

describe('validateInput()', () => {
  it('returns { success: true, data } for valid input', () => {
    const result = validateInput(loginSchema, {
      email: 'demo@theviralfindsmy.com',
      password: 'secret123',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        email: 'demo@theviralfindsmy.com',
        password: 'secret123',
      })
    }
  })

  it('returns { success: false, error, status } for invalid input', () => {
    const result = validateInput(loginSchema, { email: 'bad', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(typeof result.error).toBe('string')
      expect(result.error.length).toBeGreaterThan(0)
      expect(result.status).toBe(400)
    }
  })

  it('returns status 400 on validation failure', () => {
    const result = validateInput(registerSchema, {
      name: 'A',
      email: 'no',
      password: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(400)
    }
  })

  it('passes through the parsed data typed by the schema', () => {
    const result = validateInput(searchSchema, { q: 'shopee' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.q).toBe('shopee')
    }
  })

  it('aggregates multiple error issues into the error string', () => {
    const result = validateInput(createLinkSchema, {
      productId: '',
      name: '',
      url: 'not-a-url',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      // multiple issues should be joined with '; '
      expect(result.error).toContain(';')
      expect(result.status).toBe(400)
    }
  })
})
