'use client'

import { useEffect, useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChangelogEntry {
  version: string
  date: string
  title: string
  type: 'feature' | 'improvement' | 'fix'
  items: string[]
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.4',
    date: 'Jun 2025',
    title: 'Global Search & Skeletons',
    type: 'feature',
    items: [
      'Global content search in command palette — find products, links & campaigns instantly',
      'Skeleton loading states on Analytics, Earnings & Hermes Hub pages',
      'Breadcrumb trail in header showing page hierarchy',
      '"/" keyboard shortcut to focus header search',
      'Fixed AnimatedNumber getting stuck at 0 on data-load',
    ],
  },
  {
    version: '2.3',
    date: 'Jun 2025',
    title: 'Command Palette UX',
    type: 'feature',
    items: [
      'Keyboard arrow navigation (↑↓ Enter Tab) in command palette',
      'Clear recent history button',
      'Celebration toast variant for live sales (gradient + shimmer)',
      'Animated dark mode preview in settings',
      'Mobile command palette FAB (floating action button)',
    ],
  },
  {
    version: '2.2',
    date: 'Jun 2025',
    title: 'Celebrations & Micro-interactions',
    type: 'feature',
    items: [
      'Confetti celebration animation on live sale notifications',
      'Recently-viewed pages in command palette',
      'Stagger animations on Products, Campaigns & Leaderboard',
      'Settings toggle for live notifications',
    ],
  },
  {
    version: '2.1',
    date: 'Jun 2025',
    title: 'AI Features & Live Dashboard',
    type: 'feature',
    items: [
      'AI image generation for thumbnails (z-ai-web-dev-sdk)',
      'AI text-to-speech voiceover studio (7 voices)',
      'WebSocket live notifications with fallback simulation',
      'Animated number counters on all stat cards',
      'G-then-X keyboard navigation (12 page shortcuts)',
      'Dashboard Live Activity feed wired to real-time events',
    ],
  },
  {
    version: '2.0',
    date: 'Jun 2025',
    title: 'Full App Build',
    type: 'feature',
    items: [
      '36 pages across 5 categories (Core, AI, Platforms, Advanced, Growth)',
      'Command palette (Cmd+K) with fuzzy search',
      'HERMES AI chatbot with Malaysian market context',
      'Framer Motion page transitions',
      'Dark/light theme with shopee + hermes color system',
    ],
  },
]

const typeConfig = {
  feature: { icon: Icons.Sparkles, color: 'text-shopee', bg: 'bg-shopee/10', label: 'New Feature' },
  improvement: { icon: Icons.TrendingUp, color: 'text-hermes', bg: 'bg-hermes/10', label: 'Improvement' },
  fix: { icon: Icons.Wrench, color: 'text-success', bg: 'bg-success/10', label: 'Bug Fix' },
}

export function ChangelogModal() {
  const { hasSeenChangelog, changelogOpen, setChangelogOpen, dismissChangelog } = useAppStore()
  const [autoShow, setAutoShow] = useState(false)

  // Auto-show after 1.5s on first visit (after onboarding/shortcuts)
  useEffect(() => {
    if (!hasSeenChangelog) {
      const t = setTimeout(() => setAutoShow(true), 1500)
      return () => clearTimeout(t)
    }
  }, [hasSeenChangelog])

  const isOpen = changelogOpen || autoShow

  const handleClose = () => {
    setAutoShow(false)
    dismissChangelog()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) handleClose(); else setChangelogOpen(true) }}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>What's New in TheViralFindsMY</DialogTitle>
          <DialogDescription>Latest updates and features</DialogDescription>
        </DialogHeader>
        {/* Header banner */}
        <div className="relative overflow-hidden rounded-t-lg bg-shopee-gradient p-6 text-white">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Icons.Gift className="size-6" />
              <h2 className="text-xl font-bold">What's New</h2>
            </div>
            <p className="mt-1 text-sm text-white/90">
              Latest updates to TheViralFindsMY — your AI-powered Shopee affiliate companion
            </p>
            <Badge className="mt-3 bg-white/20 text-white border-white/30 backdrop-blur">
              v{changelog[0].version} • {changelog[0].date}
            </Badge>
          </div>
        </div>

        {/* Changelog list */}
        <div className="max-h-[50vh] overflow-y-auto scrollbar-thin p-4">
          <div className="space-y-4">
            {changelog.map((entry, idx) => {
              const cfg = typeConfig[entry.type]
              const Icon = cfg.icon
              return (
                <motion.div
                  key={entry.version}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  className={cn(
                    'relative rounded-lg border p-3',
                    idx === 0 ? 'border-shopee/30 bg-shopee/[0.03]' : 'border-border/60'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', cfg.bg, cfg.color)}>
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold">{entry.title}</h3>
                        <span className="text-[10px] text-muted-foreground">v{entry.version}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{entry.date}</p>
                      <ul className="mt-2 space-y-1">
                        {entry.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <Icons.Check className="mt-0.5 size-3 shrink-0 text-success" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {idx === 0 && (
                    <Badge className="absolute right-2 top-2 bg-shopee text-white text-[9px]">
                      LATEST
                    </Badge>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t p-3">
          <Button variant="ghost" size="sm" onClick={() => setChangelogOpen(false)}>
            View later
          </Button>
          <Button size="sm" onClick={handleClose} className="bg-shopee-gradient hover:opacity-90">
            <Icons.Check className="mr-1 size-4" /> Got it, dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
