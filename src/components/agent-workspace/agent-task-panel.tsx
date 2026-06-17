'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { AgentAction, AgentLog } from '@/lib/types'

interface TaskStep {
  /** Delay before this step fires, in ms (cumulative across the run). */
  delay: number
  /** Action to push onto the timeline. */
  action: Omit<AgentAction, 'id' | 'timestamp' | 'status'> & {
    status?: AgentAction['status']
  }
  /** Optional log line accompanying the action. */
  log?: Omit<AgentLog, 'id' | 'timestamp'>
  /** Optional screenshot data URL to set on the virtual canvas. */
  screenshot?: string
}

interface TaskDef {
  id: string
  name: string
  tagline: string
  description: string
  Icon: LucideIcon
  accentClass: string
  initialUrl: string
  steps: TaskStep[]
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * Build a minimal mock "screenshot" as an inline SVG data URL so the virtual
 * browser canvas has something to render during a simulated agent run. The
 * real Phase 6.3+ agent will replace this with actual headless-browser
 * captures streamed from the backend.
 */
function mockScreenshot(opts: {
  url: string
  title: string
  phase: string
  accent: string
}): string {
  const host = (() => {
    try {
      return new URL(opts.url).hostname
    } catch {
      return opts.url
    }
  })()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${opts.accent}"/>
      <stop offset="1" stop-color="${opts.accent}" stop-opacity="0.55"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#e5e7eb" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="560" fill="#f8fafc"/>
  <rect width="800" height="560" fill="url(#grid)" opacity="0.6"/>
  <rect width="800" height="56" fill="${opts.accent}"/>
  <circle cx="28" cy="28" r="8" fill="#ffffff" opacity="0.9"/>
  <circle cx="52" cy="28" r="8" fill="#ffffff" opacity="0.6"/>
  <circle cx="76" cy="28" r="8" fill="#ffffff" opacity="0.4"/>
  <rect x="120" y="18" width="520" height="20" rx="10" fill="#ffffff" opacity="0.25"/>
  <text x="138" y="33" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="600">${host}</text>
  <text x="32" y="100" fill="#0f172a" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="700">${opts.title}</text>
  <text x="32" y="126" fill="#64748b" font-family="Arial,Helvetica,sans-serif" font-size="13">${opts.phase}</text>
  <rect x="32" y="148" width="736" height="80" rx="10" fill="url(#g)" opacity="0.18"/>
  <rect x="48" y="166" width="220" height="14" rx="4" fill="${opts.accent}" opacity="0.55"/>
  <rect x="48" y="194" width="320" height="10" rx="3" fill="#94a3b8" opacity="0.55"/>
  <g font-family="Arial,Helvetica,sans-serif">
    <rect x="32" y="252" width="170" height="120" rx="10" fill="#ffffff" stroke="#e2e8f0"/>
    <rect x="48" y="268" width="140" height="60" rx="6" fill="${opts.accent}" opacity="0.25"/>
    <rect x="48" y="338" width="100" height="10" rx="3" fill="#475569" opacity="0.65"/>
    <rect x="48" y="354" width="60" height="8" rx="3" fill="${opts.accent}"/>
    <rect x="218" y="252" width="170" height="120" rx="10" fill="#ffffff" stroke="#e2e8f0"/>
    <rect x="234" y="268" width="140" height="60" rx="6" fill="${opts.accent}" opacity="0.18"/>
    <rect x="234" y="338" width="100" height="10" rx="3" fill="#475569" opacity="0.65"/>
    <rect x="234" y="354" width="60" height="8" rx="3" fill="${opts.accent}"/>
    <rect x="404" y="252" width="170" height="120" rx="10" fill="#ffffff" stroke="#e2e8f0"/>
    <rect x="420" y="268" width="140" height="60" rx="6" fill="${opts.accent}" opacity="0.28"/>
    <rect x="420" y="338" width="100" height="10" rx="3" fill="#475569" opacity="0.65"/>
    <rect x="420" y="354" width="60" height="8" rx="3" fill="${opts.accent}"/>
    <rect x="590" y="252" width="178" height="120" rx="10" fill="#ffffff" stroke="#e2e8f0"/>
    <rect x="606" y="268" width="146" height="60" rx="6" fill="${opts.accent}" opacity="0.22"/>
    <rect x="606" y="338" width="100" height="10" rx="3" fill="#475569" opacity="0.65"/>
    <rect x="606" y="354" width="60" height="8" rx="3" fill="${opts.accent}"/>
  </g>
  <rect x="32" y="404" width="736" height="120" rx="10" fill="#ffffff" stroke="#e2e8f0"/>
  <rect x="48" y="420" width="180" height="14" rx="4" fill="${opts.accent}" opacity="0.7"/>
  <rect x="48" y="444" width="700" height="8" rx="3" fill="#cbd5e1"/>
  <rect x="48" y="462" width="660" height="8" rx="3" fill="#cbd5e1"/>
  <rect x="48" y="480" width="520" height="8" rx="3" fill="#cbd5e1"/>
  <rect x="48" y="498" width="240" height="8" rx="3" fill="#cbd5e1"/>
  <text x="768" y="540" text-anchor="end" fill="#94a3b8" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="600">HERMES • ${opts.phase}</text>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const SHOPEE_ACCENT = '#ee4d2d'
const TIKTOK_ACCENT = '#7c3aed' // hermes purple, since TikTok's actual pink is too close to destructive
const META_ACCENT = '#16a34a'

const TASKS: TaskDef[] = [
  {
    id: 'no-api-sync',
    name: 'No-API Data Sync',
    tagline: 'Shopee + Lazada commission scraper',
    description:
      'Logs in to your Shopee & Lazada affiliate dashboards and scrapes live commission data without needing official API keys. Syncs 42+ products in one run.',
    Icon: Icons.Database,
    accentClass: 'text-shopee bg-shopee/10 border-shopee/30',
    initialUrl: 'https://shopee.com.my/affiliate/dashboard',
    steps: [
      {
        delay: 400,
        action: { type: 'navigate', target: 'https://shopee.com.my/affiliate/dashboard', status: 'success' },
        log: { level: 'info', message: 'Navigating to Shopee Affiliate dashboard…' },
        screenshot: mockScreenshot({ url: 'https://shopee.com.my/affiliate/dashboard', title: 'Shopee Affiliate Dashboard', phase: 'Loading session', accent: SHOPEE_ACCENT }),
      },
      {
        delay: 900,
        action: { type: 'click', target: 'a[aria-label="Log In"]', status: 'success' },
        log: { level: 'info', message: 'Login modal opened.' },
      },
      {
        delay: 700,
        action: { type: 'type', target: 'input[name="email"]', value: 'demo@theviralfindsmy.com', status: 'success' },
        log: { level: 'info', message: 'Entered affiliate account email.' },
      },
      {
        delay: 600,
        action: { type: 'type', target: 'input[name="password"]', value: '••••••••••', status: 'success' },
        log: { level: 'info', message: 'Entered password (vault-injected).' },
      },
      {
        delay: 800,
        action: { type: 'click', target: 'button[type="submit"]', status: 'success' },
        log: { level: 'success', message: 'Logged in. Session cookie captured for re-use.' },
        screenshot: mockScreenshot({ url: 'https://shopee.com.my/affiliate/dashboard', title: 'Shopee Affiliate Dashboard', phase: 'Authenticated — extracting', accent: SHOPEE_ACCENT }),
      },
      {
        delay: 900,
        action: { type: 'extract', target: 'table.affiliate-products', value: '24 products', status: 'success' },
        log: { level: 'success', message: 'Extracted 24 products with live commission rates.' },
      },
      {
        delay: 600,
        action: { type: 'navigate', target: 'https://www.lazada.com.my/affiliate/dashboard', status: 'success' },
        log: { level: 'info', message: 'Switching to Lazada Affiliate dashboard…' },
        screenshot: mockScreenshot({ url: 'https://www.lazada.com.my/affiliate/dashboard', title: 'Lazada Affiliate Dashboard', phase: 'Cross-platform sync', accent: SHOPEE_ACCENT }),
      },
      {
        delay: 900,
        action: { type: 'extract', target: 'table.commission-list', value: '18 products', status: 'success' },
        log: { level: 'success', message: 'Extracted 18 Lazada products. Total: 42 synced.' },
      },
      {
        delay: 500,
        action: { type: 'done', target: 'sync-complete', value: '42 products, 2 platforms', status: 'success' },
        log: { level: 'success', message: '✓ Sync complete — 42 products updated across Shopee + Lazada.' },
      },
    ],
  },
  {
    id: 'tiktok-spy',
    name: 'TikTok Trend Spy',
    tagline: 'Viral product discovery engine',
    description:
      'Scans TikTok Discover for viral products, extracts trending hashtags and engagement metrics. Flags high-velocity opportunities before competitors notice.',
    Icon: Icons.Music2,
    accentClass: 'text-hermes bg-hermes/10 border-hermes/30',
    initialUrl: 'https://www.tiktok.com/discover',
    steps: [
      {
        delay: 400,
        action: { type: 'navigate', target: 'https://www.tiktok.com/discover', status: 'success' },
        log: { level: 'info', message: 'Opening TikTok Discover feed…' },
        screenshot: mockScreenshot({ url: 'https://www.tiktok.com/discover', title: 'TikTok Discover', phase: 'Warming up feed', accent: TIKTOK_ACCENT }),
      },
      {
        delay: 800,
        action: { type: 'scroll', target: 'feed', value: '+480px', status: 'success' },
        log: { level: 'info', message: 'Scrolled feed to load trending content.' },
      },
      {
        delay: 900,
        action: { type: 'extract', target: 'section.trending-hashtags', value: '12 hashtags', status: 'success' },
        log: { level: 'success', message: 'Extracted 12 trending hashtags (#TikTokMadeMeBuyIt, #MsiaFinds, …).' },
      },
      {
        delay: 800,
        action: { type: 'extract', target: 'div.product-mentions', value: '8 viral products', status: 'success' },
        log: { level: 'success', message: 'Detected 8 viral product mentions with engagement signals.' },
      },
      {
        delay: 700,
        action: { type: 'click', target: 'a[href="/tag/TikTokMadeMeBuyIt"]', status: 'success' },
        log: { level: 'info', message: 'Inspecting top trending tag feed.' },
        screenshot: mockScreenshot({ url: 'https://www.tiktok.com/tag/TikTokMadeMeBuyIt', title: '#TikTokMadeMeBuyIt — Top Feed', phase: 'Engagement analysis', accent: TIKTOK_ACCENT }),
      },
      {
        delay: 900,
        action: { type: 'extract', target: 'div.engagement-metrics', value: 'avg 2.4M views, 18% CTR', status: 'success' },
        log: { level: 'success', message: 'Computed engagement metrics — 2.4M avg views, 18% click-through.' },
      },
      {
        delay: 500,
        action: { type: 'done', target: 'scan-complete', value: '8 opportunities, 3 hot', status: 'success' },
        log: { level: 'success', message: '✓ Scan complete — 8 viral opportunities found, 3 marked HOT.' },
      },
    ],
  },
  {
    id: 'auto-deploy',
    name: 'Auto Content Deploy',
    tagline: 'Multi-platform publisher',
    description:
      'Publishes prepared content to Facebook, Instagram and TikTok in one run. Handles per-platform caption variations, hashtags and optimal scheduling.',
    Icon: Icons.Rocket,
    accentClass: 'text-success bg-success/10 border-success/30',
    initialUrl: 'https://www.facebook.com/creatorstudio',
    steps: [
      {
        delay: 400,
        action: { type: 'navigate', target: 'https://www.facebook.com/creatorstudio', status: 'success' },
        log: { level: 'info', message: 'Opening Meta Creator Studio…' },
        screenshot: mockScreenshot({ url: 'https://www.facebook.com/creatorstudio', title: 'Meta Creator Studio', phase: 'Composing Facebook post', accent: META_ACCENT }),
      },
      {
        delay: 700,
        action: { type: 'click', target: 'button[data-testid="create-post"]', status: 'success' },
        log: { level: 'info', message: 'Started new Facebook post composer.' },
      },
      {
        delay: 700,
        action: { type: 'type', target: 'div[contenteditable="true"]', value: '🛍️ Hot find: Wireless Earbuds X3 — 40% off this week!', status: 'success' },
        log: { level: 'info', message: 'Filled Facebook caption.' },
      },
      {
        delay: 800,
        action: { type: 'click', target: 'button[data-testid="publish"]', status: 'success' },
        log: { level: 'success', message: '✓ Published to Facebook.' },
      },
      {
        delay: 700,
        action: { type: 'navigate', target: 'https://www.instagram.com/creatorstudio', status: 'success' },
        log: { level: 'info', message: 'Switching to Instagram composer…' },
        screenshot: mockScreenshot({ url: 'https://www.instagram.com/creatorstudio', title: 'Instagram Composer', phase: 'Reel upload', accent: META_ACCENT }),
      },
      {
        delay: 800,
        action: { type: 'type', target: 'textarea[aria-label="Caption"]', value: '🛍️ Hot find: Wireless Earbuds X3 — 40% off! #MsiaFinds #TikTokMadeMeBuyIt', status: 'success' },
        log: { level: 'info', message: 'Filled Instagram caption + 2 hashtags.' },
      },
      {
        delay: 700,
        action: { type: 'click', target: 'button:has-text("Share")', status: 'success' },
        log: { level: 'success', message: '✓ Published to Instagram.' },
      },
      {
        delay: 700,
        action: { type: 'navigate', target: 'https://www.tiktok.com/creator', status: 'success' },
        log: { level: 'info', message: 'Switching to TikTok composer…' },
        screenshot: mockScreenshot({ url: 'https://www.tiktok.com/creator', title: 'TikTok Upload', phase: 'Final platform', accent: TIKTOK_ACCENT }),
      },
      {
        delay: 800,
        action: { type: 'type', target: 'input[aria-label="caption"]', value: 'POV: you found the best wireless earbuds deal 🎧🔥 #fyp #MsiaFinds', status: 'success' },
        log: { level: 'info', message: 'Filled TikTok caption + 2 hashtags.' },
      },
      {
        delay: 700,
        action: { type: 'click', target: 'button[data-e2e="post-button"]', status: 'success' },
        log: { level: 'success', message: '✓ Published to TikTok.' },
      },
      {
        delay: 500,
        action: { type: 'done', target: 'deploy-complete', value: '3 platforms', status: 'success' },
        log: { level: 'success', message: '✓ Deploy complete — content live on Facebook, Instagram & TikTok.' },
      },
    ],
  },
]

const ACTION_ICON: Record<AgentAction['type'], LucideIcon> = {
  click: Icons.MousePointer2,
  type: Icons.Keyboard,
  navigate: Icons.Navigation,
  scroll: Icons.ArrowDown,
  extract: Icons.Download,
  done: Icons.CheckCircle2,
}

const STATUS_ICON: Record<AgentAction['status'], LucideIcon> = {
  pending: Icons.Clock,
  executing: Icons.LoaderCircle,
  success: Icons.Check,
  failed: Icons.X,
}

const LOG_COLOR: Record<AgentLog['level'], string> = {
  info: 'text-muted-foreground',
  warn: 'text-warning',
  error: 'text-destructive',
  success: 'text-success',
}

const LOG_ICON: Record<AgentLog['level'], LucideIcon> = {
  info: Icons.Terminal,
  warn: Icons.AlertTriangle,
  error: Icons.AlertOctagon,
  success: Icons.CheckCircle2,
}

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  } catch {
    return iso
  }
}

