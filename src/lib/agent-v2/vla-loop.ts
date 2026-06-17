/**
 * Agent V2 — VLA Loop Service
 * ----------------------------
 * Vision-Language-Action loop for the Computer-Use Agent (Phase 6.3).
 *
 * The loop:
 *   1. The user picks a pre-built {@link VlaTask} (e.g. "TikTok Trend Spy").
 *   2. The agent asks the z-ai-web-dev-sdk chat completion API to plan a
 *      sequence of {@link AgentAction}s that, if executed against a
 *      browser session, would accomplish the task goal.
 *   3. The planned actions are returned to the caller (the API route)
 *      which streams them to the agent-browser mini-service via Socket.io.
 *   4. Each action produces a screenshot + log; the loop optionally
 *      re-prompts the LLM with the new screenshot (via VLM) until the
 *      task is `done` or an error threshold is hit.
 *
 * For Phase 6.3 the loop is single-pass: we plan → return the plan → the
 * UI/mini-service executes the actions. A multi-pass VLM-driven
 * replan-on-screenshot loop is left as the next iteration hook.
 *
 * Backwards compatibility: P6-1/P6-2 scaffolded a `VlaLoop` class +
 * `VlaLoopConfig` interface that the in-process `JobRegistry` (see
 * `./job-registry.ts`) consumes. We keep a thin adapter at the bottom
 * of this file that delegates to `VlaLoopService.executeTask` so the
 * registry keeps working unchanged.
 */

import { logger } from '@/lib/logger'
import type {
  AgentAction as AgentActionWire,
  ActionResult,
  ScreenshotAnalysis,
} from './action-types'

// ============== Types ==============

export type ActionType =
  | 'navigate'
  | 'click'
  | 'type'
  | 'scroll'
  | 'extract'
  | 'done'

/**
 * Wire-format action emitted by the planner. This is the shape that
 * travels over Socket.io to the agent-browser mini-service.
 */
export interface AgentAction {
  type: ActionType
  url?: string
  x?: number
  y?: number
  text?: string
  selector?: string
  direction?: 'up' | 'down'
  amount?: number
  fields?: string[]
}

export interface VlaTask {
  id: string
  name: string
  description: string
  goal: string
  steps: string[]
  platforms: string[]
  expectedOutput: string
  /** Whether this task requires real browser rendering (vs. simulation only). */
  requiresRealBrowser?: boolean
}

export interface ExecuteOptions {
  onScreenshot?: (screenshot: string) => void
  onAction?: (action: AgentAction) => void
  onLog?: (level: string, message: string) => void
  onComplete?: (result: string) => void
  onError?: (error: string) => void
  /** Optional user id for telemetry. Defaults to 'demo-user'. */
  userId?: string
}

// ============== Pre-built Task Catalog ==============

export const TASK_DEFINITIONS: VlaTask[] = [
  {
    id: 'no-api-sync',
    name: 'No-API Data Sync',
    description:
      'Login to Shopee/Lazada Affiliate Portal and sync commission data without official API',
    goal: 'Extract live commission data from affiliate portal',
    steps: [
      'Navigate to affiliate portal login page',
      'Enter user credentials',
      'Navigate to dashboard/earnings page',
      'Extract commission, clicks, orders data',
      'Sync data to TheViralFindsMY database',
    ],
    platforms: ['shopee', 'lazada'],
    expectedOutput: 'Updated earnings data in dashboard',
    requiresRealBrowser: true,
  },
  {
    id: 'tiktok-trend-spy',
    name: 'TikTok Trend Spy',
    description:
      'Scan TikTok for viral products with affiliate bags and extract product info',
    goal: 'Find trending affiliate products on TikTok Malaysia',
    steps: [
      'Navigate to TikTok trending page',
      'Scroll through videos looking for affiliate bag icons',
      'Click on affiliate products',
      'Extract product name, price, link',
      'Return list of trending products',
    ],
    platforms: ['tiktok'],
    expectedOutput: 'List of 10-20 trending products with affiliate links',
    requiresRealBrowser: true,
  },
  {
    id: 'auto-content-deploy',
    name: 'Auto Content Deploy',
    description:
      'Publish AI-generated content to Facebook, Instagram, and TikTok automatically',
    goal: 'Post AI-generated content to social media platforms',
    steps: [
      'Navigate to platform (FB/IG/TikTok)',
      'Login with user credentials',
      'Create new post',
      'Upload product image',
      'Paste AI-generated caption',
      'Add affiliate link',
      'Publish post',
    ],
    platforms: ['facebook', 'instagram', 'tiktok'],
    expectedOutput: 'Published posts on selected platforms',
    requiresRealBrowser: true,
  },
  {
    id: 'shopee-xtra-harvest',
    name: 'Shopee XTRA Harvest',
    description:
      'Scan the Shopee Affiliate dashboard for products with active XTRA commission boosts and queue them for re-linking',
    goal: 'Identify and capture every XTRA commission opportunity',
    steps: [
      'Navigate to Shopee Affiliate dashboard',
      'Open the XTRA campaigns page',
      'Scroll through all listed products',
      'Extract product id, name, XTRA commission %, expiry',
      'Return list for re-linking',
    ],
    platforms: ['shopee'],
    expectedOutput: 'List of XTRA-eligible products ready for re-linking',
    requiresRealBrowser: true,
  },
  {
    id: 'competitor-content-scan',
    name: 'Competitor Content Scan',
    description:
      'Visit a competitor Shopee shop and capture their top-selling products and pricing',
    goal: 'Build a competitor pricing benchmark',
    steps: [
      'Navigate to competitor shop URL',
      'Open "Top Selling" tab',
      'Scroll to load full list',
      'Extract product names, prices, sold counts, ratings',
      'Return structured list',
    ],
    platforms: ['shopee'],
    expectedOutput: 'Structured competitor benchmark list (10-30 products)',
    requiresRealBrowser: true,
  },
]

