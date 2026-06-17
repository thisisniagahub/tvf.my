'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader, StatCard, PlatformBadge, StatCardSkeleton, ListRowSkeleton } from './_shared'
import { Skeleton } from '@/components/ui/skeleton'
import { demoEarnings, demoLinks, formatRM, formatNumber } from '@/lib/demo-data'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Range = '7d' | '30d' | '90d'

const trafficSources = [
  { name: 'Direct', value: 3820, color: 'var(--shopee)' },
  { name: 'Shopee', value: 2480, color: 'var(--hermes)' },
  { name: 'Social', value: 1280, color: 'var(--success)' },
  { name: 'Email', value: 654, color: 'var(--warning)' },
]

const clicksByCategory = [
  { category: 'Beauty', clicks: 1820, orders: 412 },
  { category: 'Fashion', clicks: 1645, orders: 389 },
  { category: 'Electronics', clicks: 1420, orders: 287 },
  { category: 'Home', clicks: 1180, orders: 234 },
  { category: 'Gaming', clicks: 870, orders: 156 },
  { category: 'Food', clicks: 620, orders: 98 },
  { category: 'Baby', clicks: 480, orders: 67 },
  { category: 'Sports', clicks: 199, orders: 47 },
]

const geographicData = [
  { state: 'Kuala Lumpur', clicks: 2340, share: 28 },
  { state: 'Selangor', clicks: 1980, share: 24 },
  { state: 'Johor', clicks: 1245, share: 15 },
  { state: 'Penang', clicks: 890, share: 11 },
  { state: 'Perak', clicks: 567, share: 7 },
  { state: 'Sabah', clicks: 432, share: 5 },
  { state: 'Sarawak', clicks: 389, share: 5 },
  { state: 'Negeri Sembilan', clicks: 245, share: 3 },
  { state: 'Kedah', clicks: 198, share: 2 },
]

const topLinks = [...demoLinks]
  .sort((a, b) => b.earnings - a.earnings)
  .slice(0, 6)

