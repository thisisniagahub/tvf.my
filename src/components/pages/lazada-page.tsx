'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader, StatCard } from './_shared'
import { demoProducts, formatRM, formatNumber } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const benefits = [
  { icon: Icons.Gift, title: 'Lazada Bonus coins', desc: 'Stack with affiliate commission for extra payout' },
  { icon: Icons.Star, title: 'Brand showcase', desc: 'Higher quality branded products with premium commissions' },
  { icon: Icons.ShieldCheck, title: 'Buyer protection', desc: 'LazMall authenticity = lower refund rates' },
  { icon: Icons.Users, title: 'Cross-border reach', desc: 'Tap into Singapore + Brunei + PH buyers too' },
]

const megaCampaigns = [
  { id: 'c1', date: '11 Nov', name: '11.11 Mega Sale', desc: 'Biggest single-day sale — vouchers stacking', days: 'In 4 days', intensity: 'hot' as const, bonus: '+30% comm' },
  { id: 'c2', date: '12 Dec', name: '12.12 Birthday Sale', desc: 'Year-end clearance + Lazada Birthday vouchers', days: 'In 35 days', intensity: 'hot' as const, bonus: '+25% comm' },
  { id: 'c3', date: '26 Mar', name: 'Lazada Birthday Festival', desc: "Lazada's anniversary — biggest brand collabs", days: 'In 139 days', intensity: 'warm' as const, bonus: '+20% comm' },
  { id: 'c4', date: '4 Apr', name: 'Lazada Payday Sale', desc: 'Monthly payday boost — quick wins', days: 'In 148 days', intensity: 'cool' as const, bonus: '+10% comm' },
]

const comparison = [
  { metric: 'Avg Commission', shopee: '8.5%', lazada: '7.2%', winner: 'shopee' as const },
  { metric: 'Product Catalog', shopee: '200M+', lazada: '80M+', winner: 'shopee' as const },
  { metric: 'Brand Trust', shopee: 'High', lazada: 'Very High (LazMall)', winner: 'lazada' as const },
  { metric: 'Payment Speed', shopee: 'Monthly 15th', lazada: 'Monthly 20th', winner: 'shopee' as const },
  { metric: 'Voucher Stacking', shopee: 'Limited', lazada: 'Excellent', winner: 'lazada' as const },
  { metric: 'Live Commerce', shopee: 'Mature (Shopee Live)', lazada: 'Growing (LazLive)', winner: 'shopee' as const },
  { metric: 'Cross-Border Reach', shopee: 'MY only', lazada: 'MY + SG + BN + PH', winner: 'lazada' as const },
]

