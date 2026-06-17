/**
 * MCP Server Service
 *
 * Manages external MCP (Model Context Protocol) server connections for the
 * TheViralFindsMY platform. Users can connect their own Hermes Agent,
 * OpenClaw, or any custom MCP-compatible endpoint.
 *
 * Persistence notes:
 *  - SQLite does not support list-of-primitives, so `capabilities` is stored
 *    as a JSON-encoded string. The application layer handles
 *    (de)serialization via JSON.parse / JSON.stringify.
 *  - `apiKey` is stored as plaintext for the demo (no encryption key
 *    configured in this sandbox). The schema column is named `apiKey` but
 *    should be treated as opaque — never log it or return it to clients in
 *    full. We expose only a masked preview via `maskApiKey()`.
 */

import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export type McpServerType = 'hermes' | 'openclaw' | 'custom'
export type McpServerStatus = 'connected' | 'disconnected' | 'error'

export interface McpServerConfig {
  id: string
  name: string
  type: McpServerType
  endpoint: string
  apiKey?: string
  status: McpServerStatus
  capabilities: string[]
  lastConnected?: Date
  createdAt?: Date
  updatedAt?: Date
}

/** Input shape for `createServer` (no id/status — those are server-set). */
export interface NewMcpServerInput {
  name: string
  type: McpServerType
  endpoint: string
  apiKey?: string
  capabilities?: string[]
}

export interface PreBuiltProfile {
  type: McpServerType
  name: string
  endpoint: string
  capabilities: string[]
  description: string
  icon: string // Lucide icon name hint for UI
}

export interface ConnectionTestResult {
  success: boolean
  message: string
  serverId: string
}

const VALID_TYPES: ReadonlyArray<McpServerType> = ['hermes', 'openclaw', 'custom']
const VALID_STATUSES: ReadonlyArray<McpServerStatus> = ['connected', 'disconnected', 'error']

function assertType(value: string): McpServerType {
  if (!VALID_TYPES.includes(value as McpServerType)) {
    throw new Error(`Invalid MCP server type: ${value}`)
  }
  return value as McpServerType
}

function assertStatus(value: string): McpServerStatus {
  if (!VALID_STATUSES.includes(value as McpServerStatus)) {
    return 'disconnected'
  }
  return value as McpServerStatus
}

