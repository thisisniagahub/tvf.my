'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader, StatCard } from './_shared'
import { useLiveNotifications } from '@/hooks/use-live-notifications'
import { cn } from '@/lib/utils'
import { formatRM, formatNumber } from '@/lib/demo-data'
import type { DashboardStats, DashboardActivity } from '@/lib/types'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { toast } from 'sonner'

const quickActions = [
  { label: 'Create Link', icon: Icons.Link, page: 'links' as const, color: 'shopee' },
  { label: 'New Campaign', icon: Icons.Megaphone, page: 'campaigns' as const, color: 'hermes' },
  { label: 'View Analytics', icon: Icons.BarChart3, page: 'analytics' as const, color: 'success' },
  { label: 'Quick Boost', icon: Icons.Zap, page: 'trend-spy' as const, color: 'warning' },
]

const aiInsight = {
  title: 'Fashion is on fire right now',
  desc: 'Tudung Bawal Premium saw a 35% conversion rate today — 4x your average. Consider boosting this product in your next campaign.',
  action: 'Create a Fashion campaign now',
}

const categoryDistribution = [
  { name: 'Electronics', value: 32, color: 'var(--shopee)' },
  { name: 'Beauty', value: 28, color: 'var(--hermes)' },
  { name: 'Fashion', value: 24, color: 'var(--success)' },
  { name: 'Home', value: 16, color: 'var(--warning)' },
]

