'use client'

import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { navItems } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import type { PageId } from '@/lib/types'

const mobileNavIds: PageId[] = [
  'dashboard',
  'products',
  'links',
  'analytics',
  'hermes-hub',
]

export function MobileNav() {
  const { activePage, setActivePage } = useAppStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t bg-background/95 px-2 py-1.5 backdrop-blur-md md:hidden">
      {mobileNavIds.map((id) => {
        const item = navItems.find((i) => i.id === id)!
        const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[item.icon] ?? Icons.Circle
        const isActive = activePage === id
        const isHermes = id === 'hermes-hub'
        return (
          <button
            key={id}
            onClick={() => setActivePage(id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className={cn(
              'flex size-7 items-center justify-center rounded-lg transition-colors',
              isActive && 'bg-primary/10',
              isHermes && !isActive && 'bg-hermes/10 text-hermes'
            )}>
              <Icon className="size-4" />
            </div>
            <span className="truncate">{item.label.split(' ')[0]}</span>
          </button>
        )
      })}
    </nav>
  )
}
