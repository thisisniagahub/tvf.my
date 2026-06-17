'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { PageHeader, StatCard, SectionCard } from './_shared'
import { formatRM, formatNumber } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Period = 'week' | 'month' | 'all'

interface LeaderEntry {
  rank: number
  name: string
  niche: string
  earnings: number
  clicks: number
  cvr: number
  trend: 'up' | 'down' | 'flat'
  trendPct: number
  badge?: string
  initials: string
}

const leaders: LeaderEntry[] = [
  { rank: 1, name: 'Ahmad Faizal', niche: 'Electronics', earnings: 28450, clicks: 12480, cvr: 32.4, trend: 'up', trendPct: 18, badge: 'Mega Seller', initials: 'AF' },
  { rank: 2, name: 'Siti Nurhaliza', niche: 'Beauty', earnings: 24120, clicks: 11200, cvr: 30.8, trend: 'up', trendPct: 12, badge: 'Beauty Queen', initials: 'SN' },
  { rank: 3, name: 'Tan Wei Ming', niche: 'Gaming', earnings: 21890, clicks: 9870, cvr: 28.6, trend: 'up', trendPct: 22, badge: 'Gaming Pro', initials: 'TW' },
  { rank: 4, name: 'Priya Devi', niche: 'Fashion', earnings: 19340, clicks: 9120, cvr: 27.1, trend: 'down', trendPct: 4, badge: 'Trendsetter', initials: 'PD' },
  { rank: 5, name: 'Lim Chee Keong', niche: 'Home', earnings: 17820, clicks: 8450, cvr: 25.9, trend: 'up', trendPct: 8, initials: 'LC' },
  { rank: 6, name: 'Nurul Aisyah', niche: 'Beauty', earnings: 16450, clicks: 7890, cvr: 24.3, trend: 'up', trendPct: 15, initials: 'NA' },
  { rank: 7, name: 'Rajesh Kumar', niche: 'Electronics', earnings: 15280, clicks: 7340, cvr: 23.7, trend: 'down', trendPct: 6, initials: 'RK' },
  { rank: 8, name: 'Farah Natasha', niche: 'Fashion', earnings: 14120, clicks: 6890, cvr: 22.8, trend: 'up', trendPct: 9, initials: 'FN' },
  { rank: 9, name: 'Kumar Subramaniam', niche: 'Gaming', earnings: 12890, clicks: 6450, cvr: 21.5, trend: 'flat', trendPct: 0, initials: 'KS' },
  { rank: 10, name: 'Aishah Rahman', niche: 'Baby', earnings: 11670, clicks: 6120, cvr: 20.9, trend: 'up', trendPct: 11, initials: 'AR' },
  { rank: 11, name: 'Daniel Wong', niche: 'Sports', earnings: 10540, clicks: 5780, cvr: 19.8, trend: 'down', trendPct: 3, initials: 'DW' },
  { rank: 12, name: 'Mei Ling Chen', niche: 'Home', earnings: 9870, clicks: 5430, cvr: 18.7, trend: 'up', trendPct: 7, initials: 'ML' },
]

const risingStars = [
  { name: 'Tan Wei Ming', niche: 'Gaming', movement: '+22%', from: '#8', to: '#3', initials: 'TW' },
  { name: 'Ahmad Faizal', niche: 'Electronics', movement: '+18%', from: '#4', to: '#1', initials: 'AF' },
  { name: 'Nurul Aisyah', niche: 'Beauty', movement: '+15%', from: '#9', to: '#6', initials: 'NA' },
  { name: 'Aishah Rahman', niche: 'Baby', movement: '+11%', from: '#14', to: '#10', initials: 'AR' },
]

const userRank = {
  rank: 47,
  earnings: 5420,
  clicks: 2340,
  cvr: 16.4,
  trend: 'up' as const,
  trendPct: 14,
  toNext: 3,
}

