/**
 * Environment Variable Validation
 *
 * Validates required environment variables at startup.
 * Fails fast with a clear error message if critical vars are missing.
 *
 * Usage in API routes:
 *   import { env } from '@/lib/env'
 *   const apiKey = env.SHOPEE_API_KEY // typed, validated
 */

type EnvVar = {
  name: string
  required: boolean
  description: string
  defaultValue?: string
}

const ENV_VARS: EnvVar[] = [
  // Database
  { name: 'DATABASE_URL', required: true, description: 'Prisma database connection string' },

  // Auth
  { name: 'NEXTAUTH_SECRET', required: true, description: 'NextAuth.js secret (use `openssl rand -base64 32`)' },
  { name: 'NEXTAUTH_URL', required: false, description: 'App URL for callbacks', defaultValue: 'http://localhost:3000' },

  // Shopee Affiliate API
  { name: 'SHOPEE_AFFILIATE_APP_ID', required: false, description: 'Shopee Affiliate API App ID' },
  { name: 'SHOPEE_AFFILIATE_API_KEY', required: false, description: 'Shopee Affiliate API key' },

  // z-ai-web-dev-sdk
  { name: 'ZAI_API_KEY', required: false, description: 'Z.AI SDK API key (optional — SDK auto-configures)' },
]

interface ValidatedEnv {
  DATABASE_URL: string
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string
  SHOPEE_AFFILIATE_APP_ID?: string
  SHOPEE_AFFILIATE_API_KEY?: string
  ZAI_API_KEY?: string
  NODE_ENV: string
}

let cachedEnv: ValidatedEnv | null = null

function validateEnv(): ValidatedEnv {
  if (cachedEnv) return cachedEnv

  const missing: string[] = []
  const env: Record<string, string | undefined> = {}

  for (const v of ENV_VARS) {
    const value = process.env[v.name] ?? v.defaultValue
    if (v.required && !value) {
      missing.push(`${v.name} — ${v.description}`)
    }
    env[v.name] = value
  }

  if (missing.length > 0) {
    const message = [
      '❌ Missing required environment variables:',
      ...missing.map((m) => `  • ${m}`),
      '',
      'Create a .env file based on .env.example',
    ].join('\n')
    throw new Error(message)
  }

  cachedEnv = env as unknown as ValidatedEnv
  return cachedEnv
}

// Lazy-loaded env — only validates on first access
export const env = new Proxy({} as ValidatedEnv, {
  get(_target, prop: string) {
    return validateEnv()[prop as keyof ValidatedEnv]
  },
})

/**
 * Check if all required env vars are set (non-throwing).
 * Returns { valid: boolean, missing: string[] }.
 */
export function checkEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = []
  for (const v of ENV_VARS) {
    if (v.required && !process.env[v.name] && !v.defaultValue) {
      missing.push(v.name)
    }
  }
  return { valid: missing.length === 0, missing }
}

/**
 * Get all env var definitions (for documentation/debugging).
 */
export function getEnvVarDefs(): EnvVar[] {
  return ENV_VARS
}
