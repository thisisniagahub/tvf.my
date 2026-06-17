import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, hermesChatSchema } from '@/lib/validation'
import { memoryService } from '@/lib/hermes-v2/memory-service'
import { skillsEngine } from '@/lib/hermes-v2/skills-engine'
import { requireUser } from '@/lib/auth'

const DEFAULT_USER_ID = 'demo-user'

const SYSTEM_PROMPT = `You are HERMES, an AI assistant for TheViralFindsMY — an AI-powered affiliate marketing platform built exclusively for the Malaysian Shopee affiliate market.

Your role:
- Help affiliates analyze their product performance, discover trending products, and optimize campaigns.
- Generate Manglish (Malaysian English), Bahasa Malaysia, or standard English content as requested.
- Provide actionable, data-driven advice specific to the Malaysian e-commerce market.
- Use Malaysian context: RM currency, local products (Safi Balqis, Wardah, Tudung Bawal), local sales events (9.9, 10.10, 11.11, 12.12, Raya, CNY), peak times (7-9PM golden hour MYT).
- Be friendly, knowledgeable, and concise. Use occasional Malaysian flavor ("lah", "can", "confirm") when appropriate but stay professional.

Key facts about the demo user:
- Plan: Pro
- Top niches: Electronics, Beauty, Fashion
- Top products: RGB Mechanical Keyboard (12.3% CVR), Tudung Bawal Premium (35.3% CVR), Portable Blender (30.5% CVR), Wardah Lipstick (31.4% CVR), Safi Balqis Sunblock (24.1% CVR)
- Average Shopee affiliate conversion rate: 8.5% (user is above average)
- Total earnings this month: RM 5,487.32

Keep responses focused and under 300 words unless asked for detail. Use bullet points and clear structure.`

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('trend') || lower.includes('hot') || lower.includes('popular')) {
    return `Here are the top trending products in Malaysia right now:\n\n• **Tudung Bawal Premium** — Fashion velocity 92% 🔥 (35.3% CVR)\n• **RGB Mechanical Keyboard** — Electronics 78% 🔥 (26% CVR)\n• **Wardah Matte Lipstick** — Beauty 84% 🔥 (31.4% CVR)\n• **Safi Balqis UV Sunblock** — Beauty 64% 🔥 (24.1% CVR)\n• **Portable Blender USB** — Home 67% 🔥 (30.5% CVR)\n\nFashion is leading the pack this week lah! I'd recommend focusing your next campaign on Tudung Bawal — the conversion rate is 4x your average. Want me to generate a content plan for it?`
  }
  if (lower.includes('caption') || lower.includes('content') || lower.includes('manglish')) {
    return `Here's a Manglish caption you can use:\n\n"Eh best giler! 😭 Just tried this and confirm game changer lah. Before this always struggle, now everything smooth like butter can. \n\nStock limited one — grab fast before sold out lor! 👇\n\n#ShopeeMY #Affiliate #WorthIt"\n\nWant me to generate more variants with different tones?`
  }
  if (lower.includes('conversion') || lower.includes('improve') || lower.includes('optimize')) {
    return `Here are 5 ways to improve your conversion rate (currently 26.4%, well above the 8.5% Shopee average):\n\n1. **Post at golden hour** (7-9PM MYT) — 3x more engagement\n2. **Use before/after content** — 45% higher CVR for beauty products\n3. **Add urgency** — "Limited stock" boosts CVR by 22%\n4. **Bundle deals** — pair complementary products (e.g., sunblock + lipstick)\n5. **Leverage XTRA commissions** — 8 of your products have XTRA offers active\n\nWant me to create an optimization plan for your top 3 products?`
  }
  if (lower.includes('commission') || lower.includes('xtra') || lower.includes('earn')) {
    return `Your commission breakdown:\n\n💰 **This month:** RM 5,487.32 (+12.5% vs last week)\n🔥 **XTRA offers active:** 8 products (+34% boost)\n📺 **Shopee Live eligible:** 4 products (up to 80% commission!)\n\nTop earners:\n1. RGB Keyboard — RM 982.56\n2. Wardah Lipstick — RM 410.62\n3. Tudung Bawal — RM 392.70\n\nPro tip: Switch your Safi Balqis link to the XTRA offer — you'd earn RM 4.19/sale instead of RM 2.99. That's +40% on 67 monthly orders = extra RM 80/mo!`
  }
  return `Great question! Based on your affiliate data, here are your top 5 performing products this month:\n\n1. **RGB Mechanical Keyboard** — 342 clicks, 89 orders, 26% CVR\n2. **Tudung Bawal Premium** — 289 clicks, 102 orders, 35.3% CVR ⭐\n3. **Portable Blender USB** — 256 clicks, 78 orders, 30.5% CVR\n4. **Wardah Lipstick** — 312 clicks, 98 orders, 31.4% CVR\n5. **Safi Balqis Sunblock** — 278 clicks, 67 orders, 24.1% CVR\n\nYour conversion rates are above the Shopee affiliate average of 8.5%. I recommend focusing more on the Portable Blender USB as it has the highest conversion potential.\n\nWhat would you like to dive deeper into? I can help with trends, content, optimization, or earnings analysis.`
}

