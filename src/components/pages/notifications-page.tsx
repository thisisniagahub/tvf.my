'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader, StatCard, SectionCard } from './_shared'
import { demoNotifications } from '@/lib/demo-data'
import type { Notification } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type FilterType = 'all' | 'unread' | 'sale' | 'alert' | 'achievement' | 'trend'

const typeConfig: Record<Notification['type'], { icon: Icons.LucideIcon; color: string; bg: string; border: string; label: string }> = {
  sale: { icon: Icons.ShoppingCart, color: 'text-success', bg: 'bg-success/10', border: 'border-success', label: 'Sale' },
  alert: { icon: Icons.BellRing, color: 'text-shopee', bg: 'bg-shopee/10', border: 'border-shopee', label: 'Alert' },
  info: { icon: Icons.Info, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-muted-foreground', label: 'Info' },
  achievement: { icon: Icons.Trophy, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning', label: 'Achievement' },
  trend: { icon: Icons.TrendingUp, color: 'text-hermes', bg: 'bg-hermes/10', border: 'border-hermes', label: 'Trend' },
}

const additionalNotifications: Notification[] = [
  { id: 'n7', type: 'sale', title: 'New Sale!', message: 'Wardah Matte Lipstick sold — you earned RM 4.19', timestamp: '6h ago', read: true },
  { id: 'n8', type: 'achievement', title: 'Streak Bonus!', message: '7-day activity streak — keep it up!', timestamp: '8h ago', read: true },
  { id: 'n9', type: 'trend', title: 'New Trending Product', message: 'Smart Watch Fitness Tracker is heating up (+28%)', timestamp: '12h ago', read: false },
  { id: 'n10', type: 'alert', title: 'XTRA Commission Boost', message: 'Wardah Cushion Foundation now offers 25% extra commission', timestamp: '1d ago', read: false },
  { id: 'n11', type: 'sale', title: 'New Sale!', message: 'Portable Blender USB sold — you earned RM 3.99', timestamp: '1d ago', read: true },
  { id: 'n12', type: 'info', title: 'New Feature Available', message: 'AI Calendar is now live — plan your content in advance', timestamp: '2d ago', read: true },
  { id: 'n13', type: 'achievement', title: 'Referral Success', message: 'Hafiz Rahman upgraded to Pro — you earned RM 50!', timestamp: '2d ago', read: true },
  { id: 'n14', type: 'trend', title: 'Category Alert', message: 'Gaming niche up 71% — explore trending products', timestamp: '3d ago', read: true },
  { id: 'n15', type: 'alert', title: 'Low Conversion Alert', message: 'Wireless Earbuds Pro conversion dropped to 22.7%', timestamp: '3d ago', read: true },
]

const allNotifications = [...demoNotifications, ...additionalNotifications]

const filterTabs: { id: FilterType; label: string; icon: Icons.LucideIcon }[] = [
  { id: 'all', label: 'All', icon: Icons.Inbox },
  { id: 'unread', label: 'Unread', icon: Icons.CircleDot },
  { id: 'sale', label: 'Sales', icon: Icons.ShoppingCart },
  { id: 'alert', label: 'Alerts', icon: Icons.BellRing },
  { id: 'achievement', label: 'Achievements', icon: Icons.Trophy },
]

interface PrefRow {
  label: string
  description: string
  icon: Icons.LucideIcon
}

const prefCategories: PrefRow[] = [
  { label: 'Sales', description: 'Real-time notifications when you make a sale', icon: Icons.ShoppingCart },
  { label: 'Trend Alerts', description: 'Get notified when a product or category spikes', icon: Icons.TrendingUp },
  { label: 'XTRA Alerts', description: 'Commission XTRA boosts and limited-time offers', icon: Icons.Star },
  { label: 'Achievements', description: 'When you unlock badges and level up', icon: Icons.Trophy },
  { label: 'Weekly Digest', description: 'Summary of your week, every Monday morning', icon: Icons.Mail },
]

const channels = ['Email', 'Push', 'In-App'] as const

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(allNotifications)
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications.filter((n) => n.type === filter)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Stay on top of sales, alerts, and achievements"
        icon={Icons.Bell}
        accent="shopee"
      >
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
          <Icons.CheckCheck className="mr-1 size-4" /> Mark all read
        </Button>
        <Button size="sm" variant="outline">
          <Icons.Settings className="mr-1 size-4" /> Preferences
        </Button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Unread" value={unreadCount.toString()} icon={Icons.BellRing} accent="shopee" subtitle="Needs your attention" />
        <StatCard label="Today" value={notifications.filter(n => n.timestamp.includes('m ago') || n.timestamp.includes('h ago')).length.toString()} icon={Icons.CalendarDays} accent="hermes" subtitle="New notifications" />
        <StatCard label="This Week" value="24" icon={Icons.CalendarRange} accent="success" delta="+8" deltaType="up" />
        <StatCard label="Sales Alerts" value={notifications.filter(n => n.type === 'sale').length.toString()} icon={Icons.ShoppingCart} accent="warning" subtitle="Money-making events" />
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {filterTabs.map((tab) => {
            const TabIcon = tab.icon
            const count = tab.id === 'all'
              ? notifications.length
              : tab.id === 'unread'
              ? unreadCount
              : notifications.filter((n) => n.type === tab.id).length
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
                <TabIcon className="size-3.5" />
                {tab.label}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Notification list */}
        <ScrollArea className="mt-4 h-[520px] pr-3">
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                  <Icons.BellOff className="size-8 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium">No notifications here</p>
                <p className="text-xs text-muted-foreground">You&apos;re all caught up!</p>
              </div>
            ) : (
              filtered.map((n) => {
                const cfg = typeConfig[n.type]
                const NotifIcon = cfg.icon
                return (
                  <Card
                    key={n.id}
                    className={cn(
                      'group relative overflow-hidden border-l-4 transition-all hover:shadow-md',
                      !n.read ? cn(cfg.border, 'bg-muted/30') : 'border-border/40 border-l-muted'
                    )}
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', cfg.bg, cfg.color)}>
                        <NotifIcon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className={cn('text-sm font-semibold', !n.read && 'text-foreground')}>
                                {n.title}
                              </p>
                              <Badge variant="outline" className={cn('text-[10px]', cfg.color, cfg.border)}>
                                {cfg.label}
                              </Badge>
                              {!n.read && (
                                <span className="size-2 rounded-full bg-shopee" aria-label="Unread" />
                              )}
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{n.timestamp}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => toggleRead(n.id)}
                          >
                            {n.read ? (
                              <Icons.Circle className="size-3.5" />
                            ) : (
                              <Icons.Check className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </ScrollArea>
      </Tabs>

      {/* Preferences */}
      <SectionCard
        title="Notification Preferences"
        description="Choose what you want to hear about and how"
        icon={Icons.Settings2}
      >
        <div className="space-y-1">
          {/* Channel header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto] gap-4 border-b pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Notification Type</span>
            {channels.map((ch) => (
              <span key={ch} className="w-16 text-center">{ch}</span>
            ))}
          </div>

          {prefCategories.map((pref, idx) => {
            const PrefIcon = pref.icon
            const defaults: Record<string, boolean[]> = {
              'Sales': [true, true, true],
              'Trend Alerts': [true, true, true],
              'XTRA Alerts': [true, false, true],
              'Achievements': [true, true, true],
              'Weekly Digest': [true, false, true],
            }
            const [emailOn, pushOn, inAppOn] = defaults[pref.label]
            return (
              <div
                key={pref.label}
                className={cn(
                  'grid gap-3 py-3 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4',
                  idx !== prefCategories.length - 1 && 'border-b'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <PrefIcon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-4 sm:contents">
                  <div className="flex items-center justify-center sm:w-16">
                    <Switch defaultChecked={emailOn} aria-label={`${pref.label} email`} />
                  </div>
                  <div className="flex items-center justify-center sm:w-16">
                    <Switch defaultChecked={pushOn} aria-label={`${pref.label} push`} />
                  </div>
                  <div className="flex items-center justify-center sm:w-16">
                    <Switch defaultChecked={inAppOn} aria-label={`${pref.label} in-app`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* Quiet Hours */}
      <SectionCard
        title="Quiet Hours"
        description="Pause non-essential notifications during your downtime"
        icon={Icons.Moon}
        action={
          <Badge variant="outline" className="gap-1">
            <Icons.Clock className="size-3" /> 22:00 – 07:00
          </Badge>
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Switch defaultChecked id="quiet-hours" />
            <Label htmlFor="quiet-hours" className="text-sm font-medium">
              Enable Quiet Hours
            </Label>
          </div>
          <div className="flex flex-1 items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Start</Label>
              <Input type="time" defaultValue="22:00" className="mt-1" />
            </div>
            <Icons.ArrowRight className="mt-5 size-4 text-muted-foreground" />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">End</Label>
              <Input type="time" defaultValue="07:00" className="mt-1" />
            </div>
          </div>
          <Button
            className="sm:mt-5"
            onClick={() => toast.success('Quiet hours saved', { description: 'You won\'t be disturbed 10PM – 7AM' })}
          >
            <Icons.Check className="mr-1 size-4" /> Save
          </Button>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <Icons.Info className="mt-0.5 size-3.5 shrink-0" />
          <span>Critical alerts (XTRA boosts, viral trends) will still come through during quiet hours. Sales notifications will be batched and delivered at 7AM.</span>
        </div>
      </SectionCard>
    </div>
  )
}
