'use client'

import { useState, useEffect, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { navItems } from '@/lib/demo-data'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import type { PageCategory } from '@/lib/types'

const categoryLabels: Record<Exclude<PageCategory, 'pinned'>, string> = {
  core: 'Core',
  ai: 'AI Powered',
  platforms: 'Platforms',
  advanced: 'Advanced',
  growth: 'Growth',
}

const quickActions = [
  { id: 'toggle-theme', label: 'Toggle dark mode', icon: Icons.Moon, desc: 'Switch between light and dark', category: 'Action' },
  { id: 'create-link', label: 'Create new affiliate link', icon: Icons.Link, desc: 'Generate a new Shopee affiliate link', category: 'Action', page: 'links' as const },
  { id: 'new-campaign', label: 'Start a campaign', icon: Icons.Megaphone, desc: 'Launch a new affiliate campaign', category: 'Action', page: 'campaigns' as const },
  { id: 'ask-hermes', label: 'Ask HERMES AI', icon: Icons.Bot, desc: 'Open the HERMES AI chat assistant', category: 'Action', page: 'hermes-hub' as const },
  { id: 'find-trends', label: 'Find trending products', icon: Icons.Radar, desc: 'Open Trend Spy', category: 'Action', page: 'trend-spy' as const },
  { id: 'gen-content', label: 'Generate AI content', icon: Icons.Sparkles, desc: 'Open Content Studio', category: 'Action', page: 'content-studio' as const },
]

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setActivePage, recentPages } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [query, setQuery] = useState('')

  // Keyboard shortcut: Cmd+K / Ctrl+K to open, Escape handled by Dialog
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCommandPaletteOpen])

  const results = useMemo(() => {
    if (!query.trim()) return null
    const q = query.toLowerCase()
    const pageMatches = navItems
      .filter((item) => item.label.toLowerCase().includes(q))
      .slice(0, 8)
      .map((item) => ({
        type: 'page' as const,
        id: item.id,
        label: item.label,
        desc: categoryLabels[item.category as Exclude<PageCategory, 'pinned'>] ?? item.category,
        icon: (Icons as unknown as Record<string, Icons.LucideIcon>)[item.icon] ?? Icons.Circle,
        badge: item.badge,
        page: item.id,
      }))
    const actionMatches = quickActions
      .filter((a) => a.label.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q))
      .slice(0, 4)
      .map((a) => ({ type: 'action' as const, ...a }))
    return [...pageMatches, ...actionMatches]
  }, [query])

  const handleSelect = (item: any) => {
    if (item.type === 'page') {
      setActivePage(item.page)
      toast.success(`Navigated to ${item.label}`)
    } else if (item.id === 'toggle-theme') {
      setTheme(theme === 'dark' ? 'light' : 'dark')
      toast.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`)
    } else if (item.page) {
      setActivePage(item.page)
      toast.success(`Opening ${item.label}...`)
    }
    setCommandPaletteOpen(false)
    setQuery('')
  }

  const recentItems = recentPages
    .map((pageId) => navItems.find((i) => i.id === pageId))
    .filter((i): i is NonNullable<typeof i> => i !== undefined)
    .slice(0, 5)
    .map((item) => ({
      type: 'page' as const,
      id: item.id,
      label: item.label,
      desc: 'Recently visited',
      icon: (Icons as unknown as Record<string, Icons.LucideIcon>)[item.icon] ?? Icons.Circle,
      badge: item.badge,
      page: item.id,
      recent: true,
    }))

  const allItems = [
    ...recentItems,
    ...quickActions.map((a) => ({ type: 'action' as const, ...a })),
  ]

  const displayItems = results ?? allItems

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={(o) => { setCommandPaletteOpen(o); if (!o) setQuery('') }}>
      <DialogContent className="top-[20%] max-w-xl translate-y-0 gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>Search pages and actions quickly</DialogDescription>
        </DialogHeader>
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4">
          <Icons.Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            placeholder="Search pages, actions, or type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && displayItems[0]) {
                handleSelect(displayItems[0])
              }
            }}
          />
          <kbd className="hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline">
            ESC
          </kbd>
        </div>
        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
          {!results && recentItems.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Icons.History className="size-3" /> Recently Visited
              </p>
            </div>
          )}
          {!results && recentItems.length === 0 && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </p>
            </div>
          )}
          {!results && recentItems.length > 0 && quickActions.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Icons.Zap className="size-3 text-shopee" /> Quick Actions
              </p>
            </div>
          )}
          <div className="p-2">
            {displayItems.length === 0 && query && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Icons.SearchX className="size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium">No results for &quot;{query}&quot;</p>
                <p className="text-xs text-muted-foreground">Try a different search term</p>
              </div>
            )}
            {displayItems.map((item: any) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                <div className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  item.type === 'action' ? 'bg-hermes/10 text-hermes' : 'bg-muted text-muted-foreground'
                )}>
                  <item.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.desc}</p>
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="shrink-0 text-[10px]">{item.badge}</Badge>
                )}
                {item.type === 'page' && (
                  <Icons.ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </button>
            ))}
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5 font-semibold">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5 font-semibold">↵</kbd> Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Icons.Zap className="size-3 text-shopee" /> TheViralFindsMY
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