export function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('month')

  const podiumColors: Record<number, { ring: string; bg: string; text: string; icon: Icons.LucideIcon; label: string }> = {
    1: { ring: 'ring-amber-400', bg: 'bg-gradient-to-br from-amber-300 to-amber-500', text: 'text-amber-700', icon: Icons.Crown, label: 'Gold' },
    2: { ring: 'ring-slate-300', bg: 'bg-gradient-to-br from-slate-200 to-slate-400', text: 'text-slate-700', icon: Icons.Medal, label: 'Silver' },
    3: { ring: 'ring-orange-300', bg: 'bg-gradient-to-br from-orange-300 to-orange-500', text: 'text-orange-800', icon: Icons.Award, label: 'Bronze' },
  }

  const top3 = leaders.slice(0, 3)
  const podiumOrder = [top3[1], top3[0], top3[2]] // 2nd, 1st, 3rd for podium display
  const rest = leaders.slice(3)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        subtitle="Top performing affiliates in Malaysia this month"
        icon={Icons.Trophy}
        accent="warning"
      >
        <Button variant="outline" size="sm">
          <Icons.Download className="mr-1 size-4" /> Export
        </Button>
        <Button size="sm" className="bg-shopee-gradient hover:opacity-90">
          <Icons.Share2 className="mr-1 size-4" /> Share Rank
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Affiliates" value="2,847" icon={Icons.Users} accent="shopee" subtitle="Active this month" delta="+124" deltaType="up" />
        <StatCard label="Top Earner" value={formatRM(28450)} icon={Icons.Crown} accent="warning" subtitle="Ahmad Faizal" />
        <StatCard label="Avg. CVR (Top 10)" value="26.4%" icon={Icons.Target} accent="success" delta="+2.1%" deltaType="up" />
        <StatCard label="Your Rank" value={`#${userRank.rank}`} icon={Icons.TrendingUp} accent="hermes" subtitle={`Up ${userRank.trendPct}% this week`} />
      </div>

      {/* Period tabs */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
        <TabsList>
          <TabsTrigger value="week"><Icons.CalendarDays className="size-3.5" /> This Week</TabsTrigger>
          <TabsTrigger value="month"><Icons.CalendarRange className="size-3.5" /> This Month</TabsTrigger>
          <TabsTrigger value="all"><Icons.History className="size-3.5" /> All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Podium */}
      <div className="grid gap-4 md:grid-cols-3">
        {podiumOrder.map((entry) => {
          const c = podiumColors[entry.rank]
          const PodiumIcon = c.icon
          const isFirst = entry.rank === 1
          return (
            <Card
              key={entry.rank}
              className={cn(
                'relative overflow-hidden border-border/60 transition-all hover:shadow-xl',
                isFirst && 'md:-translate-y-4 md:scale-[1.03] ring-2 ring-amber-400/50',
                !isFirst && 'md:translate-y-2'
              )}
            >
              {isFirst && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />
              )}
              <CardContent className={cn('flex flex-col items-center p-6 text-center')}>
                <div className="mb-3 flex items-center gap-1.5">
                  <PodiumIcon className={cn('size-5', c.text)} />
                  <span className={cn('text-xs font-bold uppercase tracking-wider', c.text)}>{c.label}</span>
                </div>
                <div className="relative">
                  <Avatar className={cn('size-20 ring-4 ring-offset-2', c.ring, isFirst && 'size-24')}>
                    <AvatarFallback className={cn('text-xl font-bold text-white', c.bg)}>
                      {entry.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    'absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow',
                    c.bg
                  )}>
                    #{entry.rank}
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold">{entry.name}</h3>
                <Badge variant="outline" className="mt-1 text-xs">{entry.niche}</Badge>
                {entry.badge && (
                  <Badge className={cn('mt-2 gap-1', c.bg, 'text-white border-0')}>
                    <Icons.Sparkles className="size-3" /> {entry.badge}
                  </Badge>
                )}
                <div className="mt-4 w-full space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Earnings</span>
                    <span className="font-bold text-shopee">{formatRM(entry.earnings)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Conversion</span>
                    <span className="font-semibold">{entry.cvr}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Clicks</span>
                    <span className="font-semibold">{formatNumber(entry.clicks)}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-success">
                  <Icons.TrendingUp className="size-3.5" /> +{entry.trendPct}% this period
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Your rank highlighted */}
      <Card className="border-shopee/30 bg-shopee/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-shopee-gradient text-white">
              <Icons.User className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">You · TheViralFindsMY</span>
                <Badge className="bg-shopee text-white">#{userRank.rank}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Just {userRank.toNext} spots away from top 50 — keep grinding lah!
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 sm:gap-8">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Earnings</p>
              <p className="text-lg font-bold text-shopee">{formatRM(userRank.earnings)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">CVR</p>
              <p className="text-lg font-bold">{userRank.cvr}%</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Trend</p>
              <p className="flex items-center gap-1 text-lg font-bold text-success">
                <Icons.TrendingUp className="size-4" /> +{userRank.trendPct}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full leaderboard table */}
      <SectionCard
        title="Full Leaderboard"
        description={`Ranked by earnings — ${period === 'week' ? 'this week' : period === 'month' ? 'this month' : 'all time'}`}
        icon={Icons.ListOrdered}
        action={<Badge variant="outline" className="gap-1"><Icons.Users className="size-3" /> {formatNumber(leaders.length)} shown</Badge>}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Affiliate</TableHead>
              <TableHead className="hidden md:table-cell">Niche</TableHead>
              <TableHead className="text-right">Earnings</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Clicks</TableHead>
              <TableHead className="hidden sm:table-cell text-right">CVR</TableHead>
              <TableHead className="text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rest.map((entry) => (
              <TableRow key={entry.rank} className="group transition-colors hover:bg-shopee/5">
                <TableCell className="font-bold text-muted-foreground">{entry.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-muted text-xs font-semibold">
                        {entry.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <span className="font-medium group-hover:text-shopee">{entry.name}</span>
                      {entry.badge && (
                        <Badge variant="outline" className="hidden lg:inline-flex gap-1 text-[10px]">
                          <Icons.Sparkles className="size-2.5" /> {entry.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="secondary" className="text-xs">{entry.niche}</Badge>
                </TableCell>
                <TableCell className="text-right font-bold text-shopee">{formatRM(entry.earnings)}</TableCell>
                <TableCell className="hidden sm:table-cell text-right">{formatNumber(entry.clicks)}</TableCell>
                <TableCell className="hidden sm:table-cell text-right">{entry.cvr}%</TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    'inline-flex items-center gap-1 text-xs font-semibold',
                    entry.trend === 'up' && 'text-success',
                    entry.trend === 'down' && 'text-destructive',
                    entry.trend === 'flat' && 'text-muted-foreground'
                  )}>
                    {entry.trend === 'up' && <Icons.TrendingUp className="size-3.5" />}
                    {entry.trend === 'down' && <Icons.TrendingDown className="size-3.5" />}
                    {entry.trend === 'flat' && <Icons.Minus className="size-3.5" />}
                    {entry.trend === 'flat' ? '0%' : `${entry.trend === 'down' ? '-' : '+'}${entry.trendPct}%`}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>

      {/* Rising Stars */}
      <SectionCard
        title="Rising Stars"
        description="Biggest movers this week — keep an eye on these wahabies!"
        icon={Icons.Rocket}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {risingStars.map((star) => (
            <Card
              key={star.name}
              className="border-border/60 transition-all hover:border-shopee/40 hover:shadow-md"
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="size-10 ring-2 ring-success/30">
                  <AvatarFallback className="bg-success/10 text-xs font-bold text-success">
                    {star.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{star.name}</p>
                  <p className="text-xs text-muted-foreground">{star.niche}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-0.5 text-xs font-bold text-success">
                    <Icons.TrendingUp className="size-3" /> {star.movement}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{star.from} → {star.to}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionCard>

      {/* Encouragement banner */}
      <Card className="overflow-hidden border-warning/30 bg-gradient-to-br from-warning/5 to-transparent">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-warning/15 text-warning">
              <Icons.Flame className="size-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">Climb the ranks, kawan!</h3>
              <p className="text-sm text-muted-foreground">
                Promote 3 more trending products this week to break into the Top 40.
              </p>
            </div>
          </div>
          <Button
            className="bg-shopee-gradient hover:opacity-90"
            onClick={() => toast.success('Redirecting to Trend Spy...', { description: 'Find your next winning product' })}
          >
            <Icons.Radar className="mr-1 size-4" /> Find Trending Products
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
