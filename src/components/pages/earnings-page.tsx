'use client'

import { useMemo, useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PageHeader, StatCard, PlatformBadge } from './_shared'
import { demoEarnings, formatRM, formatNumber } from '@/lib/demo-data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'platform' | 'category' | 'withdrawal'

const platformBreakdown = [
  { platform: 'Shopee', earnings: 38240.5, clicks: 5240, orders: 1342, cvr: 25.6, color: 'var(--shopee)' },
  { platform: 'TikTok Shop', earnings: 7820.25, clicks: 1840, orders: 312, cvr: 17.0, color: 'var(--hermes)' },
  { platform: 'Lazada', earnings: 2860.0, clicks: 1154, orders: 236, cvr: 20.5, color: 'var(--success)' },
]

const categoryBreakdown = [
  { name: 'Beauty', value: 18420, color: 'var(--shopee)' },
  { name: 'Fashion', value: 14280, color: 'var(--hermes)' },
  { name: 'Electronics', value: 9870, color: 'var(--success)' },
  { name: 'Home', value: 4320, color: 'var(--warning)' },
  { name: 'Gaming', value: 2030, color: 'hsl(280 70% 55%)' },
]

const withdrawalHistory = [
  { id: 'w1', amount: 5000, status: 'completed', method: 'Maybank ●●● 4821', date: '2025-06-01', reference: 'WD-2025-06-001' },
  { id: 'w2', amount: 3500, status: 'completed', method: 'Maybank ●●● 4821', date: '2025-05-01', reference: 'WD-2025-05-008' },
  { id: 'w3', amount: 2800, status: 'completed', method: 'CIMB ●●● 9302', date: '2025-04-01', reference: 'WD-2025-04-003' },
  { id: 'w4', amount: 1234, status: 'pending', method: 'Maybank ●●● 4821', date: '2025-06-28', reference: 'WD-2025-06-014' },
  { id: 'w5', amount: 1500, status: 'processing', method: 'Maybank ●●● 4821', date: '2025-06-26', reference: 'WD-2025-06-013' },
]

const bankAccounts = [
  { id: 'b1', label: 'Maybank ●●● 4821', holder: 'Ahmad bin Ali' },
  { id: 'b2', label: 'CIMB ●●● 9302', holder: 'Ahmad bin Ali' },
]

const availableBalance = 5487.32
const minWithdrawal = 50

