'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { PageHeader, StatCard, SectionCard } from './_shared'
import { formatRM } from '@/lib/demo-data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

type XtraOffer = {
  id: string
  product: string
  category: string
  baseCommission: number
  xtraBoost: number
  finalCommission: number
  price: number
  expiryHours: number
  status: 'live' | 'ending-soon' | 'new'
}

const liveOffers: XtraOffer[] = [
  {
    id: 'x1',
    product: 'Safi Balqis UV Sunblock SPF50 PA+++',
    category: 'Beauty',
    baseCommission: 12,
    xtraBoost: 8,
    finalCommission: 20,
    price: 24.9,
    expiryHours: 6,
    status: 'ending-soon',
  },
  {
    id: 'x2',
    product: 'Wardah Exclusive Matte Lipstick Halal',
    category: 'Beauty',
    baseCommission: 14,
    xtraBoost: 6,
    finalCommission: 20,
    price: 29.9,
    expiryHours: 23,
    status: 'live',
  },
  {
    id: 'x3',
    product: 'Instant Pot Pressure Cooker 6L',
    category: 'Home',
    baseCommission: 6,
    xtraBoost: 9,
    finalCommission: 15,
    price: 199,
    expiryHours: 2,
    status: 'ending-soon',
  },
  {
    id: 'x4',
    product: 'Anker Power Bank 20000mAh PD 22.5W',
    category: 'Electronics',
    baseCommission: 7,
    xtraBoost: 5,
    finalCommission: 12,
    price: 119,
    expiryHours: 47,
    status: 'live',
  },
  {
    id: 'x5',
    product: 'Cushion Foundation Matte Halal Wardah',
    category: 'Beauty',
    baseCommission: 13,
    xtraBoost: 7,
    finalCommission: 20,
    price: 45,
    expiryHours: 71,
    status: 'new',
  },
  {
    id: 'x6',
    product: 'Tudung Bawal Premium Soft Chiffon',
    category: 'Fashion',
    baseCommission: 11,
    xtraBoost: 4,
    finalCommission: 15,
    price: 35,
    expiryHours: 12,
    status: 'live',
  },
]

const alertRules = [
  { id: 'a1', label: 'XTRA commission launched', desc: 'Notify me the moment any XTRA boost goes live', icon: Icons.Rocket, on: true },
  { id: 'a2', label: 'XTRA ending soon', desc: 'Alert when XTRA offer has < 6 hours left', icon: Icons.Timer, on: true },
  { id: 'a3', label: 'New high-commission product', desc: 'When a product launches with > 15% commission', icon: Icons.Star, on: true },
  { id: 'a4', label: 'Competitor activity', desc: 'When competitors boost similar products', icon: Icons.Eye, on: false },
  { id: 'a5', label: 'Mega Sale XTRA (11.11 / 12.12)', desc: 'Special campaigns with stacked XTRA boosts', icon: Icons.Flame, on: true },
]

const earningsImpact = [
  { week: 'W1', baseline: 320, withXtra: 380 },
  { week: 'W2', baseline: 410, withXtra: 540 },
  { week: 'W3', baseline: 380, withXtra: 620 },
  { week: 'W4', baseline: 450, withXtra: 780 },
  { week: 'W5', baseline: 500, withXtra: 890 },
  { week: 'W6', baseline: 480, withXtra: 920 },
  { week: 'W7', baseline: 520, withXtra: 1010 },
  { week: 'W8', baseline: 560, withXtra: 1180 },
]

