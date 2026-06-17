import { logger } from '@/lib/logger'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key)
    }
  }
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number
  /** Time window in milliseconds */
  windowMs: number
  /** Optional: custom key prefix (defaults to route path) */
  keyPrefix?: string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter: number // seconds until reset
}

/**
 * Check rate limit for a given key (usually IP + route).
 * Uses token bucket algorithm with sliding window.
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup()

  const key = `${config.keyPrefix ?? 'default'}:${identifier}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetTime) {
    // New window
    store.set(key, { count: 1, resetTime: now + config.windowMs })
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: now + config.windowMs,
      retryAfter: 0,
    }
  }

  if (entry.count >= config.limit) {
    // Rate limited
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    logger.warn('Rate limit exceeded', { key, count: entry.count, limit: config.limit })
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    }
  }

  // Increment
  entry.count++
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
    retryAfter: 0,
  }
}

// ============== Preset Configurations ==============

export const RATE_LIMITS = {
  /** Auth routes — strict to prevent brute force */
  auth: { limit: 5, windowMs: 60 * 1000 }, // 5 req/min
  /** Standard API data routes */
  api: { limit: 100, windowMs: 60 * 1000 }, // 100 req/min
  /** AI generation routes — expensive, lower limit */
  ai: { limit: 10, windowMs: 60 * 1000 }, // 10 req/min
  /** Search routes */
  search: { limit: 30, windowMs: 60 * 1000 }, // 30 req/min
} as const

/**
 * Helper to get client IP from Next.js request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

/**
 * Apply rate limiting to a Next.js API route.
 * Returns null if allowed, or a Response object if rate limited.
 *
 * Usage:
 *   const limited = applyRateLimit(request, RATE_LIMITS.api, 'products')
 *   if (limited) return limited
 */
export function applyRateLimit(
  request: Request,
  config: RateLimitConfig,
  routeName: string
): Response | null {
  const ip = getClientIp(request)
  const result = rateLimit(ip, { ...config, keyPrefix: routeName })

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(result.retryAfter),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetTime),
        },
      }
    )
  }

  return null
}
