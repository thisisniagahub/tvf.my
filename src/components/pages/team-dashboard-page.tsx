'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Legend,
} from 'recharts'

type Role = 'Admin' | 'Manager' | 'Affiliate' | 'Viewer'

type Member = {
  id: string
  name: string
  email: string
  initials: string
  role: Role
  products: number
  earnings: number
  cvr: number
  status: 'online' | 'offline' | 'away'
}

const teamMembers: Member[] = [
  { id: 't1', name: 'Daniel Goh', email: 'daniel@theviralfindsmy.com', initials: 'DG', role: 'Admin', products: 68, earnings: 6240, cvr: 28.4, status: 'online' },
  { id: 't2', name: 'Sarah Lim', email: 'sarah@theviralfindsmy.com', initials: 'SL', role: 'Manager', products: 54, earnings: 4820, cvr: 31.2, status: 'online' },
  { id: 't3', name: 'Ahmad Faizal', email: 'faizal@theviralfindsmy.com', initials: 'AF', role: 'Affiliate', products: 42, earnings: 3680, cvr: 24.6, status: 'away' },
  { id: 't4', name: 'Priya K', email: 'priya@theviralfindsmy.com', initials: 'PK', role: 'Affiliate', products: 38, earnings: 2410, cvr: 22.1, status: 'offline' },
  { id: 't5', name: 'Wei Ming', email: 'weiming@theviralfindsmy.com', initials: 'WM', role: 'Viewer', products: 0, earnings: 1300, cvr: 18.5, status: 'online' },
]

const teamPerformance = [
  { month: 'May', daniel: 4200, sarah: 3100, faizal: 2400, priya: 1800, wei: 900 },
  { month: 'Jun', daniel: 4800, sarah: 3600, faizal: 2800, priya: 2100, wei: 1100 },
  { month: 'Jul', daniel: 5200, sarah: 4200, faizal: 3100, priya: 2400, wei: 1300 },
  { month: 'Aug', daniel: 5800, sarah: 4500, faizal: 3300, priya: 2300, wei: 1300 },
  { month: 'Sep', daniel: 6240, sarah: 4820, faizal: 3680, priya: 2410, wei: 1300 },
]

const activities = [
  { id: 'a1', member: 'Sarah Lim', initials: 'SL', action: 'launched campaign', target: 'Raya Beauty Collection', time: '2 min ago', color: 'shopee' },
  { id: 'a2', member: 'Daniel Goh', initials: 'DG', action: 'approved link for', target: 'Safi Balqis UV Sunblock', time: '15 min ago', color: 'success' },
  { id: 'a3', member: 'Ahmad Faizal', initials: 'AF', action: 'updated AI content for', target: 'RGB Mechanical Keyboard', time: '1h ago', color: 'hermes' },
  { id: 'a4', member: 'Priya K', initials: 'PK', action: 'paused campaign', target: 'Back to School Gadgets', time: '2h ago', color: 'warning' },
  { id: 'a5', member: 'Wei Ming', initials: 'WM', action: 'viewed analytics for', target: 'Electronics category', time: '3h ago', color: 'shopee' },
  { id: 'a6', member: 'Sarah Lim', initials: 'SL', action: 'invited new member', target: 'affiliates@theviralfindsmy.com', time: '5h ago', color: 'hermes' },
]

const roleColor = (role: Role) => {
  switch (role) {
    case 'Admin': return 'bg-shopee/15 text-shopee'
    case 'Manager': return 'bg-hermes/15 text-hermes'
    case 'Affiliate': return 'bg-success/15 text-success'
    case 'Viewer': return 'bg-muted text-muted-foreground'
  }
}

const statusColor = (s: Member['status']) => {
  if (s === 'online') return 'bg-success'
  if (s === 'away') return 'bg-warning'
  return 'bg-muted-foreground/40'
}

