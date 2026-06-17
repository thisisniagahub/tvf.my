/**
 * Zod Validation Schemas
 *
 * Reusable schemas for API route input validation.
 * Usage:
 *   import { createLinkSchema } from '@/lib/validation'
 *   const parsed = createLinkSchema.safeParse(body)
 *   if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
 *   // parsed.data is now typed
 */

import { z } from 'zod'

// ============== Auth Schemas ==============

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// ============== Affiliate Link Schemas ==============

export const createLinkSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Name is required').max(200),
  url: z.string().url('Invalid URL'),
  category: z.string().min(1).max(50).optional(),
  commission: z.number().min(0).max(100).optional(),
  platform: z.string().min(1).max(50).optional(),
  customSlug: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/).optional(),
  campaign: z.string().max(100).optional(),
})

// ============== Campaign Schemas ==============

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100),
  platform: z.string().min(1).max(50),
  budget: z.number().min(0, 'Budget must be positive'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  description: z.string().max(500).optional(),
})

// ============== HERMES Chat Schema ==============

export const hermesChatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(4000, 'Message too long'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).max(20, 'Too many history messages').optional(),
})

// ============== Content Script Schema ==============

export const contentScriptSchema = z.object({
  template: z.enum(['before-after', 'unboxing', 'tutorial', 'review', 'comparison', 'story']),
  productName: z.string().min(1, 'Product name is required').max(200),
  language: z.enum(['Manglish', 'Bahasa Malaysia', 'English', 'Rojak']),
  tone: z.enum(['Excited', 'Friendly', 'Professional', 'Funny', 'Urgent', 'Luxurious']),
  duration: z.enum(['15s', '30s', '60s', '90s']),
})

// ============== AI Thumbnails Schema ==============

export const aiThumbnailsSchema = z.object({
  productName: z.string().min(1, 'Product name is required').max(200),
  style: z.enum(['Bold', 'Minimal', 'Vibrant', 'Halal-friendly']),
  textOverlay: z.string().max(100).optional(),
})

// ============== AI Voiceover Schema ==============

export const aiVoiceoverSchema = z.object({
  text: z.string().min(1, 'Text is required').max(1024, 'Text exceeds 1024 character limit'),
  voice: z.enum(['tongtong', 'chuichui', 'xiaochen', 'jam', 'kazi', 'douji', 'luodo']).optional(),
  speed: z.number().min(0.5, 'Speed must be >= 0.5').max(2.0, 'Speed must be <= 2.0').optional(),
})

// ============== Search Schema ==============

export const searchSchema = z.object({
  q: z.string().min(2, 'Query must be at least 2 characters').max(100),
})

// ============== Helper: Validate and parse ==============

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; status: number } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errorMessages = result.error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('; ')
  return { success: false, error: errorMessages, status: 400 }
}
