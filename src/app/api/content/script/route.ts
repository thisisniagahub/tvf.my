export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, contentScriptSchema } from '@/lib/validation'
import { requireUser } from '@/lib/auth'

function generateFallbackScript(
  template: string,
  productName: string,
  language: string,
  tone: string,
  duration: string
): string {
  const isManglish = language === 'Manglish'
  const isBahasa = language === 'Bahasa Malaysia'
  const excited = tone === 'Excited'

  const intros: Record<string, string> = {
    'before-after': isManglish
      ? `Eh, you all won't believe this one lah! 😱\n\nBefore: [Show problem/pain point]\n\nAfter using ${productName}:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]\n\nSeriously game changer can! ${excited ? 'BEST GILER!' : 'Highly recommend.'}\n\n👉 Click link in bio to grab yours now! Limited stock only lor.\n\n#ShopeeMY #${productName.split(' ').slice(0, 2).join('')} #Affiliate #GameChanger`
      : isBahasa
      ? `Jangan percaya sampai anda cuba sendiri! 😱\n\nSebelum: [Tunjuk masalah]\n\nSelepas guna ${productName}:\n• [Manfaat 1]\n• [Manfaat 2]\n• [Manfaat 3]\n\nMemang berbaloi tau! ${excited ? 'TERBAIK!' : 'Sangat disyorkan.'}\n\n👉 Klik link di bio untuk dapatkan sekarang! Stok terhad.\n\n#ShopeeMY #${productName.split(' ').slice(0, 2).join('')} #Affiliate`
      : `You won't believe the transformation! 😱\n\nBefore: [Show problem]\n\nAfter using ${productName}:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]\n\n${excited ? 'Absolutely incredible!' : 'Highly recommended.'}\n\n👉 Click the link in bio to get yours! Limited stock.\n\n#ShopeeMY #Affiliate`,
    unboxing: isManglish
      ? `ALOHA everyone! 🎉\n\nToday we unbox the ${productName}! This one I've been eyeing for so long already...\n\n*opens box*\n\nWah, packaging very premium one! Inside got:\n✨ [Item 1]\n✨ [Item 2]\n✨ [Item 3]\n\nThe quality confirm worth every ringgit lah. ${excited ? 'I\'M SHAKING!' : 'Solid build.'}\n\nLink below — grab before sold out! 🔥\n\n#Unboxing #ShopeeMY #${productName.split(' ').slice(0, 2).join('')}`
      : `Today we're unboxing the ${productName}! 🎉\n\nI've been waiting for this...\n\n*opens box*\n\nWow, premium packaging! Inside:\n✨ [Item 1]\n✨ [Item 2]\n✨ [Item 3]\n\n${excited ? 'Incredible quality!' : 'Well-made product.'}\n\nLink below — grab yours! 🔥`,
    tutorial: isManglish
      ? `Hey kawan-kawan! 👋\n\nToday I teach you how to use ${productName} properly. Many people don't know the right way one...\n\nStep 1: [First step]\nStep 2: [Second step]\nStep 3: [Third step]\n\nEasy right? ${excited ? 'CONFIRM CAN ONE!' : 'Practice makes perfect.'}\n\nGet yours from my Shopee link! 🛒\n\n#Tutorial #ShopeeMY #HowTo`
      : `Hey everyone! 👋\n\nToday I'll show you how to use ${productName} correctly...\n\nStep 1: [First step]\nStep 2: [Second step]\nStep 3: [Third step]\n\nEasy, right? ${excited ? 'You got this!' : 'Keep practicing.'}\n\nGet yours from my Shopee link! 🛒`,
    review: isManglish
      ? `Real talk time about ${productName} 💯\n\nI've been using this for 2 weeks now, so here's my honest review:\n\n👍 PROS:\n• [Pro 1]\n• [Pro 2]\n\n👎 CONS:\n• [Con 1]\n\nOverall: ${excited ? '9/10 WORTH IT LAH!' : '8/10, solid purchase.'}\n\nLink below if you want to try 👇\n\n#Review #HonestReview #ShopeeMY`
      : `Honest review of ${productName} 💯\n\n2 weeks of testing, here's my verdict:\n\n👍 PROS:\n• [Pro 1]\n• [Pro 2]\n\n👎 CONS:\n• [Con 1]\n\nOverall: ${excited ? '9/10 WORTH IT!' : '8/10, solid purchase.'}\n\nLink below 👇`,
    comparison: isManglish
      ? `${productName} vs [Competitor] — which one better ah? 🤔\n\nLet's compare:\n💰 Price: [Comparison]\n⭐ Quality: [Comparison]\n📦 Features: [Comparison]\n💯 Value: [Comparison]\n\nMy verdict: ${excited ? `${productName} WINS HANDS DOWN!` : 'Both good, but ' + productName + ' slightly better.'}\n\nGrab the winner here 👇\n\n#Comparison #ShopeeMY #BestBuy`
      : `${productName} vs [Competitor] — which is better? 🤔\n\nLet's compare:\n💰 Price: [Comparison]\n⭐ Quality: [Comparison]\n📦 Features: [Comparison]\n💯 Value: [Comparison]\n\nMy verdict: ${excited ? `${productName} wins!` : productName + ' is slightly better.'}\n\nGet the winner here 👇`,
    story: isManglish
      ? `So this happened to me last week... 😅\n\nI was struggling with [problem] until I found ${productName}.\n\nAt first I thought, 'Confirm scam one this.' But after trying...\n\nWah. LIFE CHANGED. ${excited ? 'NO JOKE!' : 'Genuinely impressed.'}\n\nIf you got same problem, try lah. Link below 👇\n\n#StoryTime #ShopeeMY #LifeChanger`
      : `So this happened last week... 😅\n\nI was struggling with [problem] until I found ${productName}.\n\nThought it was too good to be true. But after trying...\n\nWow. LIFE CHANGED. ${excited ? 'No joke!' : 'Genuinely impressed.'}\n\nLink below 👇`,
  }

  return intros[template] || `Here's your ${language} script for ${productName}!\n\n[Tone: ${tone} | Duration: ${duration}]\n\n[Customize with your product details and affiliate link.]\n\n👉 Don't forget your Shopee affiliate link! 🛒`
}

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.ai, 'content-script')
  if (limited) return limited

  try {
    const body = await request.json()
    const validation = validateInput(contentScriptSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    const { template, productName, language, tone, duration } = validation.data

    // Resolve the user server-side so the audit log attributes the
    // AI completion call to the right account. Demo-mode fallback is
    // allowed — the underlying call is rate-limited per-IP.
    const user = await requireUser()

    // Try real AI
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const prompt = `Generate a ${duration} social media script for the product "${productName}".

Requirements:
- Template style: ${template}
- Language: ${language} (${language === 'Manglish' ? 'Malaysian English with lah/lor/can particles' : language === 'Bahasa Malaysia' ? 'standard Malay' : 'standard English'})
- Tone: ${tone}
- Include emoji and hashtags relevant to Malaysian Shopee affiliate market
- End with a call-to-action to click the affiliate link
- Keep it concise and engaging for ${duration} content`

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media copywriter for Malaysian Shopee affiliates. Generate engaging, conversion-focused scripts.',
          },
          { role: 'user', content: prompt },
        ],
        thinking: { type: 'disabled' },
      })

      const script =
        completion.choices[0]?.message?.content ||
        generateFallbackScript(template, productName, language, tone, duration)

      return NextResponse.json({ script, source: 'ai' })
    } catch (aiError) {
      logger.warn('Content script AI unavailable, using fallback', {
        userId: user.id,
        error: aiError instanceof Error ? aiError.message : 'unknown',
      })
      return NextResponse.json({
        script: generateFallbackScript(template, productName, language, tone, duration),
        source: 'fallback',
      })
    }
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Content script',
      'Failed to generate script'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
