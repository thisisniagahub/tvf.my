import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, pluginInstallSchema } from '@/lib/validation'
import { pluginService } from '@/lib/mcp/plugin-registry'

/**
 * Plugin Install API
 *
 * POST /api/mcp/plugins/install
 *      Body: { catalogId: string }
 *      Installs a plugin from the static catalog by its id. Returns the
 *      freshly-installed plugin record.
 *
 * Idempotency: throws (400) if the plugin is already installed.
 *
 * Rate-limited at the AI tier (lower limit) because installed plugins
 * typically trigger automation work on enable.
 */

const DEMO_USER_ID = 'demo-user'

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

    const plugin = await pluginService.installPlugin(
      DEMO_USER_ID,
      validation.data.catalogId
    )

    logger.info('Plugin installed via API', {
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
