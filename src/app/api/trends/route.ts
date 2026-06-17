import { NextRequest, NextResponse } from 'next/server'
import { categoryTrends, demoTrends } from '@/lib/demo-data'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { handleApiError, logger } from '@/lib/logger'
import { requireUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'trends')
  if (limited) return limited

  try {
    // Resolve the user server-side so the audit log records who viewed
    // the trends. Demo-mode fallback allowed — trends are shared.
    const user = await requireUser()
    logger.info('Trends fetched via API', { userId: user.id })

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
