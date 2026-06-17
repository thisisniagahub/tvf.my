'use client'

import { useMemo, useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader, StatCard, PlatformBadge } from './_shared'
import { demoLinks, demoProducts, formatRM, formatNumber } from '@/lib/demo-data'
import type { AffiliateLink } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type FilterStatus = 'all' | 'active' | 'paused'

export function LinksPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [links, setLinks] = useState<AffiliateLink[]>(demoLinks)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    productId: '',
    slug: '',
    campaign: '',
  })

  // Derived stats
  const stats = useMemo(() => {
    const total = links.length
    const active = links.filter((l) => l.status === 'active').length
    const clicks = links.reduce((sum, l) => sum + l.clicks, 0)
    const orders = links.reduce((sum, l) => sum + l.orders, 0)
    const cvr = clicks > 0 ? (orders / clicks) * 100 : 0
    return { total, active, clicks, cvr }
  }, [links])

  const filtered = useMemo(() => {
    return links.filter((l) => {
      const matchesSearch =
        !search ||
        l.productName.toLowerCase().includes(search.toLowerCase()) ||
        l.shortUrl.toLowerCase().includes(search.toLowerCase())
      const matchesFilter =
        filter === 'all' || l.status === filter
      return matchesSearch && matchesFilter
    })
  }, [links, search, filter])

  function handleToggleStatus(id: string) {
    setLinks((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: l.status === 'active' ? 'paused' : 'active',
            }
          : l
      )
    )
    const link = links.find((l) => l.id === id)
    if (link) {
      toast.success(
        `Link ${link.status === 'active' ? 'paused' : 'activated'} — ${link.productName}`,
        { description: 'Status updated successfully lah.' }
      )
    }
  }

  function handleDelete(id: string) {
    const link = links.find((l) => l.id === id)
    setLinks((prev) => prev.filter((l) => l.id !== id))
    toast.success(`Link deleted`, {
      description: link ? `${link.productName} removed from your links.` : '',
    })
  }

  function handleCopy(link: AffiliateLink) {
    const fullUrl = `https://${link.shortUrl}`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl).catch(() => {})
    }
    toast.success('Affiliate link copied!', {
      description: fullUrl,
    })
  }

  function handleCreate() {
    if (!form.productId) {
      toast.error('Pick a product first lah')
      return
    }
    const product = demoProducts.find((p) => p.id === form.productId)
    if (!product) return
    const newLink: AffiliateLink = {
      id: `l${Date.now()}`,
      productId: product.id,
      productName: product.name.split(' ').slice(0, 3).join(' '),
      shortUrl: `shopee.com.my/aff/${(form.slug || product.id).slice(0, 6)}${Math.floor(
        Math.random() * 900 + 100
      )}`,
      clicks: 0,
      orders: 0,
      earnings: 0,
      conversion: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'active',
      platform: 'Shopee',
    }
    setLinks((prev) => [newLink, ...prev])
    setForm({ productId: '', slug: '', campaign: '' })
    setCreateOpen(false)
    toast.success('New affiliate link created!', {
      description: `${product.name} is now tracked and ready to share.`,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Affiliate Links"
        subtitle="Manage your tracked Shopee affiliate links — copy, pause, or delete anytime lor"
        icon={Icons.Link}
        accent="shopee"
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Exporting CSV...')}>
          <Icons.Download className="mr-1 size-4" /> Export
        </Button>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-shopee-gradient hover:opacity-90"
        >
          <Icons.Plus className="mr-1 size-4" /> Create Link
        </Button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Links"
          value={stats.total}
          icon={Icons.Link}
          accent="shopee"
          subtitle="Across all platforms"
          delta="+3 this week"
          deltaType="up"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={Icons.CircleCheck}
          accent="success"
          subtitle={`${stats.total - stats.active} paused`}
          delta={`${Math.round((stats.active / Math.max(stats.total, 1)) * 100)}% live`}
          deltaType="up"
        />
        <StatCard
          label="Total Clicks"
          value={formatNumber(stats.clicks)}
          icon={Icons.MousePointerClick}
          accent="hermes"
          subtitle="All-time tracked clicks"
          delta="+8.2% WoW"
          deltaType="up"
        />
        <StatCard
          label="Avg CVR"
          value={`${stats.cvr.toFixed(1)}%`}
          icon={Icons.Target}
          accent="warning"
          subtitle="Above 8.5% Shopee MY avg"
          delta="+3.1%"
          deltaType="up"
        />
      </div>

      {/* Search + filter tabs */}
      <Card className="border-border/60">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Icons.Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by product name or URL lah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
            <TabsList>
              <TabsTrigger value="all" className="text-xs">
                All ({links.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs">
                <Icons.CircleDot className="mr-1 size-3" /> Active ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="paused" className="text-xs">
                <Icons.Pause className="mr-1 size-3" /> Paused ({stats.total - stats.active})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Links table */}
      <Card className="border-border/60">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.Link2 className="size-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold">Your Affiliate Links</h3>
              <p className="text-xs text-muted-foreground">
                Showing {filtered.length} of {links.length} links
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-shopee/5 text-shopee">
            <Icons.ShoppingBag className="mr-1 size-3" /> Shopee MY
          </Badge>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-4">Product</TableHead>
                <TableHead>Short URL</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">CVR</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
                    <Icons.SearchX className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                    No links match your filter. Try another search lah.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((link) => {
                  const cvrColor =
                    link.conversion >= 30
                      ? 'text-success'
                      : link.conversion >= 20
                        ? 'text-shopee'
                        : 'text-warning'
                  return (
                    <TableRow key={link.id} className="group">
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-shopee/10 text-shopee">
                            <Icons.Package className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate text-sm font-medium">
                              {link.productName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Created {link.createdAt}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleCopy(link)}
                          className="group/url inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-shopee"
                          title="Click to copy"
                        >
                          <span className="max-w-[160px] truncate font-mono">
                            {link.shortUrl}
                          </span>
                          <Icons.Copy className="size-3 opacity-0 transition-opacity group-hover/url:opacity-100" />
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-semibold">
                          {formatNumber(link.clicks)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm">{link.orders}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn('text-sm font-semibold', cvrColor)}>
                          {link.conversion.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-bold text-shopee">
                          {formatRM(link.earnings)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'size-1.5 rounded-full',
                              link.status === 'active' ? 'bg-success' : 'bg-warning'
                            )}
                          />
                          <Badge
                            variant="outline"
                            className={cn(
                              link.status === 'active'
                                ? 'border-success/30 bg-success/5 text-success'
                                : 'border-warning/30 bg-warning/5 text-warning'
                            )}
                          >
                            {link.status === 'active' ? 'Active' : 'Paused'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => handleCopy(link)}
                            title="Copy link"
                          >
                            <Icons.Copy className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => handleToggleStatus(link.id)}
                            title={link.status === 'active' ? 'Pause' : 'Activate'}
                          >
                            {link.status === 'active' ? (
                              <Icons.Pause className="size-4 text-warning" />
                            ) : (
                              <Icons.Play className="size-4 text-success" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="size-8">
                                <Icons.MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCopy(link)}>
                                <Icons.Copy className="mr-2 size-4" /> Copy link
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(link.id)}>
                                {link.status === 'active' ? (
                                  <>
                                    <Icons.Pause className="mr-2 size-4" /> Pause link
                                  </>
                                ) : (
                                  <>
                                    <Icons.Play className="mr-2 size-4" /> Activate link
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toast.info('Opening analytics for ' + link.productName)
                                }
                              >
                                <Icons.BarChart3 className="mr-2 size-4" /> View analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toast.info('Generating QR code for ' + link.productName)
                                }
                              >
                                <Icons.QrCode className="mr-2 size-4" /> Generate QR
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(link.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Icons.Trash2 className="mr-2 size-4" /> Delete link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create link dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Icons.Link className="size-5 text-shopee" /> Create Affiliate Link
            </DialogTitle>
            <DialogDescription>
              Generate a new tracked Shopee affiliate link for one of your products.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Product selector */}
            <div className="space-y-2">
              <Label htmlFor="product" className="text-sm font-medium">
                Product <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.productId}
                onValueChange={(v) => setForm((f) => ({ ...f, productId: v }))}
              >
                <SelectTrigger id="product" className="w-full">
                  <SelectValue placeholder="Pick a product to promote..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {demoProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex w-full items-center gap-2">
                        <span className="truncate">{p.name}</span>
                        <Badge variant="outline" className="ml-auto bg-shopee/5 text-shopee">
                          {p.commissionRate}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.productId && (
                <p className="text-xs text-muted-foreground">
                  Commission: {formatRM(demoProducts.find((p) => p.id === form.productId)?.commission ?? 0)} per sale
                </p>
              )}
            </div>

            {/* Custom slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium">
                Custom slug <span className="text-muted-foreground">(optional)</span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded-md border border-input bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
                  shopee.com.my/aff/
                </span>
                <Input
                  id="slug"
                  placeholder="myslug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to auto-generate. Only letters and numbers allowed.
              </p>
            </div>

            {/* Campaign */}
            <div className="space-y-2">
              <Label htmlFor="campaign" className="text-sm font-medium">
                Campaign <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Select
                value={form.campaign}
                onValueChange={(v) => setForm((f) => ({ ...f, campaign: v }))}
              >
                <SelectTrigger id="campaign" className="w-full">
                  <SelectValue placeholder="Assign to a campaign..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— No campaign —</SelectItem>
                  <SelectItem value="c1">11.11 Mega Sale Electronics</SelectItem>
                  <SelectItem value="c2">Raya Beauty Collection</SelectItem>
                  <SelectItem value="c5">12.12 Year End Blowout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-dashed border-shopee/30 bg-shopee/[0.03] p-3">
              <div className="flex items-center gap-2">
                <Icons.Eye className="size-4 text-shopee" />
                <p className="text-xs font-semibold text-shopee">Link Preview</p>
              </div>
              <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                https://shopee.com.my/aff/
                <span className="text-foreground">
                  {form.slug || (form.productId ? form.productId : 'preview') || 'preview'}
                  {Math.floor(Math.random() * 900 + 100)}
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-shopee-gradient hover:opacity-90"
            >
              <Icons.Link className="mr-1 size-4" /> Create Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
