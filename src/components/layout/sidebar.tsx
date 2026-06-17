'use client'

import { useState, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { navItems } from '@/lib/demo-data'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import type { PageId, PageCategory } from '@/lib/types'

const categoryLabels: Record<Exclude<PageCategory, 'pinned'>, string> = {
  core: 'CORE',
  ai: 'AI POWERED',
  platforms: 'PLATFORMS',
  advanced: 'ADVANCED',
  growth: 'GROWTH',
}

const categoryOrder: Exclude<PageCategory, 'pinned'>[] = ['core', 'ai', 'platforms', 'advanced', 'growth']

export function Sidebar() {
  const { activePage, setActivePage, sidebarCollapsed, toggleSidebar, pinnedPages, togglePin } = useAppStore()
  const [search, setSearch] = useState('')
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set())

  const filteredItems = useMemo(() => {
    if (!search) return navItems
    return navItems.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const pinned = pinnedPages
    .map((id) => navItems.find((i) => i.id === id))
    .filter((i): i is NonNullable<typeof i> => i !== undefined)
    .filter((i) => (search ? i.label.toLowerCase().includes(search.toLowerCase()) : true))

  const toggleCat = (cat: string) =>
    setCollapsedCats((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })

  const renderItem = (item: NonNullable<typeof navItems[number]>) => {
    const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[item.icon] ?? Icons.Circle
    const isActive = activePage === item.id
    const isPinned = pinnedPages.includes(item.id)

    if (sidebarCollapsed) {
      return (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setActivePage(item.id)}
              className={cn(
                'relative flex h-10 w-full items-center justify-center rounded-lg transition-all hover:translate-x-0.5',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="size-5" />
              {item.badge && (
                <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-shopee" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      )
    }

    return (
      <div key={item.id} className="group relative">
        <button
          onClick={() => setActivePage(item.id)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:translate-x-0.5',
            isActive
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
          {/* Active indicator bar — gradient strip on the left edge */}
          {isActive && (
            <span
              className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-shopee to-hermes"
              aria-hidden="true"
            />
          )}
          <Icon className="size-4 shrink-0" />
          <span className="flex-1 text-left truncate">{item.label}</span>
          {item.badge && (
            <Badge
              variant="secondary"
              className={cn(
                'h-5 px-1.5 text-[10px] font-semibold',
                item.badge === 'AI' && 'bg-hermes/15 text-hermes',
                item.badge === 'New' && 'bg-success/15 text-success',
                item.badge === 'PRO' && 'bg-shopee/15 text-shopee',
                item.badge === 'ENT' && 'bg-warning/15 text-warning',
                item.badge === 'API' && 'bg-muted text-muted-foreground',
                item.badge === '80%' && 'bg-shopee/15 text-shopee',
              )}
            >
              {item.badge}
            </Badge>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            togglePin(item.id)
          }}
          className={cn(
            'absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 transition-opacity hover:bg-sidebar-accent/60',
            'group-hover:opacity-100',
            isPinned && 'opacity-100'
          )}
          title={isPinned ? 'Unpin' : 'Pin'}
        >
          {isPinned ? (
            <Icons.PinOff className="size-3 text-muted-foreground" />
          ) : (
            <Icons.Pin className="size-3 text-muted-foreground" />
          )}
        </button>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-full flex-col">
        {/* Logo — gradient bottom border + subtle glow on hover */}
        <div className="group relative flex h-16 items-center gap-2 border-b px-4">
          {/* Gradient bottom border — decorative strip under the logo */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-shopee to-transparent opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true" />
          {/* Soft glow on hover */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-hover:shadow-[inset_0_0_24px_rgba(238,77,45,0.12)]" aria-hidden="true" />
          {sidebarCollapsed ? (
            <Logo size="sm" showText={false} className="relative" />
          ) : (
            <div className="relative flex min-w-0 flex-col gap-0.5">
              <Logo size="sm" />
              <p className="truncate pl-1 text-[10px] text-muted-foreground">Affiliate Manager Pro</p>
            </div>
          )}
        </div>

        {/* Search — focus glow + animated icon */}
        {!sidebarCollapsed && (
          <div className="p-3">
            <div className="group relative">
              <Icons.Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-all group-focus-within:left-2.5 group-focus-within:text-shopee group-focus-within:scale-110" />
              <Input
                placeholder="Search sidebar pages"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 text-sm transition-shadow focus-visible:glow-shopee focus-visible:border-shopee/40"
              />
            </div>
          </div>
        )}

        {/* Nav items */}
        <ScrollArea className="scrollbar-glow flex-1 px-2">
          <div className="space-y-1 pb-4">
            {/* Pinned */}
            {pinned.length > 0 && !sidebarCollapsed && (
              <div className="mb-2">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Pinned <span className="text-gradient-shopee">({pinned.length})</span>
                </p>
                {pinned.map(renderItem)}
              </div>
            )}

            {/* Categories */}
            {categoryOrder.map((cat) => {
              const items = filteredItems.filter((i) => i.category === cat)
              if (items.length === 0) return null
              const isCollapsed = collapsedCats.has(cat)

              if (sidebarCollapsed) {
                return (
                  <div key={cat} className="space-y-1">
                    {items.map(renderItem)}
                  </div>
                )
              }

              return (
                <div key={cat} className="mb-2">
                  <button
                    onClick={() => toggleCat(cat)}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {/* Gradient category header */}
                    <span className="text-gradient">{categoryLabels[cat]}</span>
                    <span className="flex items-center gap-1">
                      {/* Count badge with subtle pulse on hover */}
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground transition-all hover:bg-shopee/15 hover:text-shopee hover:animate-pulse">
                        {items.length}
                      </span>
                      <Icons.ChevronDown
                        className={cn('size-3 transition-transform duration-200', isCollapsed && '-rotate-90')}
                      />
                    </span>
                  </button>
                  {!isCollapsed && <div className="space-y-0.5">{items.map(renderItem)}</div>}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Collapse toggle — rotates on hover, gradient bg when expanded */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="group w-full justify-start gap-2 text-muted-foreground transition-all hover:bg-gradient-to-r hover:from-shopee/10 hover:to-hermes/10 hover:text-foreground"
          >
            {sidebarCollapsed ? (
              <Icons.ChevronRight className="size-4 transition-transform duration-300 group-hover:rotate-180" />
            ) : (
              <>
                <Icons.ChevronLeft className="size-4 transition-transform duration-300 group-hover:-rotate-180" />
                <span>Collapse sidebar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
