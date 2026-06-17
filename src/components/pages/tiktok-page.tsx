'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader, StatCard } from './_shared'
import { demoProducts, formatRM, formatNumber } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const benefits = [
  { icon: Icons.Music2, title: 'Reach Gen Z buyers', desc: 'Tap into 8M+ Malaysian TikTok users actively shopping' },
  { icon: Icons.Video, title: 'Shoppable videos', desc: 'Tag products natively inside your TikTok content' },
  { icon: Icons.Coins, title: 'Higher commissions', desc: 'Up to 25% commission on trending beauty & fashion' },
  { icon: Icons.Radio, title: 'TikTok Live selling', desc: 'Stream live and convert viewers in real-time' },
]

const viralIdeas = [
  {
    id: 'v1',
    product: 'Safi Balqis UV Sunblock SPF50',
    hook: '"Eh, you seriously still not wearing sunblock meh?"',
    script: 'Open with relatable aunty-scolding-millennial moment → reveal SPF50 PA+++ → show before/after UV camera test → CTA: "Tap the orange cart below 👇"',
    sound: 'Original Audio — "Cepat-cepat" by Khai',
    hashtags: ['#skincareMY', '#sunblockviral', '#safibalqis'],
    estViews: '85K-150K',
    difficulty: 'Easy',
  },
  {
    id: 'v2',
    product: 'Tudung Bawal Premium Chiffon',
    hook: '"This tudung makes me look like a Datuk\'s wife 🥹"',
    script: 'Try-on haul 5 colours → slow-mo fabric flow → styling tips for Raya → CTA: "Stok cepat habis, grab now"',
    sound: 'Trending: "Bunga" by Siti Badriah',
    hashtags: ['#tudungbawal', '#ootdhijab', '#raya2026'],
    estViews: '120K-200K',
    difficulty: 'Medium',
  },
  {
    id: 'v3',
    product: 'RGB Mechanical Keyboard Hot-Swap',
    hook: '"POV: Your keyboard glows harder than your future 🔥"',
    script: 'ASMR typing test → swap switches on camera → RGB showcase in dark room → CTA: "Use code KAKI10 for 10% off"',
    sound: 'Lo-fi beats + keyboard ASMR',
    hashtags: ['#gamingsetup', '#mechanicalkeyboard', '#asmr'],
    estViews: '60K-95K',
    difficulty: 'Hard',
  },
]

const postingTimes = [
  { slot: '7:00 PM - 9:00 PM', label: 'Golden hour', reach: 92, desc: 'After dinner, max Malaysians scrolling' },
  { slot: '12:00 PM - 2:00 PM', label: 'Lunch break', reach: 78, desc: 'Office workers lunchtime scroll session' },
  { slot: '9:00 PM - 11:00 PM', label: 'Wind down', reach: 85, desc: 'Pre-bedtime binge, great for emotional hooks' },
  { slot: '6:00 AM - 8:00 AM', label: 'Morning commute', reach: 64, desc: 'LRT/KTM commuters catching up' },
]

const liveSchedule = [
  { id: 'l1', date: 'Tonight', time: '8:30 PM', title: 'Raya Beauty Haul Live', products: 6, expectedViewers: 450, status: 'upcoming' as const },
  { id: 'l2', date: 'Tomorrow', time: '1:00 PM', title: 'Lunchtime Gadget Showcase', products: 4, expectedViewers: 280, status: 'upcoming' as const },
  { id: 'l3', date: 'Sat, 16 Nov', time: '9:00 PM', title: 'Weekend Fashion Try-On', products: 12, expectedViewers: 800, status: 'scheduled' as const },
  { id: 'l4', date: 'Sun, 17 Nov', time: '8:00 PM', title: 'Skincare Routine Live Q&A', products: 5, expectedViewers: 350, status: 'scheduled' as const },
]

