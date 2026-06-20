'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader, StatCard, SectionCard } from './_shared'
import { formatRM, formatNumber } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Category = 'all' | 'sales' | 'content' | 'engagement' | 'streaks' | 'special'

interface Achievement {
  id: string
  title: string
  description: string
  icon: Icons.LucideIcon
  xp: number
  category: Exclude<Category, 'all'>
  unlocked: boolean
  progress?: number
  total?: number
  progressLabel?: string
  unlockedDate?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const achievements: Achievement[] = [
  // Sales
  { id: 'a1', title: 'First Sale', description: 'Earn your first commission on Shopee', icon: Icons.ShoppingCart, xp: 50, category: 'sales', unlocked: true, unlockedDate: '12 Jun 2024', rarity: 'common' },
  { id: 'a2', title: 'RM 1K Club', description: 'Reach RM 1,000 in total commissions', icon: Icons.Coins, xp: 200, category: 'sales', unlocked: true, unlockedDate: '03 Aug 2024', rarity: 'rare' },
  { id: 'a3', title: 'RM 10K Club', description: 'Reach RM 10,000 in total commissions', icon: Icons.Gem, xp: 1000, category: 'sales', unlocked: false, progress: 5400, total: 10000, progressLabel: 'RM', rarity: 'epic' },
  { id: 'a4', title: 'RM 100K Master', description: 'Reach RM 100,000 lifetime earnings', icon: Icons.Crown, xp: 5000, category: 'sales', unlocked: false, progress: 5400, total: 100000, progressLabel: 'RM', rarity: 'legendary' },
  // Content
  { id: 'a5', title: '100 Links Created', description: 'Create 100 affiliate links', icon: Icons.Link, xp: 150, category: 'content', unlocked: true, unlockedDate: '21 Jul 2024', rarity: 'common' },
  { id: 'a6', title: 'Viral Post', description: 'Get 10,000 views on a single post', icon: Icons.Flame, xp: 500, category: 'content', unlocked: false, progress: 6200, total: 10000, progressLabel: 'views', rarity: 'epic' },
  { id: 'a7', title: 'Content Maestro', description: 'Publish 500 pieces of content', icon: Icons.PenTool, xp: 300, category: 'content', unlocked: false, progress: 187, total: 500, progressLabel: 'posts', rarity: 'rare' },
  // Engagement
  { id: 'a8', title: 'Social Butterfly', description: 'Reach 1,000 followers across platforms', icon: Icons.Users, xp: 250, category: 'engagement', unlocked: true, unlockedDate: '15 Sep 2024', rarity: 'rare' },
  { id: 'a9', title: 'Conversion King', description: 'Achieve 30% conversion rate for a week', icon: Icons.Target, xp: 400, category: 'engagement', unlocked: false, progress: 26, total: 30, progressLabel: '%', rarity: 'epic' },
  { id: 'a10', title: 'Crowd Favourite', description: 'Get 100 saved/favorited posts', icon: Icons.Heart, xp: 200, category: 'engagement', unlocked: true, unlockedDate: '08 Oct 2024', rarity: 'common' },
  // Streaks
  { id: 'a11', title: '7-Day Streak', description: 'Be active for 7 consecutive days', icon: Icons.CalendarCheck, xp: 100, category: 'streaks', unlocked: true, unlockedDate: '19 Jun 2024', rarity: 'common' },
  { id: 'a12', title: '30-Day Streak', description: 'Be active for 30 consecutive days', icon: Icons.Flame, xp: 500, category: 'streaks', unlocked: false, progress: 18, total: 30, progressLabel: 'days', rarity: 'epic' },
  { id: 'a13', title: '100-Day Legend', description: 'Be active for 100 consecutive days', icon: Icons.Award, xp: 2000, category: 'streaks', unlocked: false, progress: 47, total: 100, progressLabel: 'days', rarity: 'legendary' },
  // Special
  { id: 'a14', title: 'Early Adopter', description: 'Joined TheViralFindsMY in beta', icon: Icons.Rocket, xp: 300, category: 'special', unlocked: true, unlockedDate: '01 Jun 2024', rarity: 'rare' },
  { id: 'a15', title: 'XTRA Hunter', description: 'Promote 20 XTRA commission products', icon: Icons.Star, xp: 350, category: 'special', unlocked: true, unlockedDate: '12 Nov 2024', rarity: 'rare' },
  { id: 'a16', title: 'HERMES Disciple', description: 'Have 50 conversations with HERMES AI', icon: Icons.Bot, xp: 250, category: 'special', unlocked: false, progress: 38, total: 50, progressLabel: 'chats', rarity: 'epic' },
]

const rarityConfig: Record<Achievement['rarity'], { border: string; bg: string; text: string; label: string }> = {
  common: { border: 'border-border/60', bg: 'bg-muted', text: 'text-muted-foreground', label: 'Common' },
  rare: { border: 'border-success/40', bg: 'bg-success/10', text: 'text-success', label: 'Rare' },
  epic: { border: 'border-hermes/40', bg: 'bg-hermes/10', text: 'text-hermes', label: 'Epic' },
  legendary: { border: 'border-warning/50', bg: 'bg-warning/10', text: 'text-warning', label: 'Legendary' },
}

const levelInfo = {
  currentLevel: 12,
  currentXP: 4820,
  xpForCurrent: 4500,
  xpForNext: 5500,
  title: 'Pro Affiliate',
  nextTitle: 'Master Affiliate',
}

const categories: { id: Category; label: string; icon: Icons.LucideIcon }[] = [
  { id: 'all', label: 'All', icon: Icons.LayoutGrid },
  { id: 'sales', label: 'Sales', icon: Icons.Coins },
  { id: 'content', label: 'Content', icon: Icons.PenTool },
  { id: 'engagement', label: 'Engagement', icon: Icons.Heart },
  { id: 'streaks', label: 'Streaks', icon: Icons.Flame },
  { id: 'special', label: 'Special', icon: Icons.Sparkles },
]

export function AchievementsPage() {
  const [category, setCategory] = useState<Category>('all')

  const earned = achievements.filter((a) => a.unlocked).length
  const totalXP = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xp, 0)
  const xpToNext = levelInfo.xpForNext - levelInfo.currentXP
  const levelProgressPct = Math.round(
    ((levelInfo.currentXP - levelInfo.xpForCurrent) / (levelInfo.xpForNext - levelInfo.xpForCurrent)) * 100
  )

