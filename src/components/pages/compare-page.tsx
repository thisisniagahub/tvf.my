'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PageHeader } from './_shared'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const comparisonRows: {
  metric: string
  shopee: string
  tiktok: string
  lazada: string
  winner: 'Shopee' | 'TikTok' | 'Lazada' | 'All'
  icon: Icons.LucideIcon
}[] = [
  { metric: 'Commission rate', shopee: '5-15% (avg 8.5%)', tiktok: '5-25% (avg 11.2%)', lazada: '4-12% (avg 7.2%)', winner: 'TikTok', icon: Icons.Percent },
  { metric: 'Payment schedule', shopee: 'Monthly, 15th', tiktok: 'Bi-weekly', lazada: 'Monthly, 20th', winner: 'TikTok', icon: Icons.CalendarClock },
  { metric: 'Min payout', shopee: 'RM 10', tiktok: 'RM 50', lazada: 'RM 50', winner: 'Shopee', icon: Icons.Coins },
  { metric: 'Product catalog size', shopee: '200M+ products', tiktok: '8M+ products', lazada: '80M+ products', winner: 'Shopee', icon: Icons.Package },
  { metric: 'Conversion avg (MY)', shopee: '21.5%', tiktok: '18.2%', lazada: '7.2%', winner: 'Shopee', icon: Icons.Target },
  { metric: 'Live commission', shopee: 'Up to 80% (Shopee Live)', tiktok: 'Up to 25% (TikTok Live)', lazada: 'Up to 12% (LazLive)', winner: 'Shopee', icon: Icons.Radio },
  { metric: 'XTRA offers', shopee: 'Yes — boosted 30-50%', tiktok: 'Limited (occasional)', lazada: 'Mega campaign boosts', winner: 'Shopee', icon: Icons.Star },
  { metric: 'Best for', shopee: 'Volume + live commerce', tiktok: 'Viral Gen Z reach', lazada: 'Premium brands + cross-border', winner: 'All', icon: Icons.Sparkles },
]

const radarData = [
  { axis: 'Commission', Shopee: 75, TikTok: 92, Lazada: 60 },
  { axis: 'Reach', Shopee: 90, TikTok: 95, Lazada: 70 },
  { axis: 'Conversion', Shopee: 88, TikTok: 72, Lazada: 45 },
  { axis: 'Ease of Use', Shopee: 85, TikTok: 60, Lazada: 75 },
  { axis: 'Payout Speed', Shopee: 65, TikTok: 88, Lazada: 55 },
]

const platformStrengths = [
  {
    platform: 'Shopee',
    accent: 'shopee' as const,
    icon: Icons.ShoppingBag,
    tagline: 'The volume king',
    description: 'Biggest Malaysian catalog, mature live commerce (Shopee Live), generous XTRA commission boosts.',
    strengths: ['Massive product catalog (200M+)', 'Shopee Live = 80% commission ceiling', 'Low RM 10 min payout', 'Strong voucher + flash sale culture'],
    bestFor: 'Affiliates focused on volume + live selling',
  },
  {
    platform: 'TikTok Shop',
    accent: 'hermes' as const,
    icon: Icons.Music,
    tagline: 'The viral engine',
    description: 'Highest commission rates (up to 25%), Gen Z audience, native video commerce, fast bi-weekly payouts.',
    strengths: ['Highest avg commission (11.2%)', 'Native shoppable videos', 'Bi-weekly payouts (fastest)', 'Massive Gen Z audience in MY'],
    bestFor: 'Content creators with video skills',
  },
  {
    platform: 'Lazada',
    accent: 'success' as const,
    icon: Icons.ShoppingBag,
    tagline: 'The brand builder',
    description: 'LazMall authenticity, voucher stacking, regional reach (MY + SG + BN + PH), mega campaign bonuses.',
    strengths: ['LazMall = authentic premium brands', 'Cross-border reach (4 countries)', 'Excellent voucher stacking', '11.11 / 12.12 mega bonuses'],
    bestFor: 'Affiliates targeting premium brands',
  },
]

const nicheRecommendations = [
  { niche: 'Beauty & Skincare', pick: 'TikTok Shop', reason: 'Gen Z drives beauty virality — Safi Balqis & Wardah clips convert 2.3x better on TikTok.' },
  { niche: 'Fashion & Tudung', pick: 'Shopee + TikTok', reason: 'Tudung Bawal: Shopee for volume (35% CVR), TikTok for trend discovery.' },
  { niche: 'Electronics & Gadgets', pick: 'Shopee', reason: 'Higher catalog depth + Shopee Live demos boost expensive gadget conversions.' },
  { niche: 'Halal Products', pick: 'Lazada', reason: 'LazMall halal certification trust + cross-border reach to SG/BN Muslim buyers.' },
]