export function TeamDashboardPage() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'Affiliate' as Role })

  const handleInvite = () => {
    if (!inviteForm.email.includes('@')) {
      toast.error('Please enter a valid email, boss')
      return
    }
    toast.success(`Invite sent to ${inviteForm.email} as ${inviteForm.role}`)
    setInviteOpen(false)
    setInviteForm({ email: '', role: 'Affiliate' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Dashboard"
        subtitle="Collaborate with your team on affiliate campaigns"
        icon={Icons.UsersRound}
        accent="hermes"
      >
        <Badge className="bg-hermes text-white">
          <Icons.Sparkles className="size-3" /> New
        </Badge>
        <Button size="sm" className="bg-hermes-gradient hover:opacity-90" onClick={() => setInviteOpen(true)}>
          <Icons.UserPlus className="mr-1 size-4" /> Invite Member
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Team Members"
          value={teamMembers.length}
          icon={Icons.Users}
          accent="hermes"
          subtitle={`${teamMembers.filter(m => m.status === 'online').length} online now`}
        />
        <StatCard
          label="Team Earnings"
          value={formatRM(18450)}
          delta="+18% vs last month"
          deltaType="up"
          icon={Icons.Wallet}
          accent="success"
          subtitle="Combined this month"
        />
        <StatCard
          label="Active Campaigns"
          value={8}
          icon={Icons.Megaphone}
          accent="shopee"
          subtitle="3 ending this week"
        />
        <StatCard
          label="Avg Member CVR"
          value="24%"
          delta="+2.4% vs last month"
          deltaType="up"
          icon={Icons.Target}
          accent="warning"
          subtitle="Above 8.5% market avg"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Team members table */}
        <SectionCard
          title="Team Members"
          description={`${teamMembers.length} members · ${teamMembers.filter(m => m.role === 'Admin').length} admin`}
          icon={Icons.Users}
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" onClick={() => setInviteOpen(true)}>
              <Icons.UserPlus className="mr-1 size-3" /> Invite
            </Button>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
                <TableHead className="text-right">CVR</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((m) => (
                <TableRow key={m.id} className="hover:bg-accent/40">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Avatar className="size-8">
                          <AvatarFallback className={cn('text-xs font-semibold', roleColor(m.role))}>
                            {m.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background',
                            statusColor(m.status)
                          )}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{m.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleColor(m.role)}>
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">{m.products}</TableCell>
                  <TableCell className="text-right text-sm font-semibold text-success">{formatRM(m.earnings)}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{m.cvr}%</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[10px]',
                        m.status === 'online' && 'bg-success/15 text-success',
                        m.status === 'away' && 'bg-warning/15 text-warning',
                        m.status === 'offline' && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {m.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Role legend */}
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
            <span className="font-medium">Roles:</span>
            {(['Admin', 'Manager', 'Affiliate', 'Viewer'] as Role[]).map((r) => (
              <span key={r} className="flex items-center gap-1.5">
                <span className={cn('size-2 rounded-full', roleColor(r).split(' ')[0])} />
                {r}
              </span>
            ))}
          </div>
        </SectionCard>

        {/* Recent team activity */}
        <SectionCard
          title="Recent Team Activity"
          description="Last 24 hours"
          icon={Icons.Activity}
        >
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 pr-3">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-hermes/10 text-xs font-semibold text-hermes">
                      {a.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-snug">
                      <span className="font-semibold">{a.member}</span>{' '}
                      <span className="text-muted-foreground">{a.action}</span>{' '}
                      <span className="font-medium">{a.target}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Icons.Clock className="size-2.5" />
                      {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SectionCard>
      </div>

      {/* Team performance chart */}
      <SectionCard
        title="Team Performance"
        description="Combined earnings per member — last 5 months"
        icon={Icons.LineChart}
        action={
          <Badge variant="outline" className="bg-success/5 text-success">
            <Icons.TrendingUp className="mr-1 size-3" /> +18% growth
          </Badge>
        }
      >
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={teamPerformance}>
            <defs>
              <linearGradient id="danielGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--shopee)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--shopee)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sarahGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--hermes)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--hermes)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="faizalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--success)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="priyaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--warning)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--warning)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v) => `RM${v}`} />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(v: number) => formatRM(v)}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="daniel" stroke="var(--shopee)" strokeWidth={2} fill="url(#danielGrad)" name="Daniel G" />
            <Area type="monotone" dataKey="sarah" stroke="var(--hermes)" strokeWidth={2} fill="url(#sarahGrad)" name="Sarah L" />
            <Area type="monotone" dataKey="faizal" stroke="var(--success)" strokeWidth={2} fill="url(#faizalGrad)" name="Faizal" />
            <Area type="monotone" dataKey="priya" stroke="var(--warning)" strokeWidth={2} fill="url(#priyaGrad)" name="Priya K" />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Invite member dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invite to bring a new member onto your TheViralFindsMY workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="teammate@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(v) => setInviteForm({ ...inviteForm, role: v as Role })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin — full access</SelectItem>
                  <SelectItem value="Manager">Manager — manage team & campaigns</SelectItem>
                  <SelectItem value="Affiliate">Affiliate — manage own products</SelectItem>
                  <SelectItem value="Viewer">Viewer — read-only access</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You can change roles anytime from team settings.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} className="bg-hermes-gradient hover:opacity-90">
              <Icons.Send className="mr-1 size-4" /> Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
