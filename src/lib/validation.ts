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

// ============== HERMES Memory Schema ==============

export const hermesMemoryCreateSchema = z.object({
  userId: z.string().min(1).max(120).default('demo-user'),
  type: z.enum(['agent', 'user']),
  content: z.string().min(1, 'Content is required').max(2000),
  tags: z.array(z.string().max(40)).max(10).optional(),
})

export const hermesMemoryClearSchema = z.object({
  userId: z.string().min(1).max(120).default('demo-user'),
  type: z.enum(['agent', 'user']).optional(),
})

// ============== HERMES Skills Schema ==============

export const hermesSkillCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  description: z.string().min(1, 'Description is required').max(500),
  category: z.string().min(1).max(60),
  content: z.string().min(1, 'Content is required').max(20000),
  trigger: z.string().max(500).optional(),
})

export const hermesSkillUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(500).optional(),
  category: z.string().min(1).max(60).optional(),
  content: z.string().min(1).max(20000).optional(),
  trigger: z.string().max(500).nullable().optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
})

// ============== HERMES v2 Cron Job Schemas ==============

export const createCronJobSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  description: z.string().min(1, 'Description is required').max(500),
  schedule: z.string().min(1, 'Schedule is required').max(120),
  skills: z.array(z.string().min(1).max(80)).max(20).default([]),
  deliverTo: z.enum(['chat', 'notification', 'email']).default('chat'),
  userId: z.string().max(80).optional(),
})

export const updateCronJobSchema = z.object({
  status: z.enum(['active', 'paused']),
})

export const executeCronJobSchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
})

// ============== HERMES v2 Subagent Delegation Schemas ==============

export const delegateSubagentSchema = z.object({
  goal: z.string().min(1, 'Goal is required').max(2000),
  context: z.string().max(4000).default(''),
  toolsets: z.array(z.string().min(1).max(60)).max(10).default([]),
  maxIterations: z.number().int().min(1).max(20).optional(),
  timeout: z.number().int().min(5).max(600).optional(),
  userId: z.string().max(80).optional(),
  parentId: z.string().max(80).optional(),
})

export const delegateBatchSchema = z.object({
  tasks: z
    .array(delegateSubagentSchema)
    .min(1, 'At least one task is required')
    .max(10),
})

// ============== HERMES v2 Tool Gateway Schema ==============

export const toolGatewaySchema = z.object({
  tool: z.enum(['webSearch', 'generateImage', 'textToSpeech', 'readWebPage']),
  params: z.record(z.string(), z.unknown()),
})

// ============== Agent v2 (VLA Loop) Schemas ==============
//
// Unified P6-3 + P6-4 surface:
//   - agentExecuteSchema: POST /api/agent/execute
//       Body: { taskId, steps?, options?: { maxIterations?, timeout? } }
//       - P6-3 callers pass { taskId, steps? } for single-pass planning.
//       - P6-4 callers pass { taskId, options? } to start a multi-pass VlaLoop job.
//       - `userId` is intentionally absent — it is resolved server-side
//         via `requireAuth()` so a client cannot impersonate another user.
//   - agentStopSchema:    POST /api/agent/stop
//       Body: { taskId?, jobId? }
//       - P6-3 callers pass { taskId? } for socket-based stop.
//       - P6-4 callers pass { jobId } to stop a registered VlaLoop job.
//   - credentialSchema:   POST /api/agent/credentials (P6-4)

export const agentExecuteSchema = z.object({
  taskId: z.string().min(1, 'taskId is required').max(80),
  /** Optional override of the planned steps (otherwise uses task defaults). */
  steps: z.array(z.string().max(500)).max(20).optional(),
  /** P6-4: optional loop-budget overrides for the multi-pass VlaLoop. */
  options: z
    .object({
      maxIterations: z.number().int().min(1).max(20).optional(),
      timeout: z.number().int().min(30).max(300).optional(),
    })
    .optional(),
})

export const agentStopSchema = z.object({
  taskId: z.string().min(1, 'taskId is required').max(80).optional(),
  /** P6-4: stop a specific VlaLoop job by id. */
  jobId: z.string().min(1, 'jobId is required').optional(),
})

// ============== MCP Server Schemas ==============

export const mcpServerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  type: z.enum(['hermes', 'openclaw', 'custom']),
  endpoint: z.string().url('Invalid endpoint URL'),
  apiKey: z.string().max(500).optional(),
  capabilities: z.array(z.string().max(60)).max(20).optional(),
})

export const mcpServerToggleSchema = z.object({
  // No body required — kept for future status overrides
  status: z.enum(['connected', 'disconnected', 'error']).optional(),
})

// ============== Plugin Schemas ==============

export const pluginInstallSchema = z.object({
  catalogId: z.string().min(1, 'catalogId is required'),
})

export const pluginToggleSchema = z.object({
  enabled: z.boolean(),
})

// ============== Agent v2 Credential Store Schema ==============

export const credentialSchema = z.object({
  platform: z.string().min(1, 'Platform is required').max(50),
  username: z.string().min(1, 'Username is required').max(200),
  password: z.string().min(1, 'Password is required').max(500),
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
