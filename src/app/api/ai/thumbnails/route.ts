import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { productName, style, textOverlay } = await request.json()

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

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
      console.error('Image generation AI error:', aiError)
      return NextResponse.json({
        error: 'Image generation temporarily unavailable. Please try again.',
        source: 'fallback',
      }, { status: 503 })
    }
  } catch (error) {
    console.error('Thumbnails API error:', error)
    return NextResponse.json({ error: 'Failed to generate thumbnail' }, { status: 500 })
  }
}
