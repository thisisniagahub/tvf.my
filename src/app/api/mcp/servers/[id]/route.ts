import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { handleApiError, logger } from '@/lib/logger'
import { mcpServerService } from '@/lib/mcp/mcp-server'
import { requireUser } from '@/lib/auth'

/**
 * MCP Server — Single Record API
 *
 * GET    /api/mcp/servers/<id>
 *        Returns the single MCP server config.
 *
 * DELETE /api/mcp/servers/<id>
 *        Permanently removes the MCP server.
 *
 * The authenticated user is resolved server-side via `requireUser()`.
 * The lookup is scoped to `user.id`, so a missing-or-foreign-owned
 * server returns the same 404 — clients cannot probe or delete
 * another user's servers by guessing ids.
 *
 * All endpoints are rate-limited at the standard API tier.
 */

/** Returns a 404 so the caller cannot distinguish "missing" from "owned
 * by someone else". */
function notFound(): NextResponse {
  return NextResponse.json({ error: 'MCP server not found' }, { status: 404 })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'mcp-server-id-get')
  if (limited) return limited

  try {
    const user = await requireUser()
    const { id } = await params
    // `getServer` returns null when the id is missing OR owned by
    // another user (it accepts the userId for filtering).
    const server = await mcpServerService.getServer(id, user.id)
    if (!server) {
      return notFound()
    }
    logger.info('MCP server fetched via API', {
      userId: user.id,
      serverId: id,
    })
    return NextResponse.json({ server })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'MCP server GET by id',
      'Failed to fetch MCP server'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'mcp-server-id-del')
  if (limited) return limited

  try {
    const user = await requireUser()
    const { id } = await params

    // Verify ownership before deleting.
    const existing = await mcpServerService.getServer(id, user.id)
    if (!existing) {
      return notFound()
    }

    await mcpServerService.deleteServer(id)
    logger.info('MCP server deleted via API', {
      userId: user.id,
      serverId: id,
    })
    return NextResponse.json({ success: true, id })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'MCP server DELETE',
      'Failed to delete MCP server'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
