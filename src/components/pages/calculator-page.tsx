'use client'

import { useMemo, useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader, StatCard } from './_shared'
import { formatRM, formatNumber } from '@/lib/demo-data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const tiers = [
  {
    name: 'Base Commission',
    range: '2.5% – 12%',
    desc: 'Standard Shopee Affiliate commission rate. Applies to all approved products by default.',
    icon: Icons.Package,
    accent: 'shopee' as const,
    color: 'bg-shopee/10 text-shopee',
  },
  {
    name: 'XTRA Commission',
    range: 'up to +40-50%',
    desc: 'Bonus commission on selected products (marked XTRA). Boosts your effective rate significantly.',
    icon: Icons.Star,
    accent: 'hermes' as const,
    color: 'bg-hermes/10 text-hermes',
  },
  {
    name: 'Shopee Live Commission',
    range: 'up to 80%',
    desc: 'Live-streaming sessions earn the highest commission. Perfect for beauty & fashion niches.',
    icon: Icons.Radio,
    accent: 'success' as const,
    color: 'bg-success/10 text-success',
  },
]

const comparisonMetrics = [
  { metric: 'Base commission rate', base: '10.0%', xtra: '10.0%' },
  { metric: 'XTRA bonus', base: '—', xtra: '+40%' },
  { metric: 'Effective rate', base: '10.0%', xtra: '14.0%' },
  { metric: 'Per-sale commission (RM 50)', base: formatRM(5), xtra: formatRM(7) },
  { metric: 'Monthly orders (100)', base: formatRM(500), xtra: formatRM(700) },
  { metric: 'Yearly projection (1200)', base: formatRM(6000), xtra: formatRM(8400) },
  { metric: 'Difference', base: '—', xtra: `+${formatRM(2400)}` },
]

