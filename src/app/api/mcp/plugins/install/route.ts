import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, pluginInstallSchema } from '@/lib/validation'
import { pluginService } from '@/lib/mcp/plugin-registry'
import { requireUser } from '@/lib/auth'

/**
 * Plugin Install API
 *
 * POST /api/mcp/plugins/install
 *      Body: { catalogId: string }
 *      Installs a plugin from the static catalog by its id. Returns the
 *      freshly-installed plugin record.
 *
 * The authenticated user is resolved server-side via `requireUser()` —
 * the resolved `user.id` is passed as the owner so the plugin is
 * scoped to the caller (any `userId` in the body is ignored).
 *
 * Idempotency: throws (400) if the plugin is already installed.
 *
 * Rate-limited at the AI tier (lower limit) because installed plugins
 * typically trigger automation work on enable.
 */

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(
    request,
    RATE_LIMITS.ai,
    'mcp-plugin-install'
  )
  if (limited) return limited

  try {
    const body = await request.json()
    const validation = validateInput(pluginInstallSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    // Resolve the user server-side so the installed plugin is owned
    // by the caller. Demo-mode fallback allowed — installs become
    // demo-owned.
    const user = await requireUser()
    const plugin = await pluginService.installPlugin(
      user.id,
      validation.data.catalogId
    )

    logger.info('Plugin installed via API', {
      userId: user.id,
      pluginId: plugin.id,
      catalogId: validation.data.catalogId,
      name: plugin.name,
    })

    return NextResponse.json({ plugin }, { status: 201 })
  } catch (error) {
    // Plugin-install errors are user-facing (catalog miss, duplicate).
    if (error instanceof Error) {
      const isUserError =
        error.message.includes('not found in catalog') ||
        error.message.includes('already installed')
      if (isUserError) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }
    const { error: msg, status } = handleApiError(
      error,
      'Plugin install',
      'Failed to install plugin'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
