'use client'

import { useState, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PageHeader, SectionCard } from './_shared'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PlannedPost {
  day: number
  type: 'reel' | 'carousel' | 'story' | 'live' | 'video'
  platform: 'IG' | 'TikTok' | 'FB' | 'WA'
  product: string
  time: string
}

interface CalendarEvent {
  month: number // 0-11
  day: number
  name: string
  emoji: string
  type: 'sale' | 'holiday'
  color: string
}

const calendarEvents: CalendarEvent[] = [
  { month: 0, day: 1, name: 'New Year Sale', emoji: '🎉', type: 'sale', color: 'shopee' },
  { month: 0, day: 25, name: 'CNY Period', emoji: '🧧', type: 'holiday', color: 'warning' },
  { month: 1, day: 10, name: 'CNY Mega Sale', emoji: '🧧', type: 'sale', color: 'shopee' },
  { month: 2, day: 8, name: 'Women\'s Day', emoji: '♀️', type: 'sale', color: 'hermes' },
  { month: 3, day: 4, name: 'Raya Open', emoji: '🌙', type: 'holiday', color: 'success' },
  { month: 4, day: 9, name: '9.9 Sale', emoji: '🛒', type: 'sale', color: 'shopee' },
  { month: 4, day: 12, name: 'Raya Aidilfitri', emoji: '🌙', type: 'holiday', color: 'success' },
  { month: 5, day: 10, name: '10.10 Sale', emoji: '🔟', type: 'sale', color: 'shopee' },
  { month: 9, day: 9, name: '9.9 Mega Sale', emoji: '🛒', type: 'sale', color: 'shopee' },
  { month: 9, day: 10, name: '10.10 Big Sale', emoji: '🔟', type: 'sale', color: 'shopee' },
  { month: 10, day: 11, name: '11.11 Big Sale', emoji: '🛍️', type: 'sale', color: 'shopee' },
  { month: 11, day: 12, name: '12.12 Year End', emoji: '🎄', type: 'sale', color: 'shopee' },
  { month: 11, day: 25, name: 'Christmas Sale', emoji: '🎅', type: 'sale', color: 'success' },
]

const postTypeMeta = {
  reel: { icon: Icons.Clapperboard, label: 'Reel', color: 'bg-hermes/15 text-hermes' },
  carousel: { icon: Icons.Images, label: 'Carousel', color: 'bg-shopee/15 text-shopee' },
  story: { icon: Icons.Circle, label: 'Story', color: 'bg-warning/15 text-warning' },
  live: { icon: Icons.Radio, label: 'Live', color: 'bg-destructive/15 text-destructive' },
  video: { icon: Icons.Video, label: 'Video', color: 'bg-success/15 text-success' },
}

const platformMeta = {
  IG: { color: 'text-pink-500' },
  TikTok: { color: 'text-foreground' },
  FB: { color: 'text-blue-600' },
  WA: { color: 'text-success' },
}

const products = [
  'Safi Balqis Sunblock',
  'RGB Mechanical Keyboard',
  'Tudung Bawal Premium',
  'Wardah Matte Lipstick',
  'Portable Blender',
  'Anker Power Bank',
  'Xiaomi Robot Vacuum',
  'Wireless Earbuds Pro',
]

