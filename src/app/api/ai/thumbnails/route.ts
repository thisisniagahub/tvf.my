import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, aiThumbnailsSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.ai, 'ai-thumbnails')
  if (limited) return limited

  try {
    const body = await request.json()
    const validation = validateInput(aiThumbnailsSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    const { productName, style, textOverlay } = validation.data

    const stylePrompts: Record<string, string> = {
      Bold: 'bold vibrant colors, high contrast, eye-catching, modern social media thumbnail style, large text-friendly composition',
      Minimal: 'minimalist clean design, lots of whitespace, subtle pastel tones, elegant product photography',
      Vibrant: 'vibrant energetic colors, dynamic composition, playful and fun, youth-oriented social media style',
      'Halal-friendly': 'halal-friendly aesthetic, modest elegant design, soft warm tones, family-friendly, Malaysian market appeal',
    }

    const styleSuffix = stylePrompts[style as string] ?? stylePrompts.Bold

    const prompt = `Professional social media thumbnail for a Malaysian Shopee affiliate product: "${productName}". Style: ${styleSuffix}. The image should be a product showcase with space for text overlay "${textOverlay || productName}". High quality, detailed, studio lighting, e-commerce marketing aesthetic. 1:1 square format.`

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const response = await zai.images.generations.create({
        prompt,
        size: '1024x1024',
      })

      const base64 = response.data?.[0]?.base64

      if (!base64) {
        throw new Error('No image data returned')
      }

      return NextResponse.json({
        image: `data:image/png;base64,${base64}`,
        prompt,
        source: 'ai',
      })
    } catch (aiError) {
      logger.error(
        'Image generation AI error',
        { productName, style },
        aiError
      )
      return NextResponse.json({
        error: 'Image generation temporarily unavailable. Please try again.',
        source: 'fallback',
      }, { status: 503 })
    }
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Thumbnails API',
      'Failed to generate thumbnail'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