function parseCapabilities(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function maskApiKey(key?: string | null): string | undefined {
  if (!key) return undefined
  if (key.length <= 8) return '••••'
  return `${key.slice(0, 4)}••••${key.slice(-4)}`
}

export class McpServerService {
  /**
   * List every MCP server configured by the given user.
   * Ordered by most-recently-updated first.
   */
  async getServers(userId: string): Promise<McpServerConfig[]> {
    const servers = await db.mcpServer.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
    return servers.map((s) => this.mapServer(s))
  }

  /**
   * Fetch a single MCP server by id (optionally scoped to a user).
   */
  async getServer(serverId: string, userId?: string): Promise<McpServerConfig | null> {
    const server = await db.mcpServer.findUnique({ where: { id: serverId } })
    if (!server) return null
    if (userId && server.userId !== userId) return null
    return this.mapServer(server)
  }

  /**
   * Persist a new MCP server. Status defaults to `disconnected` — call
   * `testConnection()` to flip it to `connected` after a successful
   * handshake.
   */
  async createServer(
    userId: string,
    config: NewMcpServerInput
  ): Promise<McpServerConfig> {
    assertType(config.type)

    const server = await db.mcpServer.create({
      data: {
        userId,
        name: config.name.trim(),
        type: config.type,
        endpoint: config.endpoint.trim(),
        apiKey: config.apiKey?.trim() || null,
        status: 'disconnected',
        capabilities: JSON.stringify(config.capabilities ?? []),
      },
    })

    logger.info('MCP server created', {
      serverId: server.id,
      userId,
      name: server.name,
      type: server.type,
    })

    return this.mapServer(server)
  }

  /**
   * Update an existing MCP server's editable fields.
   */
  async updateServer(
    serverId: string,
    patch: Partial<Pick<NewMcpServerInput, 'name' | 'endpoint' | 'apiKey' | 'capabilities' | 'type'>>
  ): Promise<McpServerConfig> {
    if (patch.type) assertType(patch.type)

    const data: Record<string, unknown> = {}
    if (patch.name !== undefined) data.name = patch.name.trim()
    if (patch.endpoint !== undefined) data.endpoint = patch.endpoint.trim()
    if (patch.apiKey !== undefined) data.apiKey = patch.apiKey.trim() || null
    if (patch.capabilities !== undefined) data.capabilities = JSON.stringify(patch.capabilities)
    if (patch.type !== undefined) data.type = patch.type

    const server = await db.mcpServer.update({
      where: { id: serverId },
      data,
    })

    logger.info('MCP server updated', { serverId, fields: Object.keys(data) })
    return this.mapServer(server)
  }

  /**
   * Test the connection to an MCP server. This is a best-effort probe —
   * in production this would open a WebSocket handshake or send an HTTP
   * `initialize` request per the MCP spec. For now we simulate a 1s
   * handshake and mark the server `connected` on success.
   *
   * Never throws — failures are returned as `{ success: false }`.
   */
  async testConnection(serverId: string): Promise<ConnectionTestResult> {
    const server = await db.mcpServer.findUnique({ where: { id: serverId } })
    if (!server) {
      return { success: false, message: 'Server not found', serverId }
    }

    try {
      // Simulate the WebSocket/HTTP handshake. A real implementation would
      // open a `ws://` connection to `server.endpoint` and send the MCP
      // `initialize` message, then await the `initialized` ack.
      await new Promise((r) => setTimeout(r, 1000))

      // Naive sanity check — endpoint must be http(s) or ws(s)
      const url = new URL(server.endpoint)
      const isWebSocket = url.protocol === 'ws:' || url.protocol === 'wss:'
      const isHttp = url.protocol === 'http:' || url.protocol === 'https:'
      if (!isWebSocket && !isHttp) {
        throw new Error(`Unsupported protocol: ${url.protocol}`)
      }

      await db.mcpServer.update({
        where: { id: serverId },
        data: { status: 'connected', lastConnected: new Date() },
      })

      logger.info('MCP server connected', {
        serverId,
        name: server.name,
        endpoint: server.endpoint,
      })

      return {
        success: true,
        message: `Connected to ${server.name}`,
        serverId,
      }
    } catch (error) {
      await db.mcpServer.update({
        where: { id: serverId },
        data: { status: 'error' },
      })

      const reason =
        error instanceof Error ? error.message : 'Unknown connection error'
      logger.warn('MCP server connection failed', {
        serverId,
        name: server.name,
        reason,
      })

      return {
        success: false,
        message: `Connection failed: ${reason}`,
        serverId,
      }
    }
  }

  /**
   * Disconnect an MCP server without deleting its config.
   */
  async disconnect(serverId: string): Promise<void> {
    await db.mcpServer.update({
      where: { id: serverId },
      data: { status: 'disconnected' },
    })
    logger.info('MCP server disconnected', { serverId })
  }

  /**
   * Permanently remove an MCP server.
   */
  async deleteServer(serverId: string): Promise<void> {
    await db.mcpServer.delete({ where: { id: serverId } })
    logger.info('MCP server deleted', { serverId })
  }

  /**
   * Catalog of pre-built MCP server profiles surfaced in the UI. Selecting
   * one pre-fills the create-server form.
   */
  getPreBuiltProfiles(): PreBuiltProfile[] {
    return [
      {
        type: 'hermes',
        name: 'Hermes Agent (Nous Research)',
        endpoint: 'wss://hermes.nousresearch.org/mcp',
        capabilities: ['web-search', 'image-gen', 'tts', 'browser', 'code', 'memory', 'skills'],
        description:
          'Connect your own Hermes Agent instance for autonomous task execution, memory, and tool use.',
        icon: 'Sparkles',
      },
      {
        type: 'openclaw',
        name: 'OpenClaw',
        endpoint: 'wss://openclaw.ai/mcp',
        capabilities: ['web-search', 'browser', 'code', 'file-ops'],
        description:
          'OpenClaw computer-use agent for browser automation and file operations.',
        icon: 'Bot',
      },
      {
        type: 'custom',
        name: 'Custom MCP Endpoint',
        endpoint: '',
        capabilities: [],
        description:
          'Connect any MCP-compatible server. Provide the WebSocket or HTTP URL yourself.',
        icon: 'Plug',
      },
    ]
  }

  /**
   * Map a raw Prisma row to the public McpServerConfig shape, parsing the
   * JSON-encoded `capabilities` field and normalising the type/status enums.
   */
  private mapServer(s: {
    id: string
    userId: string
    name: string
    type: string
    endpoint: string
    apiKey: string | null
    status: string
    capabilities: string
    lastConnected: Date | null
    createdAt?: Date
    updatedAt?: Date
  }): McpServerConfig {
    return {
      id: s.id,
      name: s.name,
      type: assertType(s.type),
      endpoint: s.endpoint,
      // Never leak the raw key in the public API. UI uses the masked
      // version for display; the full key is only used for outbound
      // requests server-side.
      apiKey: maskApiKey(s.apiKey),
      status: assertStatus(s.status),
      capabilities: parseCapabilities(s.capabilities),
      lastConnected: s.lastConnected ?? undefined,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }
  }
}

export const mcpServerService = new McpServerService()
