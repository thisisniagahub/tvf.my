export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { demoProducts } from '@/lib/demo-data'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { handleApiError, logger } from '@/lib/logger'
import { requireUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'products')
  if (limited) return limited

  try {
    // Resolve the user server-side so the audit log records who browsed
    // the catalog. Demo-mode fallback allowed — products are shared.
    const user = await requireUser()

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

    logger.info('Products listed via API', {
      userId: user.id,
      count: products.length,
    })

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
