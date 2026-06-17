import { NextResponse } from 'next/server'
import {
  demoEarnings,
  demoActivities,
  demoProducts,
} from '@/lib/demo-data'

export async function GET() {
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
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
