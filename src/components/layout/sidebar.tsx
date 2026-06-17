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
                'relative flex h-10 w-full items-center justify-center rounded-lg transition-all',
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
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
            isActive
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
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
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-shopee-gradient text-white shadow-sm">
            <Icons.ShoppingBag className="size-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">
                TheViral<span className="text-shopee">FindsMY</span>
              </p>
              <p className="truncate text-[10px] text-muted-foreground">Affiliate Manager Pro</p>
            </div>
          )}
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="p-3">
            <div className="relative">
              <Icons.Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sidebar pages"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
          </div>
        )}

        {/* Nav items */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {/* Pinned */}
            {pinned.length > 0 && !sidebarCollapsed && (
              <div className="mb-2">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Pinned ({pinned.length})
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
                    className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    <span>{categoryLabels[cat]} ({items.length})</span>
                    <Icons.ChevronDown
                      className={cn('size-3 transition-transform', isCollapsed && '-rotate-90')}
                    />
                  </button>
                  {!isCollapsed && <div className="space-y-0.5">{items.map(renderItem)}</div>}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Collapse toggle */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            {sidebarCollapsed ? (
              <Icons.ChevronRight className="size-4" />
            ) : (
              <>
                <Icons.ChevronLeft className="size-4" />
                <span>Collapse sidebar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