/**
 * Heuristic: extract a user-profile interest from a free-text message.
 * Looks for "I like X", "I focus on X", "interested in X", "my niche is X"
 * patterns and returns a short profile note (or null when no clear signal).
 *
 * This is intentionally conservative — only fires on explicit first-person
 * interest statements so we don't pollute the profile with every message.
 */
function extractInterest(message: string): string | null {
  const lower = message.toLowerCase()
  const patterns = [
    /\bi\s+(?:like|love|prefer|focus\s+on|specialize\s+in)\s+([a-z0-9 ,]{3,60})/i,
    /\binterested\s+in\s+([a-z0-9 ,]{3,60})/i,
    /\bmy\s+niche\s+is\s+([a-z0-9 ,]{3,60})/i,
    /\bi\s+sell\s+([a-z0-9 ,]{3,60})/i,
    /\bi\s+promote\s+([a-z0-9 ,]{3,60})/i,
  ]
  for (const p of patterns) {
    const m = lower.match(p)
    if (m && m[1]) {
      const interest = m[1].trim().replace(/\s+/g, ' ')
      // Filter out trailing punctuation / stop-words
      const cleaned = interest.replace(/[.,!?]+$/, '').trim()
      if (cleaned.length >= 3 && cleaned.length <= 60) {
        return `Interested in: ${cleaned}`
      }
    }
  }
  return null
}

/** Categorize the question for the agent-memory note (best-effort). */
function categorizeQuestion(message: string): string {
  const lower = message.toLowerCase()
  if (lower.match(/trend|hot|viral|velocity/)) return 'trend-analysis'
  if (lower.match(/caption|content|script|post|generate|write/)) return 'content-generation'
  if (lower.match(/product|research|discover|find/)) return 'product-research'
  if (lower.match(/manglish|malay|bahasa|rojak/)) return 'manglish-style'
  if (lower.match(/commission|earn|xtra|revenue/)) return 'earnings'
  if (lower.match(/conversion|optimize|improve/)) return 'optimization'
  return 'general'
}

/**
 * Persist a memory note + update skill-usage stats. All operations are
 * best-effort: any failure is logged at warn level and swallowed so the
 * chat response is never blocked by a memory-write problem.
 */
