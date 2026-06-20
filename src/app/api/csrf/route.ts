import { NextResponse } from 'next/server'
import { generateCsrfToken } from '@/lib/csrf'

/**
 * GET /api/csrf
 *
 * Issues a fresh CSRF token. The token is set as an httpOnly + sameSite=strict
 * cookie and also returned in the JSON body so the client can read it and
 * attach it as the `x-csrf-token` header on subsequent state-changing requests.
 *
 * This is the "issue" half of the double-submit cookie CSRF pattern.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const token = generateCsrfToken()
  const response = NextResponse.json({ token })
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  })
  return response
}
