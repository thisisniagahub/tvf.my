'use client'

import { motion } from 'framer-motion'
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
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ShortcutGroup {
  category: string
  icon: Icons.LucideIcon
  color: string
  shortcuts: { keys: string[]; label: string; desc?: string }[]
}

const shortcutGroups: ShortcutGroup[] = [
  {
    category: 'Navigation',
    icon: Icons.Navigation,
    color: 'text-shopee bg-shopee/10',
    shortcuts: [
      { keys: ['G', 'D'], label: 'Go to Dashboard', desc: 'Press G then D' },
      { keys: ['G', 'P'], label: 'Go to Products', desc: 'Press G then P' },
      { keys: ['G', 'L'], label: 'Go to Affiliate Links' },
      { keys: ['G', 'A'], label: 'Go to Analytics' },
      { keys: ['G', 'E'], label: 'Go to Earnings' },
      { keys: ['G', 'C'], label: 'Go to Calculator' },
      { keys: ['G', 'M'], label: 'Go to Campaigns' },
      { keys: ['G', 'T'], label: 'Go to Trend Spy' },
      { keys: ['G', 'H'], label: 'Go to Hermes AI Hub' },
      { keys: ['G', 'S'], label: 'Go to Settings' },
      { keys: ['G', 'N'], label: 'Go to Notifications' },
      { keys: ['G', 'O'], label: 'Go to Leaderboard' },
    ],
  },
  {
    category: 'Quick Actions',
    icon: Icons.Zap,
    color: 'text-hermes bg-hermes/10',
    shortcuts: [
      { keys: ['⌘', 'K'], label: 'Open Command Palette', desc: 'Search pages & content' },
      { keys: ['/'], label: 'Focus Header Search', desc: 'Jump to the search bar' },
      { keys: ['B'], label: 'Toggle Sidebar', desc: 'Collapse/expand sidebar' },
      { keys: ['F'], label: 'Focus Mode', desc: 'Hide sidebar & mobile nav' },
      { keys: ['?'], label: 'Show this cheat sheet', desc: 'Shift + /' },
    ],
  },
  {
    category: 'Command Palette',
    icon: Icons.Search,
    color: 'text-success bg-success/10',
    shortcuts: [
      { keys: ['↑', '↓'], label: 'Navigate results', desc: 'Move up/down' },
      { keys: ['↵'], label: 'Select result', desc: 'Enter to activate' },
      { keys: ['Tab'], label: 'Cycle results', desc: 'Shift+Tab for reverse' },
      { keys: ['Esc'], label: 'Close palette', desc: 'Dismiss dialog' },
    ],
  },
  {
    category: 'Global',
    icon: Icons.Globe,
    color: 'text-warning bg-warning/10',
    shortcuts: [
      { keys: ['⌘', 'K'], label: 'Command Palette', desc: 'Works anywhere' },
      { keys: ['Esc'], label: 'Close any dialog', desc: 'Universal dismiss' },
    ],
  },
]

export function ShortcutsModal() {
  const { shortcutsOpen, setShortcutsOpen } = useAppStore()

  return (
    <Dialog open={shortcutsOpen} onOpenChange={(o) => setShortcutsOpen(o)}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>All available keyboard shortcuts</DialogDescription>
        </DialogHeader>
        {/* Header banner */}
        <div className="relative overflow-hidden rounded-t-lg bg-hermes-gradient p-5 text-white">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Icons.Keyboard className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
              <p className="text-xs text-white/90">Master TheViralFindsMY with these shortcuts</p>
            </div>
          </div>
        </div>

        {/* Shortcut groups */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin p-4">
          <div className="space-y-5">
            {shortcutGroups.map((group, groupIdx) => {
              const GroupIcon = group.icon
              return (
                <motion.div
                  key={group.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIdx * 0.08, duration: 0.3 }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className={cn('flex size-7 items-center justify-center rounded-lg', group.color)}>
                      <GroupIcon className="size-4" />
                    </div>
                    <h3 className="text-sm font-bold">{group.category}</h3>
                    <Badge variant="secondary" className="text-[9px]">{group.shortcuts.length}</Badge>
                  </div>
                  <div className="space-y-1">
                    {group.shortcuts.map((shortcut, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-accent/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{shortcut.label}</p>
                          {shortcut.desc && (
                            <p className="text-[10px] text-muted-foreground">{shortcut.desc}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, j) => (
                            <kbd
                              key={j}
                              className="inline-flex h-6 min-w-6 items-center justify-center rounded border bg-muted px-1.5 text-xs font-semibold text-foreground shadow-sm"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t p-3">
          <p className="text-[10px] text-muted-foreground">
            {shortcutGroups.reduce((sum, g) => sum + g.shortcuts.length, 0)} shortcuts available
          </p>
          <Button size="sm" onClick={() => setShortcutsOpen(false)} className="bg-hermes-gradient hover:opacity-90">
            <Icons.Check className="mr-1 size-4" /> Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
