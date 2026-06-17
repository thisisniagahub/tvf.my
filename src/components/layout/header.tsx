'use client'

import { useState, useEffect, useRef } from 'react'
import * as Icons from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const { activePage, user, logout, setActivePage, setCommandPaletteOpen, setChangelogOpen, hasSeenChangelog, liveNotificationsEnabled, notificationSoundEnabled, focusMode, toggleFocusMode, setShortcutsOpen } = useAppStore()
  const { theme, setTheme } = useTheme()
  const { connected, simulated, events: liveEvents, unreadCount: liveUnread, markAllRead } = useLiveNotifications(liveNotificationsEnabled, notificationSoundEnabled)
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const searchInputRef = useRef<HTMLInputElement>(null)
  // Bell-wiggle state — uses the documented "adjusting state during render"
  // pattern. prevUnread stores the previous unread count so we can detect
  // increases; bellKey bumps to force a remount of the bell wrapper (which
  // replays the CSS animation class).
  const [prevUnread, setPrevUnread] = useState(0)
  const [bellKey, setBellKey] = useState(0)

  // "/" keyboard shortcut to focus the header search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement
        // Skip if already typing in an input/textarea/contenteditable
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable ||
            target.getAttribute('role') === 'textbox')
        ) {
          return
        }
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const currentItem = navItems.find((i) => i.id === activePage)
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const unreadCount = demoNotifications.filter((n) => !n.read).length + liveUnread

  // Replay the bell-wiggle animation when unreadCount increases.
  // This is the documented "adjusting state during render" pattern from
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  // Calling setState during render (only for the same component, only to
  // synchronise with a derived value) is allowed by React and avoids the
  // cascading-render warning that an effect would trigger.
  if (unreadCount > prevUnread) {
    setPrevUnread(unreadCount)
    setBellKey((k) => k + 1)
  }

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
      {/* Breadcrumb / page title */}
      <div className="flex flex-col gap-0 min-w-0">
        <nav className="flex items-center gap-1 text-[10px] text-muted-foreground" aria-label="Breadcrumb">
          <button
            onClick={() => setActivePage('dashboard')}
            className="transition-colors hover:text-shopee"
          >
            Home
          </button>
          {currentItem && (
            <>
              {/* Separator fade-in animation */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground/50"
              >
                <Icons.ChevronRight className="size-3" />
              </motion.span>
              <span className="text-muted-foreground/80 capitalize transition-colors hover:text-shopee cursor-default">{currentItem.category}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground/50"
              >
                <Icons.ChevronRight className="size-3" />
              </motion.span>
              <span className="font-medium text-foreground truncate max-w-[140px] sm:max-w-[200px]">
                {currentItem.label}
              </span>
            </>
          )}
          {currentItem?.badge && (
            <Badge variant="secondary" className="ml-1 h-3.5 px-1 text-[9px]">{currentItem.badge}</Badge>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <h1 className="truncate text-base font-bold md:text-lg">
            {currentItem?.label ?? 'Dashboard'}
          </h1>
          {user && (
            <Badge variant="outline" className="hidden sm:inline-flex bg-shopee/5 text-shopee border-shopee/20 text-[10px]">
              {user.plan.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>

      {/* Search — focus expands the input width + fades the keyboard hint */}
      <form onSubmit={handleSearch} className="ml-auto hidden md:block">
        <div className="relative transition-all duration-300" style={{ width: searchFocused ? 360 : 280 }}>
          <Icons.Search className={`absolute left-2.5 top-1/2 size-4 -translate-y-1/2 transition-colors ${searchFocused ? 'text-shopee' : 'text-muted-foreground'}`} />
          <Input
            ref={searchInputRef}
            placeholder="Search links, products, campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="h-9 pl-8 pr-10 transition-shadow focus-visible:glow-shopee focus-visible:border-shopee/40"
          />
          {/* Keyboard shortcut hint — fades out when focused */}
          <AnimatePresence>
            {!searchFocused && showHint && (
              <motion.kbd
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1 py-0.5 text-[10px] font-semibold text-muted-foreground"
              >
                /
              </motion.kbd>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Real-time status — pulsing ring + gradient bg */}
      <div className="ml-auto md:ml-0 flex items-center gap-1">
        <div className={cn(
          'relative flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all',
          connected
            ? (simulated
                ? 'bg-gradient-to-r from-hermes/10 to-hermes/5 shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                : 'bg-gradient-to-r from-success/10 to-success/5 shadow-[0_0_12px_rgba(34,197,94,0.25)]')
            : 'bg-muted',
        )}>
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

      {/* Notifications — bell wiggles when a new event arrives */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" title="View notifications">
            {/* key={bellKey} forces a remount → replays the bell-wiggle animation
                whenever a new notification arrives. The class is only applied
                after the first unread bump (bellKey > 0). */}
            <span key={bellKey} className={cn('inline-flex', bellKey > 0 && 'animate-bell-wiggle')}>
              <Icons.Bell className="size-5" />
            </span>
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-shopee-gradient text-[9px] font-bold text-white shadow-[0_0_10px_rgba(238,77,45,0.5)]">
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

      {/* Theme toggle — rotating sun/moon + glow on hover */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title="Toggle dark mode"
        className="group transition-shadow hover:glow-hermes"
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'dark' ? (
            <motion.span
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
              className="inline-flex"
            >
              <Icons.Sun className="size-5" />
            </motion.span>
          ) : (
            <motion.span
              key="moon"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
              className="inline-flex"
            >
              <Icons.Moon className="size-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Focus Mode toggle — pulse + gradient bg when active */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'relative hidden md:inline-flex transition-all',
          focusMode && 'bg-gradient-to-br from-hermes/15 to-shopee/10 text-hermes shadow-[0_0_18px_rgba(139,92,246,0.35)]',
        )}
        title="Focus Mode (F) — hide sidebar & notifications"
        onClick={() => {
          toggleFocusMode()
          toast.success(focusMode ? 'Focus mode off' : 'Focus mode on', {
            description: focusMode ? 'Sidebar restored' : 'Sidebar hidden — distraction-free work',
            duration: 2000,
          })
        }}
      >
        <motion.span
          animate={focusMode ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 1.6, repeat: focusMode ? Infinity : 0, ease: 'easeInOut' }}
          className="inline-flex"
        >
          <Icons.Focus className="size-5" />
        </motion.span>
      </Button>

      {/* What's New / Changelog */}
      <Button
        variant="ghost"
        size="icon"
        className="relative hidden md:inline-flex"
        title="What's New"
        onClick={() => setChangelogOpen(true)}
      >
        <Icons.Gift className="size-5" />
        {!hasSeenChangelog && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-shopee px-1 text-[9px] font-bold text-white shadow-sm">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-shopee/60" />
            <span className="relative">5</span>
          </span>
        )}
      </Button>

      {/* Keyboard shortcuts cheat sheet */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        title="Keyboard shortcuts (?)"
        onClick={() => setShortcutsOpen(true)}
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