export function AnalyticsPage() {
  const [range, setRange] = useState<Range>('30d')

  // Simulate async data fetch so skeleton loading states can render on initial mount
  const { isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500))
      return true
    },
  })

  // Generate revenue-over-time data based on selected range
  const revenueData = useMemo(() => {
    const slice =
      range === '7d' ? demoEarnings.slice(-7) : range === '30d' ? demoEarnings : demoEarnings
    if (range === '90d') {
      // Stretch 30-day base to ~90 points by triplicating with variance
      const extended: { date: string; revenue: number; orders: number; clicks: number }[] = []
      for (let m = 0; m < 3; m++) {
        demoEarnings.forEach((d, i) => {
          const multiplier = 1 + m * 0.15
          extended.push({
            date: `M${m + 1} D${i + 1}`,
            revenue: Math.round(d.earnings * multiplier),
            orders: Math.round(d.orders * multiplier),
            clicks: Math.round(d.clicks * multiplier),
          })
        })
      }
      return extended
    }
    return slice.map((d) => ({
      date: d.date,
      revenue: Math.round(d.earnings * 1.4),
      orders: d.orders,
      clicks: d.clicks,
    }))
  }, [range])

  const totals = useMemo(() => {
    const revenue = revenueData.reduce((s, d) => s + d.revenue, 0)
    const clicks = revenueData.reduce((s, d) => s + d.clicks, 0)
    const orders = revenueData.reduce((s, d) => s + d.orders, 0)
    const cvr = clicks > 0 ? (orders / clicks) * 100 : 0
    return { revenue, clicks, orders, cvr }
  }, [revenueData])

  const totalTraffic = trafficSources.reduce((s, t) => s + t.value, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Deep dive into your affiliate performance across the Malaysian market"
        icon={Icons.BarChart3}
        accent="hermes"
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Generating PDF report...')}>
          <Icons.FileDown className="mr-1 size-4" /> Report
        </Button>
        <Button
          size="sm"
          onClick={() => toast.success('Schedule set!', { description: 'Daily analytics digest at 9am MYT' })}
          className="bg-hermes-gradient hover:opacity-90"
        >
          <Icons.Bell className="mr-1 size-4" /> Schedule
        </Button>
      </PageHeader>

      {/* Date range tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList>
            <TabsTrigger value="7d" className="text-xs">Last 7 days</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs">Last 30 days</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs">Last 90 days</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icons.Calendar className="size-3.5" />
          <span>
            {range === '7d'
              ? 'Jun 24 – Jun 30'
              : range === '30d'
                ? 'Jun 1 – Jun 30'
                : 'Apr 1 – Jun 30'}{' '}
            2025
          </span>
        </div>
      </div>

      {/* Stat cards */}
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
        <StatCard
          label="Total Revenue"
          value={formatRM(totals.revenue)}
          icon={Icons.DollarSign}
          accent="shopee"
          subtitle="Gross sales attributed"
          delta="+18.4% vs prev"
          deltaType="up"
        />
        <StatCard
          label="Total Clicks"
          value={formatNumber(totals.clicks)}
          icon={Icons.MousePointerClick}
          accent="hermes"
          subtitle="All tracked clicks"
          delta="+12.6% vs prev"
          deltaType="up"
        />
        <StatCard
          label="Total Orders"
          value={formatNumber(totals.orders)}
          icon={Icons.ShoppingCart}
          accent="success"
          subtitle="Confirmed purchases"
          delta="+9.8% vs prev"
          deltaType="up"
        />
        <StatCard
          label="Conversion"
          value={`${totals.cvr.toFixed(1)}%`}
          icon={Icons.Target}
          accent="warning"
          subtitle="Clicks → orders"
          delta="+2.1pp"
          deltaType="up"
        />
        </>
        )}
      </div>

      {/* Revenue over time (LineChart) */}
      <Card className="border-border/60">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.TrendingUp className="size-4 text-shopee" />
            <div>
              <h3 className="text-sm font-semibold">Revenue Over Time</h3>
              <p className="text-xs text-muted-foreground">
                Daily revenue trend — {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-success/5 text-success">
            <Icons.TrendingUp className="mr-1 size-3" /> +18.4%
          </Badge>
        </div>
        <CardContent className="p-4">
          {isLoading ? (
            <Skeleton className="h-[280px] w-full rounded-lg" />
          ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                stroke="var(--muted-foreground)"
                tickLine={false}
                axisLine={false}
                interval={range === '90d' ? 9 : range === '30d' ? 4 : 0}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `RM${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(v: number, name) => [
                  name === 'revenue' ? formatRM(v) : formatNumber(v),
                  name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Clicks',
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--shopee)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: 'var(--shopee)' }}
                name="revenue"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="var(--hermes)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                name="orders"
              />
            </LineChart>
          </ResponsiveContainer>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-shopee" />
              <span className="text-muted-foreground">Revenue (RM)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-hermes" />
              <span className="text-muted-foreground">Orders</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clicks by category (BarChart) + Traffic sources (PieChart) */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Icons.BarChart2 className="size-4 text-hermes" />
              <div>
                <h3 className="text-sm font-semibold">Clicks by Category</h3>
                <p className="text-xs text-muted-foreground">Top performing niches in MY</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toast.info('Opening Products page')}>
              Drill in
            </Button>
          </div>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-[280px] w-full rounded-lg" />
            ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={clicksByCategory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10 }}
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(v: number, name) => [formatNumber(v), name === 'clicks' ? 'Clicks' : 'Orders']}
                />
                <Bar dataKey="clicks" fill="var(--shopee)" radius={[4, 4, 0, 0]} name="clicks" />
                <Bar dataKey="orders" fill="var(--hermes)" radius={[4, 4, 0, 0]} name="orders" />
              </BarChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <div className="border-b p-4">
            <div className="flex items-center gap-2">
              <Icons.PieChart className="size-4 text-success" />
              <div>
                <h3 className="text-sm font-semibold">Traffic Sources</h3>
                <p className="text-xs text-muted-foreground">Where clicks come from</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-[280px] w-full rounded-lg" />
            ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={trafficSources}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {trafficSources.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [formatNumber(v), 'Clicks']}
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            )}
            <div className="mt-3 space-y-1.5">
              {trafficSources.map((src) => {
                const pct = ((src.value / totalTraffic) * 100).toFixed(1)
                return (
                  <div key={src.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: src.color }}
                      />
                      <span className="text-muted-foreground">{src.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{formatNumber(src.value)}</span>
                      <span className="w-10 text-right font-semibold">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top performing links table */}
      <Card className="border-border/60">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.Trophy className="size-4 text-warning" />
            <div>
              <h3 className="text-sm font-semibold">Top Performing Links</h3>
              <p className="text-xs text-muted-foreground">Ranked by total earnings</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => toast.info('Opening Affiliate Links page')}>
            View all <Icons.ArrowRight className="ml-1 size-3" />
          </Button>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <ListRowSkeleton key={i} />
              ))}
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-4">#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">CVR</TableHead>
                <TableHead className="pr-4 text-right">Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topLinks.map((link, i) => {
                const cvrColor =
                  link.conversion >= 30
                    ? 'text-success'
                    : link.conversion >= 20
                      ? 'text-shopee'
                      : 'text-warning'
                return (
                  <TableRow key={link.id}>
                    <TableCell className="pl-4">
                      <div
                        className={cn(
                          'flex size-7 items-center justify-center rounded-md text-xs font-bold',
                          i === 0
                            ? 'bg-warning/15 text-warning'
                            : i === 1
                              ? 'bg-muted text-muted-foreground'
                              : i === 2
                                ? 'bg-shopee/15 text-shopee'
                                : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {i + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[220px] truncate text-sm font-medium">
                        {link.productName}
                      </p>
                    </TableCell>
                    <TableCell>
                      <PlatformBadge platform={link.platform} />
                    </TableCell>
                    <TableCell className="text-right text-sm">{formatNumber(link.clicks)}</TableCell>
                    <TableCell className="text-right text-sm">{link.orders}</TableCell>
                    <TableCell className={cn('text-right text-sm font-semibold', cvrColor)}>
                      {link.conversion.toFixed(1)}%
                    </TableCell>
                    <TableCell className="pr-4 text-right text-sm font-bold text-shopee">
                      {formatRM(link.earnings)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Geographic distribution */}
      <Card className="border-border/60">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.MapPin className="size-4 text-hermes" />
            <div>
              <h3 className="text-sm font-semibold">Geographic Distribution</h3>
              <p className="text-xs text-muted-foreground">Clicks by Malaysian state</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-hermes/5 text-hermes">
            <Icons.MapPin className="mr-1 size-3" /> 9 states tracked
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Map-style visualization */}
            <div className="relative flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-hermes/[0.04] to-shopee/[0.04] p-6">
              <div className="relative size-full">
                {/* Pseudo Malaysia map dots */}
                {geographicData.map((g, i) => {
                  const positions = [
                    { top: '38%', left: '52%' }, // KL
                    { top: '32%', left: '45%' }, // Selangor
                    { top: '70%', left: '52%' }, // Johor
                    { top: '28%', left: '30%' }, // Penang
                    { top: '22%', left: '40%' }, // Perak
                    { top: '40%', left: '78%' }, // Sabah
                    { top: '55%', left: '70%' }, // Sarawak
                    { top: '45%', left: '48%' }, // NS
                    { top: '18%', left: '34%' }, // Kedah
                  ]
                  const pos = positions[i] || positions[0]
                  const dotSize = 10 + (g.share / 28) * 24
                  return (
                    <div
                      key={g.state}
                      className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ top: pos.top, left: pos.left }}
                      title={`${g.state}: ${formatNumber(g.clicks)} clicks`}
                    >
                      <div
                        className="rounded-full bg-shopee/70 ring-2 ring-shopee/20 transition-all group-hover:bg-shopee"
                        style={{ width: dotSize, height: dotSize }}
                      />
                      <div className="absolute left-1/2 top-full z-10 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border bg-card px-2 py-1 text-[10px] shadow-md group-hover:block">
                        <span className="font-semibold">{g.state}</span>{' '}
                        <span className="text-muted-foreground">{formatNumber(g.clicks)}</span>
                      </div>
                    </div>
                  )
                })}
                <div className="absolute bottom-0 left-0 rounded-lg bg-card/80 px-3 py-2 text-[10px] backdrop-blur">
                  <p className="font-semibold text-muted-foreground">Malaysia</p>
                  <p className="text-muted-foreground/70">Total: {formatNumber(geographicData.reduce((s, g) => s + g.clicks, 0))} clicks</p>
                </div>
              </div>
            </div>

            {/* State progress bars */}
            <div className="space-y-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  ))
                : geographicData.map((g) => (
                <div key={g.state} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Icons.MapPin className="size-3 text-muted-foreground" />
                      {g.state}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{formatNumber(g.clicks)}</span>
                      <span className="w-9 text-right font-semibold">{g.share}%</span>
                    </div>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-shopee-gradient transition-all"
                      style={{ width: `${(g.share / 28) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick insight banner */}
      <Card className="border-hermes/30 bg-gradient-to-r from-hermes/[0.06] to-shopee/[0.04]">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-hermes-gradient text-white">
              <Icons.Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">HERMES AI Insight</p>
              <p className="text-xs text-muted-foreground">
                Kuala Lumpur + Selangor drive 52% of your clicks. Try localising content
                with Manglish captions to boost CVR in Johor & Penang lor.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success('Insight saved')}>
            <Icons.Bookmark className="mr-1 size-4" /> Save
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
