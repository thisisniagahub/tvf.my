'use client'

import { useMemo, useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader, StatCard, PlatformBadge } from './_shared'
import { demoCampaigns, formatRM, formatNumber } from '@/lib/demo-data'
import type { Campaign } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | 'active' | 'paused' | 'ended' | 'draft'

const statusConfig: Record<
  Campaign['status'],
  { badge: string; dot: string; label: string }
> = {
  active: {
    badge: 'border-success/30 bg-success/5 text-success',
    dot: 'bg-success',
    label: 'Active',
  },
  paused: {
    badge: 'border-warning/30 bg-warning/5 text-warning',
    dot: 'bg-warning',
    label: 'Paused',
  },
  ended: {
    badge: 'border-border bg-muted/40 text-muted-foreground',
    dot: 'bg-muted-foreground',
    label: 'Ended',
  },
  draft: {
    badge: 'border-border bg-background text-foreground',
    dot: 'bg-foreground/40',
    label: 'Draft',
  },
}

export function CampaignsPage() {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [campaigns, setCampaigns] = useState<Campaign[]>(demoCampaigns)
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [form, setForm] = useState({
    name: '',
    platform: 'Shopee',
    budget: '500',
    startDate: '',
    endDate: '',
  })

  const stats = useMemo(() => {
    const active = campaigns.filter((c) => c.status === 'active').length
    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0)
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0)
    const validRoas = campaigns.filter((c) => c.roas > 0)
    const avgRoas =
      validRoas.length > 0
        ? validRoas.reduce((s, c) => s + c.roas, 0) / validRoas.length
        : 0
    return { active, totalBudget, totalSpent, avgRoas }
  }, [campaigns])

  const filtered = useMemo(() => {
    if (filter === 'all') return campaigns
    return campaigns.filter((c) => c.status === filter)
  }, [campaigns, filter])

  function handleCreate() {
    if (!form.name.trim()) {
      toast.error('Give your campaign a name first lah')
      return
    }
    if (!form.budget || parseFloat(form.budget) <= 0) {
      toast.error('Set a valid budget')
      return
    }
    const newCampaign: Campaign = {
      id: `c${Date.now()}`,
      name: form.name.trim(),
      status: 'draft',
      platform: form.platform,
      budget: parseFloat(form.budget),
      spent: 0,
      clicks: 0,
      orders: 0,
      revenue: 0,
      commission: 0,
      roas: 0,
      startDate: form.startDate || new Date().toISOString().slice(0, 10),
      endDate: form.endDate,
    }
    setCampaigns((prev) => [newCampaign, ...prev])
    setForm({ name: '', platform: 'Shopee', budget: '500', startDate: '', endDate: '' })
    setCreateOpen(false)
    toast.success('Campaign created!', {
      description: `${newCampaign.name} saved as draft. Launch when ready lor.`,
    })
  }

  function handleStatusChange(id: string, newStatus: Campaign['status']) {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    )
    const c = campaigns.find((x) => x.id === id)
    toast.success(`Campaign ${newStatus}`, {
      description: c ? `${c.name} is now ${newStatus}.` : '',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        subtitle="Plan, launch and track your affiliate marketing campaigns across Shopee MY"
        icon={Icons.Megaphone}
        accent="hermes"
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Exporting campaign report...')}>
          <Icons.Download className="mr-1 size-4" /> Export
        </Button>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-hermes-gradient hover:opacity-90"
        >
          <Icons.Plus className="mr-1 size-4" /> New Campaign
        </Button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Campaigns"
          value={stats.active}
          icon={Icons.Rocket}
          accent="success"
          subtitle="Running right now"
          delta={`${campaigns.filter((c) => c.status === 'draft').length} drafts ready`}
          deltaType="neutral"
        />
        <StatCard
          label="Total Budget"
          value={formatRM(stats.totalBudget)}
          icon={Icons.Wallet}
          accent="shopee"
          subtitle="Allocated across all"
          delta={`${campaigns.length} total campaigns`}
          deltaType="neutral"
        />
        <StatCard
          label="Total Spent"
          value={formatRM(stats.totalSpent)}
          icon={Icons.TrendingDown}
          accent="warning"
          subtitle={`${((stats.totalSpent / Math.max(stats.totalBudget, 1)) * 100).toFixed(0)}% of budget`}
          delta={formatRM(stats.totalBudget - stats.totalSpent) + ' remaining'}
          deltaType="up"
        />
        <StatCard
          label="Avg ROAS"
          value={`${stats.avgRoas.toFixed(1)}x`}
          icon={Icons.Target}
          accent="hermes"
          subtitle="Return on ad spend"
          delta="Above 4x target"
          deltaType="up"
        />
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all" className="text-xs">
            All ({campaigns.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs">
            <Icons.CircleDot className="mr-1 size-3" /> Active ({campaigns.filter((c) => c.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="paused" className="text-xs">
            <Icons.Pause className="mr-1 size-3" /> Paused ({campaigns.filter((c) => c.status === 'paused').length})
          </TabsTrigger>
          <TabsTrigger value="ended" className="text-xs">
            <Icons.CircleStop className="mr-1 size-3" /> Ended ({campaigns.filter((c) => c.status === 'ended').length})
          </TabsTrigger>
          <TabsTrigger value="draft" className="text-xs">
            <Icons.FileEdit className="mr-1 size-3" /> Draft ({campaigns.filter((c) => c.status === 'draft').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Campaign cards grid */}
      {filtered.length === 0 ? (
        <Card className="border-border/60 border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Icons.Megaphone className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No campaigns in this filter</p>
              <p className="text-xs text-muted-foreground">
                Try another filter or create a new campaign lah.
              </p>
            </div>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-hermes-gradient hover:opacity-90">
              <Icons.Plus className="mr-1 size-4" /> New Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const cfg = statusConfig[c.status]
            const budgetPct = c.budget > 0 ? Math.min(100, (c.spent / c.budget) * 100) : 0
            const roasColor =
              c.roas >= 6
                ? 'text-success'
                : c.roas >= 3
                  ? 'text-shopee'
                  : c.roas > 0
                    ? 'text-warning'
                    : 'text-muted-foreground'
            return (
              <Card
                key={c.id}
                className="group flex flex-col border-border/60 transition-all hover:border-hermes/40 hover:shadow-md"
              >
                {/* Header */}
                <div className="border-b p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <PlatformBadge platform={c.platform} />
                        <Badge variant="outline" className={cn('gap-1', cfg.badge)}>
                          <span className={cn('size-1.5 rounded-full', cfg.dot)} />
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                    <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', cfg.badge)}>
                      <Icons.Megaphone className="size-4" />
                    </div>
                  </div>
                </div>

                {/* Budget progress */}
                <div className="border-b p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Icons.Wallet className="size-3" /> Budget
                    </span>
                    <span className="font-semibold">
                      {formatRM(c.spent)} <span className="text-muted-foreground">/ {formatRM(c.budget)}</span>
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        budgetPct >= 100
                          ? 'bg-destructive'
                          : budgetPct >= 80
                            ? 'bg-warning'
                            : 'bg-shopee-gradient'
                      )}
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{budgetPct.toFixed(0)}% used</span>
                    <span>{formatRM(c.budget - c.spent)} left</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-px border-b bg-border/40">
                  <div className="bg-card p-3">
                    <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <Icons.MousePointerClick className="size-3" /> Clicks
                    </p>
                    <p className="mt-0.5 text-sm font-bold">{formatNumber(c.clicks)}</p>
                  </div>
                  <div className="bg-card p-3">
                    <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <Icons.ShoppingCart className="size-3" /> Orders
                    </p>
                    <p className="mt-0.5 text-sm font-bold">{formatNumber(c.orders)}</p>
                  </div>
                  <div className="bg-card p-3">
                    <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <Icons.DollarSign className="size-3" /> Revenue
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-shopee">{formatRM(c.revenue)}</p>
                  </div>
                  <div className="bg-card p-3">
                    <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <Icons.Coins className="size-3" /> Commission
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-success">{formatRM(c.commission)}</p>
                  </div>
                </div>

                {/* ROAS + dates */}
                <div className="flex items-center justify-between border-b p-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">ROAS</p>
                    <p className={cn('text-lg font-bold', roasColor)}>
                      {c.roas > 0 ? `${c.roas.toFixed(2)}x` : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                      <Icons.Calendar className="size-3" /> Schedule
                    </p>
                    <p className="text-xs font-medium">
                      {c.startDate}
                      {c.endDate ? ` → ${c.endDate}` : ' → ongoing'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-2 p-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelected(c)}
                  >
                    <Icons.Eye className="mr-1 size-3.5" /> View Details
                  </Button>
                  {c.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(c.id, 'paused')}
                      title="Pause"
                    >
                      <Icons.Pause className="size-3.5 text-warning" />
                    </Button>
                  ) : c.status === 'paused' || c.status === 'draft' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(c.id, 'active')}
                      title="Launch"
                    >
                      <Icons.Play className="size-3.5 text-success" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      title="Ended"
                    >
                      <Icons.CircleStop className="size-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create campaign dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Icons.Megaphone className="size-5 text-hermes" /> New Campaign
            </DialogTitle>
            <DialogDescription>
              Set up a new affiliate campaign. You can launch it now or save as draft.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="c-name" className="text-sm font-medium">
                Campaign Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="c-name"
                placeholder="e.g. 11.11 Mega Sale Beauty"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="c-platform" className="text-sm font-medium">
                  Platform
                </Label>
                <Select
                  value={form.platform}
                  onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}
                >
                  <SelectTrigger id="c-platform" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shopee">Shopee</SelectItem>
                    <SelectItem value="TikTok">TikTok Shop</SelectItem>
                    <SelectItem value="Lazada">Lazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-budget" className="text-sm font-medium">
                  Budget (RM) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="c-budget"
                  type="number"
                  min={0}
                  value={form.budget}
                  onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="c-start" className="text-sm font-medium">
                  Start Date
                </Label>
                <Input
                  id="c-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-end" className="text-sm font-medium">
                  End Date <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="c-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Budget presets */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Budget Presets</Label>
              <div className="flex flex-wrap gap-2">
                {[100, 300, 500, 1000, 2000].map((b) => (
                  <Button
                    key={b}
                    type="button"
                    size="sm"
                    variant={form.budget === String(b) ? 'default' : 'outline'}
                    onClick={() => setForm((f) => ({ ...f, budget: String(b) }))}
                    className={form.budget === String(b) ? 'bg-hermes-gradient hover:opacity-90' : ''}
                  >
                    {formatRM(b)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Summary preview */}
            <div className="rounded-lg border border-dashed border-hermes/30 bg-hermes/[0.03] p-3">
              <div className="flex items-center gap-2">
                <Icons.Info className="size-4 text-hermes" />
                <p className="text-xs font-semibold text-hermes">Campaign Summary</p>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• Name: <span className="font-medium text-foreground">{form.name || '—'}</span></li>
                <li>• Platform: <span className="font-medium text-foreground">{form.platform}</span></li>
                <li>• Budget: <span className="font-medium text-foreground">{form.budget ? formatRM(parseFloat(form.budget)) : '—'}</span></li>
                <li>• Status: <span className="font-medium text-foreground">Draft (launch anytime)</span></li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-hermes-gradient hover:opacity-90">
              <Icons.Plus className="mr-1 size-4" /> Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign details dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Icons.Megaphone className="size-5 text-hermes" /> {selected.name}
                </DialogTitle>
                <DialogDescription>
                  Campaign performance and details
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Top badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <PlatformBadge platform={selected.platform} />
                  <Badge variant="outline" className={cn('gap-1', statusConfig[selected.status].badge)}>
                    <span className={cn('size-1.5 rounded-full', statusConfig[selected.status].dot)} />
                    {statusConfig[selected.status].label}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Icons.Calendar className="size-3" />
                    {selected.startDate} → {selected.endDate ?? 'ongoing'}
                  </Badge>
                </div>

                {/* Stat grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Clicks</p>
                    <p className="mt-1 text-lg font-bold">{formatNumber(selected.clicks)}</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Orders</p>
                    <p className="mt-1 text-lg font-bold">{formatNumber(selected.orders)}</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Revenue</p>
                    <p className="mt-1 text-lg font-bold text-shopee">{formatRM(selected.revenue)}</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Commission</p>
                    <p className="mt-1 text-lg font-bold text-success">{formatRM(selected.commission)}</p>
                  </div>
                </div>

                {/* Budget + ROAS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Budget Usage</span>
                      <span className="font-semibold">
                        {formatRM(selected.spent)} / {formatRM(selected.budget)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-shopee-gradient"
                        style={{
                          width: `${Math.min(100, (selected.spent / Math.max(selected.budget, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">Return on Ad Spend</p>
                    <p className={cn(
                      'mt-1 text-2xl font-bold',
                      selected.roas >= 6
                        ? 'text-success'
                        : selected.roas >= 3
                          ? 'text-shopee'
                          : selected.roas > 0
                            ? 'text-warning'
                            : 'text-muted-foreground'
                    )}>
                      {selected.roas > 0 ? `${selected.roas.toFixed(2)}x` : '—'}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {selected.status === 'active' && (
                    <Button variant="outline" size="sm" onClick={() => { handleStatusChange(selected.id, 'paused'); setSelected(null) }}>
                      <Icons.Pause className="mr-1 size-4 text-warning" /> Pause
                    </Button>
                  )}
                  {(selected.status === 'paused' || selected.status === 'draft') && (
                    <Button variant="outline" size="sm" onClick={() => { handleStatusChange(selected.id, 'active'); setSelected(null) }}>
                      <Icons.Play className="mr-1 size-4 text-success" /> Launch
                    </Button>
                  )}
                  {selected.status !== 'ended' && (
                    <Button variant="outline" size="sm" onClick={() => { handleStatusChange(selected.id, 'ended'); setSelected(null) }}>
                      <Icons.CircleStop className="mr-1 size-4" /> End Campaign
                    </Button>
                  )}
                  <Button size="sm" className="ml-auto bg-hermes-gradient hover:opacity-90" onClick={() => { toast.success('Opening analytics for ' + selected.name); setSelected(null) }}>
                    <Icons.BarChart3 className="mr-1 size-4" /> Full Analytics
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
