'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader, StatCard, SectionCard } from './_shared'
import { formatRM } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const recommendations = [
  {
    id: 'rec1',
    product: 'Safi Balqis UV Sunblock SPF50',
    category: 'Beauty',
    currentCommission: 12,
    action: 'Switch to XTRA offer',
    actionDesc: 'XTRA campaign live — boost commission by 28%',
    potentialLift: 28,
    monthlyGain: 245.50,
    icon: Icons.Zap,
  },
  {
    id: 'rec2',
    product: 'RGB Mechanical Keyboard',
    category: 'Electronics',
    currentCommission: 8.5,
    action: 'Bundle with trending product',
    actionDesc: 'Bundle with Wireless Mouse (trending +34%)',
    potentialLift: 19,
    monthlyGain: 187.20,
    icon: Icons.Package,
  },
  {
    id: 'rec3',
    product: 'Tudung Bawal Premium',
    category: 'Fashion',
    currentCommission: 11,
    action: 'Post at 7PM golden hour',
    actionDesc: 'Audience peak engagement 7-9PM MYT',
    potentialLift: 41,
    monthlyGain: 312.80,
    icon: Icons.Clock,
  },
  {
    id: 'rec4',
    product: 'Wardah Matte Lipstick',
    category: 'Beauty',
    currentCommission: 14,
    action: 'Create tutorial carousel',
    actionDesc: 'Tutorials convert 2.3x better than single posts',
    potentialLift: 22,
    monthlyGain: 168.90,
    icon: Icons.Images,
  },
  {
    id: 'rec5',
    product: 'Portable Blender USB',
    category: 'Home',
    currentCommission: 10,
    action: 'Switch to XTRA offer',
    actionDesc: 'Limited XTRA offer — only 6 days left',
    potentialLift: 30,
    monthlyGain: 145.30,
    icon: Icons.Zap,
  },
  {
    id: 'rec6',
    product: 'Xiaomi Robot Vacuum',
    category: 'Electronics',
    currentCommission: 5,
    action: 'Bundle with trending product',
    actionDesc: 'Bundle with Air Purifier (trending +27%)',
    potentialLift: 15,
    monthlyGain: 178.40,
    icon: Icons.Package,
  },
]

const commissionData = [
  { product: 'Safi Balqis', current: 12, optimized: 16.8 },
  { product: 'RGB Keyboard', current: 8.5, optimized: 11.2 },
  { product: 'Tudung Bawal', current: 11, optimized: 14.8 },
  { product: 'Wardah Lipstick', current: 14, optimized: 17.5 },
  { product: 'Blender', current: 10, optimized: 13.5 },
  { product: 'Robot Vac', current: 5, optimized: 6.8 },
]

const postingTimes = [
  { slot: '7-9PM', label: 'Golden Hour', desc: 'Peak engagement — best for fashion, beauty, lifestyle', intensity: 95, icon: Icons.Sunset },
  { slot: '12-2PM', label: 'Lunch Break', desc: 'Quick scrollers — best for food, gadgets, deals', intensity: 72, icon: Icons.Sandwich },
  { slot: '9PM-12AM', label: 'Impulse Buy', desc: 'Late night shoppers — best for entertainment, gaming', intensity: 88, icon: Icons.Moon },
  { slot: '6-8AM', label: 'Morning Scroll', desc: 'Early birds — best for health, supplements, news', intensity: 54, icon: Icons.Sunrise },
  { slot: '3-5PM', label: 'Tea Time', desc: 'Casual browsers — best for home, decor, baby', intensity: 48, icon: Icons.Coffee },
]

