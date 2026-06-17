'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { PageHeader, StatCard, SectionCard } from './_shared'
import { formatRM } from '@/lib/demo-data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Plan = {
  id: string
  name: string
  priceMonthly: number | null
  priceYearly: number | null
  tagline: string
  features: { label: string; included: boolean }[]
  cta: string
  highlighted?: boolean
  current?: boolean
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    tagline: 'For new affiliates just starting out',
    features: [
      { label: 'Up to 20 tracked products', included: true },
      { label: '50 affiliate links / month', included: true },
      { label: 'Basic analytics', included: true },
      { label: 'Shopee platform only', included: true },
      { label: 'HERMES AI (5 queries/mo)', included: true },
      { label: 'Multi-platform sync', included: false },
      { label: 'Auto Post automation', included: false },
      { label: 'White-label reports', included: false },
    ],
    cta: 'Downgrade',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 49,
    priceYearly: 470,
    tagline: 'For serious solo affiliates',
    features: [
      { label: 'Up to 500 tracked products', included: true },
      { label: 'Unlimited affiliate links', included: true },
      { label: 'Advanced analytics + ROAS', included: true },
      { label: 'Shopee + TikTok + Lazada', included: true },
      { label: 'HERMES AI (unlimited)', included: true },
      { label: 'Auto Post (3 platforms)', included: true },
      { label: 'XTRA Alerts + Commission boosts', included: true },
      { label: 'White-label reports', included: false },
    ],
    cta: 'Current Plan',
    highlighted: true,
    current: true,
  },
  {
    id: 'business',
    name: 'Business',
    priceMonthly: 149,
    priceYearly: 1430,
    tagline: 'For teams & power users',
    features: [
      { label: 'Unlimited tracked products', included: true },
      { label: 'Unlimited everything', included: true },
      { label: 'Team dashboard (5 members)', included: true },
      { label: 'All platforms + Shopee Live', included: true },
      { label: 'HERMES AI (priority)', included: true },
      { label: 'Auto Post (all platforms)', included: true },
      { label: 'Marketplace seller access', included: true },
      { label: 'White-label reports', included: true },
    ],
    cta: 'Upgrade',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: null,
    priceYearly: null,
    tagline: 'For agencies & big affiliate networks',
    features: [
      { label: 'Custom product limits', included: true },
      { label: 'Unlimited team members', included: true },
      { label: 'Dedicated account manager', included: true },
      { label: 'White-label solution', included: true },
      { label: 'API access + webhooks', included: true },
      { label: 'Custom integrations', included: true },
      { label: '99.9% uptime SLA', included: true },
      { label: 'Onboarding & training', included: true },
    ],
    cta: 'Contact Sales',
  },
]

const usageItems = [
  { label: 'AI generations', used: 1240, limit: 5000, color: 'bg-hermes' },
  { label: 'Products tracked', used: 312, limit: 500, color: 'bg-shopee' },
  { label: 'Links created', used: 89, limit: 9999, color: 'bg-success' },
  { label: 'API calls', used: 8420, limit: 50000, color: 'bg-warning' },
]

const billingHistory = [
  { id: 'b1', date: '01 Dec 2025', amount: 49, status: 'paid', invoice: 'INV-2025-1201' },
  { id: 'b2', date: '01 Nov 2025', amount: 49, status: 'paid', invoice: 'INV-2025-1101' },
  { id: 'b3', date: '01 Oct 2025', amount: 49, status: 'paid', invoice: 'INV-2025-1001' },
  { id: 'b4', date: '01 Sep 2025', amount: 49, status: 'paid', invoice: 'INV-2025-0901' },
  { id: 'b5', date: '01 Aug 2025', amount: 49, status: 'paid', invoice: 'INV-2025-0801' },
]

