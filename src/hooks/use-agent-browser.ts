'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppStore } from '@/store/app-store'
import type { AgentAction, AgentLog, AgentStatus } from '@/lib/types'

/**
 * useAgentBrowser
 * ----------------
 * Frontend hook that connects to the Agent Browser mini-service
 * (Socket.io on port 3004 via the Caddy `?XTransformPort=3004` gateway).
 *
 * The hook is mounted only when `agentWorkspaceOpen` is true in the
 * app store — opening the workspace triggers a connection, closing it
 * disconnects cleanly. All screenshots / logs / action results streamed
 * back from the service are written into the app store so any component
 * in the workspace can render them reactively.
 *
 * NOTE: Phase 6.2 ships a UI-only simulation driven by
 * `agent-workspace/agent-task-panel.tsx`. This hook is the future
 * real-socket integration path — it is wired to the same store fields
 * the simulation writes to, so swapping the simulation for live socket
 * events in a later phase is a drop-in change.
 *
 * Returns:
 *   - connected: whether the socket is currently connected
 *   - navigate(url), click(x,y), type(text), scroll(dir), extract(fields)
 *     — thin emitters that translate UI intents into wire messages
 *   - stop() — cancel the current task in-flight on the service
 */

interface ConnectedPayload {
  message: string
  sessionId: string
}

interface ScreenshotPayload {
  screenshot: string
  url: string
}

interface LogPayload {
  level: string
  message: string
  timestamp: string
}

interface ActionResultPayload {
  type: string
  success: boolean
  selector?: string
  url?: string
  text?: string
  value?: string
  message?: string
  [key: string]: unknown
}

interface TaskStoppedPayload {
  reason: string
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function useAgentBrowser() {
  const {
    agentWorkspaceOpen,
    setAgentScreenshot,
    setAgentUrl,
    setAgentStatus,
    addAgentLog,
    addAgentAction,
  } = useAppStore()
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!agentWorkspaceOpen) return

    // The AgentStatus union is `idle | running | paused | completed | error`
    // — there is no dedicated "connecting" state, so we surface connection
    // progress through logs and keep the status as `idle` until the first
    // real action arrives. See agent-workspace/agent-control-bar.tsx.
    const idleStatus: AgentStatus = 'idle'
    setAgentStatus(idleStatus)
    addAgentLog({
      id: makeId('log'),
      level: 'info',
      message: 'Connecting to HERMES browser runtime on :3004…',
      timestamp: new Date().toISOString(),
    })

    const socket = io('/?XTransformPort=3004', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      setAgentStatus(idleStatus)
      addAgentLog({
        id: makeId('log'),
        level: 'success',
        message: 'Connected to HERMES browser runtime.',
        timestamp: new Date().toISOString(),
      })
    })

    socket.on('disconnect', () => {
      setConnected(false)
      setAgentStatus(idleStatus)
    })

    socket.on('connect_error', () => {
      setConnected(false)
      setAgentStatus('error')
      addAgentLog({
        id: makeId('log'),
        level: 'error',
        message: 'Failed to reach HERMES browser runtime (port 3004).',
        timestamp: new Date().toISOString(),
      })
    })

    socket.on('connected', (data: ConnectedPayload) => {
      addAgentLog({
        id: makeId('log'),
        level: 'success' as AgentLog['level'],
        message: data.message,
        timestamp: new Date().toISOString(),
      })
    })

    socket.on('screenshot', (data: ScreenshotPayload) => {
      setAgentScreenshot(data.screenshot)
      setAgentUrl(data.url)
    })

    socket.on('log', (data: LogPayload) => {
      addAgentLog({
        id: makeId('log'),
        level: (data.level as AgentLog['level']) ?? 'info',
        message: data.message,
        timestamp: data.timestamp,
      })
    })

    socket.on('action-result', (data: ActionResultPayload) => {
      const target =
        typeof data.selector === 'string'
          ? data.selector
          : typeof data.url === 'string'
            ? data.url
            : undefined
      const value =
        typeof data.text === 'string'
          ? data.text
          : typeof data.value === 'string'
            ? data.value
            : typeof data.message === 'string'
              ? data.message
              : undefined
      const action: AgentAction = {
        id: makeId('action'),
        type: (data.type as AgentAction['type']) ?? 'done',
        target,
        value,
        timestamp: new Date().toISOString(),
        status: data.success ? 'success' : 'failed',
      }
      addAgentAction(action)
      // Promote status to "running" so the UI shows activity.
      if (data.success) {
        setAgentStatus('running')
      }
    })

    socket.on('task-stopped', (data: TaskStoppedPayload) => {
      addAgentLog({
        id: makeId('log'),
        level: 'warn',
        message: `Task stopped: ${data.reason}`,
        timestamp: new Date().toISOString(),
      })
      setAgentStatus(idleStatus)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
    // We intentionally depend only on `agentWorkspaceOpen` — the action
    // setters from the store are stable references (zustand never
    // recreates them) and adding them would cause spurious reconnects.
  }, [agentWorkspaceOpen, setAgentScreenshot, setAgentUrl, setAgentStatus, addAgentLog, addAgentAction])

  const navigate = useCallback((url: string) => {
    socketRef.current?.emit('navigate', { url })
  }, [])

  const click = useCallback((x: number, y: number, selector?: string) => {
    socketRef.current?.emit('click', { x, y, selector })
  }, [])

  const type = useCallback((text: string, selector?: string) => {
    socketRef.current?.emit('type', { text, selector })
  }, [])

  const scroll = useCallback((direction: 'up' | 'down', amount?: number) => {
    socketRef.current?.emit('scroll', { direction, amount })
  }, [])

  const extract = useCallback((fields?: string[], selector?: string) => {
    socketRef.current?.emit('extract', { fields, selector })
  }, [])

  const stop = useCallback(() => {
    socketRef.current?.emit('stop', {})
  }, [])

  return { connected, navigate, click, type, scroll, extract, stop }
}
