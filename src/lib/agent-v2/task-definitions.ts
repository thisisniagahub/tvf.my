/**
 * Agent v2 — Task Definitions
 * ---------------------------
 * Curated catalog of "killer use cases" the agent can run end-to-end
 * via the VLA loop. Each task is a self-contained playbook:
 *
 *   - `goal`         — what the VLA loop is trying to achieve (passed
 *                      to the LLM as the system-prompt goal).
 *   - `steps`        — ordered human-readable description of the flow.
 *                      Used for UI display and as soft guidance; the
 *                      LLM may deviate if it observes something else.
 *   - `platforms`    — which affiliate platforms the task touches.
 *   - `riskLevel`    — surfaces in the legal disclaimer / safety UI.
 *   - `requiresCredentials` — whether the user must store creds first.
 *   - `icon`         — lucide-react icon name for the UI.
 *
 * Keep this file pure (no imports) so it can be bundled into both
 * client and server without side effects.
 */

export type AgentTaskCategory =
  | 'data-sync'
  | 'trend-spy'
  | 'content-deploy'
  | 'custom'

export type RiskLevel = 'low' | 'medium' | 'high'

export interface AgentTask {
  id: string
  name: string
  description: string
  category: AgentTaskCategory
  /** The natural-language goal the VLA loop will pursue. */
  goal: string
  /** Ordered human-readable step list for UI display. */
  steps: string[]
  /** Which affiliate platforms this task interacts with. */
  platforms: string[]
  expectedOutput: string
  estimatedTime: string
  riskLevel: RiskLevel
  requiresCredentials: boolean
  /** lucide-react icon name (e.g. 'ShoppingBag'). */
  icon: string
}

export const AGENT_TASKS: AgentTask[] = [
  {
    id: 'no-api-shopee-sync',
    name: 'Shopee Commission Sync (No-API)',
    description:
      'Login to Shopee Affiliate Portal and extract live commission data without official API',
    category: 'data-sync',
    goal: 'Extract earnings, clicks, orders, and commission data from Shopee Affiliate Portal',
    steps: [
      'Navigate to https://affiliate.shopee.com.my/',
      'Enter user email and password',
      'Wait for dashboard to load',
      'Navigate to Performance > Earnings',
      'Extract: total earnings, clicks, orders, conversion rate',
      'Navigate to Product Performance',
      'Extract: top 10 products with clicks and commissions',
      'Sync extracted data to TheViralFindsMY database',
    ],
    platforms: ['shopee'],
    expectedOutput: 'Updated dashboard with live Shopee commission data',
    estimatedTime: '2-3 minutes',
    riskLevel: 'high',
    requiresCredentials: true,
    icon: 'ShoppingBag',
  },
  {
    id: 'no-api-lazada-sync',
    name: 'Lazada Commission Sync (No-API)',
    description: 'Login to Lazada Affiliate Portal and extract live commission data',
    category: 'data-sync',
    goal: 'Extract earnings and performance data from Lazada Affiliate Portal',
    steps: [
      'Navigate to https://affiliate.lazada.com.my/',
      'Enter user credentials',
      'Navigate to Reports > Performance',
      'Extract: earnings, clicks, orders',
      'Sync to TheViralFindsMY',
    ],
    platforms: ['lazada'],
    expectedOutput: 'Updated Lazada earnings in Unified Earnings page',
    estimatedTime: '2-3 minutes',
    riskLevel: 'high',
    requiresCredentials: true,
    icon: 'ShoppingBag',
  },
  {
    id: 'tiktok-trend-spy',
    name: 'TikTok Viral Product Spy',
    description:
      'Scan TikTok for viral products with affiliate bags (beg kuning) and extract product info',
    category: 'trend-spy',
    goal: 'Find 10-20 trending affiliate products on TikTok Malaysia',
    steps: [
      'Navigate to https://www.tiktok.com/discover/trending',
      'Scroll through trending videos',
      'Identify videos with affiliate bag icon (beg kuning)',
      'Click on affiliate product link',
      'Extract: product name, price, platform, affiliate link',
      'Return list of trending products',
    ],
    platforms: ['tiktok'],
    expectedOutput: 'List of 10-20 trending products added to Trend Spy',
    estimatedTime: '5-10 minutes',
    riskLevel: 'low',
    requiresCredentials: false,
    icon: 'Music',
  },
  {
    id: 'auto-content-facebook',
    name: 'Auto-Post to Facebook Page',
    description:
      'Publish AI-generated content to Facebook Page with product image and affiliate link',
    category: 'content-deploy',
    goal: 'Create and publish a post on Facebook Page',
    steps: [
      'Navigate to https://www.facebook.com/',
      'Login with user credentials',
      'Navigate to user Facebook Page',
      'Click "Create Post"',
      'Upload product image',
      'Paste AI-generated caption with Manglish style',
      'Add affiliate link',
      'Click "Post"',
    ],
    platforms: ['facebook'],
    expectedOutput: 'Published Facebook post with affiliate content',
    estimatedTime: '1-2 minutes',
    riskLevel: 'medium',
    requiresCredentials: true,
    icon: 'Facebook',
  },
  {
    id: 'auto-content-instagram',
    name: 'Auto-Post to Instagram',
    description: 'Publish AI-generated content to Instagram with product image and caption',
    category: 'content-deploy',
    goal: 'Create and publish an Instagram post',
    steps: [
      'Navigate to https://www.instagram.com/',
      'Login with user credentials',
      'Click "Create New Post"',
      'Upload product image',
      'Paste AI-generated caption',
      'Add hashtags',
      'Click "Share"',
    ],
    platforms: ['instagram'],
    expectedOutput: 'Published Instagram post',
    estimatedTime: '1-2 minutes',
    riskLevel: 'medium',
    requiresCredentials: true,
    icon: 'Instagram',
  },
  {
    id: 'auto-content-tiktok',
    name: 'Auto-Post to TikTok',
    description: 'Publish AI-generated content to TikTok with video and caption',
    category: 'content-deploy',
    goal: 'Create and publish a TikTok post',
    steps: [
      'Navigate to https://www.tiktok.com/upload',
      'Login with user credentials',
      'Upload product video/image',
      'Paste AI-generated caption',
      'Add hashtags',
      'Click "Post"',
    ],
    platforms: ['tiktok'],
    expectedOutput: 'Published TikTok post',
    estimatedTime: '2-3 minutes',
    riskLevel: 'medium',
    requiresCredentials: true,
    icon: 'Music',
  },
]

/** Look up a single task by id. Returns `undefined` if not found. */
export function getTaskById(id: string): AgentTask | undefined {
  return AGENT_TASKS.find((t) => t.id === id)
}

/** Filter tasks by category. */
export function getTasksByCategory(category: AgentTaskCategory): AgentTask[] {
  return AGENT_TASKS.filter((t) => t.category === category)
}
