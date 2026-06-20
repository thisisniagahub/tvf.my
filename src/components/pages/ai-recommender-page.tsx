'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader } from './_shared'
import { formatRM } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Recommendation {
  id: string
  type: 'product' | 'content' | 'timing' | 'strategy'
  title: string
  description: string
  confidence: number
  reason: string
  action: string
  meta?: string
}

const recommendations: Recommendation[] = [
  // Products
  { id: 'p1', type: 'product', title: 'Promote Safi Balqis UV Sunblock today', description: 'Trending up 64% this week. XTRA commission live.', confidence: 96, reason: 'Matches your beauty niche + audience peak hours align.', action: 'Create Link', meta: '12% comm · RM 24.90' },
  { id: 'p2', type: 'product', title: 'Add Tudung Bawal Premium to Raya campaign', description: '35.3% conversion rate — best in your portfolio.', confidence: 92, reason: 'Raya season coming + Fashion velocity at 92%.', action: 'Add to campaign', meta: '11% comm · RM 35' },
  { id: 'p3', type: 'product', title: 'Bundle RGB Keyboard with Wireless Mouse', description: 'Bundle commission +19% vs single sale.', confidence: 84, reason: 'Mouse trending +34% — perfect cross-sell.', action: 'Create bundle', meta: '8.5% + 9% comm' },

  // Content
  { id: 'c1', type: 'content', title: 'Post "Before/After" tutorial Reel', description: 'Before/After format converts 2.3x better for beauty.', confidence: 88, reason: 'Your audience engaged 4.2x more with previous tutorials.', action: 'Generate content', meta: 'Reel · 30s' },
  { id: 'c2', type: 'content', title: 'Try unboxing format for Anker Power Bank', description: 'Unboxing drives 47% more saves than static posts.', confidence: 79, reason: 'High-ticket item benefits from demo content.', action: 'Generate script', meta: 'TikTok · 45s' },
  { id: 'c3', type: 'content', title: 'Carousel: "5 Halal Lipsticks for Raya"', description: 'List carousels get 3x more shares on IG.', confidence: 81, reason: 'Listicle format + Raya timing = viral potential.', action: 'Generate carousel', meta: 'Instagram · 5 slides' },

  // Timing
  { id: 't1', type: 'timing', title: 'Post Safi Balqis at 7:30PM tonight', description: 'Golden hour 7-9PM MYT — your audience peaks.', confidence: 94, reason: 'Your last 8PM post had 3.1x reach vs avg.', action: 'Schedule post', meta: 'Tonight 7:30PM' },
  { id: 't2', type: 'timing', title: 'Avoid posting 2-4PM on weekdays', description: 'Engagement drops 60% during this window.', confidence: 87, reason: 'Your audience works office hours — low phone time.', action: 'Set quiet hours', meta: 'Mon-Fri 2-4PM' },
  { id: 't3', type: 'timing', title: 'Sunday 9PM is your power slot', description: 'Best historical performance: 4.5x avg engagement.', confidence: 91, reason: 'Sundays + late night = impulse buying window.', action: 'Schedule weekly post', meta: 'Every Sun 9PM' },

  // Strategy
  { id: 's1', type: 'strategy', title: 'Pivot 30% budget to Beauty for Raya', description: 'Beauty sales historically surge 280% in Raya season.', confidence: 89, reason: 'Your current split: 60% Electronics, 20% Beauty, 20% Fashion.', action: 'Adjust budget', meta: '+RM 150/mo to Beauty' },
  { id: 's2', type: 'strategy', title: 'Test TikTok Shop as second platform', description: 'Your IG content style translates well to TikTok.', confidence: 76, reason: 'TikTok Shopee affiliate CVR is 1.8x higher than IG.', action: 'Connect TikTok', meta: '+RM 320/mo potential' },
  { id: 's3', type: 'strategy', title: 'Run a 7-day giveaway to grow audience', description: 'Audience growth plateaus — giveaway can boost +18%.', confidence: 72, reason: 'Tudung Bawal giveaway last time added 2,400 followers.', action: 'Plan giveaway', meta: '7 days · RM 70 cost' },
]

const typeMeta = {
  product: { label: 'Product to promote', icon: Icons.Package, color: 'shopee' },
  content: { label: 'Content idea', icon: Icons.Clapperboard, color: 'hermes' },
  timing: { label: 'Best time to post', icon: Icons.Clock, color: 'success' },
  strategy: { label: 'Niche opportunity', icon: Icons.Target, color: 'warning' },
} as const