export function XtraAlertsPage() {
  const [rules, setRules] = useState(alertRules)
  const [prefs, setPrefs] = useState({ email: true, push: true, inApp: true, sms: false })

  const toggleRule = (id: string) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, on: !r.on } : r)))

  const statusBadge = (s: XtraOffer['status']) => {
    if (s === 'ending-soon')
      return (
        <Badge className="bg-warning text-white">
          <Icons.Timer className="size-3" /> Ending soon
        </Badge>
      )
    if (s === 'new')
      return (
        <Badge className="bg-hermes text-white">
          <Icons.Sparkles className="size-3" /> New
        </Badge>
      )
    return (
      <Badge className="bg-success text-white">
        <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-white" /> Live
      </Badge>
    )
  }

  const formatExpiry = (h: number) => {
    if (h < 1) return '< 1h left'
    if (h < 24) return `${h}h left`
    const d = Math.floor(h / 24)
    const rh = h % 24
    return `${d}d ${rh}h left`
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="XTRA Alerts"
        subtitle="Never miss a Commission XTRA boost again"
        icon={Icons.BellRing}
        accent="shopee"
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Opening alert settings...')}>
          <Icons.Settings className="mr-1 size-4" /> Settings
        </Button>
        <Button size="sm" className="bg-shopee-gradient hover:opacity-90" onClick={() => toast.success('Scanning Shopee for XTRA offers...')}>
          <Icons.Radar className="mr-1 size-4" /> Scan Now
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active XTRA Offers"
          value={18}
          icon={Icons.Rocket}
          accent="shopee"
          subtitle="Across 5 categories"
          delta="+3 today"
          deltaType="up"
        />
        <StatCard
          label="Alerts Triggered"
          value={42}
          icon={Icons.BellRing}
          accent="hermes"
          subtitle="This week"
          delta="+12 vs last week"
          deltaType="up"
        />
        <StatCard
          label="Extra Earnings"
          value={formatRM(890)}
          icon={Icons.DollarSign}
          accent="success"
          subtitle="From XTRA boosts"
          delta="+RM 210 this week"
          deltaType="up"
        />
        <StatCard
          label="Avg Boost"
          value="+34%"
          icon={Icons.TrendingUp}
          accent="warning"
          subtitle="Above base commission"
        />
      </div>

      {/* Live XTRA offers feed + alert rules */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Live XTRA Offers"
          description="Boosted commission products right now"
          icon={Icons.Rocket}
          className="lg:col-span-2"
          action={
            <Badge variant="outline" className="bg-success/5 text-success">
              <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-success" /> {liveOffers.length} live
            </Badge>
          }
        >
          <ScrollArea className="max-h-[520px]">
            <div className="space-y-3 pr-3">
              {liveOffers.map((offer) => (
                <Card
                  key={offer.id}
                  className={cn(
                    'border-border/60 transition-all hover:border-shopee/40 hover:shadow-md',
                    offer.status === 'ending-soon' && 'border-warning/40 bg-warning/[0.03]'
                  )}
                >
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-shopee/10 text-shopee">
                        <Icons.Package className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold">{offer.product}</p>
                          {statusBadge(offer.status)}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{offer.category}</Badge>
                          <span>RM {offer.price.toFixed(2)}</span>
                        </div>
                        {/* Commission breakdown */}
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground line-through">
                            {offer.baseCommission}% base
                          </span>
                          <Icons.ArrowRight className="size-3 text-muted-foreground" />
                          <Badge className="bg-shopee text-white">
                            <Icons.Zap className="mr-0.5 size-2.5" /> +{offer.xtraBoost}% XTRA
                          </Badge>
                          <span className="font-bold text-shopee">
                            = {offer.finalCommission}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-stretch gap-2 sm:items-end">
                      <span
                        className={cn(
                          'flex items-center gap-1 text-xs font-medium',
                          offer.expiryHours < 6 ? 'text-warning' : 'text-muted-foreground'
                        )}
                      >
                        <Icons.Clock className="size-3" />
                        {formatExpiry(offer.expiryHours)}
                      </span>
                      <Button
                        size="sm"
                        className="bg-shopee-gradient hover:opacity-90"
                        onClick={() => toast.success(`Grabbing XTRA offer for ${offer.product}!`)}
                      >
                        <Icons.Hand className="mr-1 size-3.5" /> Grab Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </SectionCard>

        {/* Alert rules */}
        <SectionCard
          title="Alert Rules"
          description="Pick what you want to be notified about"
          icon={Icons.BellRing}
        >
          <div className="space-y-3">
            {rules.map((rule, i) => (
              <div key={rule.id}>
                {i > 0 && <Separator className="mb-3" />}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg',
                        rule.on ? 'bg-shopee/10 text-shopee' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <rule.icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{rule.label}</p>
                      <p className="text-xs text-muted-foreground">{rule.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={rule.on}
                    onCheckedChange={() => toggleRule(rule.id)}
                    aria-label={`Toggle ${rule.label}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notification channels
            </p>
            {[
              { key: 'email' as const, label: 'Email', icon: Icons.Mail },
              { key: 'push' as const, label: 'Push notifications', icon:Icons.Smartphone },
              { key: 'inApp' as const, label: 'In-app alerts', icon: Icons.LayoutDashboard },
              { key: 'sms' as const, label: 'SMS (RM0.20/msg)', icon: Icons.MessageSquare },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <Icon className="size-4 text-muted-foreground" />
                  {label}
                </span>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
                  aria-label={`Toggle ${label}`}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* XTRA Earnings Impact chart */}
      <SectionCard
        title="XTRA Earnings Impact"
        description="Extra RM earned thanks to XTRA boosts — last 8 weeks"
        icon={Icons.TrendingUp}
        action={
          <Badge variant="outline" className="bg-success/5 text-success">
            <Icons.TrendingUp className="mr-1 size-3" /> +RM 890 extra this week
          </Badge>
        }
      >
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={earningsImpact}>
            <defs>
              <linearGradient id="xtraGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--shopee)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--shopee)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--muted-foreground)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v) => `RM${v}`} />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(v: number, name) => [formatRM(v), name === 'withXtra' ? 'With XTRA' : 'Baseline']}
            />
            <ReferenceLine y={560} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: 'Baseline avg', fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <Area type="monotone" dataKey="baseline" stroke="var(--muted-foreground)" strokeWidth={2} fill="url(#baseGrad)" />
            <Area type="monotone" dataKey="withXtra" stroke="var(--shopee)" strokeWidth={2} fill="url(#xtraGrad)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">Baseline earnings</p>
            <p className="text-lg font-bold">{formatRM(560)}/wk</p>
          </div>
          <div className="rounded-lg border bg-shopee/5 p-3 text-center">
            <p className="text-xs text-muted-foreground">With XTRA</p>
            <p className="text-lg font-bold text-shopee">{formatRM(1180)}/wk</p>
          </div>
          <div className="rounded-lg border bg-success/5 p-3 text-center">
            <p className="text-xs text-muted-foreground">Extra earned</p>
            <p className="text-lg font-bold text-success">+{formatRM(620)}/wk</p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
