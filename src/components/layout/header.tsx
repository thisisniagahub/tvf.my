'use client'

import { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAppStore } from '@/store/app-store'
import { navItems } from '@/lib/demo-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { demoNotifications } from '@/lib/demo-data'
import { useLiveNotifications } from '@/hooks/use-live-notifications'

export function Header() {
  const { activePage, user, logout, setActivePage, setCommandPaletteOpen } = useAppStore()
  const { theme, setTheme } = useTheme()
  const { connected, simulated, events: liveEvents, unreadCount: liveUnread, markAllRead } = useLiveNotifications(true)
  const [search, setSearch] = useState('')
  const [showHint, setShowHint] = useState(true)

  const currentItem = navItems.find((i) => i.id === activePage)
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const unreadCount = demoNotifications.filter((n) => !n.read).length + liveUnread

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) return
    const found = navItems.find((i) =>
      i.label.toLowerCase().includes(search.toLowerCase())
    )
    if (found) {
      setActivePage(found.id)
      toast.success(`Navigated to ${found.label}`)
    } else {
      toast.error(`No page found for "${search}"`)
    }
    setSearch('')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      {/* Page title */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="truncate text-lg font-bold md:text-xl">
          {currentItem?.label ?? 'Dashboard'}
        </h1>
        {user && (
          <Badge variant="outline" className="hidden sm:inline-flex bg-shopee/5 text-shopee border-shopee/20">
            {user.plan.toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="ml-auto hidden md:block w-full max-w-xs">
        <div className="relative">
          <Icons.Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search links, products, campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
      </form>

      {/* Real-time status */}
      <div className="ml-auto md:ml-0 flex items-center gap-1">
        <div className={cn('relative flex items-center gap-1.5 rounded-full px-2.5 py-1', connected ? (simulated ? 'bg-hermes/10' : 'bg-success/10') : 'bg-muted')}>
          <span className="relative flex size-2">
            {connected && (
              <span className={cn('pulse-ring absolute inline-flex size-2 rounded-full', simulated ? 'text-hermes/60' : 'text-success/60')} />
            )}
            <span className={cn('relative inline-flex size-2 rounded-full', connected ? (simulated ? 'bg-hermes' : 'bg-success') : 'bg-muted-foreground')} />
          </span>
          <span className={cn('hidden lg:inline text-[11px] font-medium', connected ? (simulated ? 'text-hermes' : 'text-success') : 'text-muted-foreground')}>
            {connected ? (simulated ? 'Live (simulated)' : 'Real-time connected') : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Notifications */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" title="View notifications">
            <Icons.Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-shopee text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between border-b p-3">
            <p className="text-sm font-semibold">Notifications</p>
            <div className="flex items-center gap-1.5">
              {liveUnread > 0 && (
                <Badge className="text-[10px] bg-shopee/15 text-shopee">
                  <span className="relative mr-0.5 flex size-1.5">
                    <span className="pulse-ring absolute inline-flex size-1.5 rounded-full text-shopee/60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-shopee" />
                  </span>
                  {liveUnread} live
                </Badge>
              )}
              <Badge variant="secondary" className="text-[10px]">{unreadCount} new</Badge>
            </div>
          </div>
          <ScrollArea className="max-h-80">
            <div className="divide-y">
              {/* Live events first */}
              {liveEvents.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className="flex gap-3 bg-shopee/[0.04] p-3 hover:bg-accent/50 cursor-pointer animate-fade-in-up"
                >
                  <div className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full',
                    n.type === 'sale' && 'bg-success/15 text-success',
                    n.type === 'trend' && 'bg-hermes/15 text-hermes',
                    n.type === 'xtra' && 'bg-shopee/15 text-shopee',
                    n.type === 'info' && 'bg-muted text-muted-foreground',
                  )}>
                    {n.type === 'sale' && <Icons.DollarSign className="size-4" />}
                    {n.type === 'trend' && <Icons.TrendingUp className="size-4" />}
                    {n.type === 'xtra' && <Icons.Star className="size-4" />}
                    {n.type === 'info' && <Icons.Info className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="mt-0.5 text-[10px] text-shopee font-medium">just now • live</p>
                  </div>
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-shopee animate-pulse" />
                </div>
              ))}
              {/* Then demo notifications */}
              {demoNotifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex gap-3 p-3 hover:bg-accent/50 cursor-pointer',
                    !n.read && 'bg-shopee/[0.03]'
                  )}
                >
                  <div className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full',
                    n.type === 'sale' && 'bg-success/15 text-success',
                    n.type === 'trend' && 'bg-hermes/15 text-hermes',
                    n.type === 'achievement' && 'bg-warning/15 text-warning',
                    n.type === 'alert' && 'bg-shopee/15 text-shopee',
                    n.type === 'info' && 'bg-muted text-muted-foreground',
                  )}>
                    {n.type === 'sale' && <Icons.DollarSign className="size-4" />}
                    {n.type === 'trend' && <Icons.TrendingUp className="size-4" />}
                    {n.type === 'achievement' && <Icons.Trophy className="size-4" />}
                    {n.type === 'alert' && <Icons.BellRing className="size-4" />}
                    {n.type === 'info' && <Icons.Info className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{n.timestamp}</p>
                  </div>
                  {!n.read && <span className="mt-1 size-2 shrink-0 rounded-full bg-shopee" />}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setActivePage('notifications')}
            >
              View all notifications
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title="Toggle dark mode"
      >
        {theme === 'dark' ? <Icons.Sun className="size-5" /> : <Icons.Moon className="size-5" />}
      </Button>

      {/* Keyboard shortcuts */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        title="Keyboard shortcuts (Shift+/)"
        onClick={() => setCommandPaletteOpen(true)}
      >
        <Icons.Keyboard className="size-5" />
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-shopee-gradient text-white text-xs font-bold">
                {user?.name?.slice(0, 2).toUpperCase() ?? 'TV'}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:inline text-sm font-medium">{user?.name}</span>
            <Icons.ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActivePage('settings')}>
            <Icons.Settings className="mr-2 size-4" /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActivePage('api-keys')}>
            <Icons.KeyRound className="mr-2 size-4" /> API Keys
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActivePage('referrals')}>
            <Icons.Gift className="mr-2 size-4" /> Refer & Earn
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => {
              logout()
              toast.success('Signed out successfully')
            }}
          >
            <Icons.LogOut className="mr-2 size-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