  const filtered = category === 'all'
    ? achievements
    : achievements.filter((a) => a.category === category)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achievements"
        subtitle="Unlock badges, earn XP, and level up your affiliate game"
        icon={Icons.Award}
        accent="warning"
      >
        <Button variant="outline" size="sm">
          <Icons.Trophy className="mr-1 size-4" /> View Leaderboard
        </Button>
        <Button
          size="sm"
          className="bg-shopee-gradient hover:opacity-90"
          onClick={() => toast.success('Share link copied!', { description: 'Show off your achievements' })}
        >
          <Icons.Share2 className="mr-1 size-4" /> Share Profile
        </Button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Achievements Earned" value={`${earned}/${achievements.length}`} icon={Icons.Award} accent="warning" subtitle={`${Math.round((earned / achievements.length) * 100)}% complete`} />
        <StatCard label="XP Points" value={formatNumber(levelInfo.currentXP)} icon={Icons.Zap} accent="hermes" delta={`+${totalXP} from badges`} deltaType="up" />
        <StatCard label="Current Level" value={levelInfo.currentLevel} icon={Icons.Star} accent="shopee" subtitle={levelInfo.title} />
        <StatCard label="Tier Rank" value="Gold" icon={Icons.Crown} accent="success" subtitle="Top 15% in Malaysia" />
      </div>

