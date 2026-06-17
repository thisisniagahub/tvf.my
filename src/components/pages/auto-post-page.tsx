'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
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

type Rule = {
  id: string
  name: string
  trigger: string
  platform: 'TikTok' | 'Shopee Live' | 'Instagram' | 'Facebook'
  status: boolean
  lastRun: string
  runs: number
}

const initialRules: Rule[] = [
  {
    id: 'r1',
    name: 'Hot Product Auto-Shoutout',
    trigger: 'When product goes hot (>80% velocity)',
    platform: 'TikTok',
    status: true,
    lastRun: '12 min ago',
    runs: 142,
  },
  {
    id: 'r2',
    name: 'Evening Recap Post',
    trigger: 'Daily at 7:00 PM MYT',
    platform: 'Instagram',
    status: true,
    lastRun: '2h ago',
    runs: 38,
  },
  {
    id: 'r3',
    name: 'XTRA Commission Boost',
    trigger: 'When XTRA commission launches',
    platform: 'Shopee Live',
    status: true,
    lastRun: '4h ago',
    runs: 24,
  },
  {
    id: 'r4',
    name: 'Weekend Flash Sale',
    trigger: 'Every Saturday 10:00 AM',
    platform: 'Facebook',
    status: false,
    lastRun: '3 days ago',
    runs: 12,
  },
  {
    id: 'r5',
    name: 'Low-stock Urgency Post',
    trigger: 'When product stock < 20',
    platform: 'TikTok',
    status: true,
    lastRun: '1d ago',
    runs: 9,
  },
]

const scheduledPosts = [
  { id: 's1', time: '09:00', title: 'Safi Balqis Sunblock morning routine', platform: 'TikTok', status: 'scheduled' },
  { id: 's2', time: '12:30', title: 'Lunch-time unboxing: RGB Keyboard', platform: 'Instagram', status: 'scheduled' },
  { id: 's3', time: '15:00', title: 'Tudung Bawal styling tutorial', platform: 'TikTok', status: 'scheduled' },
  { id: 's4', time: '19:00', title: 'Evening recap: Top 5 deals today', platform: 'Instagram', status: 'scheduled' },
  { id: 's5', time: '19:00', title: 'Shopee Live: XTRA commission boost', platform: 'Shopee Live', status: 'scheduled' },
  { id: 's6', time: '21:30', title: 'Night-time skincare with Wardah', platform: 'Facebook', status: 'draft' },
]

const automationStats = [
  { day: 'Mon', posts: 4, engagement: 18 },
  { day: 'Tue', posts: 5, engagement: 22 },
  { day: 'Wed', posts: 3, engagement: 15 },
  { day: 'Thu', posts: 6, engagement: 28 },
  { day: 'Fri', posts: 7, engagement: 32 },
  { day: 'Sat', posts: 8, engagement: 35 },
  { day: 'Sun', posts: 5, engagement: 26 },
]

const platformColor = (p: string) => {
  if (p === 'TikTok') return 'border-foreground/20 bg-foreground/5'
  if (p === 'Instagram') return 'border-shopee/30 bg-shopee/5 text-shopee'
  if (p === 'Shopee Live') return 'border-success/30 bg-success/5 text-success'
  return 'border-hermes/30 bg-hermes/5 text-hermes'
}

