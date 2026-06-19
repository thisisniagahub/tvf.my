export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { handleApiError, logger } from '@/lib/logger'
import { pluginService } from '@/lib/mcp/plugin-registry'
import { requireUser } from '@/lib/auth'

/**
 * Plugins API
 *
 * GET /api/mcp/plugins
 *     Returns both the user's installed plugins AND the static catalog
 *     (with `installedNames` set so the UI can grey out installed
 *     entries). One round-trip renders the entire Plugins section.
 *
 * The authenticated user is resolved server-side via `requireUser()` —
 * the resolved `user.id` scopes the installed-plugins query so a
 * caller only ever sees their own plugins.
 *
 * All endpoints are rate-limited at the standard API tier.
 */

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'mcp-plugins-get')
  if (limited) return limited

  try {
    // Resolve the user server-side so the installed-plugins query is
    // scoped to the caller. Demo-mode fallback allowed — the demo
    // user's plugins are returned.
    const user = await requireUser()
    const [installed, installedNamesSet] = await Promise.all([
      pluginService.getInstalledPlugins(user.id),
      pluginService.getInstalledCatalogNames(user.id),
    ])

    const installedNames = Array.from(installedNamesSet)
    const catalog = pluginService.getCatalog(installedNames)

    logger.info('Plugins listed via API', {
      userId: user.id,
      installedCount: installed.length,
    })

    return NextResponse.json({
      installed,
      catalog,
      installedNames,
      installedCount: installed.length,
      catalogCount: catalog.length,
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Plugins GET',
      'Failed to fetch plugins'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
