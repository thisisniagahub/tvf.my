import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/logger'
import { pluginService } from '@/lib/mcp/plugin-registry'

/**
 * Plugins API
 *
 * GET /api/mcp/plugins
 *     Returns both the user's installed plugins AND the static catalog
 *     (with `installedNames` set so the UI can grey out installed
 *     entries). One round-trip renders the entire Plugins section.
 *
 * All endpoints are rate-limited at the standard API tier.
 */

const DEMO_USER_ID = 'demo-user'

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'mcp-plugins-get')
  if (limited) return limited

  try {
    const [installed, installedNamesSet] = await Promise.all([
      pluginService.getInstalledPlugins(DEMO_USER_ID),
      pluginService.getInstalledCatalogNames(DEMO_USER_ID),
    ])

    const installedNames = Array.from(installedNamesSet)
    const catalog = pluginService.getCatalog(installedNames)

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
