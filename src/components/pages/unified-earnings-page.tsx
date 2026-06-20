'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { PageHeader, StatCard } from './_shared'
import { formatRM, formatNumber } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const platforms = [
  { id: 'shopee', name: 'Shopee', color: 'var(--shopee)', earnings: 5487.32, clicks: 2847, orders: 612, cvr: 21.5, share: 47.9 },
  { id: 'shopee-live', name: 'Shopee Live', color: 'var(--shopee-dark)', earnings: 3200.0, clicks: 1840, orders: 285, cvr: 15.5, share: 27.9 },
  { id: 'tiktok', name: 'TikTok Shop', color: 'var(--hermes)', earnings: 1840.0, clicks: 3456, orders: 412, cvr: 11.9, share: 16.1 },
  { id: 'lazada', name: 'Lazada', color: 'var(--success)', earnings: 920.0, clicks: 1234, orders: 89, cvr: 7.2, share: 8.0 },
]

const earningsTrend = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  return {
    date: `Nov ${day}`,
    Shopee: Math.round(120 + Math.sin(i / 3) * 40 + i * 3 + Math.random() * 20),
    'Shopee Live': Math.round(70 + Math.cos(i / 4) * 25 + i * 2 + Math.random() * 15),
    'TikTok Shop': Math.round(40 + Math.sin(i / 5) * 15 + i * 1.5 + Math.random() * 10),
    Lazada: Math.round(20 + Math.cos(i / 6) * 10 + Math.random() * 8),
  }
})

const payoutSchedules = [
  { platform: 'Shopee', schedule: 'Monthly, 15th', icon: Icons.ShoppingBag, accent: 'shopee' as const, nextPayout: '15 Dec 2025', minPayout: 'RM 10.00', estAmount: 5487.32 },
  { platform: 'Shopee Live', schedule: 'Weekly, Friday', icon: Icons.Radio, accent: 'shopee' as const, nextPayout: '21 Nov 2025', minPayout: 'RM 1.00', estAmount: 3200.0 },
  { platform: 'TikTok Shop', schedule: 'Bi-weekly', icon: Icons.Music, accent: 'hermes' as const, nextPayout: '30 Nov 2025', minPayout: 'RM 50.00', estAmount: 1840.0 },
  { platform: 'Lazada', schedule: 'Monthly, 20th', icon: Icons.ShoppingBag, accent: 'success' as const, nextPayout: '20 Dec 2025', minPayout: 'RM 50.00', estAmount: 920.0 },
]

