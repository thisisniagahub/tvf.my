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
 *
 * Header priority:
 *   1. `x-vercel-forwarded-for` (Vercel-native, trustworthy) — leftmost
 *      entry is the original client IP.
 *   2. `x-real-ip` (set by Vercel / our Caddy infra) — single value,
 *      trustworthy.
 *   3. `x-forwarded-for` — fall back to the RIGHTMOST entry. The
 *      rightmost value is appended by our own trusted infrastructure
 *      (Caddy → app), while the leftmost entries may be spoofed by the
 *      client. Picking the rightmost is defense-in-depth: even if a
 *      client injects a fake `X-Forwarded-For: 1.2.3.4` header, our
 *      infra's appended entry (the real remote_host) takes precedence.
 *   4. 'unknown' — no IP detected (rate-limit falls back to a shared
 *      'unknown' bucket, which is intentionally restrictive).
 */
export function getClientIp(request: Request): string {
  // 1. Vercel sets x-vercel-forwarded-for with the real client IP.
  //    Take the FIRST entry (leftmost = original client).
  const vercelFwd = request.headers.get('x-vercel-forwarded-for')
  if (vercelFwd) {
    const first = vercelFwd.split(',')[0]?.trim()
    if (first) return first
  }

  // 2. x-real-ip is set by Vercel / our infrastructure — trustworthy.
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  // 3. Fallback: x-forwarded-for — take RIGHTMOST (set by our infra,
  //    not client). Leftmost entries can be spoofed by clients that
  //    send their own X-Forwarded-For header before reaching us.
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const parts = forwarded.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length > 0) {
      // Rightmost is set by our own infra (most trustworthy).
      return parts[parts.length - 1] || 'unknown'
    }
  }

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
