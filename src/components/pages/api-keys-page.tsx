'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { PageHeader, StatCard, SectionCard } from './_shared'
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
} from 'recharts'

type ApiKey = {
  id: string
  name: string
  prefix: string
  suffix: string
  created: string
  lastUsed: string
  permissions: ('read' | 'write' | 'admin')[]
}

type Webhook = {
  id: string
  url: string
  events: string[]
  status: boolean
  lastDelivery: string
  deliveries: number
}

const apiKeys: ApiKey[] = [
  {
    id: 'k1',
    name: 'Production Server',
    prefix: 'tvfm_live_',
    suffix: 'a4f2b8e9',
    created: '12 Oct 2025',
    lastUsed: '2 min ago',
    permissions: ['read', 'write', 'admin'],
  },
  {
    id: 'k2',
    name: 'Mobile App',
    prefix: 'tvfm_live_',
    suffix: 'c7d1e3f5',
    created: '03 Aug 2025',
    lastUsed: '15 min ago',
    permissions: ['read', 'write'],
  },
  {
    id: 'k3',
    name: 'Analytics Dashboard',
    prefix: 'tvfm_live_',
    suffix: 'b2a9c4d7',
    created: '21 Jun 2025',
    lastUsed: '1 hour ago',
    permissions: ['read'],
  },
]

const webhooks: Webhook[] = [
  {
    id: 'w1',
    url: 'https://api.kopio.my/webhooks/tvfm/sales',
    events: ['sale.completed', 'commission.earned'],
    status: true,
    lastDelivery: '5 min ago',
    deliveries: 1248,
  },
  {
    id: 'w2',
    url: 'https://hooks.zapier.com/hooks/catch/8842/xtra-alerts',
    events: ['xtra.launched', 'xtra.ending'],
    status: true,
    lastDelivery: '32 min ago',
    deliveries: 86,
  },
  {
    id: 'w3',
    url: 'https://api.kopio.my/webhooks/tvfm/links',
    events: ['link.created', 'link.clicked'],
    status: false,
    lastDelivery: '3 days ago',
    deliveries: 312,
  },
]

const apiUsage = [
  { hour: '00:00', calls: 32, errors: 0 },
  { hour: '04:00', calls: 18, errors: 0 },
  { hour: '08:00', calls: 124, errors: 2 },
  { hour: '12:00', calls: 286, errors: 1 },
  { hour: '16:00', calls: 342, errors: 4 },
  { hour: '20:00', calls: 198, errors: 0 },
  { hour: '23:59', calls: 84, errors: 1 },
]

const availableEvents = [
  { id: 'sale.completed', label: 'sale.completed', desc: 'When an affiliate sale completes' },
  { id: 'commission.earned', label: 'commission.earned', desc: 'When commission is credited' },
  { id: 'link.created', label: 'link.created', desc: 'When a new affiliate link is created' },
  { id: 'link.clicked', label: 'link.clicked', desc: 'When an affiliate link is clicked' },
  { id: 'xtra.launched', label: 'xtra.launched', desc: 'When XTRA commission goes live' },
  { id: 'xtra.ending', label: 'xtra.ending', desc: '6h before XTRA expires' },
  { id: 'product.hot', label: 'product.hot', desc: 'When product hits > 80% velocity' },
  { id: 'campaign.ended', label: 'campaign.ended', desc: 'When a campaign ends' },
]

const permBadge = (p: 'read' | 'write' | 'admin') => {
  const colors = {
    read: 'bg-success/15 text-success',
    write: 'bg-warning/15 text-warning',
    admin: 'bg-shopee/15 text-shopee',
  }
  return <Badge key={p} variant="outline" className={colors[p]}>{p}</Badge>
}

