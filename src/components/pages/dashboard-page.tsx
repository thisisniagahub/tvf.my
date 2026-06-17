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

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed')
      return res.json() as Promise<DashboardStats>
    },
  })

  const earningsData = stats?.earnings ?? []
  const topProducts = stats?.topProducts ?? []

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
    const demo: DashboardActivity[] = (stats?.activities ?? []).map((a) => ({ ...a, live: false }))
    return [...liveMapped, ...demo]
  }, [liveEvents, stats?.activities])

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

      {/* AI Insight Banner */}
      <Card className="overflow-hidden border-hermes/30 bg-gradient-to-r from-hermes/[0.06] to-shopee/[0.04]">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-hermes-gradient text-white">
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
            <Button size="sm" onClick={() => setActivePage('campaigns')} className="bg-hermes-gradient hover:opacity-90">
              {aiInsight.action}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Total Earnings" value={formatRM(5487.32)} delta="+12.5% vs last week" deltaType="up" icon={Icons.Wallet} accent="shopee" subtitle="This month" />
        <StatCard index={1} label="Total Clicks" value={formatNumber(2847)} delta="+8.2% vs last week" deltaType="up" icon={Icons.MousePointerClick} accent="hermes" subtitle="Last 30 days" />
        <StatCard index={2} label="Conversion Rate" value="26.4%" delta="+3.1% vs last week" deltaType="up" icon={Icons.Target} accent="success" subtitle="Above 8.5% avg" />
        <StatCard index={3} label="Active Links" value="42" delta="+5 new" deltaType="up" icon={Icons.Link} accent="warning" subtitle="6 paused" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => setActivePage(action.page)}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-shopee/40 hover:shadow-md"
          >
            <div className={`flex size-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${
              action.color === 'shopee' ? 'bg-shopee/10 text-shopee' :
              action.color === 'hermes' ? 'bg-hermes/10 text-hermes' :
              action.color === 'success' ? 'bg-success/10 text-success' :
              'bg-warning/10 text-warning'
            }`}>
              <action.icon className="size-5" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </button>
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v) => `RM${v}`} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(v: number) => [formatRM(v), 'Earnings']}
                />
                <Area type="monotone" dataKey="earnings" stroke="var(--shopee)" strokeWidth={2} fill="url(#earningsGrad)" />
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
                <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-accent/40">
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
                      allowed Shopee CDN hosts. */}
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
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
            <ScrollArea className="h-[280px]">
              <div className="divide-y">
                <AnimatePresence initial={false}>
                  {activities.map((a) => (
                    <motion.div
                      key={a.id}
                      layout
                      initial={a.live ? { opacity: 0, height: 0, backgroundColor: 'rgba(238, 77, 45, 0.08)' } : false}
                      animate={{ opacity: 1, height: 'auto', backgroundColor: 'rgba(0,0,0,0)' }}
                      transition={{ duration: 0.5 }}
                      className="flex items-start gap-3 p-3"
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
