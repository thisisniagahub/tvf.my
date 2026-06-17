import { PrismaClient } from '@prisma/client'

/**
 * Robust Prisma client with graceful fallback.
 * 
 * On Vercel (serverless), SQLite is not persistent. This wrapper:
 * 1. Creates the Prisma client normally
 * 2. Tracks whether the DB is actually available
 * 3. All services check `dbAvailable` before using Prisma
 * 4. Falls back to in-memory storage when DB unavailable
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbAvailable: boolean | undefined
}

let prismaClient: PrismaClient | null = null

try {
  prismaClient =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    })
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient
  // Assume available until proven otherwise
  if (globalForPrisma.dbAvailable === undefined) globalForPrisma.dbAvailable = true
} catch {
  prismaClient = null
  globalForPrisma.dbAvailable = false
}

/**
 * Check if the database is available.
 *
 * Captured at module load. Services can branch on this for an early-exit
 * shortcut (e.g. skip a DB write entirely). For a *live* re-check after
 * runtime failures, use {@link withDbFallback} — it re-reads the global
 * flag so {@link markDbUnavailable} propagates immediately to subsequent
 * callers within the same Node.js process.
 */
export const dbAvailable: boolean = globalForPrisma.dbAvailable ?? false

/**
 * The Prisma client (may be null if initialization failed).
 * Always check `dbAvailable` before using this.
 */
export const db = prismaClient as PrismaClient

/**
 * Mark the database as unavailable (called when a DB operation fails).
 * Once marked unavailable, all subsequent operations use in-memory fallback.
 */
export function markDbUnavailable(): void {
  globalForPrisma.dbAvailable = false
}

/**
 * Returns true when the DB is currently usable. Reads the live global flag
 * so it stays in sync with {@link markDbUnavailable} — once any call fails,
 * every subsequent call short-circuits to the fallback without retrying.
 */
function isDbAvailable(): boolean {
  return globalForPrisma.dbAvailable ?? false
}

/**
 * Execute a Prisma operation with graceful fallback.
 * If the DB is unavailable or the operation fails, returns the fallback value.
 *
 * Usage:
 *   const result = await withDbFallback(() => db.user.findMany(), [])
 */
export async function withDbFallback<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!isDbAvailable()) return fallback
  try {
    return await operation()
  } catch (error) {
    // Mark DB as unavailable for future calls
    markDbUnavailable()
    if (process.env.NODE_ENV === 'development') {
      console.warn('[DB] Operation failed, falling back:', error instanceof Error ? error.message : 'unknown')
    }
    return fallback
  }
}
