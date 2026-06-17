'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import type { PageId } from '@/lib/types'
import { toast } from 'sonner'

// Maps the "second key" in a G-then-X sequence to a page
const gKeyMap: Record<string, { page: PageId; label: string }> = {
  d: { page: 'dashboard', label: 'Dashboard' },
  p: { page: 'products', label: 'Products' },
  l: { page: 'links', label: 'Affiliate Links' },
  a: { page: 'analytics', label: 'Analytics' },
  e: { page: 'earnings', label: 'Earnings' },
  c: { page: 'calculator', label: 'Calculator' },
  m: { page: 'campaigns', label: 'Campaigns' },
  t: { page: 'trend-spy', label: 'Trend Spy' },
  h: { page: 'hermes-hub', label: 'Hermes AI Hub' },
  s: { page: 'settings', label: 'Settings' },
  n: { page: 'notifications', label: 'Notifications' },
  o: { page: 'leaderboard', label: 'Leaderboard' },
}

// Single-key shortcuts (no G prefix)
const directKeys: Record<string, () => void> = {}

export function useKeyboardShortcuts() {
  const { setActivePage, toggleSidebar, setCommandPaletteOpen, setShortcutsOpen, toggleFocusMode, isAuthenticated } = useAppStore()
  const [gPressed, setGPressed] = useState(false)
  const [gTimer, setGTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const resetG = useCallback(() => {
    setGPressed(false)
    if (gTimer) {
      clearTimeout(gTimer)
      setGTimer(null)
    }
  }, [gTimer])

  useEffect(() => {
    if (!isAuthenticated) return

    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return
      }

      // Skip if any modifier (except for Cmd+K which is handled by command palette)
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()

      // G-prefix sequence
      if (key === 'g' && !gPressed) {
        setGPressed(true)
        const timer = setTimeout(() => resetG(), 1200)
        setGTimer(timer)
        e.preventDefault()
        return
      }

      // Second key after G
      if (gPressed) {
        const mapping = gKeyMap[key]
        if (mapping) {
          setActivePage(mapping.page)
          toast.success(`→ ${mapping.label}`, { duration: 1500 })
          e.preventDefault()
        } else {
          toast.info('Unknown shortcut', { description: 'Press G then D/P/L/A/E/C/M/T/H/S/N/O', duration: 2000 })
        }
        resetG()
        return
      }

      // Direct shortcuts
      if (key === 'b') {
        toggleSidebar()
        toast.success('Sidebar toggled', { duration: 1200 })
        e.preventDefault()
      }
      if (key === 'f') {
        toggleFocusMode()
        e.preventDefault()
      }
      if (key === '?' || (e.shiftKey && e.key === '/')) {
        setShortcutsOpen(true)
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      if (gTimer) clearTimeout(gTimer)
    }
  }, [isAuthenticated, gPressed, gTimer, resetG, setActivePage, toggleSidebar, setCommandPaletteOpen, setShortcutsOpen, toggleFocusMode])

  return { gPressed }
}
