import { NextResponse } from 'next/server'
import { categoryTrends, demoTrends } from '@/lib/demo-data'

export async function GET() {
  try {
    return NextResponse.json({
      categories: categoryTrends,
      trends: demoTrends,
      lastUpdated: new Date().toISOString(),
      source: 'demo',
    })
  } catch (error) {
    console.error('Trends API error:', error)
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 })
  }
}
