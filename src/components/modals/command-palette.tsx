'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
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
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import type { PageCategory, PageId, SearchResultItem } from '@/lib/types'

/**
 * A single row rendered inside the command palette. The palette merges pages,
 * quick actions, and global content search results into one heterogeneous list,
 * so all optional fields are tolerated. The discriminated `type` field drives
 * the icon background and selection behaviour.
 */
type CommandPaletteItem = {
  type: 'page' | 'action' | 'content'
  id: string
  label: string
  desc: string
  icon: Icons.LucideIcon
  badge?: string
  page?: PageId
  recent?: boolean
  frequent?: boolean
  contentType?: string
  category?: string
}

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
  const { commandPaletteOpen, setCommandPaletteOpen, setActivePage, recentPages, pageVisitCounts, clearRecentPages } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [query, setQueryState] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const setQuery = useCallback((q: string) => {
    setQueryState(q)
    setActiveIndex(0)
  }, [])

  // Keyboard shortcut: Cmd+K / Ctrl+K to open
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

  // Focus input when palette opens
  useEffect(() => {
    if (commandPaletteOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [commandPaletteOpen])

  const handleOpenChange = useCallback((open: boolean) => {
    setCommandPaletteOpen(open)
    if (!open) {
      setQueryState('')
      setActiveIndex(0)
    }
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

  // Global content search (products, links, campaigns) — debounced
  const [contentResults, setContentResults] = useState<SearchResultItem[]>([])
  const [searchingContent, setSearchingContent] = useState(false)

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setContentResults([])
      return
    }
    setSearchingContent(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setContentResults(data.results || [])
        }
      } catch {
        setContentResults([])
      } finally {
        setSearchingContent(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const handleSelect = useCallback((item: CommandPaletteItem) => {
    if (item.type === 'page') {
      if (item.page) setActivePage(item.page)
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
  }, [setActivePage, setCommandPaletteOpen, setTheme, theme])

  const recentItems = useMemo(() => recentPages
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
    })), [recentPages])

  // Frequently visited pages — sorted by visit count (excluding dashboard which is always #1)
  const frequentItems = useMemo(() => {
    const entries = Object.entries(pageVisitCounts)
      .filter(([id, count]) => id !== 'dashboard' && count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
    return entries
      .map(([pageId, count]) => {
        const item = navItems.find((i) => i.id === pageId)
        if (!item) return null
        return {
          type: 'page' as const,
          id: item.id,
          label: item.label,
          desc: `${count} visits`,
          icon: (Icons as unknown as Record<string, Icons.LucideIcon>)[item.icon] ?? Icons.Circle,
          badge: item.badge,
          page: item.id,
          frequent: true,
        }
      })
      .filter((i): i is NonNullable<typeof i> => i !== null)
  }, [pageVisitCounts])

  const allItems = useMemo(() => [
    ...frequentItems,
    ...recentItems,
    ...quickActions.map((a) => ({ type: 'action' as const, ...a })),
  ], [frequentItems, recentItems])

  // Map content results to display items with proper icons
  const contentItems = contentResults.map((r) => ({
    type: 'content' as const,
    id: r.id,
    label: r.label,
    desc: r.desc,
    icon: r.icon === 'Package' ? Icons.Package : r.icon === 'Link' ? Icons.Link : Icons.Megaphone,
    badge: r.badge,
    page: r.page,
    contentType: r.type,
  }))

  const displayItems = results ? [...results, ...contentItems] : allItems

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, displayItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (displayItems[activeIndex]) {
        handleSelect(displayItems[activeIndex])
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      setActiveIndex((prev) => {
        if (e.shiftKey) return prev <= 0 ? displayItems.length - 1 : prev - 1
        return prev >= displayItems.length - 1 ? 0 : prev + 1
      })
    }
  }, [displayItems, activeIndex, handleSelect])

  // Scroll active item into view
  useEffect(() => {
    const container = listRef.current
    if (!container) return
    const activeEl = container.querySelector(`[data-idx="${activeIndex}"]`) as HTMLElement | null
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [activeIndex])

  const handleClearRecent = () => {
    clearRecentPages()
    toast.success('Recent history cleared')
  }

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="top-[15%] max-w-xl translate-y-0 gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>Search pages and actions quickly</DialogDescription>
        </DialogHeader>
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4">
          <Icons.Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            placeholder="Search pages, actions, or type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline">
            ESC
          </kbd>
        </div>
        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto scrollbar-thin">
          {/* Frequently Visited header */}
          {!results && frequentItems.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Icons.Flame className="size-3 text-shopee" /> Frequently Visited
              </p>
            </div>
          )}
          {/* Recently Visited header with clear button */}
          {!results && recentItems.length > 0 && (
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Icons.History className="size-3" /> Recently Visited
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-destructive"
                onClick={handleClearRecent}
                title="Clear recent history"
              >
                <Icons.X className="mr-0.5 size-3" /> Clear
              </Button>
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
          {results && contentItems.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Icons.Database className="size-3 text-hermes" /> Content
                <span className="font-normal text-muted-foreground/60">({contentItems.length})</span>
              </p>
            </div>
          )}
          {searchingContent && (
            <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
              <Icons.Loader2 className="size-3 animate-spin" />
              Searching content...
            </div>
          )}
          <div className="p-2">
            {displayItems.length === 0 && query && !searchingContent && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Icons.SearchX className="size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium">No results for &quot;{query}&quot;</p>
                <p className="text-xs text-muted-foreground">Try a different search term</p>
              </div>
            )}
            {displayItems.map((item: CommandPaletteItem, idx: number) => {
              const isActive = idx === activeIndex
              const isRecent = item.recent && !results
              const isFrequent = item.frequent && !results
              const isContent = item.type === 'content'
              const isFirstContent = isContent && (idx === 0 || displayItems[idx - 1]?.type !== 'content')
              // Find boundaries between sections for visual separators
              const isLastFrequent = isFrequent && (idx === frequentItems.length - 1)
              const isLastRecent = isRecent && (idx === frequentItems.length + recentItems.length - 1)
              // First frequent item (after frequent header)
              const isFirstFrequent = isFrequent && idx === 0
              // First recent item (after frequent section)
              const isFirstRecent = isRecent && (idx === frequentItems.length)
              return (
                <div key={`${item.type}-${item.id}-${item.frequent ? 'freq' : item.recent ? 'recent' : 'item'}-${idx}`}>
                  {isFirstFrequent && frequentItems.length > 0 && idx > 0 && (
                    <div className="my-1 border-t" />
                  )}
                  {isFirstRecent && frequentItems.length > 0 && (
                    <div className="my-1 border-t" />
                  )}
                  {isLastFrequent && frequentItems.length > 0 && (
                    <div className="my-1 border-t" />
                  )}
                  {isFirstContent && results && results.length > 0 && (
                    <div className="my-1 border-t" />
                  )}
                  {isFirstContent && results && results.length === 0 && idx > 0 && (
                    <div className="my-1 border-t" />
                  )}
                  <button
                    data-idx={idx}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                      isActive ? 'bg-accent ring-1 ring-shopee/30' : 'hover:bg-accent/50'
                    )}
                  >
                    <div className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg transition-transform',
                      item.type === 'action' ? 'bg-hermes/10 text-hermes' :
                      item.type === 'content' ? 'bg-shopee/10 text-shopee' :
                      'bg-muted text-muted-foreground',
                      isActive && 'scale-110'
                    )}>
                      <item.icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('truncate text-sm font-medium', isActive && 'text-shopee')}>{item.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">{item.badge}</Badge>
                    )}
                    {isActive && item.type === 'page' && (
                      <Icons.ArrowRight className="size-3.5 shrink-0 text-shopee" />
                    )}
                  </button>
                  {isLastRecent && <div className="my-1 border-t" />}
                </div>
              )
            })}
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
            <span className="hidden items-center gap-1 sm:flex">
              <kbd className="rounded border bg-muted px-1 py-0.5 font-semibold">Tab</kbd> Cycle
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
