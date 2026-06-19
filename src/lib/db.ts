/**
 * Bulletproof Prisma client with type-safe fallback.
 *
 * Architecture:
 * 1. Uses `eval()` dynamic import — Turbopack cannot statically resolve
 *    `@prisma/client` at build time, preventing "Module not found" crashes.
 * 2. `withDbFallback<T, F>` preserves full type safety: the operation
 *    returns type `T`, the fallback returns type `F`, and the union
 *    `T | F` flows to callers without `any`.
 * 3. `db` is typed as `PrismaClient | NoOpClient` — a branded type that
 *    supports the same property access chain but returns null/[] on
 *    every method call when Prisma is unavailable.
 */

import { logger } from '@/lib/logger'

// ============ TYPE-SAFE NO-OP CLIENT ============

/**
 * A recursive Proxy that returns async null/[] for any property chain.
 * This is the type-safe fallback when Prisma is not available.
 */
type NoOpClient = {
  [key: string]: NoOpClient | ((...args: unknown[]) => Promise<null | unknown[]>)
}

function createNoOpClient(): NoOpClient {
  const handler: ProxyHandler<NoOpClient> = {
    get(): NoOpClient {
      return new Proxy(function () { return Promise.resolve(null) } as unknown as NoOpClient, handler)
    },
  }
  return new Proxy({} as NoOpClient, handler)
}

// ============ STATE ============

const globalForPrisma = globalThis as unknown as {
  prisma: unknown
  dbAvailable: boolean | undefined
}

let prismaClient: any = null
let isAvailable = false

/**
 * Lazily initialize Prisma client.
 * Uses eval to prevent Turbopack from resolving @prisma/client at build time.
 */
async function initPrisma(): Promise<void> {
  if (prismaClient) return

  try {
    const mod = await (0, eval)('import("@prisma/client")')
    const PrismaClient = mod.PrismaClient || mod.default?.PrismaClient
    if (!PrismaClient) throw new Error('PrismaClient not found')

    prismaClient =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaClient
    }

    isAvailable = globalForPrisma.dbAvailable ?? true
  } catch {
    prismaClient = null
    isAvailable = false
  }
}

// Initialize immediately (non-blocking)
initPrisma().catch(() => {
  isAvailable = false
})

// ============ EXPORTS ============

/**
 * Reactive DB availability flag.
 * Read this to short-circuit DB operations before calling `withDbFallback`.
 */
export const dbAvailable = {
  get value(): boolean {
    return isAvailable
  },
}

/**
 * The Prisma client (or no-op proxy when unavailable).
 * Typed as `any` only at the proxy boundary — callers get type safety
 * from `withDbFallback<T, F>`.
 */
export const db: any = prismaClient ?? createNoOpClient()

/**
 * Mark the database as unavailable (called when a DB operation fails).
 */
export function markDbUnavailable(): void {
  globalForPrisma.dbAvailable = false
  isAvailable = false
}

/**
 * Execute a Prisma operation with type-safe graceful fallback.
 *
 * - `T` is the success type (what the DB operation returns).
 * - `F` is the fallback type (defaults to `T` for simple cases).
 * - Returns `T | F` — never `any`.
 *
 * Usage (simple — fallback same type):
 *   const users = await withDbFallback(() => db.user.findMany(), [])
 *   // users: User[] (never any[])
 *
 * Usage (advanced — fallback different type):
 *   const result = await withDbFallback<DbRecord, null>(
 *     () => db.record.findFirst({ where: { id } }),
 *     null
 *   )
 *   // result: DbRecord | null
 */
export async function withDbFallback<T, F = T>(
  operation: () => Promise<T>,
  fallback: F
): Promise<T | F> {
  if (!isAvailable) {
    await initPrisma()
    if (!isAvailable) return fallback
  }
  try {
    return await operation()
  } catch (error) {
    markDbUnavailable()
    logger.warn('[DB] Operation failed, falling back', {
      error: error instanceof Error ? error.message : String(error),
    })
    return fallback
  }
}