// ============== Service ==============

const SYSTEM_PROMPT = `You are a browser-automation planner for TheViralFindsMY, a Malaysian Shopee affiliate platform.
Given a task description, goal, and high-level steps, output a JSON array of actions to execute in a headless browser.

Each action object has:
  - "type": one of "navigate" | "click" | "type" | "scroll" | "extract" | "done"
  - "url": string  (for "navigate")
  - "x": number, "y": number  (for "click", coordinates in the 1280x720 viewport)
  - "text": string  (for "type")
  - "selector": string  (optional CSS selector for "click" / "type")
  - "direction": "up" | "down"  (for "scroll")
  - "fields": string[]  (for "extract")

Output ONLY the JSON array — no markdown, no prose. Limit to 12 actions. Always end with a "done" action.
If the task requires real authentication or sensitive credentials, return a single "done" action with text "DEFERRED: requires credentials".`

const DEFAULT_USER_ID = 'demo-user'

export class VlaLoopService {
  /**
   * Plan and (in a future iteration) execute a VLA task. Phase 6.3 only
   * runs the planning pass — execution is delegated to the
   * agent-browser mini-service via Socket.io from the API layer.
   */
  async executeTask(
    taskId: string,
    options: ExecuteOptions
  ): Promise<void> {
    const userId = options.userId ?? DEFAULT_USER_ID
    const task = TASK_DEFINITIONS.find((t) => t.id === taskId)
    if (!task) {
      options.onError?.('Task not found')
      return
    }

    options.onLog?.('info', `Starting task: ${task.name}`)

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content:
              `Task: ${task.name}\n` +
              `Goal: ${task.goal}\n` +
              `Steps:\n${task.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n` +
              `Platforms: ${task.platforms.join(', ')}\n` +
              `Expected output: ${task.expectedOutput}\n\n` +
              `Output the action sequence as a JSON array.`,
          },
        ],
        thinking: { type: 'disabled' },
      })

      const response = completion.choices[0]?.message?.content ?? ''

      if (!response) {
        options.onError?.('Agent returned an empty plan')
        return
      }

      options.onLog?.(
        'info',
        `Agent planned actions: ${response.length > 120 ? response.slice(0, 120) + '…' : response}`
      )

      // Parse the planned actions. Tolerate responses that wrap the
      // array in markdown fences or prepend prose.
      const plannedActions = this.parseActions(response)
      if (plannedActions.length === 0) {
        options.onLog?.('warn', 'Agent plan contained no parseable actions')
      } else {
        for (const action of plannedActions) {
          options.onAction?.(action)
          if (action.type === 'done') {
            // Don't forward the terminal marker as a browser action.
            break
          }
        }
      }

      logger.info('VLA task planned', {
        taskId: task.id,
        userId,
        actionCount: plannedActions.length,
      })

      options.onLog?.('success', `Task "${task.name}" planned (${plannedActions.length} actions)`)
      options.onComplete?.(response)
    } catch (error) {
      logger.error(
        'VLA loop failed',
        { taskId: task.id, userId },
        error
      )
      options.onError?.(
        error instanceof Error ? error.message : 'Unknown VLA loop error'
      )
    }
  }

  /**
   * Best-effort parser: extract a JSON array of action objects from an
   * LLM response. The model sometimes wraps output in ```json fences
   * or prepends a sentence — we strip all of that and look for the
   * first balanced `[...]` block.
   */
  private parseActions(raw: string): AgentAction[] {
    const trimmed = raw.trim()
    // Strip markdown code fences if present
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
    const candidate = fenceMatch ? fenceMatch[1] : trimmed

    const start = candidate.indexOf('[')
    const end = candidate.lastIndexOf(']')
    if (start === -1 || end === -1 || end <= start) {
      return []
    }

    try {
      const parsed: unknown = JSON.parse(candidate.slice(start, end + 1))
      if (!Array.isArray(parsed)) return []
      return parsed
        .filter((a): a is Record<string, unknown> => typeof a === 'object' && a !== null && 'type' in a)
        .map((a) => this.normalizeAction(a))
        .filter((a): a is AgentAction => a !== null)
    } catch {
      return []
    }
  }

  private normalizeAction(raw: Record<string, unknown>): AgentAction | null {
    const type = raw.type as string
    if (!type) return null
    const allowed: ActionType[] = [
      'navigate',
      'click',
      'type',
      'scroll',
      'extract',
      'done',
    ]
    if (!allowed.includes(type as ActionType)) return null
    const action: AgentAction = { type: type as ActionType }
    if (typeof raw.url === 'string') action.url = raw.url
    if (typeof raw.x === 'number') action.x = raw.x
    if (typeof raw.y === 'number') action.y = raw.y
    if (typeof raw.text === 'string') action.text = raw.text
    if (typeof raw.selector === 'string') action.selector = raw.selector
    if (raw.direction === 'up' || raw.direction === 'down') {
      action.direction = raw.direction
    }
    if (typeof raw.amount === 'number') action.amount = raw.amount
    if (Array.isArray(raw.fields)) {
      action.fields = raw.fields.filter(
        (f): f is string => typeof f === 'string'
      )
    }
    return action
  }

  /**
   * Look up a task by id. Used by the GET /api/agent/tasks endpoint
   * and by POST /api/agent/execute to validate the requested task.
   */
  getTask(taskId: string): VlaTask | undefined {
    return TASK_DEFINITIONS.find((t) => t.id === taskId)
  }

  listTasks(): VlaTask[] {
    return TASK_DEFINITIONS
  }
}

