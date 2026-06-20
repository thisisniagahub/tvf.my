import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

/**
 * CSRF Protection Utility
 *
 * Implements the double-submit cookie pattern:
 *   1. Client fetches `GET /api/csrf` which sets an httpOnly `csrf-token`
 *      cookie and returns the same token in the JSON body.
 *   2. Client reads the token from the response body and sends it back in
 *      an `x-csrf-token` header on every state-changing request.
 *   3. `verifyCsrfToken()` compares the header token against the cookie
 *      token using a timing-safe equality check.
 *
 * Because the cookie is httpOnly+sameSite=strict, JavaScript on a
 * cross-origin page cannot read it — so a malicious site cannot forge a
 * matching header/cookie pair. Same-origin scripts can read the token
 * from the JSON response (step 1) and send it in the header (step 2),
 * which is the intended UX.
 */

const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_COOKIE = 'csrf-token'

/**
 * Generate a CSRF token (32 random bytes → 64-char hex string).
 *
 * Uses the Web Crypto `crypto.getRandomValues` global, which is available
 * in both the Node.js runtime (Next.js route handlers) and the Edge runtime.
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Verify the CSRF token presented in the request header against the value
 * stored in the csrf-token cookie.
 *
 * Returns true only when both values are present and byte-equal. Uses
 * Node.js `crypto.timingSafeEqual` to prevent timing-side-channel attacks.
 */
export function verifyCsrfToken(request: NextRequest): boolean {
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER)
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value

  if (!headerToken || !cookieToken) return false

  // Timing-safe comparison — constant-time for equal-length buffers.
  const a = Buffer.from(headerToken)
  const b = Buffer.from(cookieToken)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * CSRF middleware helper for state-changing requests.
 *
 * Returns `null` when the request is allowed to proceed (GET/HEAD, or a
 * state-changing request with a valid token). Returns a 403 JSON response
 * when the token is missing or invalid.
 *
 * Usage in a route handler:
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const csrfError = csrfCheck(request)
 *   if (csrfError) return csrfError
 *   // ... route logic
 * }
 * ```
 */
export function csrfCheck(request: NextRequest): NextResponse | null {
  if (request.method === 'GET' || request.method === 'HEAD') return null

  if (!verifyCsrfToken(request)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  return null
}

/**
 * Exported for consumers that need to read the canonical header / cookie
 * names (e.g. client-side fetch wrappers that auto-attach the header).
 */
export const CSRF = {
  HEADER: CSRF_TOKEN_HEADER,
  COOKIE: CSRF_COOKIE,
} as const