export function CalculatorPage() {
  // Inputs
  const [price, setPrice] = useState(49.9)
  const [commissionRate, setCommissionRate] = useState(10)
  const [monthlyClicks, setMonthlyClicks] = useState(500)
  const [conversionRate, setConversionRate] = useState(25)
  const [xtraBonus, setXtraBonus] = useState(40)

  // Derived calculations
  const calc = useMemo(() => {
    const basePerSale = price * (commissionRate / 100)
    const xtraPerSale = basePerSale * (1 + xtraBonus / 100)
    const monthlyOrders = Math.round((monthlyClicks * conversionRate) / 100)
    const monthlyBase = basePerSale * monthlyOrders
    const monthlyXTRA = xtraPerSale * monthlyOrders
    const yearlyBase = monthlyBase * 12
    const yearlyXTRA = monthlyXTRA * 12
    const extraYearly = yearlyXTRA - yearlyBase
    const upliftPct = yearlyBase > 0 ? (extraYearly / yearlyBase) * 100 : 0
    return {
      basePerSale,
      xtraPerSale,
      monthlyOrders,
      monthlyBase,
      monthlyXTRA,
      yearlyBase,
      yearlyXTRA,
      extraYearly,
      upliftPct,
    }
  }, [price, commissionRate, monthlyClicks, conversionRate, xtraBonus])

  function handleReset() {
    setPrice(49.9)
    setCommissionRate(10)
    setMonthlyClicks(500)
    setConversionRate(25)
    setXtraBonus(40)
    toast.success('Calculator reset to defaults lah')
  }

  function handleSaveScenario() {
    toast.success('Scenario saved!', {
      description: `Base: ${formatRM(calc.monthlyBase)}/mo · XTRA: ${formatRM(calc.monthlyXTRA)}/mo`,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commission Calculator"
        subtitle="Estimate your Shopee affiliate earnings — adjust inputs to see live projections lor"
        icon={Icons.Calculator}
        accent="success"
      >
        <Button variant="outline" size="sm" onClick={handleReset}>
          <Icons.RotateCcw className="mr-1 size-4" /> Reset
        </Button>
        <Button size="sm" onClick={handleSaveScenario} className="bg-shopee-gradient hover:opacity-90">
          <Icons.Bookmark className="mr-1 size-4" /> Save Scenario
        </Button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Per-Sale Commission"
          value={formatRM(calc.basePerSale)}
          icon={Icons.Coins}
          accent="shopee"
          subtitle={`At ${commissionRate}% rate`}
          delta={`+${xtraBonus}% XTRA = ${formatRM(calc.xtraPerSale)}`}
          deltaType="up"
        />
        <StatCard
          label="Monthly Orders"
          value={formatNumber(calc.monthlyOrders)}
          icon={Icons.ShoppingCart}
          accent="hermes"
          subtitle={`From ${formatNumber(monthlyClicks)} clicks`}
          delta={`${conversionRate}% CVR`}
          deltaType="up"
        />
        <StatCard
          label="Monthly Earnings"
          value={formatRM(calc.monthlyBase)}
          icon={Icons.Wallet}
          accent="success"
          subtitle="Base commission"
          delta={`+${formatRM(calc.monthlyXTRA - calc.monthlyBase)} with XTRA`}
          deltaType="up"
        />
        <StatCard
          label="Yearly Projection"
          value={formatRM(calc.yearlyBase)}
          icon={Icons.TrendingUp}
          accent="warning"
          subtitle="Base scenario"
          delta={`+${calc.upliftPct.toFixed(0)}% with XTRA`}
          deltaType="up"
        />
      </div>

      {/* Calculator inputs + live results */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Inputs */}
        <Card className="border-border/60 lg:col-span-3">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Icons.Sliders className="size-4 text-shopee" />
              <div>
                <h3 className="text-sm font-semibold">Inputs</h3>
                <p className="text-xs text-muted-foreground">Tweak any field — results update live</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-success/5 text-success">
              <Icons.Circle className="mr-1 size-2 fill-success" /> Live
            </Badge>
          </div>
          <CardContent className="space-y-5 p-5">
            {/* Product price */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="price" className="text-sm font-medium">
                  Product Price (RM)
                </Label>
                <Badge variant="secondary" className="font-mono">
                  {formatRM(price)}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={0.1}
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="flex-1"
                />
                <Slider
                  value={[price]}
                  min={0}
                  max={500}
                  step={0.1}
                  onValueChange={(v) => setPrice(v[0])}
                  className="flex-[2]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Avg Shopee MY product price is RM 30–80
              </p>
            </div>

            {/* Commission rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rate" className="text-sm font-medium">
                  Commission Rate (%)
                </Label>
                <Badge variant="secondary" className="font-mono">
                  {commissionRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  id="rate"
                  type="number"
                  min={0}
                  max={80}
                  step={0.5}
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Math.max(0, Math.min(80, parseFloat(e.target.value) || 0)))}
                  className="flex-1"
                />
                <Slider
                  value={[commissionRate]}
                  min={0}
                  max={40}
                  step={0.5}
                  onValueChange={(v) => setCommissionRate(v[0])}
                  className="flex-[2]"
                />
              </div>
            </div>

            {/* Monthly clicks */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="clicks" className="text-sm font-medium">
                  Estimated Monthly Clicks
                </Label>
                <Badge variant="secondary" className="font-mono">
                  {formatNumber(monthlyClicks)}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  id="clicks"
                  type="number"
                  min={0}
                  step={10}
                  value={monthlyClicks}
                  onChange={(e) => setMonthlyClicks(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1"
                />
                <Slider
                  value={[monthlyClicks]}
                  min={0}
                  max={5000}
                  step={10}
                  onValueChange={(v) => setMonthlyClicks(v[0])}
                  className="flex-[2]"
                />
              </div>
            </div>

            {/* Conversion rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cvr" className="text-sm font-medium">
                  Conversion Rate (%)
                </Label>
                <Badge variant="secondary" className="font-mono">
                  {conversionRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  id="cvr"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="flex-1"
                />
                <Slider
                  value={[conversionRate]}
                  min={0}
                  max={60}
                  step={0.5}
                  onValueChange={(v) => setConversionRate(v[0])}
                  className="flex-[2]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Shopee MY average CVR is ~8.5%. Your links typically hit 25%+
              </p>
            </div>

            {/* XTRA bonus */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="xtra" className="text-sm font-medium">
                  XTRA Bonus (%)
                </Label>
                <Badge variant="secondary" className="font-mono bg-hermes/10 text-hermes">
                  +{xtraBonus}%
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  id="xtra"
                  type="number"
                  min={0}
                  max={80}
                  step={5}
                  value={xtraBonus}
                  onChange={(e) => setXtraBonus(Math.max(0, Math.min(80, parseFloat(e.target.value) || 0)))}
                  className="flex-1"
                />
                <Slider
                  value={[xtraBonus]}
                  min={0}
                  max={80}
                  step={5}
                  onValueChange={(v) => setXtraBonus(v[0])}
                  className="flex-[2]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live results */}
        <Card className="border-shopee/30 bg-gradient-to-br from-shopee/[0.04] to-transparent lg:col-span-2">
          <div className="border-b p-4">
            <div className="flex items-center gap-2">
              <Icons.Sparkles className="size-4 text-shopee" />
              <div>
                <h3 className="text-sm font-semibold">Live Projection</h3>
                <p className="text-xs text-muted-foreground">Updates as you type</p>
              </div>
            </div>
          </div>
          <CardContent className="space-y-4 p-5">
            {/* Per-sale */}
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <p className="text-xs text-muted-foreground">Per-Sale Commission</p>
              <p className="mt-0.5 text-2xl font-bold text-shopee">
                {formatRM(calc.basePerSale)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <Icons.Star className="size-3 text-hermes" />
                <span className="text-muted-foreground">With XTRA:</span>
                <span className="font-semibold text-hermes">{formatRM(calc.xtraPerSale)}</span>
              </div>
            </div>

            {/* Monthly orders */}
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <p className="text-xs text-muted-foreground">Monthly Orders</p>
              <p className="mt-0.5 text-2xl font-bold">{formatNumber(calc.monthlyOrders)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatNumber(monthlyClicks)} clicks × {conversionRate}% CVR
              </p>
            </div>

            {/* Monthly earnings */}
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <p className="text-xs text-muted-foreground">Monthly Earnings</p>
              <p className="mt-0.5 text-2xl font-bold text-success">{formatRM(calc.monthlyBase)}</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <Icons.TrendingUp className="size-3 text-hermes" />
                <span className="text-muted-foreground">With XTRA:</span>
                <span className="font-semibold text-hermes">{formatRM(calc.monthlyXTRA)}</span>
                <span className="text-success">(+{formatRM(calc.monthlyXTRA - calc.monthlyBase)})</span>
              </div>
            </div>

            {/* Yearly projection */}
            <div className="rounded-lg border-2 border-shopee/30 bg-shopee/[0.06] p-3">
              <div className="flex items-center gap-1.5">
                <Icons.Calendar className="size-3.5 text-shopee" />
                <p className="text-xs font-semibold text-shopee">Yearly Projection</p>
              </div>
              <p className="mt-1 text-3xl font-bold text-shopee">{formatRM(calc.yearlyBase)}</p>
              <div className="mt-2 flex items-center justify-between rounded-md bg-card/60 p-2 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Icons.Star className="size-3 text-hermes" /> With XTRA:
                </span>
                <span className="font-bold text-hermes">{formatRM(calc.yearlyXTRA)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-md bg-success/10 p-2 text-xs">
                <span className="flex items-center gap-1 font-medium text-success">
                  <Icons.ArrowUpRight className="size-3" /> Extra yearly:
                </span>
                <span className="font-bold text-success">
                  +{formatRM(calc.extraYearly)} ({calc.upliftPct.toFixed(0)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shopee commission tiers info */}
      <Card className="border-border/60">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.Layers className="size-4 text-hermes" />
            <div>
              <h3 className="text-sm font-semibold">Shopee Commission Tiers</h3>
              <p className="text-xs text-muted-foreground">
                Understand how Malaysian Shopee affiliate commissions stack up
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            {tiers.map((tier) => {
              const Icon = tier.icon
              return (
                <div
                  key={tier.name}
                  className="group rounded-xl border border-border/60 p-4 transition-all hover:border-shopee/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className={cn('flex size-10 items-center justify-center rounded-lg', tier.color)}>
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {tier.range}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{tier.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{tier.desc}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison table */}
      <Card className="border-border/60">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.GitCompare className="size-4 text-success" />
            <div>
              <h3 className="text-sm font-semibold">With vs Without XTRA</h3>
              <p className="text-xs text-muted-foreground">
                Side-by-side earnings comparison at current inputs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-muted-foreground/40" /> Base
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-hermes" /> With XTRA
            </span>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-4">Metric</TableHead>
                <TableHead className="text-right">Without XTRA</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="inline-flex items-center gap-1 text-hermes">
                    <Icons.Star className="size-3" /> With XTRA
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonMetrics.map((row, i) => {
                const isLast = i === comparisonMetrics.length - 1
                return (
                  <TableRow key={row.metric} className={cn(isLast && 'bg-success/5')}>
                    <TableCell className="pl-4 text-sm font-medium">{row.metric}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {row.base}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'pr-4 text-right text-sm font-semibold',
                        isLast ? 'text-success' : 'text-hermes'
                      )}
                    >
                      {row.xtra}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CTA banner */}
      <Card className="border-hermes/30 bg-gradient-to-r from-hermes/[0.06] to-shopee/[0.04]">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-hermes-gradient text-white">
              <Icons.Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Want this in real life?</p>
              <p className="text-xs text-muted-foreground">
                Browse products tagged XTRA on the Products page and start boosting your commission today can.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-hermes-gradient hover:opacity-90"
            onClick={() => toast.success('Opening Products page — filtering for XTRA offers')}
          >
            <Icons.Search className="mr-1 size-4" /> Find XTRA Products
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
