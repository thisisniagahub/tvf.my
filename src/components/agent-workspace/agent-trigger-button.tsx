'use client'

import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'

/**
 * Floating action button that toggles the HERMES Agent Workspace open/closed.
 *
 * Renders as a pill-shaped FAB fixed to the top-right of the viewport (just
 * below the header). Uses the `hermes` purple gradient as the primary
 * accent — matching the AI theme used across HERMES-powered features. When
 * the agent is actively running, a small pulsing white dot overlays the
 * button so the user can see activity at a glance.
 *
 * Clicking the button toggles `agentWorkspaceOpen` in the Zustand store.
 * The split-screen layout in {@link AgentWorkspace} reacts accordingly.
 */
export function AgentTriggerButton() {
  const agentWorkspaceOpen = useAppStore((s) => s.agentWorkspaceOpen)
  const setAgentWorkspaceOpen = useAppStore((s) => s.setAgentWorkspaceOpen)
  const agentStatus = useAppStore((s) => s.agentStatus)
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const hasSeenOnboarding = useAppStore((s) => s.hasSeenOnboarding)
  const focusMode = useAppStore((s) => s.focusMode)

  // Don't render on landing / onboarding / focus mode — the agent workspace
  // only makes sense inside the authenticated dashboard shell.
  if (!isAuthenticated || !hasSeenOnboarding || focusMode) {
    return null
  }

  const isRunning = agentStatus === 'running'

  return (
    <motion.button
      type="button"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setAgentWorkspaceOpen(!agentWorkspaceOpen)}
      aria-pressed={agentWorkspaceOpen}
      aria-label={
        agentWorkspaceOpen ? 'Close HERMES agent workspace' : 'Open HERMES agent workspace'
      }
      className={cn(
        'fixed right-4 top-20 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 shadow-lg transition-colors md:right-6',
        agentWorkspaceOpen
          ? 'bg-destructive text-white shadow-destructive/30 hover:bg-destructive/90'
          : 'bg-hermes-gradient text-white shadow-hermes/30 hover:opacity-95'
      )}
    >
      <Icons.Bot className="size-5 shrink-0" />
      <span className="hidden text-sm font-medium sm:inline">
        {agentWorkspaceOpen ? 'Close Agent' : 'Run Agent Automation'}
      </span>
      <span className="text-sm font-medium sm:hidden">
        {agentWorkspaceOpen ? 'Close' : 'Agent'}
      </span>
      {isRunning && (
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-2 animate-ping rounded-full bg-white/60" />
          <span className="relative inline-flex size-2 rounded-full bg-white" />
        </span>
      )}
    </motion.button>
  )
}
