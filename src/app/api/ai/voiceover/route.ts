import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, aiVoiceoverSchema } from '@/lib/validation'
import { requireUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.ai, 'ai-voiceover')
  if (limited) return limited

  try {
    const body = await request.json()
    const validation = validateInput(aiVoiceoverSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    const { text, voice = 'tongtong', speed = 1.0 } = validation.data

    // Resolve the user server-side so the audit log attributes the
    // TTS call to the right account. Demo-mode fallback is allowed —
    // the underlying call is rate-limited per-IP.
    const user = await requireUser()

    // TTS API limit: 1024 chars
    const truncatedText = text.slice(0, 1000)

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const response = await zai.audio.tts.create({
        input: truncatedText,
        voice,
        speed: Math.min(2.0, Math.max(0.5, speed)),
        response_format: 'wav',
        stream: false,
      })

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(new Uint8Array(arrayBuffer))

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'no-cache',
        },
      })
    } catch (aiError) {
      logger.error(
        'TTS AI error',
        { userId: user.id, voice, textLength: truncatedText.length },
        aiError
      )
      return NextResponse.json({
        error: 'Voiceover generation temporarily unavailable. Please try again.',
      }, { status: 503 })
    }
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Voiceover API',
      'Failed to generate voiceover'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