async function persistPostChat(
  userId: string,
  message: string,
  response: string,
  source: 'ai' | 'fallback',
  skillIds: string[]
): Promise<void> {
  const tasks: Promise<unknown>[] = []

  // 1. Save a brief agent-memory note about what was discussed.
  const category = categorizeQuestion(message)
  const truncated = message.length > 120 ? message.slice(0, 117) + '...' : message
  tasks.push(
    memoryService
      .addMemory(userId, 'agent', `Discussed ${category}: "${truncated}" (${source})`, [
        category,
        source,
      ])
      .catch((err: unknown) =>
        logger.warn('Failed to persist agent memory', {
          error: err instanceof Error ? err.message : 'unknown',
        })
      )
  )

  // 2. If the user expressed an explicit interest, save it to the user profile.
  const interest = extractInterest(message)
  if (interest) {
    tasks.push(
      memoryService
        .addMemory(userId, 'user', interest, ['interest'])
        .catch((err: unknown) =>
          logger.warn('Failed to persist user profile interest', {
            error: err instanceof Error ? err.message : 'unknown',
          })
        )
    )
  }

  // 3. Update usage stats for every detected skill. We treat the call as
  //    "successful" when the AI returned a non-empty response; fallback
  //    responses count as failure (the skill didn't actually help).
  const success = source === 'ai' && response.length > 0
  for (const id of skillIds) {
    tasks.push(
      skillsEngine
        .updateSkillUsage(id, success)
        .catch((err: unknown) =>
          logger.warn('Failed to update skill usage', {
            skillId: id,
            error: err instanceof Error ? err.message : 'unknown',
          })
        )
    )
  }

  await Promise.all(tasks)
}

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.ai, 'hermes-chat')
  if (limited) return limited

  try {
    const body = await request.json()
    const validation = validateInput(hermesChatSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    const { message, history } = validation.data
    // Auth: resolve the user server-side so the client cannot impersonate
    // another user by passing a `userId` in the body. Falls back to the
    // demo account when no session is present (demo mode).
    const user = await requireUser()
    const userId = user.id || DEFAULT_USER_ID

    // ============== Pre-AI: build memory + skills context ==============
    // Both calls are best-effort — a failure here should not block the
    // chat; we just fall back to the bare system prompt.
    let memoryContext = ''
    let skillsContext = ''
    let detectedSkillIds: string[] = []
    try {
      ;[memoryContext, skillsContext, detectedSkillIds] = await Promise.all([
        memoryService.buildMemoryContext(userId),
        skillsEngine.buildSkillsContext(message),
        skillsEngine.detectSkillIds(message),
      ])
    } catch (ctxErr) {
      logger.warn('Failed to build HERMES context (memory/skills)', {
        userId,
        error: ctxErr instanceof Error ? ctxErr.message : 'unknown',
      })
    }

    const fullSystemPrompt =
      SYSTEM_PROMPT + memoryContext + skillsContext

    // Try real AI
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const messages: Array<{
        role: 'system' | 'user' | 'assistant'
        content: string
      }> = [
        { role: 'system', content: fullSystemPrompt },
        ...(history ?? []).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user', content: message },
      ]

      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      })

      const response =
        completion.choices[0]?.message?.content || getFallbackResponse(message)
      const source: 'ai' | 'fallback' =
        completion.choices[0]?.message?.content ? 'ai' : 'fallback'

      // Persist memory + skill usage in the background. Await so we know
      // it landed before the response leaves the server, but swallow errors.
      await persistPostChat(userId, message, response, source, detectedSkillIds)

      if (detectedSkillIds.length > 0) {
        logger.info('HERMES chat used skills', {
          userId,
          skillIds: detectedSkillIds,
          source,
        })
      }

      return NextResponse.json({
        response,
        source,
        meta: {
          memoryUsed: memoryContext.length > 0,
          skillsUsed: detectedSkillIds,
        },
      })
    } catch (aiError) {
      logger.warn('Hermes AI unavailable, using fallback response', {
        error: aiError instanceof Error ? aiError.message : 'unknown',
      })
      const fallback = getFallbackResponse(message)
      // Persist memory even on fallback so we still track what was asked.
      await persistPostChat(
        userId,
        message,
        fallback,
        'fallback',
        detectedSkillIds
      )
      return NextResponse.json({
        response: fallback,
        source: 'fallback',
        meta: {
          memoryUsed: memoryContext.length > 0,
          skillsUsed: detectedSkillIds,
        },
      })
    }
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes chat',
      'Failed to process message'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
