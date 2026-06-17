'use client'

import { useCallback, useRef, useState } from 'react'
import * as Icons from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'
import type { AgentAction } from '@/lib/types'

function uid() {
  return `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

interface ClickMarker {
  id: string
  x: number
  y: number
}

/**
 * Virtual browser viewport — the right-hand side of the agent workspace.
 *
 * Displays (in priority order):
 *  1. The latest `agentScreenshot` (a base64 data URL captured by the
 *     HERMES agent's headless browser) when one is available.
 *  2. A loading spinner overlay while the agent is `running` but no
 *     screenshot has been received yet.
 *  3. A subtle grid-patterned gradient placeholder with the message
 *     "Browser session will appear here" when the agent is idle/paused.
 *
 * Interactive: clicking anywhere on the screenshot drops a click marker
 * at the cursor position (Kimi-style) and pushes a `click` action onto
 * the agent action timeline — useful for manually steering the agent at
 * a specific element. A small scroll-position indicator (faux scrollbar
 * on the right edge) gives the impression of a real browser viewport.
 */
export function VirtualBrowserCanvas() {
  const agentScreenshot = useAppStore((s) => s.agentScreenshot)
  const agentStatus = useAppStore((s) => s.agentStatus)
  const agentUrl = useAppStore((s) => s.agentUrl)
  const addAgentAction = useAppStore((s) => s.addAgentAction)
  const addAgentLog = useAppStore((s) => s.addAgentLog)

  const [markers, setMarkers] = useState<ClickMarker[]>([])
  const [scrollPct, setScrollPct] = useState(12)
  const containerRef = useRef<HTMLDivElement>(null)

  const isRunning = agentStatus === 'running'
  const isLoading = isRunning && !agentScreenshot
  const isEmpty = !agentScreenshot && !isRunning

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || !agentScreenshot) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
      const markerId = `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
      setMarkers((prev) => [...prev.slice(-3), { id: markerId, x, y }])
      // auto-clear markers after a short delay
      window.setTimeout(() => {
        setMarkers((prev) => prev.filter((m) => m.id !== markerId))
      }, 1400)

      const action: AgentAction = {
        id: uid(),
        type: 'click',
        target: `viewport@${x}%,${y}%`,
        timestamp: new Date().toISOString(),
        status: 'success',
      }
      addAgentAction(action)
      addAgentLog({
        id: `log_${uid()}`,
        level: 'success',
        message: `Manual click recorded at (${x}%, ${y}%).`,
        timestamp: new Date().toISOString(),
      })
    },
    [agentScreenshot, addAgentAction, addAgentLog]
  )

  // Fake scroll progress for the right-edge scrollbar indicator
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!agentScreenshot) return
    e.preventDefault()
    setScrollPct((prev) => {
      const next = prev + e.deltaY * 0.05
      return Math.max(0, Math.min(100, next))
    })
  }, [agentScreenshot])

  return (
    <div className="relative flex flex-1 flex-col bg-background">
      {/* Toolbar — fake browser chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-1.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive/60" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
        </div>
        <span className="ml-2 truncate text-[11px] font-medium text-muted-foreground">
          {agentUrl || 'about:blank'} — HERMES Virtual Browser
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        className={cn(
          'relative flex-1 overflow-hidden',
          agentScreenshot ? 'cursor-crosshair' : 'cursor-default'
        )}
      >
        {/* Screenshot image */}
        {agentScreenshot && (
          <img
            src={agentScreenshot}
            alt="HERMES agent browser screenshot"
            className="h-full w-full select-none object-contain object-top"
            draggable={false}
          />
        )}

        {/* Empty placeholder */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center bg-grid">
            <div className="pointer-events-none flex flex-col items-center gap-3 px-6 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-hermes-gradient text-white shadow-lg shadow-hermes/30">
                <Icons.Globe className="size-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Browser session will appear here
                </p>
                <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                  Pick a task from the panel on the left, then hit{' '}
                  <span className="font-medium text-hermes">Start Task</span>. The
                  HERMES agent will navigate, interact and stream its view here in
                  real-time.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
            <div className="relative flex size-14 items-center justify-center">
              <span className="absolute inline-flex size-14 animate-ping rounded-full bg-hermes/20" />
              <Icons.LoaderCircle className="size-10 animate-spin text-hermes" />
            </div>
            <p className="text-xs font-medium text-foreground">Booting headless browser…</p>
            <p className="text-[11px] text-muted-foreground">
              Connecting to HERMES runtime
            </p>
          </div>
        )}

        {/* Click markers */}
        <AnimatePresence>
          {markers.map((m) => (
            <motion.div
              key={m.id}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              <span className="relative flex size-6">
                <span className="absolute inline-flex size-6 animate-ping rounded-full bg-hermes/40" />
                <span className="relative inline-flex size-6 items-center justify-center rounded-full border-2 border-hermes bg-hermes/20 backdrop-blur-sm">
                  <Icons.MousePointer2 className="size-3 text-hermes" />
                </span>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Faux scrollbar indicator on the right edge */}
        {agentScreenshot && (
          <div className="absolute right-0 top-0 h-full w-2 bg-muted/40">
            <div
              className="w-full rounded bg-hermes/40 transition-all"
              style={{ height: '24%', transform: `translateY(${scrollPct * 0.76}%)` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