export function AutoPostPage() {
  const [rules, setRules] = useState<Rule[]>(initialRules)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    trigger: 'hot',
    platform: 'TikTok',
    template: '',
    schedule: '',
  })

  const toggleRule = (id: string) =>
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: !r.status } : r))
    )

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast.error('Please give your rule a name, boss')
      return
    }
    const triggerMap: Record<string, string> = {
      hot: 'When product goes hot (>80% velocity)',
      daily7pm: 'Daily at 7:00 PM MYT',
      xtra: 'When XTRA commission launches',
      lowstock: 'When product stock < 20',
    }
    setRules((prev) => [
      {
        id: `r${Date.now()}`,
        name: form.name,
        trigger: triggerMap[form.trigger] ?? form.trigger,
        platform: form.platform as Rule['platform'],
        status: true,
        lastRun: 'Just created',
        runs: 0,
      },
      ...prev,
    ])
    toast.success('Automation rule created! Let it run, abang.')
    setCreateOpen(false)
    setForm({ name: '', trigger: 'hot', platform: 'TikTok', template: '', schedule: '' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auto Post"
        subtitle="Schedule and automate your affiliate posts across platforms"
        icon={Icons.Zap}
        accent="hermes"
      >
        <Badge className="bg-hermes text-white">
          <Icons.Sparkles className="size-3" /> New
        </Badge>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-hermes-gradient hover:opacity-90"
        >
          <Icons.Plus className="mr-1 size-4" /> Create Rule
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Scheduled"
          value={28}
          icon={Icons.CalendarClock}
          accent="hermes"
          subtitle="Next 7 days"
        />
        <StatCard
          label="Auto-Posted Today"
          value={5}
          delta="+2 vs yesterday"
          deltaType="up"
          icon={Icons.Send}
          accent="shopee"
          subtitle="Across 3 platforms"
        />
        <StatCard
          label="Avg Engagement"
          value="+18%"
          delta="Above manual posts"
          deltaType="up"
          icon={Icons.Heart}
          accent="success"
          subtitle="Likes + comments + shares"
        />
        <StatCard
          label="Time Saved"
          value="12h/wk"
          icon={Icons.Clock}
          accent="warning"
          subtitle="Equivalent to 1.5 work days"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Active automation rules */}
        <SectionCard
          title="Active Automation Rules"
          description={`${rules.filter((r) => r.status).length} of ${rules.length} rules running`}
          icon={Icons.Bot}
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
              <Icons.Plus className="mr-1 size-3" /> New
            </Button>
          }
        >
          <div className="space-y-3">
            {rules.map((rule) => (
              <Card
                key={rule.id}
                className={cn(
                  'border-border/60 transition-all hover:shadow-md',
                  !rule.status && 'opacity-60'
                )}
              >
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg',
                        rule.status
                          ? 'bg-hermes/10 text-hermes'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icons.Zap className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">{rule.name}</p>
                        <Badge variant="outline" className={platformColor(rule.platform)}>
                          {rule.platform}
                        </Badge>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Icons.Sparkle className="size-3" /> {rule.trigger}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icons.Clock className="size-3" /> Last run: {rule.lastRun}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Repeat className="size-3" /> {rule.runs} runs
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Badge
                      variant={rule.status ? 'default' : 'secondary'}
                      className={rule.status ? 'bg-success text-white' : ''}
                    >
                      {rule.status ? 'Active' : 'Paused'}
                    </Badge>
                    <Switch
                      checked={rule.status}
                      onCheckedChange={() => toggleRule(rule.id)}
                      aria-label={`Toggle rule ${rule.name}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionCard>

        {/* Automation stats mini chart */}
        <SectionCard
          title="Automation Stats"
          description="Posts & engagement this week"
          icon={Icons.BarChart3}
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={automationStats}>
              <defs>
                <linearGradient id="autoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--hermes)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--hermes)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="engagement" stroke="var(--hermes)" strokeWidth={2} fill="url(#autoGrad)" name="Engagement %" />
              <Area type="monotone" dataKey="posts" stroke="var(--shopee)" strokeWidth={2} fill="none" name="Posts" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Total posts this week</p>
              <p className="text-lg font-bold">38</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Avg engagement</p>
              <p className="text-lg font-bold text-success">+25%</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Scheduled posts timeline */}
      <SectionCard
        title="Scheduled Posts"
        description="Today's automation timeline"
        icon={Icons.CalendarClock}
        action={
          <Button variant="ghost" size="sm" onClick={() => toast.info('Opening calendar view...')}>
            <Icons.CalendarDays className="mr-1 size-3" /> Full calendar
          </Button>
        }
      >
        <ScrollArea className="max-h-96">
          <div className="relative space-y-3 pr-3">
            {scheduledPosts.map((post, i) => (
              <div key={post.id} className="flex gap-3">
                {/* Time + line */}
                <div className="flex w-16 shrink-0 flex-col items-center">
                  <span className="text-xs font-semibold">{post.time}</span>
                  {i < scheduledPosts.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-border" />
                  )}
                </div>
                {/* Card */}
                <Card
                  className={cn(
                    'mb-3 flex-1 border-border/60 transition-all hover:shadow-md',
                    post.status === 'draft' && 'opacity-70'
                  )}
                >
                  <CardContent className="flex items-center justify-between gap-3 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-lg',
                          post.platform === 'TikTok' && 'bg-foreground/5 text-foreground',
                          post.platform === 'Instagram' && 'bg-shopee/10 text-shopee',
                          post.platform === 'Shopee Live' && 'bg-success/10 text-success',
                          post.platform === 'Facebook' && 'bg-hermes/10 text-hermes'
                        )}
                      >
                        {post.platform === 'TikTok' && <Icons.Music className="size-4" />}
                        {post.platform === 'Instagram' && <Icons.Camera className="size-4" />}
                        {post.platform === 'Shopee Live' && <Icons.Radio className="size-4" />}
                        {post.platform === 'Facebook' && <Icons.ThumbsUp className="size-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{post.title}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className={platformColor(post.platform)}>
                            {post.platform}
                          </Badge>
                          <Badge
                            variant={post.status === 'scheduled' ? 'default' : 'secondary'}
                            className={post.status === 'scheduled' ? 'bg-success text-white' : ''}
                          >
                            {post.status === 'scheduled' ? 'Ready' : 'Draft'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toast.info('Edit scheduled post')}>
                      <Icons.Pencil className="size-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SectionCard>

      {/* Create rule dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
            <DialogDescription>
              Set up a new rule to auto-post your affiliate content. HERMES AI will handle the rest.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rule-name">Rule name</Label>
              <Input
                id="rule-name"
                placeholder="e.g. Hot Product Auto-Shoutout"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Trigger</Label>
                <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">When product goes hot</SelectItem>
                    <SelectItem value="daily7pm">Daily at 7:00 PM</SelectItem>
                    <SelectItem value="xtra">XTRA commission launches</SelectItem>
                    <SelectItem value="lowstock">Low-stock urgency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Platform</Label>
                <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Shopee Live">Shopee Live</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rule-template">Content template (optional)</Label>
              <Textarea
                id="rule-template"
                placeholder="Write your post template here... Use {product}, {price}, {commission} as placeholders."
                rows={3}
                value={form.template}
                onChange={(e) => setForm({ ...form, template: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Tip: HERMES AI will auto-fill placeholders with real product data.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rule-schedule">Schedule (optional)</Label>
              <Input
                id="rule-schedule"
                placeholder="e.g. Every day at 7:00 PM MYT"
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-hermes-gradient hover:opacity-90">
              <Icons.Zap className="mr-1 size-4" /> Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
