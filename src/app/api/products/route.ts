import { NextRequest, NextResponse } from 'next/server'
import { demoProducts } from '@/lib/demo-data'

export async function GET(request: NextRequest) {
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
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