export function EarningsPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankAccount, setBankAccount] = useState('b1')

  const totalPlatformEarnings = platformBreakdown.reduce((s, p) => s + p.earnings, 0)
  const totalCategoryEarnings = categoryBreakdown.reduce((s, c) => s + c.value, 0)

  const earningsData = useMemo(
    () =>
      demoEarnings.map((d) => ({
        date: d.date,
        earnings: d.earnings,
        orders: d.orders,
      })),
    []
  )

  function handleWithdraw() {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount lah')
      return
    }
    if (amount < minWithdrawal) {
      toast.error(`Minimum withdrawal is ${formatRM(minWithdrawal)}`)
      return
    }
    if (amount > availableBalance) {
      toast.error('Amount exceeds available balance')
      return
    }
    const bank = bankAccounts.find((b) => b.id === bankAccount)
    toast.success('Withdrawal requested!', {
      description: `${formatRM(amount)} to ${bank?.label}. Funds arrive in 1-3 business days.`,
    })
    setWithdrawAmount('')
  }

  function handleQuickAmount(amount: number) {
    setWithdrawAmount(String(Math.min(amount, availableBalance)))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Earnings"
        subtitle="Track commissions, withdrawals and lifetime earnings across all platforms"
        icon={Icons.Wallet}
        accent="shopee"
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Generating tax statement...')}>
          <Icons.FileText className="mr-1 size-4" /> Tax Statement
        </Button>
        <Button
          size="sm"
          onClick={() => setTab('withdrawal')}
          className="bg-shopee-gradient hover:opacity-90"
        >
          <Icons.ArrowDownToLine className="mr-1 size-4" /> Withdraw
        </Button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="This Month"
          value={formatRM(5487)}
          icon={Icons.CalendarDays}
          accent="shopee"
          subtitle="June 2025"
          delta="+12.3% vs May"
          deltaType="up"
        />
        <StatCard
          label="Last Month"
          value={formatRM(4890)}
          icon={Icons.History}
          accent="hermes"
          subtitle="May 2025"
          delta="+8.4% vs April"
          deltaType="up"
        />
        <StatCard
          label="Pending"
          value={formatRM(1234)}
          icon={Icons.Clock}
          accent="warning"
          subtitle="Awaiting clearance"
          delta="Clears in 7 days"
          deltaType="neutral"
        />
        <StatCard
          label="Lifetime"
          value={formatRM(48920)}
          icon={Icons.Trophy}
          accent="success"
          subtitle="All-time earnings"
          delta="RM 100k by Dec 🎯"
          deltaType="up"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" className="text-xs">
            <Icons.LayoutDashboard className="mr-1 size-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="platform" className="text-xs">
            <Icons.Layers className="mr-1 size-3.5" /> By Platform
          </TabsTrigger>
          <TabsTrigger value="category" className="text-xs">
            <Icons.Tags className="mr-1 size-3.5" /> By Category
          </TabsTrigger>
          <TabsTrigger value="withdrawal" className="text-xs">
            <Icons.Banknote className="mr-1 size-3.5" /> Withdrawal
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Earnings area chart */}
            <Card className="border-border/60 lg:col-span-2">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <Icons.TrendingUp className="size-4 text-shopee" />
                  <div>
                    <h3 className="text-sm font-semibold">Earnings Trend</h3>
                    <p className="text-xs text-muted-foreground">Daily earnings — last 30 days</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success/5 text-success">
                  <Icons.TrendingUp className="mr-1 size-3" /> +24% MoM
                </Badge>
              </div>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={earningsData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--shopee)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--shopee)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      stroke="var(--muted-foreground)"
                      tickLine={false}
                      axisLine={false}
                      interval={4}
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
                      formatter={(v: number) => [formatRM(v), 'Earnings']}
                    />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="var(--shopee)"
                      strokeWidth={2.5}
                      fill="url(#earnGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Withdrawal card */}
            <Card className="border-shopee/30 bg-gradient-to-br from-shopee/[0.06] to-transparent">
              <div className="border-b p-4">
                <div className="flex items-center gap-2">
                  <Icons.Wallet className="size-4 text-shopee" />
                  <h3 className="text-sm font-semibold">Available for Withdrawal</h3>
                </div>
              </div>
              <CardContent className="space-y-4 p-5">
                <div>
                  <p className="text-xs text-muted-foreground">Current balance</p>
                  <p className="mt-1 text-4xl font-bold text-shopee">{formatRM(availableBalance)}</p>
                </div>

                <div className="space-y-2 rounded-lg border border-border/60 bg-card p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Icons.Clock className="size-3" /> Pending clearance
                    </span>
                    <span className="font-semibold">{formatRM(1234)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Icons.CircleDot className="size-3" /> Available now
                    </span>
                    <span className="font-semibold text-success">{formatRM(4253.32)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Icons.Trophy className="size-3" /> Lifetime
                    </span>
                    <span className="font-semibold">{formatRM(48920)}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-shopee-gradient hover:opacity-90"
                  size="lg"
                  onClick={() => setTab('withdrawal')}
                >
                  <Icons.ArrowDownToLine className="mr-1 size-4" /> Withdraw Now
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                  <Icons.Shield className="size-3" />
                  Min withdrawal {formatRM(minWithdrawal)} · 1-3 business days
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mini stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Icons.ArrowUpRight className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Best day</p>
                  <p className="text-sm font-bold">{formatRM(412)}</p>
                  <p className="text-[10px] text-muted-foreground">Jun 28, 2025</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-shopee/10 text-shopee">
                  <Icons.Calendar className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg per day</p>
                  <p className="text-sm font-bold">{formatRM(183)}</p>
                  <p className="text-[10px] text-muted-foreground">Last 30 days</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-hermes/10 text-hermes">
                  <Icons.Star className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg per order</p>
                  <p className="text-sm font-bold">{formatRM(7.42)}</p>
                  <p className="text-[10px] text-muted-foreground">All-time</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* BY PLATFORM TAB */}
        <TabsContent value="platform" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {platformBreakdown.map((p) => {
              const sharePct = ((p.earnings / totalPlatformEarnings) * 100).toFixed(1)
              return (
                <Card key={p.platform} className="border-border/60 transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <PlatformBadge platform={p.platform} />
                      <span
                        className="text-lg font-bold"
                        style={{ color: p.color }}
                      >
                        {sharePct}%
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Total earnings</p>
                    <p className="text-2xl font-bold" style={{ color: p.color }}>
                      {formatRM(p.earnings)}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Clicks</p>
                        <p className="text-sm font-semibold">{formatNumber(p.clicks)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Orders</p>
                        <p className="text-sm font-semibold">{formatNumber(p.orders)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">CVR</p>
                        <p className="text-sm font-semibold text-success">{p.cvr}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="border-border/60">
            <div className="border-b p-4">
              <div className="flex items-center gap-2">
                <Icons.Layers className="size-4 text-hermes" />
                <div>
                  <h3 className="text-sm font-semibold">Platform Breakdown</h3>
                  <p className="text-xs text-muted-foreground">Detailed comparison across platforms</p>
                </div>
              </div>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="pl-4">Platform</TableHead>
                    <TableHead className="text-right">Earnings</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">CVR</TableHead>
                    <TableHead className="pr-4 text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformBreakdown.map((p) => {
                    const sharePct = (p.earnings / totalPlatformEarnings) * 100
                    return (
                      <TableRow key={p.platform}>
                        <TableCell className="pl-4">
                          <div className="flex items-center gap-2">
                            <span className="size-2.5 rounded-full" style={{ background: p.color }} />
                            <span className="text-sm font-medium">{p.platform}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-shopee">
                          {formatRM(p.earnings)}
                        </TableCell>
                        <TableCell className="text-right text-sm">{formatNumber(p.clicks)}</TableCell>
                        <TableCell className="text-right text-sm">{formatNumber(p.orders)}</TableCell>
                        <TableCell className="text-right text-sm font-semibold text-success">
                          {p.cvr}%
                        </TableCell>
                        <TableCell className="pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${sharePct}%`, background: p.color }}
                              />
                            </div>
                            <span className="w-12 text-right text-xs font-semibold">
                              {sharePct.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow className="bg-muted/20">
                    <TableCell className="pl-4 text-sm font-bold">Total</TableCell>
                    <TableCell className="text-right text-sm font-bold text-shopee">
                      {formatRM(totalPlatformEarnings)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-bold">
                      {formatNumber(platformBreakdown.reduce((s, p) => s + p.clicks, 0))}
                    </TableCell>
                    <TableCell className="text-right text-sm font-bold">
                      {formatNumber(platformBreakdown.reduce((s, p) => s + p.orders, 0))}
                    </TableCell>
                    <TableCell className="text-right text-sm font-bold text-success">
                      {(
                        (platformBreakdown.reduce((s, p) => s + p.orders, 0) /
                          platformBreakdown.reduce((s, p) => s + p.clicks, 0)) *
                        100
                      ).toFixed(1)}%
                    </TableCell>
                    <TableCell className="pr-4 text-right text-sm font-bold">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BY CATEGORY TAB */}
        <TabsContent value="category" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/60">
              <div className="border-b p-4">
                <div className="flex items-center gap-2">
                  <Icons.PieChart className="size-4 text-success" />
                  <div>
                    <h3 className="text-sm font-semibold">Earnings by Category</h3>
                    <p className="text-xs text-muted-foreground">Distribution this month</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      label={({ name, value }: { name: string; value: number }) =>
                        `${name} ${((value / totalCategoryEarnings) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                      style={{ fontSize: '11px' }}
                    >
                      {categoryBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [formatRM(v), 'Earnings']}
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <div className="border-b p-4">
                <div className="flex items-center gap-2">
                  <Icons.Tags className="size-4 text-hermes" />
                  <div>
                    <h3 className="text-sm font-semibold">Category Breakdown</h3>
                    <p className="text-xs text-muted-foreground">Ranked by earnings</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Earnings</TableHead>
                      <TableHead className="text-right">Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...categoryBreakdown]
                      .sort((a, b) => b.value - a.value)
                      .map((c) => {
                        const pct = ((c.value / totalCategoryEarnings) * 100).toFixed(1)
                        return (
                          <TableRow key={c.name}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                                <span className="text-sm font-medium">{c.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-sm font-bold text-shopee">
                              {formatRM(c.value)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {pct}%
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* WITHDRAWAL TAB */}
        <TabsContent value="withdrawal" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-5">
            {/* Withdrawal form */}
            <Card className="border-border/60 lg:col-span-2">
              <div className="border-b p-4">
                <div className="flex items-center gap-2">
                  <Icons.ArrowDownToLine className="size-4 text-shopee" />
                  <div>
                    <h3 className="text-sm font-semibold">Request Withdrawal</h3>
                    <p className="text-xs text-muted-foreground">Funds arrive in 1-3 business days</p>
                  </div>
                </div>
              </div>
              <CardContent className="space-y-4 p-5">
                {/* Available balance */}
                <div className="rounded-lg bg-shopee/[0.06] p-4">
                  <p className="text-xs text-muted-foreground">Available for withdrawal</p>
                  <p className="mt-1 text-3xl font-bold text-shopee">{formatRM(availableBalance)}</p>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="w-amount" className="text-sm font-medium">
                    Withdrawal Amount (RM)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      RM
                    </span>
                    <Input
                      id="w-amount"
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-10 text-lg font-semibold"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAmount(500)}
                    >
                      {formatRM(500)}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAmount(1000)}
                    >
                      {formatRM(1000)}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAmount(2500)}
                    >
                      {formatRM(2500)}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAmount(availableBalance)}
                      className="text-shopee"
                    >
                      Max
                    </Button>
                  </div>
                </div>

                {/* Bank account */}
                <div className="space-y-2">
                  <Label htmlFor="w-bank" className="text-sm font-medium">
                    Bank Account
                  </Label>
                  <Select value={bankAccount} onValueChange={setBankAccount}>
                    <SelectTrigger id="w-bank" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          <div className="flex items-center gap-2">
                            <Icons.Landmark className="size-3.5" />
                            <span>{b.label}</span>
                            <span className="text-xs text-muted-foreground">· {b.holder}</span>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="add-new">
                        <span className="flex items-center gap-2 text-shopee">
                          <Icons.Plus className="size-3.5" /> Add new bank account
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Summary */}
                {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                  <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Withdrawal amount</span>
                      <span className="font-semibold">{formatRM(parseFloat(withdrawAmount) || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Processing fee</span>
                      <span className="font-semibold text-success">FREE</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-1.5">
                      <span className="font-medium">You receive</span>
                      <span className="font-bold text-shopee">
                        {formatRM(parseFloat(withdrawAmount) || 0)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-shopee-gradient hover:opacity-90"
                  size="lg"
                  onClick={handleWithdraw}
                >
                  <Icons.ArrowDownToLine className="mr-1 size-4" /> Request Withdrawal
                </Button>
                <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                  <Icons.Shield className="size-3" />
                  Min withdrawal {formatRM(minWithdrawal)} · No fees · MY banks only
                </p>
              </CardContent>
            </Card>

            {/* Withdrawal history */}
            <Card className="border-border/60 lg:col-span-3">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <Icons.History className="size-4 text-hermes" />
                  <div>
                    <h3 className="text-sm font-semibold">Withdrawal History</h3>
                    <p className="text-xs text-muted-foreground">Last 5 transactions</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info('Loading full history...')}>
                  View All
                </Button>
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="pl-4">Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="pr-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawalHistory.map((w) => {
                      const statusCfg =
                        w.status === 'completed'
                          ? { label: 'Completed', cls: 'border-success/30 bg-success/5 text-success', icon: Icons.CircleCheck }
                          : w.status === 'processing'
                            ? { label: 'Processing', cls: 'border-hermes/30 bg-hermes/5 text-hermes', icon: Icons.Loader }
                            : { label: 'Pending', cls: 'border-warning/30 bg-warning/5 text-warning', icon: Icons.Clock }
                      const StatusIcon = statusCfg.icon
                      return (
                        <TableRow key={w.id}>
                          <TableCell className="pl-4">
                            <p className="font-mono text-xs font-medium">{w.reference}</p>
                          </TableCell>
                          <TableCell className="text-right text-sm font-bold text-shopee">
                            {formatRM(w.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Icons.Landmark className="size-3.5" />
                              {w.method}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{w.date}</TableCell>
                          <TableCell className="pr-4">
                            <Badge variant="outline" className={cn('gap-1', statusCfg.cls)}>
                              <StatusIcon className={cn('size-3', w.status === 'processing' && 'animate-spin')} />
                              {statusCfg.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Withdrawal summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Icons.CircleCheck className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completed (YTD)</p>
                  <p className="text-sm font-bold">{formatRM(11300)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <Icons.Clock className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending + Processing</p>
                  <p className="text-sm font-bold">{formatRM(2734)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-shopee/10 text-shopee">
                  <Icons.Wallet className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lifetime withdrawn</p>
                  <p className="text-sm font-bold">{formatRM(43433)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