export function PricingPage() {
  const [annual, setAnnual] = useState(true)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing & Plans"
        subtitle="Choose the plan that scales with your affiliate business"
        icon={Icons.CreditCard}
        accent="shopee"
      >
        <Badge className="bg-shopee text-white">
          <Icons.Crown className="size-3" /> PRO
        </Badge>
      </PageHeader>

      {/* Current plan summary */}
      <Card className="overflow-hidden border-shopee/30 bg-gradient-to-r from-shopee/[0.06] to-hermes/[0.04]">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-shopee-gradient text-white">
              <Icons.Crown className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold">You&apos;re on Pro plan</p>
                <Badge className="bg-success text-white">Active</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Renews on 01 Jan 2026 · {formatRM(49)}/month · Visa ending 4242
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info('Opening billing portal...')}>
              <Icons.CreditCard className="mr-1 size-4" /> Manage billing
            </Button>
            <Button size="sm" className="bg-hermes-gradient hover:opacity-90" onClick={() => toast.success('Redirecting to upgrade options...')}>
              <Icons.ArrowUpCircle className="mr-1 size-4" /> Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={cn('text-sm font-medium', !annual && 'text-shopee')}>Monthly</span>
        <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Toggle annual billing" />
        <span className={cn('text-sm font-medium', annual && 'text-shopee')}>Annual</span>
        <Badge className="bg-success/15 text-success">
          <Icons.Tag className="size-3" /> Save 20%
        </Badge>
      </div>

      {/* Pricing tier cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const price = annual ? plan.priceYearly : plan.priceMonthly
          const displayPrice = price === null ? 'Custom' : annual && price !== 0 ? Math.round((price as number) / 12) : price
          return (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col border-border/60 transition-all hover:shadow-lg',
                plan.highlighted && 'border-shopee shadow-md ring-1 ring-shopee/20'
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-shopee-gradient text-white shadow">
                    <Icons.Star className="size-3" /> Most Popular
                  </Badge>
                </div>
              )}
              <CardContent className="flex flex-1 flex-col p-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {plan.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.tagline}</p>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  {displayPrice === 'Custom' ? (
                    <span className="text-3xl font-bold">Custom</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">{displayPrice === 0 ? 'Free' : formatRM(displayPrice as number)}</span>
                      {(displayPrice as number) > 0 && (
                        <span className="text-xs text-muted-foreground">
                          /mo{annual ? ' billed annually' : ''}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-4 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <div key={f.label} className="flex items-start gap-2 text-sm">
                      {f.included ? (
                        <Icons.Check className="mt-0.5 size-4 shrink-0 text-success" />
                      ) : (
                        <Icons.X className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <span className={cn(!f.included && 'text-muted-foreground/60 line-through')}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-5 w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  disabled={plan.current}
                  onClick={() => {
                    if (plan.current) return
                    if (plan.id === 'enterprise') {
                      toast.success('Our sales team will WhatsApp you within 1 business day.')
                    } else {
                      toast.success(`${plan.id === 'business' ? 'Upgrading' : 'Switching'} to ${plan.name}...`)
                    }
                  }}
                  style={plan.highlighted ? { background: 'var(--shopee)' } : undefined}
                >
                  {plan.current && <Icons.Check className="mr-1 size-4" />}
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Usage this month */}
        <SectionCard
          title="Usage This Month"
          description="Resets on 01 Jan 2026"
          icon={Icons.Gauge}
        >
          <div className="space-y-4">
            {usageItems.map((item) => {
              const pct = Math.min(100, (item.used / item.limit) * 100)
              const isUnlimited = item.limit >= 9999
              return (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.used.toLocaleString()} / {isUnlimited ? '∞' : item.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full transition-all', item.color)}
                      style={{ width: `${isUnlimited ? 8 : pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {isUnlimited
                      ? 'Unlimited on Pro plan'
                      : pct > 80
                        ? `${Math.round(100 - pct)}% remaining — consider upgrading soon`
                        : `${Math.round(100 - pct)}% remaining`}
                  </p>
                </div>
              )
            })}
          </div>
        </SectionCard>

        {/* Add payment method */}
        <SectionCard
          title="Payment Methods"
          description="Manage how you pay"
          icon={Icons.CreditCard}
          action={
            <Button variant="ghost" size="sm" onClick={() => toast.info('Opening payment method form...')}>
              <Icons.Plus className="mr-1 size-3" /> Add
            </Button>
          }
        >
          <div className="space-y-3">
            <Card className="border-border/60">
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-foreground/5 text-foreground">
                    <Icons.CreditCard className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Visa ending 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 08/27 · Primary</p>
                  </div>
                </div>
                <Badge className="bg-success/15 text-success">Default</Badge>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-success/10 text-success">
                    <Icons.Wallet className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Touch n Go eWallet</p>
                    <p className="text-xs text-muted-foreground">Connected · 012-***-8842</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Icons.MoreHorizontal className="size-4" />
                </Button>
              </CardContent>
            </Card>
            <Button variant="outline" className="w-full" onClick={() => toast.info('Opening payment method form...')}>
              <Icons.Plus className="mr-1 size-4" /> Add Payment Method
            </Button>
          </div>
        </SectionCard>
      </div>

      {/* Billing history */}
      <SectionCard
        title="Billing History"
        description="All your past invoices"
        icon={Icons.Receipt}
        action={
          <Button variant="ghost" size="sm" onClick={() => toast.info('Exporting all invoices...')}>
            <Icons.Download className="mr-1 size-3" /> Export
          </Button>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billingHistory.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.invoice}</TableCell>
                <TableCell>{b.date}</TableCell>
                <TableCell className="font-semibold">{formatRM(b.amount)}</TableCell>
                <TableCell>
                  <Badge className="bg-success/15 text-success">
                    <Icons.Check className="size-3" /> {b.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => toast.success(`Downloading ${b.invoice}.pdf`)}>
                    <Icons.Download className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  )
}