function generateMonthPosts(year: number, month: number, daysInMonth: number): PlannedPost[] {
  const posts: PlannedPost[] = []
  const types: PlannedPost['type'][] = ['reel', 'carousel', 'story', 'live', 'video']
  const platforms: PlannedPost['platform'][] = ['IG', 'TikTok', 'FB', 'WA']
  const times = ['7:30PM', '8:00PM', '12:30PM', '9:00PM', '6:00PM']

  // Distribute ~14 posts across the month, biased toward sale days
  const targetDays = [3, 6, 9, 11, 14, 17, 19, 22, 24, 26, 28, 30]
  targetDays.forEach((day, i) => {
    if (day > daysInMonth) return
    posts.push({
      day,
      type: types[i % types.length],
      platform: platforms[i % platforms.length],
      product: products[i % products.length],
      time: times[i % times.length],
    })
  })
  return posts
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AiCalendarPage() {
  const today = new Date()
  const [year] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [posts, setPosts] = useState<PlannedPost[]>(() => {
    const days = new Date(year, today.getMonth() + 1, 0).getDate()
    return generateMonthPosts(year, today.getMonth(), days)
  })

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const monthEvents = calendarEvents.filter((e) => e.month === month)
  const eventByDay = new Map(monthEvents.map((e) => [e.day, e]))

  const postByDay = useMemo(() => {
    const map = new Map<number, PlannedPost>()
    posts.forEach((p) => {
      if (p.day <= daysInMonth) map.set(p.day, p)
    })
    return map
  }, [posts, daysInMonth])

  const autoGenerate = () => {
    setPosts(generateMonthPosts(year, month, daysInMonth))
    toast.success(`HERMES filled ${monthNames[month]} with ${posts.length || 12} AI suggestions! 📅`)
  }

  const navigateMonth = (delta: number) => {
    const newMonth = (month + delta + 12) % 12
    setMonth(newMonth)
    const newDays = new Date(year, newMonth + 1, 0).getDate()
    setPosts(generateMonthPosts(year, newMonth, newDays))
  }

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const upcomingPosts = posts
    .filter((p) => p.day >= today.getDate() || month !== today.getMonth())
    .slice(0, 8)

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Content Calendar"
        subtitle="Plan a full month of posts in one click. HERMES picks the best products, platforms & times."
        icon={Icons.CalendarDays}
        accent="hermes"
      >
        <Badge className="bg-hermes-gradient text-white">
          <Icons.Sparkles className="mr-1 size-3" /> AI Powered
        </Badge>
        <Button variant="outline" size="sm" onClick={() => toast.success('Calendar exported to iCal!')}>
          <Icons.Download className="mr-1 size-4" /> Export
        </Button>
        <Button size="sm" onClick={autoGenerate} className="bg-hermes-gradient hover:opacity-90">
          <Icons.Sparkles className="mr-1 size-4" /> Auto-Generate Month
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar grid */}
        <Card className="border-border/60">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="size-8" onClick={() => navigateMonth(-1)}>
                <Icons.ChevronLeft className="size-4" />
              </Button>
              <h3 className="text-sm font-semibold">{monthNames[month]} {year}</h3>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => navigateMonth(1)}>
                <Icons.ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px]">
                <span className="mr-1 size-1.5 rounded-full bg-shopee" /> Sale
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                <span className="mr-1 size-1.5 rounded-full bg-success" /> Holiday
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                <span className="mr-1 size-1.5 rounded-full bg-hermes" /> AI Post
              </Badge>
            </div>
          </div>
          <CardContent className="p-3">
            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-1.5">
              {weekdays.map((d) => (
                <div key={d} className="rounded-md bg-muted/50 py-1.5 text-center text-[10px] font-semibold uppercase text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div className="mt-1.5 grid grid-cols-7 gap-1.5">
              {cells.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} className="aspect-[4/5] rounded-lg bg-muted/20" />
                const event = eventByDay.get(day)
                const post = postByDay.get(day)
                const isToday = month === today.getMonth() && day === today.getDate()
                const postMeta = post ? postTypeMeta[post.type] : null
                const PlatIcon = post ? (post.platform === 'IG' ? Icons.Instagram : post.platform === 'TikTok' ? Icons.Music : post.platform === 'FB' ? Icons.Facebook : Icons.MessageCircle) : null

                return (
                  <TooltipProvider key={`day-${day}`} delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-lg border-2 p-1.5 transition-all hover:border-hermes/40 hover:shadow-sm',
                            isToday ? 'border-hermes bg-hermes/5' : 'border-border/60',
                            event?.color === 'shopee' && 'bg-shopee/5',
                            event?.color === 'success' && 'bg-success/5',
                            event?.color === 'warning' && 'bg-warning/5',
                            event?.color === 'hermes' && 'bg-hermes/5'
                          )}
                          onClick={() => post ? toast.info(`${post.product} · ${postMeta?.label} · ${post.platform} · ${post.time}`) : toast.info('No post scheduled — add one!')}
                        >
                          {/* Date */}
                          <div className="flex items-start justify-between">
                            <span className={cn(
                              'text-xs font-bold',
                              isToday && 'text-hermes'
                            )}>{day}</span>
                            {event && <span className="text-xs">{event.emoji}</span>}
                          </div>

                          {/* Event label */}
                          {event && (
                            <p className="mt-0.5 truncate text-[8px] font-medium text-muted-foreground">{event.name}</p>
                          )}

                          {/* Post preview */}
                          {post && postMeta && (
                            <div className="mt-1 space-y-1">
                              <div className={cn('inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[8px] font-medium', postMeta.color)}>
                                <postMeta.icon className="size-2.5" />
                                {postMeta.label}
                              </div>
                              <p className="truncate text-[8px] text-muted-foreground">{post.product}</p>
                              <div className="flex items-center justify-between">
                                {PlatIcon && <PlatIcon className={cn('size-2.5', platformMeta[post.platform].color)} />}
                                <span className="text-[8px] text-muted-foreground">{post.time}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-semibold">{monthNames[month]} {day}, {year}</p>
                          {event && <p className="text-shopee">{event.emoji} {event.name}</p>}
                          {post ? (
                            <>
                              <p className="mt-1">{postMeta?.label} · {post.platform}</p>
                              <p className="text-muted-foreground">{post.product}</p>
                              <p className="text-muted-foreground">{post.time} MYT</p>
                            </>
                          ) : (
                            <p className="mt-1 text-muted-foreground">No post scheduled</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
              <span>Post types:</span>
              {Object.entries(postTypeMeta).map(([k, m]) => (
                <span key={k} className="flex items-center gap-0.5">
                  <span className={cn('size-2 rounded', m.color)} />
                  {m.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <SectionCard
            title="Upcoming Posts"
            description={`Next ${upcomingPosts.length} scheduled`}
            icon={Icons.CalendarClock}
          >
            <ScrollArea className="max-h-[420px]">
              <div className="space-y-2">
                {upcomingPosts.map((p, i) => {
                  const meta = postTypeMeta[p.type]
                  const Icon = meta.icon
                  return (
                    <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border/60 p-2.5 hover:bg-accent/40">
                      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', meta.color)}>
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-xs font-semibold">{p.product}</p>
                          <Badge variant="outline" className="text-[9px]">{p.platform}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Day {p.day} · {p.time} MYT · {meta.label}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {upcomingPosts.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-foreground">No upcoming posts</p>
                )}
              </div>
            </ScrollArea>
          </SectionCard>

          <SectionCard
            title="Key Events"
            description="Malaysian sales & holidays"
            icon={Icons.Star}
          >
            <div className="space-y-1.5">
              {calendarEvents
                .filter((e) => e.month === month || e.type === 'sale')
                .slice(0, 8)
                .map((e, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-accent/40">
                    <span className="text-lg">{e.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{e.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {monthNames[e.month]} {e.day}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn(
                      'text-[9px]',
                      e.type === 'sale' && 'bg-shopee/5 text-shopee',
                      e.type === 'holiday' && 'bg-success/5 text-success'
                    )}>
                      {e.type}
                    </Badge>
                  </div>
                ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
