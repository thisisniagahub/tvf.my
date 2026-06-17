'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { PageHeader, StatCard, TrendBadge, StatCardSkeleton, ListRowSkeleton } from './_shared'
import { formatRM } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { TrendsResponse } from '@/lib/types'

export function TrendSpyPage() {
  const { setActivePage } = useAppStore()
  const [activeCat, setActiveCat] = useState<string | null>(null)

  const { data, isLoading } = useQuery<TrendsResponse>({
    queryKey: ['trends'],
    queryFn: async () => {
      const res = await fetch('/api/trends')
      if (!res.ok) throw new Error('Failed')
      return res.json() as Promise<TrendsResponse>
    },
  })

  const categories = data?.categories ?? []
  const trends = data?.trends ?? []

  const filtered = activeCat ? trends.filter((t) => t.category === activeCat) : trends

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trend Spy"
        subtitle="See which products other affiliates are promoting right now — anonymous intel."
        icon={Icons.Radar}
        accent="hermes"
      >
        <Button variant="outline" size="sm">
          <Icons.BellRing className="mr-1 size-4" /> Manage Alerts
        </Button>
        <Button size="sm" onClick={() => setActivePage('products')} className="bg-shopee-gradient hover:opacity-90">
          <Icons.Plus className="mr-1 size-4" /> Track Product
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Trending Products" value={trends.length.toString()} icon={Icons.Radar} accent="hermes" subtitle="Detected today" />
            <StatCard label="Hot Categories" value={categories.filter((c) => c.status === 'hot').length.toString()} icon={Icons.Flame} accent="shopee" subtitle="Above 70% velocity" />
            <StatCard label="Your Watchlist" value="12" icon={Icons.Eye} accent="success" subtitle="Products tracked" />
            <StatCard label="Active Alerts" value="5" icon={Icons.BellRing} accent="warning" subtitle="Notification on" />
          </>
        )}
      </div>

      {/* Category heatmap */}
      <Card className="border-border/60">
        <div className="border-b p-4">
          <h3 className="text-sm font-semibold">Category Trend Heatmap</h3>
          <p className="text-xs text-muted-foreground">Click any category to filter products below. Color = trend velocity (hot vs cool).</p>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {categories.map((cat) => {
              const intensity = Math.min(1, cat.velocity / 100)
              const isActive = activeCat === cat.name
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCat(isActive ? null : cat.name)}
                  className={cn(
                    'relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all',
                    isActive ? 'border-shopee shadow-md' : 'border-border/60 hover:border-shopee/40'
                  )}
                  style={{
                    background: cat.status === 'hot'
                      ? `rgba(238, 77, 45, ${0.05 + intensity * 0.12})`
                      : cat.status === 'warm'
                      ? `rgba(234, 179, 8, ${0.05 + intensity * 0.1})`
                      : 'var(--muted)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{cat.emoji}</span>
                    <TrendBadge velocity={cat.velocity} status={cat.status} />
                  </div>
                  <p className="mt-2 text-sm font-bold">{cat.name}</p>
                  <p className="text-[10px] text-muted-foreground">{cat.products} products tracked</p>
                </button>
              )
            })}
          </div>
          {activeCat && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Filtering by:</span>
              <Badge className="bg-shopee/15 text-shopee">{activeCat}</Badge>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setActiveCat(null)}>
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending products list */}
      <Card className="border-border/60">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h3 className="text-sm font-semibold">Trending Products Feed</h3>
            <p className="text-xs text-muted-foreground">Real-time anonymous competitor intel</p>
          </div>
          <Badge variant="outline" className="bg-success/5 text-success">
            <span className="relative mr-1 flex size-1.5">
              <span className="pulse-ring absolute inline-flex size-1.5 rounded-full text-success/60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-success" />
            </span>
            Live
          </Badge>
        </div>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[600px]">
            <div className="divide-y">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <ListRowSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Icons.SearchX className="size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm font-medium">No trending products found</p>
                  <p className="text-xs text-muted-foreground">Try a different category filter</p>
                </div>
              ) : (
                filtered.map((t) => (
                <div key={t.id} className="flex items-center gap-4 p-4 hover:bg-accent/40">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-muted/60 to-muted">
                    <Icons.Package className="size-6 text-muted-foreground/50" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                      <span className="flex items-center gap-1">
                        <Icons.Users className="size-3" /> {t.competitors} affiliates
                      </span>
                      <span className="flex items-center gap-1">
                        <Icons.Percent className="size-3" /> {t.avgCommission}% avg comm
                      </span>
                      <span className="flex items-center gap-1">
                        <Icons.Activity className="size-3" /> Score {t.trendScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <TrendBadge velocity={t.velocity} status={t.status} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Icons.MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.success('Added to watchlist')}>
                          <Icons.Eye className="mr-2 size-4" /> Watch this
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Alert created')}>
                          <Icons.BellRing className="mr-2 size-4" /> Create alert
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActivePage('products')}>
                          <Icons.Package className="mr-2 size-4" /> View product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