/**
 * Left-hand sidebar of the HERMES agent workspace right panel.
 *
 * Hosts the three killer agent use cases as a dropdown —
 *   1. No-API Data Sync (Shopee + Lazada commission scraper)
 *   2. TikTok Trend Spy (viral product discovery)
 *   3. Auto Content Deploy (FB / IG / TikTok publisher)
 *
 * Selecting a task reveals its description and a "Start Task" button. While
 * a run is in progress the Start button swaps for a "Stop" control. Below
 * the controls, two collapsible accordion sections render the live action
 * timeline and execution log stream — both scrollable, both with timestamps
 * and per-item status icons.
 *
 * The actual "agent execution" is a front-end simulation that drives the
 * Zustand store through a fixed timeline (see {@link TASKS}). Phase 6.3+
 * will replace this with a real backend-driven socket stream.
 */
export function AgentTaskPanel() {
  const agentTask = useAppStore((s) => s.agentTask)
  const setAgentTask = useAppStore((s) => s.setAgentTask)
  const agentStatus = useAppStore((s) => s.agentStatus)
  const setAgentStatus = useAppStore((s) => s.setAgentStatus)
  const setAgentUrl = useAppStore((s) => s.setAgentUrl)
  const setAgentScreenshot = useAppStore((s) => s.setAgentScreenshot)
  const agentActions = useAppStore((s) => s.agentActions)
  const agentLogs = useAppStore((s) => s.agentLogs)
  const addAgentAction = useAppStore((s) => s.addAgentAction)
  const clearAgentActions = useAppStore((s) => s.clearAgentActions)
  const addAgentLog = useAppStore((s) => s.addAgentLog)
  const clearAgentLogs = useAppStore((s) => s.clearAgentLogs)

  const [localTask, setLocalTask] = useState<string>(agentTask ?? '')
  const abortRef = useRef(false)

  // Cleanup any in-flight simulation when the panel unmounts.
  useEffect(() => {
    return () => {
      abortRef.current = true
    }
  }, [])

  const selectedTask = useMemo(
    () => TASKS.find((t) => t.id === localTask) ?? null,
    [localTask]
  )

  const isBusy = agentStatus === 'running' || agentStatus === 'paused'

  const startTask = async () => {
    if (!selectedTask || isBusy) return
    abortRef.current = false

    clearAgentActions()
    clearAgentLogs()
    setAgentTask(selectedTask.id)
    setAgentUrl(selectedTask.initialUrl)
    setAgentScreenshot(null)
    setAgentStatus('running')

    addAgentLog({
      id: uid('log'),
      level: 'info',
      message: `Initializing HERMES agent — task "${selectedTask.name}"…`,
      timestamp: new Date().toISOString(),
    })
    addAgentLog({
      id: uid('log'),
      level: 'info',
      message: `Spawning headless browser session (chromium, MY geo).`,
      timestamp: new Date().toISOString(),
    })

    for (const step of selectedTask.steps) {
      if (abortRef.current) return
      await sleep(step.delay)

      // Honour pause/resume by polling the store
      let waited = 0
      while (!abortRef.current) {
        const s = useAppStore.getState().agentStatus
        if (s === 'idle' || s === 'error') return // stopped
        if (s === 'running') break
        // paused — keep waiting
        await sleep(250)
        waited += 250
        if (waited > 60_000) return // safety valve
      }
      if (abortRef.current) return

      const ts = new Date().toISOString()
      addAgentAction({
        id: uid('act'),
        type: step.action.type,
        target: step.action.target,
        value: step.action.value,
        timestamp: ts,
        status: step.action.status ?? 'success',
      })
      if (step.log) {
        addAgentLog({
          id: uid('log'),
          level: step.log.level,
          message: step.log.message,
          timestamp: ts,
        })
      }
      if (step.screenshot) {
        setAgentScreenshot(step.screenshot)
      }
    }

    if (!abortRef.current) {
      setAgentStatus('completed')
      addAgentLog({
        id: uid('log'),
        level: 'success',
        message: 'Agent run finished. Workspace ready for next task.',
        timestamp: new Date().toISOString(),
      })
    }
  }

  const stopTask = () => {
    abortRef.current = true
    setAgentStatus('idle')
    setAgentScreenshot(null)
    addAgentLog({
      id: uid('log'),
      level: 'warn',
      message: 'Run aborted by user.',
      timestamp: new Date().toISOString(),
    })
  }

  const successCount = agentActions.filter((a) => a.status === 'success').length
  const failedCount = agentActions.filter((a) => a.status === 'failed').length

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r bg-background md:w-80">
      {/* Header: task picker + description + controls */}
      <div className="space-y-3 border-b p-3">
        <div className="flex items-center gap-1.5">
          <Icons.Sparkles className="size-3.5 text-hermes" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            HERMES Agent
          </h2>
          <Badge variant="outline" className="ml-auto border-hermes/30 text-[10px] text-hermes">
            beta
          </Badge>
        </div>

        <Select
          value={localTask}
          onValueChange={(v) => {
            setLocalTask(v)
            setAgentTask(v)
          }}
          disabled={isBusy}
        >
          <SelectTrigger className="h-9 w-full text-xs">
            <SelectValue placeholder="Choose a task…" />
          </SelectTrigger>
          <SelectContent>
            {TASKS.map((t) => (
              <SelectItem key={t.id} value={t.id} className="py-2">
                <div className="flex items-center gap-2">
                  <t.Icon className="size-4 text-hermes" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{t.name}</span>
                    <span className="text-[10px] text-muted-foreground">{t.tagline}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTask ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-hermes/20 bg-hermes/5 p-2.5"
          >
            <div className="mb-1 flex items-center gap-2">
              <selectedTask.Icon className="size-4 text-hermes" />
              <span className="text-xs font-semibold">{selectedTask.name}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {selectedTask.description}
            </p>
          </motion.div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-3 text-center">
            <Icons.Bot className="mx-auto mb-1.5 size-6 text-muted-foreground/60" />
            <p className="text-[11px] text-muted-foreground">
              Pick a task above to see its description.
            </p>
          </div>
        )}

        {/* Primary controls */}
        <div className="flex gap-2">
          {!isBusy ? (
            <Button
              type="button"
              onClick={startTask}
              disabled={!selectedTask}
              className="flex-1 bg-hermes-gradient text-xs font-semibold shadow-sm hover:opacity-90"
              size="sm"
            >
              <Icons.Play className="size-3.5" />
              Start Task
            </Button>
          ) : (
            <Button
              type="button"
              onClick={stopTask}
              variant="destructive"
              className="flex-1 text-xs font-semibold"
              size="sm"
            >
              <Icons.Square className="size-3" />
              Stop Run
            </Button>
          )}
        </div>

        {/* Run metrics */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            {agentActions.length} actions · {agentLogs.length} logs
          </span>
          <span className="flex items-center gap-2">
            {successCount > 0 && (
              <span className="flex items-center gap-0.5 text-success">
                <Icons.Check className="size-3" /> {successCount}
              </span>
            )}
            {failedCount > 0 && (
              <span className="flex items-center gap-0.5 text-destructive">
                <Icons.X className="size-3" /> {failedCount}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Body: scrollable timeline */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <Accordion
          type="multiple"
          defaultValue={['logs', 'actions']}
          className="px-2"
        >
          <AccordionItem value="logs" className="border-b">
            <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
              <span className="flex items-center gap-1.5">
                <Icons.ScrollText className="size-3.5 text-hermes" />
                Execution Logs
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                  {agentLogs.length}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="max-h-48 overflow-y-auto scrollbar-thin rounded-md bg-muted/40 p-2 font-mono">
                {agentLogs.length === 0 ? (
                  <p className="px-1 py-2 text-center text-[11px] text-muted-foreground">
                    No logs yet. Start a task to see live output.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {agentLogs.map((log) => {
                      const LogIcon = LOG_ICON[log.level]
                      return (
                        <li
                          key={log.id}
                          className="flex items-start gap-1.5 text-[11px] leading-relaxed"
                        >
                          <span className="mt-0.5 shrink-0 text-muted-foreground/70">
                            {formatTime(log.timestamp)}
                          </span>
                          <LogIcon className={cn('mt-0.5 size-3 shrink-0', LOG_COLOR[log.level])} />
                          <span className={cn('break-words', LOG_COLOR[log.level])}>
                            {log.message}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="actions" className="border-b">
            <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
              <span className="flex items-center gap-1.5">
                <Icons.ListChecks className="size-3.5 text-hermes" />
                Actions
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                  {agentActions.length}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="max-h-64 overflow-y-auto scrollbar-thin">
                {agentActions.length === 0 ? (
                  <p className="px-1 py-2 text-center text-[11px] text-muted-foreground">
                    No actions yet.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {agentActions.map((action, idx) => {
                      const ActionIcon = ACTION_ICON[action.type]
                      const StatusIcon = STATUS_ICON[action.status]
                      return (
                        <motion.li
                          key={action.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-2 rounded-md border border-border/60 bg-card px-2 py-1.5"
                        >
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-hermes/10 text-hermes">
                            <ActionIcon className="size-3" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
                                {action.type}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                #{idx + 1}
                              </span>
                              <StatusIcon
                                className={cn(
                                  'ml-auto size-3 shrink-0',
                                  action.status === 'executing' && 'animate-spin text-hermes',
                                  action.status === 'success' && 'text-success',
                                  action.status === 'failed' && 'text-destructive',
                                  action.status === 'pending' && 'text-muted-foreground'
                                )}
                              />
                            </div>
                            {action.target && (
                              <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                                {action.target}
                              </p>
                            )}
                            {action.value && (
                              <p className="mt-0.5 truncate text-[10px] text-foreground/80">
                                → {action.value}
                              </p>
                            )}
                            <p className="mt-0.5 text-[9px] text-muted-foreground/70">
                              {formatTime(action.timestamp)}
                            </p>
                          </div>
                        </motion.li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Footer: branding */}
      <div className="border-t bg-muted/30 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Icons.BrainCircuit className="size-3 text-hermes" />
            Powered by HERMES
          </span>
          <span className="text-[10px] text-muted-foreground">
            v6.2 · split-screen
          </span>
        </div>
      </div>
    </aside>
  )
}
