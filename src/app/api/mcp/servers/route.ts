import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, mcpServerSchema } from '@/lib/validation'
import { mcpServerService } from '@/lib/mcp/mcp-server'
import { requireUser } from '@/lib/auth'

/**
 * MCP Servers API
 *
 * GET  /api/mcp/servers
 *      Lists every MCP server configured by the authenticated user.
 *      Returns the pre-built catalog alongside so the UI can render the
 *      "Add Server" picker without a second round-trip.
 *
 * POST /api/mcp/servers
 *      Body: { name, type: 'hermes'|'openclaw'|'custom', endpoint, apiKey?, capabilities? }
 *      Persists a new MCP server with status `disconnected`. The UI should
 *      call POST /api/mcp/servers/<id>/test to flip it to `connected`.
 *
 * The authenticated user is resolved server-side via `requireUser()` —
 * the resolved `user.id` scopes both reads and writes so a caller
 * only ever sees their own servers and cannot create servers owned
 * by another account.
 *
 * All endpoints are rate-limited at the standard API tier.
 */

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'mcp-servers-get')
  if (limited) return limited

  try {
    const user = await requireUser()
    const [servers, profiles] = await Promise.all([
      mcpServerService.getServers(user.id),
      Promise.resolve(mcpServerService.getPreBuiltProfiles()),
    ])

    logger.info('MCP servers listed via API', {
      userId: user.id,
      count: servers.length,
    })

    return NextResponse.json({
      servers,
      profiles,
      count: servers.length,
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'MCP servers GET',
      'Failed to fetch MCP servers'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'mcp-servers-post')
  if (limited) return limited

  try {
    const body = await request.json()
    const validation = validateInput(mcpServerSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    // Resolve the user server-side so the new server is owned by the
    // caller. Demo-mode fallback allowed — servers become demo-owned.
    const user = await requireUser()

    const server = await mcpServerService.createServer(user.id, {
      name: validation.data.name,
      type: validation.data.type,
      endpoint: validation.data.endpoint,
      apiKey: validation.data.apiKey,
      capabilities: validation.data.capabilities ?? [],
    })

    logger.info('MCP server created via API', {
      userId: user.id,
      serverId: server.id,
      name: server.name,
      type: server.type,
    })

    return NextResponse.json({ server }, { status: 201 })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'MCP servers POST',
      'Failed to create MCP server'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
