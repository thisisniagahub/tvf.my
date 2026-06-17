'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileNav } from './mobile-nav'
import { useAppStore } from '@/store/app-store'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { AnimatePresence, motion } from 'framer-motion'
import * as Icons from 'lucide-react'

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const focusMode = useAppStore((s) => s.focusMode)
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen)
  const { gPressed } = useKeyboardShortcuts()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar (hidden in focus mode) */}
      {!focusMode && (
        <aside
          className={`hidden md:flex flex-col border-r bg-sidebar transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <Sidebar />
        </aside>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-[1600px] w-full p-4 md:p-6 animate-fade-in-up pb-24 md:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav (hidden in focus mode) */}
      {!focusMode && <MobileNav />}

      {/* Mobile command palette FAB (hidden in focus mode) */}
      {!focusMode && (
      <motion.button
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setCommandPaletteOpen(true)}
        className="fixed right-4 bottom-20 z-30 flex size-12 items-center justify-center rounded-full bg-shopee-gradient text-white shadow-lg shadow-shopee/30 md:hidden"
        aria-label="Open command palette"
      >
        <Icons.Search className="size-5" />
        <span className="absolute -right-0.5 -top-0.5 flex size-3">
          <span className="absolute inline-flex size-3 animate-ping rounded-full bg-white/60" />
          <span className="relative inline-flex size-3 rounded-full bg-white" />
        </span>
      </motion.button>
      )}

      {/* G-key indicator overlay */}
      <AnimatePresence>
        {gPressed && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 md:left-1/2"
          >
            <div className="flex items-center gap-3 rounded-xl border border-shopee/30 bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur-md">
              <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded border bg-shopee px-1.5 text-xs font-bold text-white">
                G
              </kbd>
              <span className="text-xs font-medium text-muted-foreground">then</span>
              <div className="flex items-center gap-1">
                {(['D', 'P', 'L', 'A', 'E', 'H'] as const).map((k, i) => (
                  <kbd
                    key={k}
                    className="inline-flex h-6 min-w-6 items-center justify-center rounded border bg-muted px-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    {k}
                  </kbd>
                ))}
                <span className="ml-1 text-[10px] text-muted-foreground">…</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