export function LazadaPage() {
  const { setActivePage } = useAppStore()
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const lazadaProducts = demoProducts.slice(0, 8)

  const handleConnect = () => {
    setConnecting(true)
    setTimeout(() => {
      setConnecting(false)
      setConnected(true)
      toast.success('Lazada Affiliate connected! 🎉', {
        description: 'Selamat datang to the Lazada family!',
      })
    }, 1600)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lazada Affiliate"
        subtitle="South-East Asia's trusted marketplace — premium brands, big voucher stacking"
        icon={Icons.ShoppingBag}
        accent="success"
      >
        <Badge variant="outline" className="bg-success/10 text-success">
          New
        </Badge>
        <Button variant="outline" size="sm" onClick={() => toast.info('Loading Lazada Affiliate starter guide...')}>
          <Icons.BookOpen className="mr-1 size-4" /> Lazada Guide
        </Button>
      </PageHeader>

      {/* Hero connect card */}
      {!connected ? (
        <Card className="overflow-hidden border-success/30 bg-gradient-to-br from-success/[0.08] via-success/[0.03] to-background">
          <CardContent className="p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-success text-white">New Integration</Badge>
                  <Badge variant="outline" className="border-success/30 text-success">Beta Access</Badge>
                </div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Connect Lazada & unlock <span className="text-success">mega campaign bonuses</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sync your Lazada Affiliate Partner account with TheViralFindsMY. Stack vouchers, track LazMall
                  brand commissions, and auto-sync with regional mega campaigns (11.11, 12.12, Birthday Festival).
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="lg" onClick={handleConnect} disabled={connecting} className="bg-success hover:bg-success/90">
                    {connecting ? (
                      <>
                        <Icons.Loader2 className="mr-2 size-4 animate-spin" /> Connecting...
                      </>
                    ) : (
                      <>
                        <Icons.Link2 className="mr-2 size-4" /> Connect Lazada
                      </>
                    )}
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => toast.info('Demo mode unlocked — explore freely 🎬')}>
                    <Icons.Eye className="mr-2 size-4" /> Explore Demo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Free during beta. Lazada Affiliate Partner account required.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {benefits.map((b) => (
                  <div key={b.title} className="rounded-xl border border-border/60 bg-card/80 p-3 backdrop-blur transition-all hover:border-success/40 hover:shadow-md">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-success/10 text-success">
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
              <p className="text-sm font-semibold">Lazada Affiliate connected</p>
              <p className="text-xs text-muted-foreground">@theviralfindsmy · Lazada Affiliate Partner sync active</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setConnected(false)
                toast.info('Lazada disconnected')
              }}
            >
              <Icons.Unlink className="mr-1 size-4" /> Disconnect
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lazada Earnings" value={formatRM(920)} delta="+15% vs last month" deltaType="up" icon={Icons.Wallet} accent="success" subtitle="This month" />
        <StatCard label="Total Clicks" value={formatNumber(1234)} delta="+98 today" deltaType="up" icon={Icons.MousePointerClick} accent="success" subtitle="Last 30 days" />
        <StatCard label="Orders" value="89" delta="+12 today" deltaType="up" icon={Icons.ShoppingCart} accent="shopee" subtitle="LazMall: 62" />
        <StatCard label="Conversion" value="7.2%" delta="-0.8% vs last week" deltaType="down" icon={Icons.Target} accent="warning" subtitle="Below Shopee (8.5%)" />
      </div>

      {/* Lazada vs Shopee comparison */}
      <Card className="border-border/60">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.GitCompare className="size-4 text-success" />
            <div>
              <h3 className="text-sm font-semibold">Lazada vs Shopee — Quick Comparison</h3>
              <p className="text-xs text-muted-foreground">Which platform wins for each metric?</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActivePage('compare')}>
            Full comparison <Icons.ArrowRight className="ml-1 size-3" />
          </Button>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">Metric</th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2 rounded-full bg-shopee" /> Shopee
                    </span>
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2 rounded-full bg-success" /> Lazada
                    </span>
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">Winner</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.metric} className="border-b last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-2.5 font-medium">{row.metric}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{row.shopee}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{row.lazada}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge className={cn('text-[10px] uppercase', row.winner === 'shopee' ? 'bg-shopee/15 text-shopee' : 'bg-success/15 text-success')}>
                        {row.winner}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mega campaigns calendar */}
      <Card className="border-border/60">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.CalendarDays className="size-4 text-success" />
            <div>
              <h3 className="text-sm font-semibold">Lazada Mega Campaigns Calendar</h3>
              <p className="text-xs text-muted-foreground">Mark your calendar — these are when Malaysian wallets open widest</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success('All mega campaigns added to your calendar 📅')}>
            <Icons.Plus className="mr-1 size-3.5" /> Add all to calendar
          </Button>
        </div>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {megaCampaigns.map((c) => (
            <div
              key={c.id}
              className={cn(
                'relative overflow-hidden rounded-xl border-2 p-4 transition-all hover:shadow-md',
                c.intensity === 'hot'
                  ? 'border-success/40 bg-success/[0.04]'
                  : c.intensity === 'warm'
                  ? 'border-warning/40 bg-warning/[0.03]'
                  : 'border-border/60 bg-card'
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'flex size-10 flex-col items-center justify-center rounded-lg text-white',
                    c.intensity === 'hot' ? 'bg-success' : c.intensity === 'warm' ? 'bg-warning' : 'bg-muted-foreground/30'
                  )}
                >
                  <span className="text-[10px] font-bold leading-none">{c.date.split(' ')[0]}</span>
                  <span className="text-[8px] leading-none">{c.date.split(' ')[1]}</span>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success text-[10px]">{c.bonus}</Badge>
              </div>
              <p className="mt-2 text-sm font-bold">{c.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{c.desc}</p>
              <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Icons.Clock className="size-3" /> {c.days}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Lazada eligible products grid */}
      <Card className="border-border/60">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.Package className="size-4 text-success" />
            <div>
              <h3 className="text-sm font-semibold">Lazada-Eligible Products</h3>
              <p className="text-xs text-muted-foreground">Curated for LazMall & Lazada cross-border</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActivePage('products')}>
            View all <Icons.ArrowRight className="ml-1 size-3" />
          </Button>
        </div>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lazadaProducts.map((p) => (
            <div key={p.id} className="group overflow-hidden rounded-xl border border-border/60 transition-all hover:border-success/40 hover:shadow-md">
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
                <div className="flex h-full items-center justify-center">
                  <Icons.Package className="size-14 text-muted-foreground/30" />
                </div>
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                  <Badge className="bg-success text-white text-[10px]">Lazada</Badge>
                  {p.hot && (
                    <Badge className="bg-shopee text-white text-[10px]">
                      <Icons.Flame className="mr-0.5 size-2.5" /> HOT
                    </Badge>
                  )}
                </div>
                <div className="absolute right-2 top-2">
                  <Badge variant="secondary" className="bg-background/90 text-[10px] backdrop-blur">
                    {p.commissionRate}% comm
                  </Badge>
                </div>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium leading-snug">{p.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-success">{formatRM(p.price)}</span>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Icons.Star className="size-3 fill-warning text-warning" />
                    {p.rating}
                  </div>
                </div>
                <Button size="sm" className="mt-2 w-full bg-success text-xs hover:bg-success/90" onClick={() => toast.success('Lazada affiliate link created!')}>
                  <Icons.Link className="mr-0.5 size-3" /> Create Lazada Link
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