export function AiRecommenderPage() {
  const [tab, setTab] = useState<string>('all')
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const filtered = recommendations.filter((r) => {
    if (dismissed.has(r.id)) return false
    if (tab === 'all') return true
    return r.type === tab
  })

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
    toast.info('Recommendation dismissed')
  }

  const act = (r: Recommendation) => {
    toast.success(`${r.action} — HERMES is on it 🚀`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Recommender"
        subtitle="Your personalized feed of high-impact moves — refreshed daily by HERMES."
        icon={Icons.Brain}
        accent="hermes"
      >
        <Badge className="bg-hermes-gradient text-white">
          <Icons.Sparkles className="mr-1 size-3" /> AI Powered
        </Badge>
        <Button variant="outline" size="sm" onClick={() => toast.success('Feed refreshed — 4 new recommendations')}>
          <Icons.RefreshCw className="mr-1 size-4" /> Refresh
        </Button>
      </PageHeader>

      {/* Daily Briefing hero */}
      <Card className="overflow-hidden border-hermes/40">
        <div className="relative bg-hermes-gradient">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <CardContent className="relative p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Icons.Bot className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">HERMES Daily Briefing</h3>
                  <Badge className="bg-white/20 text-white text-[10px]">{new Date().toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'short' })}</Badge>
                </div>
                <p className="mt-1 text-sm text-white/90">
                  &quot;Good morning lah! 🌅 You earned <span className="font-bold">RM 47.30</span> overnight from 3 sales. Today&apos;s top priority: promote Safi Balqis at 7:30PM — your audience engagement will be at peak. Also, Raya is 6 weeks away, start building your beauty content calendar now.&quot;
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="rounded-lg bg-white/15 px-3 py-1.5 text-xs backdrop-blur">
                    <span className="text-white/70">Today&apos;s potential:</span>{' '}
                    <span className="font-bold">RM 220+</span>
                  </div>
                  <div className="rounded-lg bg-white/15 px-3 py-1.5 text-xs backdrop-blur">
                    <span className="text-white/70">Active recommendations:</span>{' '}
                    <span className="font-bold">{recommendations.length - dismissed.size}</span>
                  </div>
                  <div className="rounded-lg bg-white/15 px-3 py-1.5 text-xs backdrop-blur">
                    <span className="text-white/70">Confidence avg:</span>{' '}
                    <span className="font-bold">{Math.round(recommendations.reduce((s, r) => s + r.confidence, 0) / recommendations.length)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">
            <Icons.Sparkles className="mr-1.5 size-4" /> All ({recommendations.length - dismissed.size})
          </TabsTrigger>
          <TabsTrigger value="product">
            <Icons.Package className="mr-1.5 size-4" /> Products
          </TabsTrigger>
          <TabsTrigger value="content">
            <Icons.Clapperboard className="mr-1.5 size-4" /> Content
          </TabsTrigger>
          <TabsTrigger value="timing">
            <Icons.Clock className="mr-1.5 size-4" /> Timing
          </TabsTrigger>
          <TabsTrigger value="strategy">
            <Icons.Target className="mr-1.5 size-4" /> Strategy
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <ScrollArea className="max-h-[900px]">
            <div className="grid gap-3 lg:grid-cols-2">
              {filtered.map((r) => {
                const meta = typeMeta[r.type]
                const Icon = meta.icon
                return (
                  <Card key={r.id} className="border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-lg',
                          meta.color === 'shopee' && 'bg-shopee/10 text-shopee',
                          meta.color === 'hermes' && 'bg-hermes/10 text-hermes',
                          meta.color === 'success' && 'bg-success/10 text-success',
                          meta.color === 'warning' && 'bg-warning/10 text-warning',
                        )}>
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold leading-tight">{r.title}</p>
                            <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => dismiss(r.id)}>
                              <Icons.X className="size-3.5" />
                            </Button>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                          {r.meta && (
                            <Badge variant="outline" className="mt-2 text-[10px]">{r.meta}</Badge>
                          )}

                          {/* Confidence bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Icons.Bot className="size-3 text-hermes" /> AI confidence
                              </span>
                              <span className="font-semibold text-hermes">{r.confidence}%</span>
                            </div>
                            <Progress value={r.confidence} className="mt-1 h-1" />
                          </div>

                          {/* Reason */}
                          <div className="mt-2 rounded-lg bg-muted/40 p-2 text-xs">
                            <p className="text-[10px] font-semibold uppercase text-hermes">Why HERMES recommends</p>
                            <p className="mt-0.5 text-muted-foreground">{r.reason}</p>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <Button size="sm" className="flex-1 bg-hermes-gradient hover:opacity-90" onClick={() => act(r)}>
                              <Icons.Zap className="mr-1 size-3" /> {r.action}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toast.info('Saving for later')}>
                              <Icons.Clock className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {filtered.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex h-48 flex-col items-center justify-center text-center">
                    <Icons.Check className="size-10 text-success" />
                    <p className="mt-3 text-sm font-medium">All caught up!</p>
                    <p className="text-xs text-muted-foreground">No recommendations in this category. Check back tomorrow.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
