import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, toolGatewaySchema } from '@/lib/validation'
import {
  toolGateway,
  type WebSearchResult,
  type ImageGenResult,
  type TTSResult,
  type WebPageResult,
} from '@/lib/hermes-v2/tool-gateway'
import { requireUser } from '@/lib/auth'

/**
 * HERMES v2 Tool Gateway API
 *
 * POST /api/hermes/tools
 *      Body: { tool: 'webSearch'|'generateImage'|'textToSpeech'|'readWebPage',
 *              params: { ... } }
 *
 *      Dispatches to the matching {@link ToolGateway} method and returns
 *      the typed result. TTS returns raw WAV bytes (audio/wav); all
 *      other tools return JSON.
 *
 * The authenticated user is resolved server-side via `requireUser()`
 * (demo-mode fallback allowed) so the audit log attributes each tool
 * call to the right account. Per-tool param contracts:
 *   webSearch:    { query: string, num?: number  (default 10, max 50) }
 *   generateImage:{ prompt: string, size?: SDK-supported size string }
 *   textToSpeech: { text: string, voice?: string (default 'tongtong'),
 *                   speed?: number  (0.5–2.0) }
 *   readWebPage:  { url: string }
 *
 * Rate-limited at the AI tier (10 req/min) because each tool triggers
 * an upstream z-ai-web-dev-sdk call.
 */

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.ai, 'hermes-tools')
  if (limited) return limited

  try {
    const body = await request.json()
    const validation = validateInput(toolGatewaySchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { tool, params } = validation.data
    const p = (params ?? {}) as Record<string, unknown>

    // Resolve the user server-side so the audit log attributes each
    // tool invocation to the right account. Demo-mode fallback is
    // allowed — the underlying call is rate-limited per-IP.
    const user = await requireUser()

    switch (tool) {
      case 'webSearch': {
        const query = typeof p.query === 'string' ? p.query : ''
        if (!query) {
          return NextResponse.json(
            { error: 'webSearch requires `params.query` (string)' },
            { status: 400 }
          )
        }
        const numRaw =
          typeof p.num === 'number' && p.num > 0 ? Math.floor(p.num) : 10
        const num = Math.min(50, numRaw)
        const results: WebSearchResult[] = await toolGateway.webSearch(
          query,
          num
        )
        logger.info('Tool gateway: webSearch via API', {
          userId: user.id,
          query,
          resultCount: results.length,
        })
        return NextResponse.json({ tool, results, count: results.length })
      }

      case 'generateImage': {
        const prompt = typeof p.prompt === 'string' ? p.prompt : ''
        if (!prompt) {
          return NextResponse.json(
            { error: 'generateImage requires `params.prompt` (string)' },
            { status: 400 }
          )
        }
        const allowedSizes = [
          '1024x1024',
          '768x1344',
          '864x1152',
          '1344x768',
          '1152x864',
          '1440x720',
          '720x1440',
        ] as const
        const size =
          typeof p.size === 'string' &&
          (allowedSizes as readonly string[]).includes(p.size)
            ? (p.size as (typeof allowedSizes)[number])
            : '1024x1024'

        const result: ImageGenResult | null = await toolGateway.generateImage(
          prompt,
          size
        )
        if (!result) {
          return NextResponse.json(
            {
              tool,
              error: 'Image generation failed — SDK unavailable or returned no data.',
            },
            { status: 503 }
          )
        }
        logger.info('Tool gateway: generateImage via API', {
          userId: user.id,
          prompt,
          size,
        })
        return NextResponse.json({ tool, result })
      }

      case 'textToSpeech': {
        const text = typeof p.text === 'string' ? p.text : ''
        if (!text) {
          return NextResponse.json(
            { error: 'textToSpeech requires `params.text` (string)' },
            { status: 400 }
          )
        }
        const voice =
          typeof p.voice === 'string' && p.voice.length > 0
            ? p.voice
            : 'tongtong'
        const speed =
          typeof p.speed === 'number' && p.speed >= 0.5 && p.speed <= 2.0
            ? p.speed
            : 1.0

        const result: TTSResult | null = await toolGateway.textToSpeech(
          text,
          voice,
          speed
        )
        if (!result) {
          return NextResponse.json(
            {
              tool,
              error: 'TTS failed — SDK unavailable or returned no audio.',
            },
            { status: 503 }
          )
        }
        logger.info('Tool gateway: textToSpeech via API', {
          userId: user.id,
          voice,
          textLength: text.length,
          bytes: result.audio.length,
        })
        // Return raw WAV bytes — same shape as /api/ai/voiceover.
        return new NextResponse(result.audio, {
          status: 200,
          headers: {
            'Content-Type': 'audio/wav',
            'Content-Length': result.audio.length.toString(),
            'Cache-Control': 'no-cache',
          },
        })
      }

      case 'readWebPage': {
        const url = typeof p.url === 'string' ? p.url : ''
        if (!url) {
          return NextResponse.json(
            { error: 'readWebPage requires `params.url` (string)' },
            { status: 400 }
          )
        }
        const result: WebPageResult | null = await toolGateway.readWebPage(url)
        if (!result) {
          return NextResponse.json(
            {
              tool,
              error: 'Web page read failed — SDK unavailable or returned no data.',
            },
            { status: 503 }
          )
        }
        logger.info('Tool gateway: readWebPage via API', {
          userId: user.id,
          url,
          title: result.title,
        })
        return NextResponse.json({ tool, result })
      }

      default: {
        // The Zod enum already prevents this, but TypeScript exhaustiveness
        // wants a default branch.
        return NextResponse.json(
          { error: `Unknown tool: ${String(tool)}` },
          { status: 400 }
        )
      }
    }
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes tools POST',
      'Failed to execute tool'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
