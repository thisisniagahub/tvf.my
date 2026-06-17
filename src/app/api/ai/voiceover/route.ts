import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'tongtong', speed = 1.0 } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

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
      console.error('TTS AI error:', aiError)
      return NextResponse.json({
        error: 'Voiceover generation temporarily unavailable. Please try again.',
      }, { status: 503 })
    }
  } catch (error) {
    console.error('Voiceover API error:', error)
    return NextResponse.json({ error: 'Failed to generate voiceover' }, { status: 500 })
  }
}