export function ComparePage() {
  const [selectedNiche, setSelectedNiche] = useState(nicheRecommendations[0].niche)
  const recommendation = nicheRecommendations.find((n) => n.niche === selectedNiche)!

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Comparison"
        subtitle="Side-by-side Shopee vs TikTok vs Lazada — pick the right platform for your niche"
        icon={Icons.GitCompare}
        accent="hermes"
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Generating full PDF report...')}>
          <Icons.FileText className="mr-1 size-4" /> Export PDF
        </Button>
      </PageHeader>

      {/* AI Recommendation */}
      <Card className="overflow-hidden border-hermes/30 bg-gradient-to-r from-hermes/[0.08] via-hermes/[0.03] to-background">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-hermes-gradient text-white shadow-md">
              <Icons.Sparkles className="size-6" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">AI Recommendation — Pick a platform for your niche</h3>
                <Badge className="bg-hermes text-white text-[10px]">HERMES AI</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on your demo profile (Beauty + Fashion niches, 26% avg CVR, content creator), here&apos;s our recommendation.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {nicheRecommendations.map((n) => (
                  <button
                    key={n.niche}
                    onClick={() => setSelectedNiche(n.niche)}
                    className={cn(
                      'rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-all',
                      selectedNiche === n.niche ? 'border-hermes bg-hermes/10 text-hermes' : 'border-border/60 hover:border-hermes/40'
                    )}
                  >
                    {n.niche}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-hermes/20 bg-hermes/[0.04] p-4">
                <div className="flex items-center gap-2">
                  <Icons.Trophy className="size-4 text-hermes" />
                  <p className="text-sm font-semibold">
                    For <span className="text-hermes">{recommendation.niche}</span> →{' '}
                    <span className="text-hermes">{recommendation.pick}</span>
                  </p>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{recommendation.reason}</p>
                <Button size="sm" className="mt-3 bg-hermes-gradient hover:opacity-90" onClick={() => toast.success(`Connecting to ${recommendation.pick.split(' ')[0]}...`)}>
                  <Icons.ArrowRight className="mr-1 size-3.5" /> Go to {recommendation.pick.split(' ')[0]}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-side comparison table */}
      <Card className="border-border/60">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.GitCompare className="size-4 text-hermes" />
            <div>
              <h3 className="text-sm font-semibold">Side-by-Side Comparison</h3>
              <p className="text-xs text-muted-foreground">8 metrics across the 3 major Malaysian affiliate platforms</p>
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Metric</th>
                  <th className="px-4 py-3 text-left font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-shopee" /> Shopee
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-hermes" /> TikTok Shop
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-success" /> Lazada
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Winner</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.metric} className="border-b last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <row.icon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="font-medium">{row.metric}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.shopee}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.tiktok}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.lazada}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge
                        className={cn(
                          'text-[10px] uppercase',
                          row.winner === 'Shopee'
                            ? 'bg-shopee/15 text-shopee'
                            : row.winner === 'TikTok'
                            ? 'bg-hermes/15 text-hermes'
                            : row.winner === 'Lazada'
                            ? 'bg-success/15 text-success'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
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

      {/* Radar chart + strengths */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Radar chart */}
        <Card className="border-border/60 lg:col-span-2">
          <div className="border-b p-4">
            <div className="flex items-center gap-2">
              <Icons.Radar className="size-4 text-hermes" />
              <div>
                <h3 className="text-sm font-semibold">Platform Strength Radar</h3>
                <p className="text-xs text-muted-foreground">5-axis comparison (0-100 scale)</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData} outerRadius={100}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} angle={90} domain={[0, 100]} />
                <Radar name="Shopee" dataKey="Shopee" stroke="var(--shopee)" fill="var(--shopee)" fillOpacity={0.25} strokeWidth={2} />
                <Radar name="TikTok" dataKey="TikTok" stroke="var(--hermes)" fill="var(--hermes)" fillOpacity={0.25} strokeWidth={2} />
                <Radar name="Lazada" dataKey="Lazada" stroke="var(--success)" fill="var(--success)" fillOpacity={0.25} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform strengths cards */}
        <div className="grid gap-4 lg:col-span-3">
          {platformStrengths.map((s) => (
            <Card key={s.platform} className="overflow-hidden border-border/60 transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-xl',
                      s.accent === 'shopee' ? 'bg-shopee/10 text-shopee' : s.accent === 'hermes' ? 'bg-hermes/10 text-hermes' : 'bg-success/10 text-success'
                    )}
                  >
                    <s.icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold">{s.platform}</h4>
                      <Badge variant="outline" className="text-[10px]">{s.tagline}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                    <div className="mt-2 grid gap-1 sm:grid-cols-2">
                      {s.strengths.map((strength) => (
                        <div key={strength} className="flex items-start gap-1.5 text-xs">
                          <Icons.CheckCircle2
                            className={cn(
                              'mt-0.5 size-3.5 shrink-0',
                              s.accent === 'shopee' ? 'text-shopee' : s.accent === 'hermes' ? 'text-hermes' : 'text-success'
                            )}
                          />
                          <span className="text-muted-foreground">{strength}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs">
                      <Icons.Sparkles className="size-3 shrink-0 text-hermes" />
                      <span>
                        <span className="font-medium">Best for:</span> <span className="text-muted-foreground">{s.bestFor}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
