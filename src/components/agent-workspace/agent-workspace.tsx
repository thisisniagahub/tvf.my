'use client'

import { useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/app-store'
import { AgentControlBar } from './agent-control-bar'
import { VirtualBrowserCanvas } from './virtual-browser-canvas'
import { AgentTaskPanel } from './agent-task-panel'

/**
 * Kimi Computer-style split-screen workspace container.
 *
 * Wraps the existing dashboard (passed as `children`) inside a horizontal
 * `react-resizable-panels` PanelGroup. When `agentWorkspaceOpen` is false the
 * dashboard panel takes the full width and the layout is visually identical
 * to before — no resize handle, no agent panel. When the user opens the
 * workspace via the floating trigger button, a second panel slides in from
 * the right hosting the agent control bar, task configuration sidebar and
 * virtual browser canvas.
 *
 * The agent panel uses the `hermes` purple accent (the AI theme) and a
 * subtle motion entrance for the Kimi-style "stage reveal" effect.
 *
 * The PanelGroup is keyed by `isOpen` so toggling the workspace fully
 * remounts it — this guarantees the new panel's `defaultSize` is honoured
 * (react-resizable-panels only applies defaultSize on first mount of a
 * panel; remounting is the simplest way to reset proportions cleanly).
 */
export function AgentWorkspace({ children }: { children: React.ReactNode }) {
  const isOpen = useAppStore((s) => s.agentWorkspaceOpen)

  // Prevent body scroll when the split-screen is active so the two columns
  // own their own scroll containers.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  return (
    <div className="h-screen w-full overflow-hidden">
      <PanelGroup
        key={isOpen ? 'agent-open' : 'agent-closed'}
        direction="horizontal"
        autoSaveId={isOpen ? 'tvfm-agent-workspace' : undefined}
        className="h-full"
      >
        {/* Left panel: Dashboard — 100% when closed, ~40% when open */}
        <Panel
          id="dashboard-panel"
          order={1}
          defaultSize={isOpen ? 40 : 100}
          minSize={30}
          maxSize={100}
        >
          <div className="h-full w-full overflow-hidden">{children}</div>
        </Panel>

        {/* Right panel: Agent workspace (only when open) */}
        {isOpen && (
          <>
            <PanelResizeHandle className="relative w-1.5 shrink-0 bg-border transition-colors hover:bg-hermes/40 data-[resize-handle-state=drag]:bg-hermes data-[resize-handle-state=hover]:bg-hermes/40" />
            <Panel
              id="agent-panel"
              order={2}
              defaultSize={60}
              minSize={30}
              maxSize={80}
            >
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex h-full flex-col bg-muted/30"
              >
                <AgentControlBar />
                <div className="flex flex-1 overflow-hidden">
                  <AgentTaskPanel />
                  <VirtualBrowserCanvas />
                </div>
              </motion.div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  )
}
