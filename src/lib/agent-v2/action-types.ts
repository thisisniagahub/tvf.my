/**
 * Agent v2 — Action Types
 * -----------------------
 * Shared type definitions for the VLA (Vision-Language-Action) loop.
 *
 * The loop observes the browser (screenshot), reasons about what to do
 * next (LLM analysis), and emits a structured `AgentAction` that the
 * browser service executes. The result of that execution is reported
 * back as an `ActionResult`, which feeds the next iteration.
 *
 * Keeping these as a standalone module (no runtime imports) means they
 * can be safely imported from client components, server routes, and
 * mini-services alike.
 */

export type ActionType =
  | 'navigate'
  | 'click'
  | 'type'
  | 'scroll'
  | 'extract'
  | 'screenshot'
  | 'wait'
  | 'done'

export interface AgentAction {
  type: ActionType
  /** For 'navigate' — absolute URL to load. */
  url?: string
  /** For 'click' — element coordinates. */
  x?: number
  y?: number
  /** For 'type' — text to enter into the focused element. */
  text?: string
  /** For 'click'/'type'/'extract' — CSS/XPath selector. */
  selector?: string
  /** For 'scroll' — direction. */
  direction?: 'up' | 'down'
  /** For 'scroll' — pixel amount. */
  amount?: number
  /** For 'extract' — field names to pull (e.g. ['earnings','clicks']). */
  fields?: string[]
  /** For 'wait' — duration in milliseconds. */
  duration?: number
  /** Human-readable explanation for logs / UI. */
  description?: string
}

export interface ActionResult {
  type: ActionType
  success: boolean
  /** Optional payload — e.g. extracted fields or screenshot data URL. */
  data?: unknown
  /** Populated when `success` is false. */
  error?: string
  /** ISO timestamp of when the action completed. */
  timestamp: string
}

export interface ScreenshotAnalysis {
  /** Natural-language description of what the model sees on the screen. */
  description: string
  /** Structured list of relevant UI elements. */
  elements: Array<{
    type: 'button' | 'input' | 'link' | 'text' | 'image'
    text?: string
    selector?: string
    position?: { x: number; y: number }
  }>
  /** The model's recommended next action, or `{ type: 'done' }`. */
  suggestedAction?: AgentAction
}
