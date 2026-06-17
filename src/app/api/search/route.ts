import { NextRequest, NextResponse } from 'next/server'
import { demoProducts, demoLinks, demoCampaigns } from '@/lib/demo-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.toLowerCase().trim()

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] })
    }

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

    return NextResponse.json({
      results: [...productMatches, ...linkMatches, ...campaignMatches],
      count: productMatches.length + linkMatches.length + campaignMatches.length,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
