import { NextRequest, NextResponse } from 'next/server'
import { demoProducts } from '@/lib/demo-data'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'products')
  if (limited) return limited

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const q = searchParams.get('q')

    let products = [...demoProducts]

    if (category && category !== 'All') {
      products = products.filter((p) => p.category === category)
    }
    if (q) {
      const query = q.toLowerCase()
      products = products.filter((p) => p.name.toLowerCase().includes(query))
    }

    return NextResponse.json({ products, source: 'demo', count: products.length })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Products API',
      'Failed to fetch products'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
