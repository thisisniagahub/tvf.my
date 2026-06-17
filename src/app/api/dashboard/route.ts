import { NextRequest, NextResponse } from 'next/server'
import {
  demoEarnings,
  demoActivities,
  demoProducts,
} from '@/lib/demo-data'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'dashboard')
  if (limited) return limited

  try {
    return NextResponse.json({
      earnings: demoEarnings,
      activities: demoActivities,
      topProducts: demoProducts.slice(0, 8),
      stats: {
        totalEarnings: 5487.32,
        totalClicks: 2847,
        conversionRate: 26.4,
        activeLinks: 42,
      },
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Dashboard API',
      'Failed to fetch dashboard data'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
