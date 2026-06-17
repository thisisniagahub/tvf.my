import { NextRequest, NextResponse } from 'next/server'
import { categoryTrends, demoTrends } from '@/lib/demo-data'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'trends')
  if (limited) return limited

  try {
    return NextResponse.json({
      categories: categoryTrends,
      trends: demoTrends,
      lastUpdated: new Date().toISOString(),
      source: 'demo',
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Trends API',
      'Failed to fetch trends'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
