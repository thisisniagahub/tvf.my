import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/logger'
import { mcpServerService } from '@/lib/mcp/mcp-server'

/**
 * MCP Server — Single Record API
 *
 * GET    /api/mcp/servers/<id>
 *        Returns the single MCP server config.
 *
 * DELETE /api/mcp/servers/<id>
 *        Permanently removes the MCP server.
 *
 * All endpoints are rate-limited at the standard API tier.
 */

const DEMO_USER_ID = 'demo-user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'mcp-server-id-get')
  if (limited) return limited

  try {
    const { id } = await params
    const server = await mcpServerService.getServer(id, DEMO_USER_ID)
    if (!server) {
      return NextResponse.json(
        { error: 'MCP server not found' },
        { status: 404 }
      )
    }
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
    const { id } = await params

    // Verify ownership before deleting.
    const existing = await mcpServerService.getServer(id, DEMO_USER_ID)
    if (!existing) {
      return NextResponse.json(
        { error: 'MCP server not found' },
        { status: 404 }
      )
    }

    await mcpServerService.deleteServer(id)
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