export function ApiKeysPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [newKey, setNewKey] = useState<{ name: string; perms: ('read' | 'write' | 'admin')[]; expiry: string }>({
    name: '',
    perms: ['read'],
    expiry: 'never',
  })
  const [hooks, setHooks] = useState(webhooks)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  const togglePerm = (p: 'read' | 'write' | 'admin') => {
    setNewKey((prev) => ({
      ...prev,
      perms: prev.perms.includes(p)
        ? prev.perms.filter((x) => x !== p)
        : [...prev.perms, p],
    }))
  }

  const toggleWebhook = (id: string) =>
    setHooks((prev) => prev.map((h) => (h.id === id ? { ...h, status: !h.status } : h)))

  const copyKey = (full: string) => {
    navigator.clipboard?.writeText(full).catch(() => {})
    toast.success('API key copied to clipboard')
  }

  const handleCreate = () => {
    if (!newKey.name.trim()) {
      toast.error('Give your API key a name first, boss')
      return
    }
    toast.success(`API key "${newKey.name}" created with ${newKey.perms.join(', ')} permissions`)
    setCreateOpen(false)
    setNewKey({ name: '', perms: ['read'], expiry: 'never' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        subtitle="Manage your API credentials for integrations"
        icon={Icons.KeyRound}
        accent="shopee"
      >
        <Badge className="bg-shopee text-white">
          <Icons.Code2 className="size-3" /> API
        </Badge>
        <Button size="sm" className="bg-shopee-gradient hover:opacity-90" onClick={() => setCreateOpen(true)}>
          <Icons.Plus className="mr-1 size-4" /> Create New Key
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Keys"
          value={apiKeys.length}
          icon={Icons.KeyRound}
          accent="shopee"
          subtitle="3 with admin access"
        />
        <StatCard
          label="API Calls Today"
          value="1,234"
          delta="+18% vs yesterday"
          deltaType="up"
          icon={Icons.Activity}
          accent="hermes"
          subtitle="Last 24 hours"
        />
        <StatCard
          label="Rate Limit"
          value="10K/mo"
          icon={Icons.Gauge}
          accent="warning"
          subtitle="2,420 used this month"
        />
        <StatCard
          label="Webhooks"
          value={hooks.filter((h) => h.status).length}
          icon={Icons.Webhook}
          accent="success"
          subtitle={`${hooks.length} total configured`}
        />
      </div>

      {/* API keys table */}
      <SectionCard
        title="Your API Keys"
        description="Use these to authenticate API requests"
        icon={Icons.KeyRound}
        action={
          <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
            <Icons.Plus className="mr-1 size-3" /> New Key
          </Button>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => {
              const full = `${key.prefix}${'•'.repeat(24)}${key.suffix}`
              const visible = revealed[key.id]
              return (
                <TableRow key={key.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-shopee/10 text-shopee">
                        <Icons.KeyRound className="size-4" />
                      </div>
                      <span className="text-sm font-medium">{key.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {visible ? `${key.prefix}${key.suffix}` : `tvfm_live_${'•'.repeat(8)}${key.suffix}`}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-7 p-0"
                        onClick={() => setRevealed((r) => ({ ...r, [key.id]: !r[key.id] }))}
                        aria-label="Toggle visibility"
                      >
                        {visible ? <Icons.EyeOff className="size-3.5" /> : <Icons.Eye className="size-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-7 p-0"
                        onClick={() => copyKey(full)}
                        aria-label="Copy key"
                      >
                        <Icons.Copy className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.map(permBadge)}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{key.created}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{key.lastUsed}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => toast.error(`API key "${key.name}" revoked. This cannot be undone.`)}
                    >
                      <Icons.Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning/[0.06] p-3 text-xs text-muted-foreground">
          <Icons.ShieldAlert className="size-4 shrink-0 text-warning" />
          <span>Keep your API keys secret. Never commit them to public repos or share in chat. We log all key usage.</span>
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Webhooks */}
        <SectionCard
          title="Webhooks"
          description="Receive real-time events"
          icon={Icons.Webhook}
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" onClick={() => toast.info('Opening webhook form...')}>
              <Icons.Plus className="mr-1 size-3" /> Add
            </Button>
          }
        >
          <div className="space-y-3">
            {hooks.map((hook) => (
              <Card key={hook.id} className={cn('border-border/60 transition-all hover:shadow-md', !hook.status && 'opacity-60')}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <code className="truncate rounded bg-muted px-2 py-1 font-mono text-xs">{hook.url}</code>
                        <Switch
                          checked={hook.status}
                          onCheckedChange={() => toggleWebhook(hook.id)}
                          aria-label={`Toggle webhook ${hook.url}`}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {hook.events.map((e) => (
                          <Badge key={e} variant="outline" className="bg-hermes/5 text-hermes text-[10px]">
                            {e}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icons.Send className="size-3" /> {hook.deliveries} deliveries
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Clock className="size-3" /> Last: {hook.lastDelivery}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success(`Test event sent to ${hook.url}`)}
                    >
                      <Icons.Zap className="mr-1 size-3.5" /> Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionCard>

        {/* API docs link card */}
        <SectionCard
          title="API Documentation"
          description="Build with TheViralFindsMY"
          icon={Icons.BookOpen}
        >
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <Icons.Terminal className="size-4 text-shopee" />
                <p className="text-sm font-medium">Quick start</p>
              </div>
              <code className="mt-2 block rounded bg-background p-2 font-mono text-[11px] text-muted-foreground">
                curl -X GET \<br />
                &nbsp;&nbsp;https://api.tvfm.my/v1/products \<br />
                &nbsp;&nbsp;-H &quot;Authorization: Bearer tvfm_live_xxx&quot;
              </code>
            </div>

            <a
              href="#"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-shopee/40 hover:bg-shopee/[0.03]"
              onClick={(e) => {
                e.preventDefault()
                toast.info('Opening API documentation...')
              }}
            >
              <span className="flex items-center gap-2 text-sm">
                <Icons.FileText className="size-4 text-shopee" />
                REST API Reference
              </span>
              <Icons.ArrowRight className="size-4 text-muted-foreground" />
            </a>

            <a
              href="#"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-hermes/40 hover:bg-hermes/[0.03]"
              onClick={(e) => {
                e.preventDefault()
                toast.info('Opening Postman collection...')
              }}
            >
              <span className="flex items-center gap-2 text-sm">
                <Icons.Box className="size-4 text-hermes" />
                Postman Collection
              </span>
              <Icons.ArrowRight className="size-4 text-muted-foreground" />
            </a>

            <a
              href="#"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-success/40 hover:bg-success/[0.03]"
              onClick={(e) => {
                e.preventDefault()
                toast.info('Opening SDK repo...')
              }}
            >
              <span className="flex items-center gap-2 text-sm">
                <Icons.Code2 className="size-4 text-success" />
                Official SDKs (JS, PHP, PY)
              </span>
              <Icons.ArrowRight className="size-4 text-muted-foreground" />
            </a>

            <div className="rounded-lg bg-shopee/5 p-3 text-center">
              <p className="text-xs text-muted-foreground">Need help integrating?</p>
              <Button variant="link" size="sm" className="text-shopee" onClick={() => toast.success('Developer support will email you within 4 hours.')}>
                Talk to developer support
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Usage statistics chart */}
      <SectionCard
        title="Usage Statistics"
        description="API calls over the last 24 hours"
        icon={Icons.BarChart3}
        action={
          <Badge variant="outline" className="bg-success/5 text-success">
            <Icons.Activity className="mr-1 size-3" /> 99.8% success rate
          </Badge>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={apiUsage}>
            <defs>
              <linearGradient id="apiCallsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--shopee)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--shopee)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="apiErrorsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area type="monotone" dataKey="calls" stroke="var(--shopee)" strokeWidth={2} fill="url(#apiCallsGrad)" name="API calls" />
            <Area type="monotone" dataKey="errors" stroke="var(--destructive)" strokeWidth={2} fill="url(#apiErrorsGrad)" name="Errors" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">Total calls today</p>
            <p className="text-lg font-bold">1,234</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">Peak hour</p>
            <p className="text-lg font-bold">16:00</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">Avg response</p>
            <p className="text-lg font-bold text-success">142ms</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">Error rate</p>
            <p className="text-lg font-bold text-success">0.18%</p>
          </div>
        </div>
      </SectionCard>

      {/* Create key dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for your integrations. You can revoke it anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="key-name">Key name</Label>
              <Input
                id="key-name"
                placeholder="e.g. Mobile App, Webhook Service"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Give it a memorable name so you know what it&apos;s for.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Permissions</Label>
              <div className="space-y-2">
                {([
                  { id: 'read' as const, label: 'Read', desc: 'View products, links, analytics' },
                  { id: 'write' as const, label: 'Write', desc: 'Create links, update campaigns' },
                  { id: 'admin' as const, label: 'Admin', desc: 'Full access — manage keys & webhooks' },
                ]).map((p) => (
                  <label
                    key={p.id}
                    htmlFor={`perm-${p.id}`}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                      newKey.perms.includes(p.id)
                        ? 'border-shopee/40 bg-shopee/[0.04]'
                        : 'hover:bg-accent'
                    )}
                  >
                    <Checkbox
                      id={`perm-${p.id}`}
                      checked={newKey.perms.includes(p.id)}
                      onCheckedChange={() => togglePerm(p.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    {p.id === 'admin' && (
                      <Icons.ShieldAlert className="size-4 text-shopee" />
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Expiry</Label>
              <Select value={newKey.expiry} onValueChange={(v) => setNewKey({ ...newKey, expiry: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never expires</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-shopee-gradient hover:opacity-90">
              <Icons.KeyRound className="mr-1 size-4" /> Generate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
