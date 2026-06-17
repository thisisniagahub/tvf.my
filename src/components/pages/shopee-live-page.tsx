'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
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
} from 'recharts'
import { PageHeader, StatCard } from './_shared'
import { demoProducts, formatRM, formatNumber } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const liveSessions = [
  { id: 's1', date: 'Tonight', time: '8:30 PM', title: 'Raya Beauty Haul Live', product: 'Wardah Matte Lipstick', expectedViewers: 480, duration: '90 min', status: 'upcoming' as const },
  { id: 's2', date: 'Tomorrow', time: '1:00 PM', title: 'Lunchtime Gadgets Showcase', product: 'RGB Mechanical Keyboard', expectedViewers: 320, duration: '60 min', status: 'upcoming' as const },
  { id: 's3', date: 'Sat, 16 Nov', time: '9:00 PM', title: 'Weekend Fashion Try-On', product: 'Tudung Bawal Premium', expectedViewers: 850, duration: '120 min', status: 'scheduled' as const },
  { id: 's4', date: 'Sun, 17 Nov', time: '8:00 PM', title: 'Skincare Routine Live Q&A', product: 'Safi Balqis UV Sunblock', expectedViewers: 420, duration: '75 min', status: 'scheduled' as const },
  { id: 's5', date: 'Tue, 19 Nov', time: '8:30 PM', title: 'Smart Home Flash Sale', product: 'Xiaomi Robot Vacuum', expectedViewers: 280, duration: '90 min', status: 'scheduled' as const },
]

const livePerformance = [
  { session: 'S1', earnings: 280, viewers: 320 },
  { session: 'S2', earnings: 420, viewers: 480 },
  { session: 'S3', earnings: 180, viewers: 220 },
  { session: 'S4', earnings: 540, viewers: 610 },
  { session: 'S5', earnings: 380, viewers: 410 },
  { session: 'S6', earnings: 720, viewers: 880 },
  { session: 'S7', earnings: 460, viewers: 540 },
  { session: 'S8', earnings: 220, viewers: 280 },
]

const tips = [
  { icon: Icons.Mic, title: 'Open with a hook in 5s', desc: 'Malaysians scroll fast — say the price + discount within the first 5 seconds. E.g. "RM29.90 je, sekarang nak tunjuk macam mana..."', accent: 'shopee' as const },
  { icon: Icons.Gift, title: 'Drop Shopee Coins every 15 min', desc: 'Sprinkle coins to keep viewers watching. Engagement = algorithm boost = more eyeballs on your live.', accent: 'hermes' as const },
  { icon: Icons.Eye, title: 'Show the product on camera', desc: "Don't just describe — physically demo. Live commerce converts 3x when buyers see real product movement.", accent: 'success' as const },
  { icon: Icons.MessageCircle, title: 'Read & answer comments live', desc: '"Encik, size L ada tak?" — answering builds trust instantly. Get a friend to help moderate.', accent: 'warning' as const },
  { icon: Icons.Zap, title: 'Create urgency with countdown', desc: '"Stok tinggal 5 je, last call!" — scarcity works. Use Shopee\'s live flash sale slot.', accent: 'shopee' as const },
  { icon: Icons.Heart, title: 'Thank each new follower by name', desc: '"Welcome Chee Meng! Thanks for follow 👋" — personal touch keeps them coming back.', accent: 'hermes' as const },
]

