'use client'

import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AgentLog, AgentStatus } from '@/lib/types'

interface StatusConfig {
  label: string
  badgeClass: string
  dotClass: string
  Icon: LucideIcon
}

const STATUS_CONFIG: Record<AgentStatus, StatusConfig> = {
  idle: {
    label: 'Idle',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    dotClass: 'bg-muted-foreground',
    Icon: Icons.CircleDot,
  },
  running: {
    label: 'Running',
    badgeClass: 'bg-success/15 text-success border-success/30',
    dotClass: 'bg-success',
    Icon: Icons.LoaderCircle,
  },
  paused: {
    label: 'Paused',
    badgeClass: 'bg-warning/15 text-warning border-warning/30',
    dotClass: 'bg-warning',
    Icon: Icons.Pause,
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-success/15 text-success border-success/30',
    dotClass: 'bg-success',
    Icon: Icons.CheckCircle2,
  },
  error: {
    label: 'Error',
    badgeClass: 'bg-destructive/15 text-destructive border-destructive/30',
    dotClass: 'bg-destructive',
    Icon: Icons.AlertCircle,
  },
}

function uid() {
  return `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Sticky status bar at the top of the HERMES agent workspace right panel.
 *
 * Mirrors the Kimi Computer control chrome — a fake browser address bar
 * (free-text URL input the user can navigate the virtual browser to), a
 * coloured status badge with a pulsing activity dot while the agent is
 * running, and a small cluster of transport-style controls:
 *
 *  - Pause / Resume: toggles between `running` and `paused`
 *  - Stop: terminates the current run (status → `idle`, clears canvas)
 *  - Refresh: re-navigates the virtual browser to the current URL
 *
 * When the agent is not running, only the refresh control is enabled — the
 * pause/stop buttons are visually disabled so the user can see there is no
 * active run to control.
 */
export function AgentControlBar() {
  const agentStatus = useAppStore((s) => s.agentStatus)
  const agentUrl = useAppStore((s) => s.agentUrl)
  const setAgentStatus = useAppStore((s) => s.setAgentStatus)
  const setAgentUrl = useAppStore((s) => s.setAgentUrl)
  const setAgentScreenshot = useAppStore((s) => s.setAgentScreenshot)
  const addAgentLog = useAppStore((s) => s.addAgentLog)

  // Local input state so the user can type freely without each keystroke
  // committing to the store. The URL is only committed on Enter / blur.
  const [urlDraft, setUrlDraft] = useState(agentUrl)
  useEffect(() => {
    setUrlDraft(agentUrl)
  }, [agentUrl])

  const config = STATUS_CONFIG[agentStatus]
  const isRunning = agentStatus === 'running'
  const isPaused = agentStatus === 'paused'
  const isBusy = isRunning || isPaused

  const pushLog = (level: AgentLog['level'], message: string) => {
    addAgentLog({
      id: uid(),
      level,
      message,
      timestamp: new Date().toISOString(),
    })
  }

  const commitUrl = () => {
    let url = urlDraft.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`
      setUrlDraft(url)
    }
    setAgentUrl(url)
    pushLog('info', `Manual navigation → ${url}`)
  }

  const handlePauseResume = () => {
    if (isRunning) {
      setAgentStatus('paused')
      pushLog('warn', 'Agent paused by user. Actions will resume on continue.')
    } else if (isPaused) {
      setAgentStatus('running')
      pushLog('info', 'Agent resumed.')
    }
  }

  const handleStop = () => {
    setAgentStatus('idle')
    setAgentScreenshot(null)
    pushLog('warn', 'Agent stopped. Partial results (if any) are retained.')
  }

  const handleRefresh = () => {
    if (!agentUrl) {
      pushLog('warn', 'No URL to refresh — enter a destination above.')
      return
    }
    pushLog('info', `Refreshing ${agentUrl} …`)
    setAgentScreenshot(null)
  }

  const StatusIcon = config.Icon

  return (
    <header className="z-10 flex flex-col gap-2 border-b bg-background/95 px-3 py-2.5 backdrop-blur md:px-4">
      <div className="flex items-center gap-2">
        {/* Hermes brand mark */}
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-hermes-gradient text-white shadow-sm">
          <Icons.Sparkles className="size-4" />
        </div>

        {/* URL / address bar */}
        <div className="relative flex flex-1 items-center">
          <Icons.Lock className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" />
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitUrl()
              }
            }}
            onBlur={() => {
              if (urlDraft.trim() && urlDraft !== agentUrl) commitUrl()
            }}
            placeholder="Enter a URL or pick a task to start…"
            className="h-8 rounded-full border-border/60 bg-muted/40 pl-8 pr-3 text-xs font-medium shadow-none focus-visible:ring-hermes/40"
            aria-label="Agent browser URL"
          />
        </div>

        {/* Transport controls */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handlePauseResume}
            disabled={!isBusy}
            aria-label={isRunning ? 'Pause agent' : 'Resume agent'}
            title={isRunning ? 'Pause' : 'Resume'}
          >
            {isRunning ? (
              <Icons.Pause className="size-4" />
            ) : (
              <Icons.Play className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleStop}
            disabled={!isBusy}
            aria-label="Stop agent"
            title="Stop"
          >
            <Icons.Square className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleRefresh}
            disabled={!agentUrl}
            aria-label="Refresh virtual browser"
            title="Refresh"
          >
            <Icons.RotateCw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-2 px-0.5">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
            config.badgeClass
          )}
        >
          <span className="relative flex size-1.5">
            {isRunning && (
              <span
                className={cn(
                  'absolute inline-flex size-1.5 animate-ping rounded-full opacity-75',
                  config.dotClass
                )}
              />
            )}
            <span className={cn('relative inline-flex size-1.5 rounded-full', config.dotClass)} />
          </span>
          {config.label}
        </span>
        <StatusIcon
          className={cn(
            'size-3.5',
            isRunning && 'animate-spin',
            config.badgeClass.includes('text-success') && 'text-success',
            config.badgeClass.includes('text-warning') && 'text-warning',
            config.badgeClass.includes('text-destructive') && 'text-destructive',
            config.badgeClass.includes('text-muted-foreground') && 'text-muted-foreground'
          )}
        />
        <span className="truncate text-[11px] text-muted-foreground">
          {agentUrl ? (
            <>
              Viewing <span className="font-medium text-foreground">{agentUrl}</span>
            </>
          ) : (
            'Awaiting task selection…'
          )}
        </span>
      </div>
    </header>
  )
}
