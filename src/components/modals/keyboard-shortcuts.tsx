'use client'

import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const shortcuts = [
  {
    category: 'NAVIGATION (PRESS G, THEN A KEY)',
    items: [
      { keys: ['G', 'D'], label: 'Go to Dashboard' },
      { keys: ['G', 'P'], label: 'Go to Products' },
      { keys: ['G', 'L'], label: 'Go to Links' },
      { keys: ['G', 'A'], label: 'Go to Analytics' },
      { keys: ['G', 'E'], label: 'Go to Earnings' },
    ],
  },
  {
    category: 'ACTIONS',
    items: [
      { keys: ['⌘', 'K'], label: 'Open command palette' },
      { keys: ['⌘', 'N'], label: 'Create new link' },
      { keys: ['⌘', 'B'], label: 'Toggle sidebar' },
      { keys: ['⌘', 'J'], label: 'Toggle dark mode' },
    ],
  },
  {
    category: 'SEARCH',
    items: [
      { keys: ['/'], label: 'Focus search' },
      { keys: ['Esc'], label: 'Close dialog / Clear' },
    ],
  },
]

export function KeyboardShortcutsModal() {
  const { hasSeenShortcuts, completeShortcuts } = useAppStore()

  return (
    <Dialog open={!hasSeenShortcuts} onOpenChange={(o) => !o && completeShortcuts()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.Keyboard className="size-5 text-shopee" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these handy shortcuts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {shortcuts.map((group) => (
            <div key={group.category}>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {group.category}
              </h4>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-accent/50"
                  >
                    <span className="text-sm">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key) => (
                        <kbd
                          key={key}
                          className="inline-flex h-6 min-w-6 items-center justify-center rounded border bg-muted px-1.5 text-xs font-semibold"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button onClick={completeShortcuts} className="bg-shopee-gradient hover:opacity-90">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