export function DashboardPage() {
  const { user, setActivePage } = useAppStore()
  const [hour] = useState(new Date().getHours())
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const { events: liveEvents, connected } = useLiveNotifications(true)

  const { data, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed')
      return res.json() as Promise<DashboardStats>
    },
  })

  const earningsData = data?.earnings ?? []
  const topProducts = data?.topProducts ?? []
  const cardStats = data?.stats ?? { totalEarnings: 5487.32, totalClicks: 2847, conversionRate: 26.4, activeLinks: 42 }

  // Merge live events with demo activities — live events appear at the top
  const activities = useMemo<DashboardActivity[]>(() => {
    const liveMapped: DashboardActivity[] = liveEvents.slice(0, 6).map((e) => ({
      id: e.id,
      type: e.type === 'xtra' ? 'commission' : (e.type === 'trend' ? 'alert' : e.type),
      message: e.title.replace(/[🎉🔥⭐]/g, '').trim() + ' — ' + e.message,
      amount: e.amount,
      timestamp: 'just now',
      live: true,
    }))
    const demo: DashboardActivity[] = (data?.activities ?? []).map((a) => ({ ...a, live: false }))
    return [...liveMapped, ...demo]
  }, [liveEvents, data?.activities])

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Icons.AlertCircle className="mx-auto size-12 text-destructive/40" />
          <p className="mt-3 text-sm font-medium">Failed to load dashboard data</p>
          <p className="text-xs text-muted-foreground">Please refresh the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${user?.name ?? 'TheViralFindsMY'}! 👋`}
        subtitle="Here's what's happening with your affiliate business today"
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Exporting report...')}>
          <Icons.Download className="mr-1 size-4" /> Export
        </Button>
        <Button size="sm" onClick={() => setActivePage('links')} className="bg-shopee-gradient hover:opacity-90">
          <Icons.Plus className="mr-1 size-4" /> Create Link
        </Button>
      </PageHeader>

      {/* AI Insight Banner — shimmer sweep + soft pulse glow */}
      <Card className="animate-soft-glow relative overflow-hidden border-hermes/30 bg-gradient-to-r from-hermes/[0.06] to-shopee/[0.04]">
        {/* Shimmer sweep layer — purely decorative, sits behind content */}
        <div className="shimmer-banner pointer-events-none absolute inset-0" aria-hidden="true" />
        <CardContent className="relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-hermes-gradient text-white shadow-[0_0_18px_rgba(139,92,246,0.4)]">
              <Icons.Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{aiInsight.title}</p>
              <p className="text-xs text-muted-foreground">{aiInsight.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.info('Insight dismissed')}>
              Dismiss
            </Button>
            <Button size="sm" onClick={() => setActivePage('campaigns')} className="bg-hermes-gradient hover:opacity-90 hover:shadow-[0_0_24px_rgba(139,92,246,0.45)] transition-shadow">
              {aiInsight.action}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Total Earnings" value={formatRM(cardStats.totalEarnings)} delta="+12.5% vs last week" deltaType="up" icon={Icons.Wallet} accent="shopee" subtitle="This month" />
        <StatCard index={1} label="Total Clicks" value={formatNumber(cardStats.totalClicks)} delta="+8.2% vs last week" deltaType="up" icon={Icons.MousePointerClick} accent="hermes" subtitle="Last 30 days" />
        <StatCard index={2} label="Conversion Rate" value={`${cardStats.conversionRate}%`} delta="+3.1% vs last week" deltaType="up" icon={Icons.Target} accent="success" subtitle="Above 8.5% avg" />
        <StatCard index={3} label="Active Links" value={cardStats.activeLinks} delta="+5 new" deltaType="up" icon={Icons.Link} accent="warning" subtitle="6 paused" />
      </div>

      {/* Quick actions — gradient icon bg + ripple ring on hover */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            onClick={() => setActivePage(action.page)}
            className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-shopee/40 hover:shadow-md"
          >
            {/* Ripple layer — expands on hover for a tactile press feel */}
            <span
              className={`pointer-events-none absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full opacity-0 transition-transform duration-500 group-hover:scale-[3] group-hover:opacity-100 ${
                action.color === 'shopee' ? 'bg-shopee/10' :
                action.color === 'hermes' ? 'bg-hermes/10' :
                action.color === 'success' ? 'bg-success/10' :
                'bg-warning/10'
              }`}
              aria-hidden="true"
            />
            <div className={`relative flex size-10 items-center justify-center rounded-lg text-white transition-transform group-hover:scale-110 group-hover:rotate-3 ${
              action.color === 'shopee' ? 'bg-shopee-gradient shadow-[0_0_18px_rgba(238,77,45,0.4)]' :
              action.color === 'hermes' ? 'bg-hermes-gradient shadow-[0_0_18px_rgba(139,92,246,0.4)]' :
              action.color === 'success' ? 'bg-gradient-to-br from-success to-success/60 shadow-[0_0_18px_rgba(34,197,94,0.4)]' :
              'bg-gradient-to-br from-warning to-warning/60 shadow-[0_0_18px_rgba(250,204,21,0.4)]'
            }`}>
              <action.icon className="size-5" />
            </div>
            <span className="relative text-sm font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Earnings chart */}
        <Card className="lg:col-span-2 border-border/60">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h3 className="text-sm font-semibold">Earnings Overview</h3>
              <p className="text-xs text-muted-foreground">Last 30 days performance</p>
            </div>
            <Badge variant="outline" className="bg-success/5 text-success">
              <Icons.TrendingUp className="mr-1 size-3" /> +24% growth
            </Badge>
          </div>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--shopee)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--shopee)" stopOpacity={0} />
                  </linearGradient>
                  {/* Secondary soft fill — adds depth without overpowering */}
                  <linearGradient id="earningsGradSoft" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--hermes)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--hermes)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v) => `RM${v}`} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px -8px rgba(238,77,45,0.25)',
                  }}
                  cursor={{ stroke: 'var(--shopee)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  formatter={(v: number) => [formatRM(v), 'Earnings']}
                />
                {/* Soft hermes-hued underlayer for depth */}
                <Area type="monotone" dataKey="earnings" stroke="none" fill="url(#earningsGradSoft)" />
                <Area type="monotone" dataKey="earnings" stroke="var(--shopee)" strokeWidth={2} fill="url(#earningsGrad)" activeDot={{ r: 5, fill: 'var(--shopee)', stroke: 'var(--background)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category distribution */}
        <Card className="border-border/60">
          <div className="border-b p-4">
            <h3 className="text-sm font-semibold">Earnings by Category</h3>
            <p className="text-xs text-muted-foreground">Distribution this month</p>
          </div>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {categoryDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {categoryDistribution.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="font-semibold">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top products */}
        <Card className="lg:col-span-2 border-border/60">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Icons.Sparkles className="size-4 text-hermes" />
              <div>
                <h3 className="text-sm font-semibold">Top Performing Products</h3>
                <p className="text-xs text-muted-foreground">HERMES AI picks for you</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActivePage('products')}>
              View all <Icons.ArrowRight className="ml-1 size-3" />
            </Button>
          </div>
          <CardContent className="p-0">
            <div className="divide-y">
              {topProducts.slice(0, 5).map((p, i: number) => (
                <div
                  key={p.id}
                  className="group flex items-center gap-3 p-3 transition-all hover:bg-accent/40 hover:translate-x-1"
                >
                  {/* Rank badge placeholder — when real product images are wired
                      up, this could become a small product thumbnail:
                      <SmartImage
                        src={p.image}
                        alt={p.name}
                        width={32}
                        height={32}
                        className="size-8 shrink-0 rounded-lg object-cover"
                      />
                      See `images.remotePatterns` in next.config.ts for the
                      allowed Shopee CDN hosts.
                      Medal colors: gold/silver/bronze for the top 3 ranks. */}
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-transform group-hover:scale-110 ${
                    i === 0 ? 'bg-gradient-to-br from-warning to-warning/60 text-white shadow-[0_0_12px_rgba(250,204,21,0.5)]' :
                    i === 1 ? 'bg-gradient-to-br from-muted-foreground/50 to-muted-foreground/30 text-white' :
                    i === 2 ? 'bg-gradient-to-br from-shopee/70 to-shopee/40 text-white shadow-[0_0_10px_rgba(238,77,45,0.35)]' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatRM(p.price)}</span>
                      <span>•</span>
                      <span>{p.conversion}% CVR</span>
                      {p.xtra && <Badge className="h-4 px-1 text-[9px] bg-shopee/15 text-shopee">XTRA</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-shopee">{formatRM(p.commission * p.orders)}</p>
                    <p className="text-[10px] text-muted-foreground">{p.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live activity */}
        <Card className="border-border/60">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex size-2">
                <span className="pulse-ring absolute inline-flex size-2 rounded-full text-success/60" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </div>
              <h3 className="text-sm font-semibold">Live Activity</h3>
              {connected && (
                <Badge variant="outline" className="ml-1 gap-0.5 border-success/30 bg-success/5 text-[9px] text-success">
                  <span className="relative flex size-1">
                    <span className="pulse-ring absolute inline-flex size-1 rounded-full text-success/60" />
                    <span className="relative inline-flex size-1 rounded-full bg-success" />
                  </span>
                  LIVE
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActivePage('notifications')}>
              See All
            </Button>
          </div>
          <CardContent className="p-0">
            <ScrollArea className="h-[280px] scrollbar-glow">
              <div className="divide-y">
                <AnimatePresence initial={false}>
                  {activities.map((a) => (
                    <motion.div
                      key={a.id}
                      layout
                      initial={a.live ? { opacity: 0, height: 0, backgroundColor: 'rgba(238, 77, 45, 0.08)' } : false}
                      animate={{ opacity: 1, height: 'auto', backgroundColor: 'rgba(0,0,0,0)' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        'relative flex items-start gap-3 overflow-hidden p-3',
                        // Gradient left border on live items — uses ::before via a wrapper span
                        a.live && 'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-gradient-to-b before:from-shopee before:to-hermes',
                      )}
                    >
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        a.type === 'sale' ? 'bg-success/15 text-success' :
                        a.type === 'click' ? 'bg-shopee/15 text-shopee' :
                        a.type === 'commission' ? 'bg-hermes/15 text-hermes' :
                        'bg-warning/15 text-warning'
                      }`}>
                        {a.type === 'sale' && <Icons.DollarSign className="size-4" />}
                        {a.type === 'click' && <Icons.MousePointerClick className="size-4" />}
                        {a.type === 'commission' && <Icons.Coins className="size-4" />}
                        {a.type === 'alert' && <Icons.BellRing className="size-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium">{a.message}</p>
                        <div className="flex items-center gap-2">
                          {a.amount && <span className="text-xs font-semibold text-success">+{formatRM(a.amount)}</span>}
                          <span className={cn('text-[10px]', a.live ? 'font-semibold text-shopee' : 'text-muted-foreground')}>
                            {a.timestamp}{a.live ? ' • live' : ''}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Clicks & Orders bar chart */}
      <Card className="border-border/60">
        <div className="border-b p-4">
          <h3 className="text-sm font-semibold">Clicks vs Orders</h3>
          <p className="text-xs text-muted-foreground">Daily breakdown — last 14 days</p>
        </div>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={earningsData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="clicks" fill="var(--shopee)" radius={[4, 4, 0, 0]} name="Clicks" />
              <Bar dataKey="orders" fill="var(--hermes)" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
