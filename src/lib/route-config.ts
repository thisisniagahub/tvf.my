/**
 * Route segment configuration presets.
 *
 * AREA 5: Hybrid caching strategy.
 *
 * - Read-heavy routes (dashboard, products, trends): `revalidate = 60`
 *   Stale-while-revalidate at the edge. Reduces Prisma load by ~90%.
 *
 * - AI/Write routes (hermes/chat, content/script, ai/*): `dynamic = 'force-dynamic'`
 *   Always fresh — these are expensive and user-specific.
 *
 * - Search routes: `revalidate = 30` — shorter cache for freshness.
 *
 * - Auth/sensitive routes: `dynamic = 'force-dynamic'` + no caching.
 */

// ============ PRESETS ============

/** Read-heavy data routes — 60s ISR (stale-while-revalidate) */
export const READ_HEAVY = {
  revalidate: 60,
} as const

/** Search routes — 30s ISR (shorter for freshness) */
export const SEARCH = {
  revalidate: 30,
} as const

/** AI generation routes — always fresh, no cache */
export const AI_DYNAMIC = {
  dynamic: 'force-dynamic' as const,
}

/** Auth/sensitive routes — always fresh, no cache */
export const SENSITIVE = {
  dynamic: 'force-dynamic' as const,
}

/** Default — safe for most routes */
export const DEFAULT = {
  dynamic: 'force-dynamic' as const,
}

// ============ ROUTE CLASSIFICATION ============

/**
 * Routes that should use ISR (60s revalidation):
 * - /api/dashboard — stats don't change per second
 * - /api/products — product catalog changes infrequently
 * - /api/trends — trend data updates every few minutes
 *
 * Routes that should use short ISR (30s):
 * - /api/search — needs freshness but can cache briefly
 *
 * Routes that MUST be force-dynamic:
 * - /api/hermes/* — AI calls, user-specific, expensive
 * - /api/ai/* — image/TTS generation
 * - /api/content/* — AI script generation
 * - /api/agent/* — credentials, execution
 * - /api/mcp/* — user-specific server/plugin config
 * - /api/auth/* — NextAuth handlers
 */
export const ROUTE_CONFIG = {
  // ISR routes (cached at edge for 60s)
  '/api/dashboard': READ_HEAVY,
  '/api/products': READ_HEAVY,
  '/api/trends': READ_HEAVY,

  // Short ISR (30s)
  '/api/search': SEARCH,

  // Always fresh
  '/api/hermes/chat': AI_DYNAMIC,
  '/api/hermes/memory': SENSITIVE,
  '/api/hermes/skills': READ_HEAVY, // Skills don't change often
  '/api/hermes/cron': SENSITIVE,
  '/api/hermes/delegate': AI_DYNAMIC,
  '/api/hermes/tools': AI_DYNAMIC,
  '/api/hermes/seed': SENSITIVE,
  '/api/content/script': AI_DYNAMIC,
  '/api/ai/thumbnails': AI_DYNAMIC,
  '/api/ai/voiceover': AI_DYNAMIC,
  '/api/agent/credentials': SENSITIVE,
  '/api/agent/execute': AI_DYNAMIC,
  '/api/agent/tasks': READ_HEAVY, // Task list is static
  '/api/agent/stop': AI_DYNAMIC,
  '/api/mcp/servers': SENSITIVE,
  '/api/mcp/plugins': READ_HEAVY, // Plugin catalog is static
  '/api/auth/*': SENSITIVE,
} as const