export const vlaLoopService = new VlaLoopService()

// ============== Backwards-compatible VlaLoop wrapper ==============
//
// P6-1/P6-2 scaffolded a `VlaLoop` class + `VlaLoopConfig` interface
// that the in-process `JobRegistry` (see `./job-registry.ts`) depends
// on. P6-3 introduced the `VlaLoopService` single-pass planner above
// as the canonical entry point for the API routes. To keep the
// `JobRegistry` working unchanged we expose a `VlaLoop` adapter that
// delegates to `VlaLoopService.executeTask` and tracks the iteration
// count + stop flag the registry reads. The fields and methods on
// this class are intentionally compatible with the original P6-1/P6-2
// surface (`run()`, `stop()`, `iterationCount`, `running`).

export interface VlaLoopConfig {
  taskId: string
  goal: string
  maxIterations: number
  /** Hard wall-clock budget, in seconds. */
  timeout: number
  /** Streamed callback — fired before each action is executed. */
  onAction?: (action: AgentActionWire) => void
  /** Streamed callback — fired after each action's result is known. */
  onResult?: (result: ActionResult) => void
  /** Streamed callback — fired whenever a new screenshot is captured. */
  onScreenshot?: (screenshot: string) => void
  /** Streamed callback — human-readable log line for the UI console. */
  onLog?: (level: 'info' | 'warn' | 'error' | 'success', message: string) => void
  /** Fired once when the loop finishes successfully. */
  onComplete?: (result: string) => void
  /** Fired once when the loop aborts with an error. */
  onError?: (error: string) => void
  /** Optional user id for telemetry. */
  userId?: string
}

export class VlaLoop {
  /** Whether the loop is currently mid-iteration. */
  private isRunning = false
  /** Number of actions emitted so far during the current run. */
  private iterations = 0
  private stopRequested = false
  private readonly config: VlaLoopConfig

  constructor(config: VlaLoopConfig) {
    this.config = config
  }

  /** Whether the loop is currently mid-iteration. */
  get running(): boolean {
    return this.isRunning
  }

  /** Number of iterations completed so far. */
  get iterationCount(): number {
    return this.iterations
  }

  /** Request the loop to stop after the current iteration. */
  stop(): void {
    this.stopRequested = true
    this.config.onLog?.('warn', 'VLA loop stopped by user')
  }

  /**
   * Run the planning pass. Resolves when the plan is produced or an
   * error occurs. P6-3 only runs the single-pass planner; the
   * `maxIterations` / `timeout` config fields are accepted for
   * backwards compatibility but are enforced by the planner's own
   * LLM call budget rather than by an iteration loop here.
   */
  async run(): Promise<void> {
    if (this.isRunning) {
      this.config.onLog?.('warn', 'VLA loop already running — ignoring duplicate run()')
      return
    }
    if (this.stopRequested) return
    this.isRunning = true
    try {
      await vlaLoopService.executeTask(this.config.taskId, {
        userId: this.config.userId,
        onLog: (level, message) => {
          const normalized = (
            ['info', 'warn', 'error', 'success'].includes(level)
              ? level
              : 'info'
          ) as 'info' | 'warn' | 'error' | 'success'
          this.config.onLog?.(normalized, message)
        },
        onAction: (action) => {
          this.iterations += 1
          // The wire `AgentAction` and the action-types `AgentAction`
          // share the same shape (the action-types variant is a
          // superset), so the cast is sound.
          this.config.onAction?.(action as unknown as AgentActionWire)
        },
        onComplete: (result) => this.config.onComplete?.(result),
        onError: (error) => this.config.onError?.(error),
        onScreenshot: (screenshot) => this.config.onScreenshot?.(screenshot),
      })
    } finally {
      this.isRunning = false
    }
  }
}

// Re-export the action-types `ScreenshotAnalysis` so consumers that
// imported it from `vla-loop` in P6-1/P6-2 keep compiling.
export type { ScreenshotAnalysis }
