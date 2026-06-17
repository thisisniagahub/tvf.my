'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { PageHeader, StatCard, ProductGridSkeleton } from './_shared'
import { formatRM, formatNumber } from '@/lib/demo-data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Product, ProductsResponse } from '@/lib/types'

const categories = ['All', 'Electronics', 'Beauty', 'Fashion', 'Home', 'Gaming']

export function ProductsPage() {
  const { setActivePage } = useAppStore()
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)

  const { data, isLoading, isError } = useQuery<ProductsResponse>({
    queryKey: ['products', category, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category !== 'All') params.set('category', category)
      if (search) params.set('q', search)
      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error('Failed')
      return res.json() as Promise<ProductsResponse>
    },
  })

  const products = data?.products ?? []

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Icons.AlertCircle className="mx-auto size-12 text-destructive/40" />
          <p className="mt-3 text-sm font-medium">Failed to load products</p>
          <p className="text-xs text-muted-foreground">Please refresh the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Discover and manage products you're promoting"
        icon={Icons.Package}
      >
        <Button variant="outline" size="sm">
          <Icons.Filter className="mr-1 size-4" /> Filter
        </Button>
        <Button size="sm" onClick={() => setActivePage('trend-spy')} className="bg-shopee-gradient hover:opacity-90">
          <Icons.Radar className="mr-1 size-4" /> Find Trends
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tracked Products" value="248" icon={Icons.Package} accent="shopee" subtitle="Across 6 categories" />
        <StatCard label="Hot Products" value="42" icon={Icons.Flame} accent="warning" subtitle="Trending now" delta="+8 today" deltaType="up" />
        <StatCard label="XTRA Commission" value="18" icon={Icons.Star} accent="hermes" subtitle="Boosted offers" />
        <StatCard label="Avg. Commission" value="9.4%" icon={Icons.Percent} accent="success" subtitle="Across all products" />
      </div>

      {/* Search + categories */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Icons.Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Shopee products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="flex-wrap">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs">{cat}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Products grid */}
      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, index: number) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
            <Card
              className="group cursor-pointer overflow-hidden border-border/60 transition-all hover:border-shopee/40 hover:shadow-lg"
              onClick={() => setSelected(p)}
            >
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
                {/* Placeholder icon — when real product images are wired up, replace
                    this block with a `<SmartImage>` (or `next/image` `<Image>`):
                    <SmartImage
                      src={p.image}
                      alt={p.name}
                      width={400}
                      height={400}
                      priority={index < 4}
                      className="size-full object-cover"
                    />
                    The `images.remotePatterns` config in next.config.ts already
                    allows `**.shopee.com` / `**.shopee.com.my` CDN hosts. */}
                <div className="flex h-full items-center justify-center">
                  <Icons.Package className="size-16 text-muted-foreground/30" />
                </div>
                {/* Badges */}
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                  {p.hot && (
                    <Badge className="bg-shopee text-white text-[10px]">
                      <Icons.Flame className="mr-0.5 size-2.5" /> HOT
                    </Badge>
                  )}
                  {p.xtra && (
                    <Badge className="bg-hermes text-white text-[10px]">
                      <Icons.Star className="mr-0.5 size-2.5" /> XTRA
                    </Badge>
                  )}
                </div>
                <div className="absolute right-2 top-2">
                  <Badge variant="secondary" className="bg-background/90 text-[10px] backdrop-blur">
                    {p.commissionRate}% comm
                  </Badge>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="line-clamp-2 text-sm font-medium leading-snug">{p.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-shopee">{formatRM(p.price)}</span>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Icons.Star className="size-3 fill-warning text-warning" />
                    {p.rating}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icons.MousePointerClick className="size-3" /> {formatNumber(p.clicks)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icons.ShoppingCart className="size-3" /> {p.orders}
                  </span>
                  <span className="font-semibold text-success">{p.conversion}%</span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={(e) => { e.stopPropagation(); setSelected(p) }}>
                    Details
                  </Button>
                  <Button size="sm" className="flex-1 bg-shopee-gradient text-xs hover:opacity-90" onClick={(e) => { e.stopPropagation(); toast.success('Affiliate link created!'); }}>
                    <Icons.Link className="mr-0.5 size-3" /> Link
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product detail modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selected.name}</DialogTitle>
                <DialogDescription>
                  Product details and affiliate performance
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Placeholder icon — when real product images are wired up,
                    replace this block with a `<SmartImage>` (or `next/image`
                    `<Image>`):
                    <SmartImage
                      src={selected.image}
                      alt={selected.name}
                      width={500}
                      height={500}
                      className="size-full rounded-lg object-cover"
                    /> */}
                <div className="aspect-square rounded-lg bg-gradient-to-br from-muted/50 to-muted">
                  <div className="flex h-full items-center justify-center">
                    <Icons.Package className="size-20 text-muted-foreground/30" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-3xl font-bold text-shopee">{formatRM(selected.price)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary">{selected.category}</Badge>
                      <Badge variant="outline" className="bg-shopee/5 text-shopee">{selected.commissionRate}% commission</Badge>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">You earn per sale</p>
                    <p className="text-xl font-bold text-success">{formatRM(selected.commission)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg border p-2">
                      <p className="text-xs text-muted-foreground">Clicks</p>
                      <p className="font-bold">{formatNumber(selected.clicks)}</p>
                    </div>
                    <div className="rounded-lg border p-2">
                      <p className="text-xs text-muted-foreground">Orders</p>
                      <p className="font-bold">{selected.orders}</p>
                    </div>
                    <div className="rounded-lg border p-2">
                      <p className="text-xs text-muted-foreground">CVR</p>
                      <p className="font-bold text-success">{selected.conversion}%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setSelected(null); setActivePage('content-studio') }}>
                  <Icons.Sparkles className="mr-1 size-4 text-hermes" /> Create AI Content
                </Button>
                <Button className="flex-1 bg-shopee-gradient hover:opacity-90" onClick={() => { toast.success('Affiliate link generated!'); setSelected(null) }}>
                  <Icons.Link className="mr-1 size-4" /> Generate Affiliate Link
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
