import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, pluginToggleSchema } from '@/lib/validation'
import { pluginService } from '@/lib/mcp/plugin-registry'

/**
 * Plugin — Single Record API
 *
 * PUT    /api/mcp/plugins/<id>
 *        Body: { enabled: boolean }
 *        Toggles the plugin's `enabled` state.
 *
 * DELETE /api/mcp/plugins/<id>
 *        Uninstalls the plugin permanently.
 *
 * All endpoints are rate-limited at the standard API tier.
 */

const DEMO_USER_ID = 'demo-user'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'mcp-plugin-id-put')
  if (limited) return limited

  try {
    const { id } = await params
    const body = await request.json()
    const validation = validateInput(pluginToggleSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    // Verify ownership before toggling.
    const existing = await pluginService.getPlugin(id, DEMO_USER_ID)
    if (!existing) {
      return NextResponse.json(
        { error: 'Plugin not found' },
        { status: 404 }
      )
    }

    const plugin = await pluginService.togglePlugin(id, validation.data.enabled)
    logger.info('Plugin toggled via API', {
      pluginId: id,
      enabled: plugin.enabled,
    })

    return NextResponse.json({ plugin })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Plugin PUT',
      'Failed to toggle plugin'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'mcp-plugin-id-del')
  if (limited) return limited

  try {
    const { id } = await params

    // Verify ownership before uninstalling.
    const existing = await pluginService.getPlugin(id, DEMO_USER_ID)
    if (!existing) {
      return NextResponse.json(
        { error: 'Plugin not found' },
        { status: 404 }
      )
    }

    await pluginService.uninstallPlugin(id)
    logger.info('Plugin uninstalled via API', { pluginId: id })

    return NextResponse.json({ success: true, id })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Plugin DELETE',
      'Failed to uninstall plugin'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