export function TiktokPage() {
  const { setActivePage } = useAppStore()
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const topProducts = demoProducts.slice(0, 6)

  const handleConnect = () => {
    setConnecting(true)
    setTimeout(() => {
      setConnecting(false)
      setConnected(true)
      toast.success('TikTok Shop connected! 🎉', {
        description: 'Welcome to the TikTok affiliate family, boss.',
      })
    }, 1600)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="TikTok Shop"
        subtitle="Malaysia's #1 short-video platform — turn views into affiliate sales"
        icon={Icons.Music}
        accent="hermes"
      >
        <Badge variant="outline" className="bg-hermes/10 text-hermes">
          New
        </Badge>
        <Button variant="outline" size="sm" onClick={() => toast.info('Loading TikTok Shop starter guide...')}>
          <Icons.BookOpen className="mr-1 size-4" /> Guide
        </Button>
      </PageHeader>

      {/* Hero connect card */}
      {!connected ? (
        <Card className="overflow-hidden border-hermes/30 bg-gradient-to-br from-hermes/[0.08] via-hermes/[0.03] to-background">
          <CardContent className="p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-hermes text-white">New Integration</Badge>
                  <Badge variant="outline" className="border-hermes/30 text-hermes">Beta Access</Badge>
                </div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Connect TikTok Shop & unlock <span className="text-gradient-hermes">video commerce</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sync your TikTok Shop affiliate account with TheViralFindsMY. Get AI-generated viral scripts,
                  real-time conversion tracking, and direct payouts — all from one dashboard.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="lg" onClick={handleConnect} disabled={connecting} className="bg-hermes-gradient hover:opacity-90">
                    {connecting ? (
                      <>
                        <Icons.Loader2 className="mr-2 size-4 animate-spin" /> Connecting...
                      </>
                    ) : (
                      <>
                        <Icons.Link2 className="mr-2 size-4" /> Connect TikTok Shop
                      </>
                    )}
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => toast.info('Demo mode unlocked — explore freely 🎬')}>
                    <Icons.Eye className="mr-2 size-4" /> Explore Demo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Free during beta. No credit card needed. Takes 30 seconds only.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {benefits.map((b) => (
                  <div key={b.title} className="rounded-xl border border-border/60 bg-card/80 p-3 backdrop-blur transition-all hover:border-hermes/40 hover:shadow-md">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-hermes/10 text-hermes">
                      <b.icon className="size-5" />
                    </div>
                    <p className="mt-2 text-sm font-semibold">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-success/30 bg-gradient-to-r from-success/[0.06] to-background">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-success/15 text-success">
              <Icons.CheckCircle2 className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">TikTok Shop connected</p>
              <p className="text-xs text-muted-foreground">@theviralfindsmy · TikTok Seller Centre sync active</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setConnected(false)
                toast.info('TikTok Shop disconnected')
              }}
            >
              <Icons.Unlink className="mr-1 size-4" /> Disconnect
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="TikTok Earnings" value={formatRM(1840)} delta="+42% vs last week" deltaType="up" icon={Icons.Wallet} accent="hermes" subtitle="This month" />
        <StatCard label="Video Views" value="124K" delta="+18K today" deltaType="up" icon={Icons.Eye} accent="hermes" subtitle="Last 30 days" />
        <StatCard label="Product Clicks" value={formatNumber(3456)} delta="+312 today" deltaType="up" icon={Icons.MousePointerClick} accent="shopee" subtitle="From shoppable videos" />
        <StatCard label="Conversion" value="18.2%" delta="+2.4% vs last week" deltaType="up" icon={Icons.Target} accent="success" subtitle="Above TikTok avg (9.1%)" />
      </div>

      {/* Top TikTok Products */}
      <Card className="border-border/60">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.Flame className="size-4 text-hermes" />
            <div>
              <h3 className="text-sm font-semibold">Top TikTok Products</h3>
              <p className="text-xs text-muted-foreground">Best-performing shoppable video picks</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActivePage('products')}>
            Browse all <Icons.ArrowRight className="ml-1 size-3" />
          </Button>
        </div>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[420px]">
            <div className="divide-y">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-accent/40">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                    #{i + 1}
                  </div>
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-muted/60 to-muted">
                    <Icons.Package className="size-6 text-muted-foreground/50" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="border-hermes/30 bg-hermes/5 text-hermes text-[10px]">
                        <Icons.Music className="mr-0.5 size-2.5" /> TikTok
                      </Badge>
                      <span>{formatRM(p.price)}</span>
                      <span>•</span>
                      <span>{p.commissionRate}% comm</span>
                      {p.hot && (
                        <Badge className="h-4 px-1 text-[9px] bg-shopee text-white">HOT</Badge>
                      )}
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-hermes">{formatRM(p.commission * p.orders)}</p>
                    <p className="text-[10px] text-muted-foreground">{p.orders} orders</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast.success('Script idea sent to Content Studio 🎬')}>
                    <Icons.Sparkles className="mr-1 size-3 text-hermes" /> Script
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Viral Video Ideas */}
      <Card className="border-border/60">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.Sparkles className="size-4 text-hermes" />
            <div>
              <h3 className="text-sm font-semibold">Viral Video Ideas from AI</h3>
              <p className="text-xs text-muted-foreground">Generated hooks, scripts & trending sounds for MY market</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success('Fresh viral ideas generated ✨')}>
            <Icons.RefreshCw className="mr-1 size-3.5" /> Regenerate
          </Button>
        </div>
        <CardContent className="grid gap-4 p-4 md:grid-cols-3">
          {viralIdeas.map((idea) => (
            <div key={idea.id} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/50 p-4 transition-all hover:border-hermes/40 hover:shadow-md">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-hermes/10 text-hermes">{idea.product}</Badge>
                <Badge variant="outline" className="text-[10px]">{idea.difficulty}</Badge>
              </div>
              <div className="rounded-lg bg-hermes/5 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-hermes">Hook</p>
                <p className="mt-0.5 text-sm font-semibold italic">{idea.hook}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Script Preview</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{idea.script}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Icons.Music className="size-3.5 shrink-0 text-hermes" />
                <span className="truncate text-muted-foreground">{idea.sound}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {idea.hashtags.map((h) => (
                  <Badge key={h} variant="secondary" className="text-[10px]">{h}</Badge>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t pt-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icons.Eye className="size-3" /> Est. {idea.estViews}
                </span>
                <Button size="sm" className="bg-hermes-gradient text-xs hover:opacity-90" onClick={() => toast.success('Sent to Content Studio 🎬')}>
                  Use idea
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Best posting times + Live schedule */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Best Posting Times */}
        <Card className="border-border/60">
          <div className="border-b p-4">
            <div className="flex items-center gap-2">
              <Icons.Clock className="size-4 text-hermes" />
              <div>
                <h3 className="text-sm font-semibold">Best Posting Times (MYT)</h3>
                <p className="text-xs text-muted-foreground">Optimal slots based on Malaysian audience</p>
              </div>
            </div>
          </div>
          <CardContent className="space-y-3 p-4">
            {postingTimes.map((t) => (
              <div key={t.slot} className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:border-hermes/40">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-hermes/10 text-hermes">
                  <Icons.Clock className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{t.slot}</p>
                    <Badge variant="outline" className="text-[10px]">{t.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Progress value={t.reach} className="h-1.5" />
                    <span className="text-[10px] font-semibold text-hermes">{t.reach}%</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live schedule */}
        <Card className="border-border/60">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Icons.Radio className="size-4 text-hermes" />
              <div>
                <h3 className="text-sm font-semibold">TikTok Live Schedule</h3>
                <p className="text-xs text-muted-foreground">Upcoming sessions — Malaysians love 8-9PM live</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => toast.info('New live session drafted')}>
              <Icons.Plus className="mr-1 size-3.5" /> Schedule
            </Button>
          </div>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[400px]">
              <div className="divide-y">
                {liveSchedule.map((l) => (
                  <div key={l.id} className="flex items-center gap-3 p-4 hover:bg-accent/40">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-hermes/10 text-hermes">
                      <Icons.Radio className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{l.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Icons.Calendar className="size-3" /> {l.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Icons.Clock className="size-3" /> {l.time}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Icons.Package className="size-3" /> {l.products} products</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge variant="outline" className={cn('text-[10px]', l.status === 'upcoming' ? 'bg-warning/10 text-warning' : 'bg-muted')}>
                        {l.status === 'upcoming' ? 'Upcoming' : 'Scheduled'}
                      </Badge>
                      <p className="mt-1 text-[10px] text-muted-foreground">~{l.expectedViewers} viewers</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
