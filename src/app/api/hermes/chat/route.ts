import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Try real AI
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(history || []).map((m: any) => ({
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

      return NextResponse.json({ response, source: 'ai' })
    } catch (aiError) {
      console.error('AI error, using fallback:', aiError)
      return NextResponse.json({
        response: getFallbackResponse(message),
        source: 'fallback',
      })
    }
  } catch (error) {
    console.error('Hermes chat error:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