      {/* Level Progress */}
      <Card className="overflow-hidden border-warning/30">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-warning via-shopee to-hermes" />
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-warning to-shopee text-white shadow-lg">
                  <div className="absolute inset-0 rounded-2xl bg-white/10" />
                  <div className="relative text-center">
                    <div className="text-2xl font-bold leading-none">{levelInfo.currentLevel}</div>
                    <div className="text-[10px] uppercase opacity-90">Level</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{levelInfo.title}</h3>
                    <Badge className="bg-warning text-white">Gold Tier</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(xpToNext)} XP to <span className="font-semibold text-foreground">Level {levelInfo.currentLevel + 1}</span> · {levelInfo.nextTitle}
                  </p>
                </div>
              </div>
              <div className="flex-1 lg:max-w-md">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">{formatNumber(levelInfo.currentXP - levelInfo.xpForCurrent)} XP</span>
                  <span className="font-medium text-muted-foreground">{formatNumber(levelInfo.xpForNext - levelInfo.xpForCurrent)} XP</span>
                </div>
                <Progress value={levelProgressPct} className="h-3" />
                <p className="mt-2 text-xs text-muted-foreground">{levelProgressPct}% to next level</p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Category filter */}
      <Tabs value={category} onValueChange={(v) => setCategory(v as Category)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="gap-1.5">
              <cat.icon className="size-3.5" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Achievement grid */}
        <TabsContent value={category} className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ach) => {
              const cfg = rarityConfig[ach.rarity]
              const AchIcon = ach.icon
              const progressPct = ach.total ? Math.round((ach.progress! / ach.total) * 100) : 0
              return (
                <Card
                  key={ach.id}
                  className={cn(
                    'group relative overflow-hidden transition-all hover:shadow-md',
                    cfg.border,
                    ach.unlocked ? cn(cfg.bg, 'hover:scale-[1.02]') : 'opacity-80 hover:opacity-100'
                  )}
                >
                  {/* Rarity strip */}
                  <div className={cn('absolute inset-x-0 top-0 h-1', ach.unlocked ? cfg.bg.replace('/10', '/60') : 'bg-muted')} />

                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className={cn(
                        'flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
                        ach.unlocked ? cn(cfg.bg, cfg.text) : 'bg-muted text-muted-foreground'
                      )}>
                        {ach.unlocked ? <AchIcon className="size-6" /> : <Icons.Lock className="size-5" />}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className={cn('text-[10px] capitalize', cfg.text, cfg.border)}>
                          {cfg.label}
                        </Badge>
                        {ach.unlocked ? (
                          <Badge className="gap-0.5 bg-success text-white">
                            <Icons.Check className="size-3" /> Earned
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-0.5 text-[10px]">
                            <Icons.Lock className="size-2.5" /> Locked
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className={cn('font-bold', ach.unlocked ? '' : 'text-muted-foreground')}>
                        {ach.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">{ach.description}</p>
                    </div>

                    {/* Progress / unlock date */}
                    <div className="mt-4 space-y-1.5">
                      {ach.unlocked ? (
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 font-semibold text-success">
                            <Icons.CheckCircle2 className="size-3.5" /> Unlocked
                          </span>
                          <span className="text-muted-foreground">{ach.unlockedDate}</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {ach.progressLabel === 'RM'
                                ? `${formatRM(ach.progress!)} / ${formatRM(ach.total!)}`
                                : `${formatNumber(ach.progress!)} / ${formatNumber(ach.total!)} ${ach.progressLabel}`}
                            </span>
                            <span className="font-semibold">{progressPct}%</span>
                          </div>
                          <Progress value={progressPct} className="h-1.5" />
                        </div>
                      )}
                    </div>

                    {/* XP reward */}
                    <div className="mt-3 flex items-center justify-between border-t pt-3">
                      <span className="flex items-center gap-1 text-xs font-semibold text-hermes">
                        <Icons.Zap className="size-3.5" /> +{ach.xp} XP
                      </span>
                      {ach.unlocked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => toast.success('Badge shared!', { description: `${ach.title} badge copied to clipboard` })}
                        >
                          <Icons.Share2 className="size-3" /> Share
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent unlocks */}
      <SectionCard
        title="Recently Unlocked"
        description="Your latest achievement milestones"
        icon={Icons.Sparkles}
      >
        <div className="space-y-3">
          {achievements.filter((a) => a.unlocked).slice(-4).reverse().map((ach) => {
            const AchIcon = ach.icon
            const cfg = rarityConfig[ach.rarity]
            return (
              <div
                key={ach.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/60"
              >
                <div className={cn('flex size-10 items-center justify-center rounded-lg', cfg.bg, cfg.text)}>
                  <AchIcon className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{ach.title}</span>
                    <Badge variant="outline" className={cn('text-[10px]', cfg.text, cfg.border)}>{cfg.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Unlocked on {ach.unlockedDate}</p>
                </div>
                <Badge className="gap-1 bg-hermes text-white">
                  <Icons.Zap className="size-3" /> +{ach.xp} XP
                </Badge>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* Next achievement teaser */}
      <Card className="overflow-hidden border-shopee/30 bg-gradient-to-br from-shopee/5 to-transparent">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-shopee/15 text-shopee">
              <Icons.Target className="size-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">Next up: RM 10K Club</h3>
              <p className="text-sm text-muted-foreground">
                Only {formatRM(4600)} away — promote 2 more XTRA products this week to smash it!
              </p>
            </div>
          </div>
          <Button
            className="bg-shopee-gradient hover:opacity-90"
            onClick={() => toast.success('Trend Spy opened', { description: 'Find your next RM-maker' })}
          >
            <Icons.Rocket className="mr-1 size-4" /> Boost Earnings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
