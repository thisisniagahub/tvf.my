import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, pluginToggleSchema } from '@/lib/validation'
import { pluginService } from '@/lib/mcp/plugin-registry'
import { requireUser } from '@/lib/auth'

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
 * The authenticated user is resolved server-side via `requireUser()`.
 * The lookup is scoped to `user.id`, so a missing-or-foreign-owned
 * plugin returns the same 404 — clients cannot probe or mutate
 * another user's plugins by guessing ids.
 *
 * All endpoints are rate-limited at the standard API tier.
 */

/** Returns a 404 so the caller cannot distinguish "missing" from "owned
 * by someone else". */
function notFound(): NextResponse {
  return NextResponse.json({ error: 'Plugin not found' }, { status: 404 })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'mcp-plugin-id-put')
  if (limited) return limited

  try {
    const user = await requireUser()
    const { id } = await params
    const body = await request.json()
    const validation = validateInput(pluginToggleSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    // Verify ownership before toggling. `pluginService.getPlugin`
    // returns null when the id is missing OR owned by another user.
    const existing = await pluginService.getPlugin(id, user.id)
    if (!existing) {
      return notFound()
    }

    const plugin = await pluginService.togglePlugin(id, validation.data.enabled)
    logger.info('Plugin toggled via API', {
      userId: user.id,
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
    const user = await requireUser()
    const { id } = await params

    // Verify ownership before uninstalling.
    const existing = await pluginService.getPlugin(id, user.id)
    if (!existing) {
      return notFound()
    }

    await pluginService.uninstallPlugin(id)
    logger.info('Plugin uninstalled via API', {
      userId: user.id,
      pluginId: id,
    })

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
