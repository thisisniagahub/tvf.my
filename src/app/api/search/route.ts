import { NextRequest, NextResponse } from 'next/server'
import { demoProducts, demoLinks, demoCampaigns } from '@/lib/demo-data'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { handleApiError, logger } from '@/lib/logger'
import { validateInput, searchSchema } from '@/lib/validation'
import { requireUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.search, 'search')
  if (limited) return limited

  try {
    // Resolve the user server-side so the audit log records who searched.
    // Demo-mode fallback allowed — search results are shared demo data.
    const user = await requireUser()

    const { searchParams } = new URL(request.url)
    const rawQ = searchParams.get('q') ?? ''

    const validation = validateInput(searchSchema, { q: rawQ })
    if (!validation.success) {
      return NextResponse.json({ results: [] })
    }
    const q = validation.data.q.toLowerCase().trim()

    const productMatches = demoProducts
      .filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({
        type: 'product' as const,
        id: p.id,
        label: p.name,
        desc: `${p.category} • RM ${p.price.toFixed(2)} • ${p.commissionRate}% commission`,
        page: 'products' as const,
        icon: 'Package',
        badge: p.hot ? 'HOT' : undefined,
      }))

    const linkMatches = demoLinks
      .filter((l) => l.productName.toLowerCase().includes(q) || l.platform.toLowerCase().includes(q))
      .slice(0, 3)
      .map((l) => ({
        type: 'link' as const,
        id: l.id,
        label: l.productName,
        desc: `${l.platform} • ${l.clicks} clicks • ${l.conversion}% CVR`,
        page: 'links' as const,
        icon: 'Link',
      }))

    const campaignMatches = demoCampaigns
      .filter((c) => c.name.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({
        type: 'campaign' as const,
        id: c.id,
        label: c.name,
        desc: `${c.platform} • ${c.status} • ${c.clicks} clicks`,
        page: 'campaigns' as const,
        icon: 'Megaphone',
        badge: c.status === 'active' ? 'ACTIVE' : undefined,
      }))

    logger.info('Search executed via API', {
      userId: user.id,
      query: q,
      resultCount:
        productMatches.length + linkMatches.length + campaignMatches.length,
    })

    return NextResponse.json({
      results: [...productMatches, ...linkMatches, ...campaignMatches],
      count: productMatches.length + linkMatches.length + campaignMatches.length,
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Search API',
      'Search failed'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