export function ShopeeLivePage() {
  const [startDialogOpen, setStartDialogOpen] = useState(false)
  const [liveTitle, setLiveTitle] = useState('')
  const [liveProduct, setLiveProduct] = useState('')
  const [liveSchedule, setLiveSchedule] = useState('')
  const [coinBudget, setCoinBudget] = useState('500')

  const handleStartLive = () => {
    if (!liveTitle.trim() || !liveProduct) {
      toast.error('Please fill in title and pick a product first')
      return
    }
    const action = liveSchedule === 'now' ? 'started' : 'scheduled'
    setStartDialogOpen(false)
    toast.success(`Live session ${action}! 🎥`, {
      description: `"${liveTitle}" — calendar invite sent. Get ready to sell, boss!`,
    })
    setLiveTitle('')
    setLiveProduct('')
    setLiveSchedule('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shopee Live"
        subtitle="Real-time live commerce — the highest-converting channel in MY affiliate marketing"
        icon={Icons.Radio}
        accent="shopee"
      >
        <Badge variant="outline" className="bg-shopee/10 text-shopee">Up to 80% commission</Badge>
        <Button variant="outline" size="sm" onClick={() => toast.info('Loading Shopee Live best practices playbook...')}>
          <Icons.BookOpen className="mr-1 size-4" /> Playbook
        </Button>
      </PageHeader>

      {/* Hero highlight */}
      <Card className="overflow-hidden border-shopee/30 bg-gradient-to-r from-shopee/[0.1] via-shopee/[0.04] to-background">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-shopee-gradient text-white shadow-md">
              <Icons.Radio className="size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight md:text-2xl">Up to 80% commission on Shopee Live!</h2>
                <Badge className="bg-shopee text-white">Boosted</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Selected products now offer up to <span className="font-bold text-shopee">80% commission</span> when sold during live sessions.
                That&apos;s <span className="font-bold text-success">RM 23.92</span> per sale on a RM 29.90 product — pocket the bulk of it!
              </p>
            </div>
          </div>
          <Button size="lg" className="bg-shopee-gradient shrink-0 hover:opacity-90" onClick={() => setStartDialogOpen(true)}>
            <Icons.Video className="mr-2 size-4" /> Start Live Session
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Live Earnings" value={formatRM(3200)} delta="+38% vs last week" deltaType="up" icon={Icons.Wallet} accent="shopee" subtitle="This month" />
        <StatCard label="Live Sessions" value="12" delta="+3 this week" deltaType="up" icon={Icons.Radio} accent="shopee" subtitle="Avg 75 min each" />
        <StatCard label="Total Viewers" value={formatNumber(8900)} delta="+1,240 today" deltaType="up" icon={Icons.Users} accent="hermes" subtitle="Unique viewers" />
        <StatCard label="Live CVR" value="42%" delta="+6% vs last week" deltaType="up" icon={Icons.Target} accent="success" subtitle="4.7x non-live avg" />
      </div>

      {/* Schedule + performance */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Live session schedule */}
        <Card className="border-border/60 lg:col-span-3">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Icons.CalendarDays className="size-4 text-shopee" />
              <div>
                <h3 className="text-sm font-semibold">Live Session Schedule</h3>
                <p className="text-xs text-muted-foreground">Upcoming sessions — Malaysians watch live 8-9PM</p>
              </div>
            </div>
            <Button size="sm" className="bg-shopee-gradient text-xs hover:opacity-90" onClick={() => setStartDialogOpen(true)}>
              <Icons.Plus className="mr-1 size-3.5" /> New Session
            </Button>
          </div>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[420px]">
              <div className="divide-y">
                {liveSessions.map((s) => (
                  <div key={s.id} className="flex items-start gap-3 p-4 hover:bg-accent/40">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-shopee/10 text-shopee">
                      <Icons.Radio className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.title}</p>
                      <p className="text-xs text-muted-foreground">Featuring: {s.product}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Icons.Calendar className="size-3" /> {s.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Icons.Clock className="size-3" /> {s.time}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Icons.Timer className="size-3" /> {s.duration}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge variant="outline" className={cn('text-[10px]', s.status === 'upcoming' ? 'bg-warning/10 text-warning' : 'bg-muted')}>
                        {s.status === 'upcoming' ? 'Upcoming' : 'Scheduled'}
                      </Badge>
                      <p className="mt-1 text-[10px] text-muted-foreground">~{s.expectedViewers} viewers</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Live performance chart */}
        <Card className="border-border/60 lg:col-span-2">
          <div className="border-b p-4">
            <div className="flex items-center gap-2">
              <Icons.TrendingUp className="size-4 text-shopee" />
              <div>
                <h3 className="text-sm font-semibold">Live Performance</h3>
                <p className="text-xs text-muted-foreground">Earnings per session (RM)</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={livePerformance}>
                <defs>
                  <linearGradient id="liveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--shopee)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--shopee)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="session" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v) => `RM${v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: number, name: string) => (name === 'earnings' ? [formatRM(v), 'Earnings'] : [formatNumber(v), 'Viewers'])}
                />
                <Area type="monotone" dataKey="earnings" stroke="var(--shopee)" strokeWidth={2} fill="url(#liveGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Live selling tips */}
      <Card className="border-border/60">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Icons.Sparkles className="size-4 text-hermes" />
            <div>
              <h3 className="text-sm font-semibold">Live Selling Tips from AI</h3>
              <p className="text-xs text-muted-foreground">Battle-tested tactics for Malaysian live audience</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success('Fresh tips generated ✨')}>
            <Icons.RefreshCw className="mr-1 size-3.5" /> More tips
          </Button>
        </div>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {tips.map((t) => (
            <div key={t.title} className="flex flex-col gap-2 rounded-xl border border-border/60 p-4 transition-all hover:shadow-md">
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-lg',
                  t.accent === 'shopee'
                    ? 'bg-shopee/10 text-shopee'
                    : t.accent === 'hermes'
                    ? 'bg-hermes/10 text-hermes'
                    : t.accent === 'success'
                    ? 'bg-success/10 text-success'
                    : 'bg-warning/10 text-warning'
                )}
              >
                <t.icon className="size-5" />
              </div>
              <p className="text-sm font-semibold">{t.title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Start live session dialog */}
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icons.Radio className="size-5 text-shopee" /> Start a Live Session
            </DialogTitle>
            <DialogDescription>
              Schedule a Shopee Live session. Coins drop every 15 min to engage viewers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="live-title">Live session title</Label>
              <Input
                id="live-title"
                placeholder="e.g. Raya Beauty Haul Live 🔥"
                value={liveTitle}
                onChange={(e) => setLiveTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="live-product">Featured product</Label>
              <Select value={liveProduct} onValueChange={setLiveProduct}>
                <SelectTrigger id="live-product">
                  <SelectValue placeholder="Pick a product to showcase" />
                </SelectTrigger>
                <SelectContent>
                  {demoProducts.slice(0, 8).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {formatRM(p.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="live-schedule">Schedule for</Label>
                <Select value={liveSchedule} onValueChange={setLiveSchedule}>
                  <SelectTrigger id="live-schedule">
                    <SelectValue placeholder="When?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Start now</SelectItem>
                    <SelectItem value="tonight">Tonight, 8:30 PM</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow, 1:00 PM</SelectItem>
                    <SelectItem value="weekend">Sat, 9:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coin-budget">Shopee Coins budget</Label>
                <Input
                  id="coin-budget"
                  type="number"
                  value={coinBudget}
                  onChange={(e) => setCoinBudget(e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Engagement projection</span>
                <span className="font-semibold text-shopee">~480 viewers</span>
              </div>
              <Progress value={68} className="mt-2 h-1.5" />
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                Based on your last 5 sessions + {coinBudget} coins budget
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleStartLive} className="bg-shopee-gradient hover:opacity-90">
              <Icons.Video className="mr-1 size-4" /> {liveSchedule === 'now' ? 'Go Live' : 'Schedule Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