export function UnifiedEarningsPage() {
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('11447')
  const [withdrawMethod, setWithdrawMethod] = useState('')

  const totalAll = platforms.reduce((sum, p) => sum + p.earnings, 0)

  const handleWithdraw = () => {
    if (!withdrawMethod) {
      toast.error('Please pick a withdrawal method')
      return
    }
    setWithdrawOpen(false)
    toast.success('Withdrawal requested! 🎉', {
      description: `${formatRM(parseFloat(withdrawAmount) || 0)} via ${withdrawMethod} — processing within 3 business days.`,
    })
    setWithdrawMethod('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unified Earnings"
        subtitle="All your platform earnings in one view — Shopee, Shopee Live, TikTok & Lazada"
        icon={Icons.Layers}
        accent="shopee"
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Exporting unified CSV...')}>
          <Icons.Download className="mr-1 size-4" /> Export
        </Button>
        <Button size="sm" className="bg-shopee-gradient hover:opacity-90" onClick={() => setWithdrawOpen(true)}>
          <Icons.Wallet className="mr-1 size-4" /> Unified Withdrawal
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total All Platforms" value={formatRM(totalAll)} delta="+24% vs last month" deltaType="up" icon={Icons.Layers} accent="shopee" subtitle="Combined earnings" />
        <StatCard label="Shopee (Main + Live)" value={formatRM(5487.32 + 3200)} delta="+18% vs last month" deltaType="up" icon={Icons.ShoppingBag} accent="shopee" subtitle="Combined Shopee family" />
        <StatCard label="TikTok Shop" value={formatRM(1840)} delta="+42% vs last month" deltaType="up" icon={Icons.Music} accent="hermes" subtitle="Trending up 🔥" />
        <StatCard label="Lazada" value={formatRM(920)} delta="+15% vs last month" deltaType="up" icon={Icons.ShoppingBag} accent="success" subtitle="11.11 boost incoming" />
      </div>

      {/* Big stacked area chart */}
      <Card className="border-border/60">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Icons.BarChart3 className="size-4 text-shopee" />
            <div>
              <h3 className="text-sm font-semibold">All-Platform Earnings Trend</h3>
              <p className="text-xs text-muted-foreground">Stacked daily earnings — last 30 days</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {platforms.map((p) => (
              <Badge key={p.id} variant="outline" className="text-[10px]">
                <span className="mr-1 size-2 rounded-full" style={{ background: p.color }} />
                {p.name}
              </Badge>
            ))}
          </div>
        </div>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={earningsTrend}>
              <defs>
                <linearGradient id="gShopee" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--shopee)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--shopee)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gShopeeLive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--shopee-dark)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--shopee-dark)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gTiktok" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--hermes)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--hermes)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gLazada" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--success)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--success)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v) => `RM${v}`} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v: number, name: string) => [formatRM(v), name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Shopee" stackId="1" stroke="var(--shopee)" strokeWidth={1.5} fill="url(#gShopee)" />
              <Area type="monotone" dataKey="Shopee Live" stackId="1" stroke="var(--shopee-dark)" strokeWidth={1.5} fill="url(#gShopeeLive)" />
              <Area type="monotone" dataKey="TikTok Shop" stackId="1" stroke="var(--hermes)" strokeWidth={1.5} fill="url(#gTiktok)" />
              <Area type="monotone" dataKey="Lazada" stackId="1" stroke="var(--success)" strokeWidth={1.5} fill="url(#gLazada)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Platform breakdown table */}
      <Card className="border-border/60">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.Table className="size-4 text-shopee" />
            <div>
              <h3 className="text-sm font-semibold">Platform Breakdown</h3>
              <p className="text-xs text-muted-foreground">Detailed metrics per platform this month</p>
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">Platform</th>
                  <th className="px-4 py-2.5 text-right font-medium">Earnings</th>
                  <th className="px-4 py-2.5 text-right font-medium">Clicks</th>
                  <th className="px-4 py-2.5 text-right font-medium">Orders</th>
                  <th className="px-4 py-2.5 text-right font-medium">CVR</th>
                  <th className="px-4 py-2.5 text-right font-medium">Share %</th>
                </tr>
              </thead>
              <tbody>
                {platforms.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ background: p.color }} />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatRM(p.earnings)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatNumber(p.clicks)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatNumber(p.orders)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('font-medium', p.cvr >= 15 ? 'text-success' : p.cvr >= 8 ? 'text-warning' : 'text-muted-foreground')}>
                        {p.cvr}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="hidden w-20 sm:block">
                          <Progress value={p.share} className="h-1.5" />
                        </div>
                        <span className="font-semibold">{p.share}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/30">
                  <td className="px-4 py-3 font-bold">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-shopee">{formatRM(totalAll)}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatNumber(platforms.reduce((s, p) => s + p.clicks, 0))}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatNumber(platforms.reduce((s, p) => s + p.orders, 0))}</td>
                  <td className="px-4 py-3 text-right font-bold">
                    {(platforms.reduce((s, p) => s + p.cvr, 0) / platforms.length).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-bold">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payout schedule */}
      <Card className="border-border/60">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.CalendarClock className="size-4 text-shopee" />
            <div>
              <h3 className="text-sm font-semibold">Payout Schedule</h3>
              <p className="text-xs text-muted-foreground">When each platform pays you — plan your cashflow</p>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {payoutSchedules.map((p) => (
            <div key={p.platform} className="rounded-xl border border-border/60 p-4 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg',
                    p.accent === 'shopee' ? 'bg-shopee/10 text-shopee' : p.accent === 'hermes' ? 'bg-hermes/10 text-hermes' : 'bg-success/10 text-success'
                  )}
                >
                  <p.icon className="size-5" />
                </div>
                <Badge variant="outline" className="text-[10px]">{p.schedule}</Badge>
              </div>
              <p className="mt-2 text-sm font-semibold">{p.platform}</p>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next payout</span>
                  <span className="font-medium">{p.nextPayout}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min payout</span>
                  <span className="font-medium">{p.minPayout}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-muted-foreground">Est. amount</span>
                  <span className="font-bold text-success">{formatRM(p.estAmount)}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Unified withdrawal card */}
      <Card className="overflow-hidden border-shopee/30 bg-gradient-to-r from-shopee/[0.08] via-background to-hermes/[0.04]">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-shopee-gradient text-white shadow-md">
              <Icons.Wallet className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Unified Withdrawal</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Cash out from all platforms at once. We consolidate to your preferred Malaysian bank account
                (Maybank, CIMB, Public Bank, RHB) or e-wallet (Touch &apos;n Go, GrabPay, BigPay).
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className="bg-success/10 text-success">
                  <Icons.CheckCircle2 className="mr-1 size-3" /> KYC verified
                </Badge>
                <Badge variant="outline" className="bg-shopee/10 text-shopee">
                  <Icons.Zap className="mr-1 size-3" /> 3-day processing
                </Badge>
                <Badge variant="outline">No withdrawal fees</Badge>
              </div>
            </div>
          </div>
          <div className="shrink-0 text-center md:text-right">
            <p className="text-xs text-muted-foreground">Available to withdraw</p>
            <p className="text-3xl font-bold text-shopee">{formatRM(totalAll)}</p>
            <Button className="mt-2 bg-shopee-gradient hover:opacity-90" onClick={() => setWithdrawOpen(true)}>
              <Icons.ArrowDownToLine className="mr-1 size-4" /> Withdraw Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icons.Wallet className="size-5 text-shopee" /> Unified Withdrawal
            </DialogTitle>
            <DialogDescription>
              Cash out from all your connected platforms at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Available balance</p>
              <p className="text-2xl font-bold text-shopee">{formatRM(totalAll)}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="withdraw-amount">Amount (RM)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={totalAll}
              />
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => setWithdrawAmount(String(totalAll))}>Max</Button>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => setWithdrawAmount('5000')}>RM 5,000</Button>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => setWithdrawAmount('2000')}>RM 2,000</Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Withdrawal method</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Maybank2U', 'CIMB Clicks', 'TNG eWallet', 'GrabPay'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setWithdrawMethod(method)}
                    className={cn(
                      'flex items-center justify-center rounded-lg border-2 p-2.5 text-xs font-medium transition-all',
                      withdrawMethod === method ? 'border-shopee bg-shopee/5 text-shopee' : 'border-border/60 hover:border-shopee/40'
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
            <Button onClick={handleWithdraw} className="bg-shopee-gradient hover:opacity-90">
              <Icons.ArrowDownToLine className="mr-1 size-4" /> Withdraw {formatRM(parseFloat(withdrawAmount) || 0)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
