import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
}

/**
 * Get the authenticated user from the session.
 * Falls back to 'demo-user' if no auth (demo mode).
 * In production, this should require authentication.
 */
export async function requireUser(): Promise<AuthUser> {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    return {
      id: (session.user as any).id || 'demo-user',
      name: session.user.name,
      email: session.user.email,
    }
  }

  // Demo mode fallback — allows the app to work without login.
  // In production, uncomment the following to require auth:
  // throw new Error('Unauthorized')
  return {
    id: 'demo-user',
    name: 'TheViralFinds',
    email: 'demo@theviralfindsmy.com',
  }
}

/**
 * Strict auth — always requires a session.
 * Use for sensitive endpoints (credentials, MCP keys).
 */
export async function requireAuth(): Promise<AuthUser> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return {
    id: (session.user as any).id || 'demo-user',
    name: session.user.name,
    email: session.user.email,
  }
}