export function ProfitOptimizerPage() {
  const [applied, setApplied] = useState<Set<string>>(new Set())

  const applyRec = (id: string) => {
    setApplied((prev) => new Set(prev).add(id))
    toast.success('Optimization applied! HERMES is recalculating projections 📈')
  }

  const totalGain = recommendations
    .filter((r) => applied.has(r.id))
    .reduce((sum, r) => sum + r.monthlyGain, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profit Optimizer"
        subtitle="HERMES analyzes your links & suggests the highest-impact moves to grow commissions."
        icon={Icons.TrendingUp}
        accent="hermes"
      >
        <Badge className="bg-hermes-gradient text-white">
          <Icons.Sparkles className="mr-1 size-3" /> AI Powered
        </Badge>
        <Button variant="outline" size="sm" onClick={() => toast.info('Generating full report…')}>
          <Icons.Download className="mr-1 size-4" /> Export
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Potential Additional Income"
          value={formatRM(1240)}
          delta="+18% vs last month"
          deltaType="up"
          icon={Icons.Wallet}
          accent="success"
          subtitle="Per month if applied"
        />
        <StatCard
          label="Optimized Products"
          value={applied.size > 0 ? `${applied.size}/8` : '8'}
          icon={Icons.PackageCheck}
          accent="hermes"
          subtitle="Ready for boost"
        />
        <StatCard
          label="Avg Commission Lift"
          value="+34%"
          delta="Above market avg"
          deltaType="up"
          icon={Icons.TrendingUp}
          accent="hermes"
          subtitle="After optimization"
        />
        <StatCard
          label="ROI Score"
          value="87/100"
          delta="Excellent"
          deltaType="up"
          icon={Icons.Gauge}
          accent="success"
          subtitle="HERMES computed"
        />
      </div>

      {/* Applied banner */}
      {applied.size > 0 && (
        <Card className="border-success/40 bg-gradient-to-r from-success/[0.06] to-transparent">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-success/15 text-success">
                <Icons.Check className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{applied.size} optimizations applied</p>
                <p className="text-xs text-muted-foreground">
                  Estimated additional monthly income: <span className="font-bold text-success">{formatRM(totalGain)}</span>
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setApplied(new Set())}>
              Reset
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recommendations list */}
        <SectionCard
          title="AI Recommendations"
          description="Sorted by potential impact"
          icon={Icons.Sparkles}
          action={<Badge variant="outline" className="text-hermes">{recommendations.length} active</Badge>}
        >
          <ScrollArea className="max-h-[680px]">
            <div className="space-y-3">
              {recommendations.map((rec, i) => {
                const Icon = rec.icon
                const isApplied = applied.has(rec.id)
                return (
                  <div
                    key={rec.id}
                    className={cn(
                      'rounded-xl border-2 p-4 transition-all',
                      isApplied ? 'border-success/40 bg-success/[0.04]' : 'border-border/60 hover:border-hermes/40'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-hermes/10 text-hermes">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{rec.product}</p>
                          <Badge variant="outline" className="text-[10px]">{rec.category}</Badge>
                          <Badge className="bg-shopee/10 text-shopee text-[10px]">#{i + 1} priority</Badge>
                        </div>
                        <p className="mt-1 text-xs font-medium text-hermes">{rec.action}</p>
                        <p className="text-xs text-muted-foreground">{rec.actionDesc}</p>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                          <div className="rounded-lg bg-muted/50 p-2">
                            <p className="text-[10px] uppercase text-muted-foreground">Current</p>
                            <p className="font-semibold">{rec.currentCommission}%</p>
                          </div>
                          <div className="rounded-lg bg-success/10 p-2">
                            <p className="text-[10px] uppercase text-success">Lift</p>
                            <p className="font-semibold text-success">+{rec.potentialLift}%</p>
                          </div>
                          <div className="rounded-lg bg-hermes/10 p-2">
                            <p className="text-[10px] uppercase text-hermes">Monthly gain</p>
                            <p className="font-semibold text-hermes">{formatRM(rec.monthlyGain)}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Progress value={rec.potentialLift * 2} className="h-1.5 w-20" />
                            <span className="text-[10px] text-muted-foreground">Impact</span>
                          </div>
                          {isApplied ? (
                            <Badge className="bg-success/15 text-success">
                              <Icons.Check className="mr-1 size-3" /> Applied
                            </Badge>
                          ) : (
                            <Button size="sm" onClick={() => applyRec(rec.id)} className="bg-hermes-gradient hover:opacity-90">
                              <Icons.Zap className="mr-1 size-3" /> Apply
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </SectionCard>

        {/* Right column */}
        <div className="space-y-6">
          {/* Commission comparison chart */}
          <SectionCard
            title="Commission Comparison"
            description="Current vs optimized rates"
            icon={Icons.BarChart3}
          >
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commissionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="product" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="current" name="Current" fill="var(--shopee)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="optimized" name="Optimized" fill="var(--hermes)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {/* Best posting times */}
          <SectionCard
            title="Best Posting Times"
            description="Malaysian audience activity (MYT)"
            icon={Icons.Clock}
          >
            <div className="space-y-3">
              {postingTimes.map((t) => {
                const Icon = t.icon
                const intensityColor =
                  t.intensity > 80 ? 'bg-success/15 text-success' :
                  t.intensity > 60 ? 'bg-hermes/15 text-hermes' :
                  t.intensity > 45 ? 'bg-warning/15 text-warning' :
                  'bg-muted text-muted-foreground'
                return (
                  <div key={t.slot} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                    <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', intensityColor)}>
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{t.slot} · {t.label}</p>
                        <Badge variant="outline" className={cn('text-[10px]', intensityColor)}>{t.intensity}%</Badge>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{t.desc}</p>
                      <Progress value={t.intensity} className="mt-1.5 h-1" />
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
