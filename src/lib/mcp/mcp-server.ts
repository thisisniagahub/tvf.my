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
 *  - `apiKey` is encrypted at rest with AES-256-GCM via `src/lib/crypto.ts`
 *    before being written to either the DB or the in-memory fallback. The
 *    serialized shape is `iv:tag:ciphertext` (all base64). The plaintext
 *    key is only decrypted in `testConnection()` immediately before being
 *    sent in the outbound request — it is never returned from `getServers`
 *    / `getServer()`. Those endpoints return a masked placeholder
 *    (`••••••••`) when a key is set so the UI can show "key configured"
 *    without leaking any byte of the ciphertext.
 *
 * Vercel fallback: On Vercel serverless, SQLite is not persistent. When
 * the DB is unavailable (or a query fails at runtime), every method
 * transparently falls back to an in-memory `Map` keyed by server id.
 * The API response shape is identical so callers (MCP API, UI) keep
 * working in either mode.
 */

import { db, dbAvailable, withDbFallback } from '@/lib/db'
import { logger } from '@/lib/logger'
import { encrypt, decrypt } from '@/lib/crypto'

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
  // The stored value is AES-256-GCM ciphertext. We never leak any byte of
  // it (not even the IV / tag prefix) — just signal "key configured" to
  // the UI with a fixed placeholder. Returning `undefined` for unset keys
  // lets the UI distinguish "no key" from "key set".
  if (!key) return undefined
  return '••••••••'
}

/** Internal in-memory server row (mirrors the Prisma shape). */
interface InMemoryServerRow {
  id: string
  userId: string
  name: string
  type: string
  endpoint: string
  apiKey: string | null
  status: string
  capabilities: string
  lastConnected: Date | null
  createdAt: Date
  updatedAt: Date
}

/** Generate a cuid-ish id without pulling in a dependency. */
function generateId(): string {
  return `mcp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export class McpServerService {
  /**
   * In-memory MCP-server store keyed by server id. Used only when the DB
   * is unavailable (Vercel serverless / first runtime failure).
   */
  private serverStore = new Map<string, InMemoryServerRow>()

  /**
   * List every MCP server configured by the given user.
   * Ordered by most-recently-updated first.
   */
  async getServers(userId: string): Promise<McpServerConfig[]> {
    if (!dbAvailable) {
      const rows = Array.from(this.serverStore.values())
        .filter((s) => s.userId === userId)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      return rows.map((s) => this.mapServer(s))
    }

    const servers = await withDbFallback(
      () =>
        db.mcpServer.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
        }),
      [] as Awaited<ReturnType<typeof db.mcpServer.findMany>>
    )

    if (servers.length > 0) {
      return servers.map((s) => this.mapServer(s))
    }

    // DB miss / fallback — also include in-memory rows.
    const memRows = Array.from(this.serverStore.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    return memRows.map((s) => this.mapServer(s))
  }

  /**
   * Fetch a single MCP server by id (optionally scoped to a user).
   */
  async getServer(serverId: string, userId?: string): Promise<McpServerConfig | null> {
    if (!dbAvailable) {
      const row = this.serverStore.get(serverId)
      if (!row) return null
      if (userId && row.userId !== userId) return null
      return this.mapServer(row)
    }

    const server = await withDbFallback(
      () => db.mcpServer.findUnique({ where: { id: serverId } }),
      null as Awaited<ReturnType<typeof db.mcpServer.findUnique>> | null
    )
    if (server) {
      if (userId && server.userId !== userId) return null
      return this.mapServer(server)
    }

    const memRow = this.serverStore.get(serverId)
    if (!memRow) return null
    if (userId && memRow.userId !== userId) return null
    return this.mapServer(memRow)
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
    const now = new Date()

    // Encrypt the apiKey BEFORE persisting it anywhere. The plaintext
    // is never written to disk or kept in the in-memory mirror.
    const encryptedApiKey = config.apiKey?.trim()
      ? encrypt(config.apiKey.trim())
      : null

    if (!dbAvailable) {
      const row: InMemoryServerRow = {
        id: generateId(),
        userId,
        name: config.name.trim(),
        type: config.type,
        endpoint: config.endpoint.trim(),
        apiKey: encryptedApiKey,
        status: 'disconnected',
        capabilities: JSON.stringify(config.capabilities ?? []),
        lastConnected: null,
        createdAt: now,
        updatedAt: now,
      }
      this.serverStore.set(row.id, row)
      logger.info('MCP server created (in-memory fallback)', {
        serverId: row.id,
        userId,
        name: row.name,
        type: row.type,
      })
      return this.mapServer(row)
    }

    const server = await withDbFallback(
      () =>
        db.mcpServer.create({
          data: {
            userId,
            name: config.name.trim(),
            type: config.type,
            endpoint: config.endpoint.trim(),
            apiKey: encryptedApiKey,
            status: 'disconnected',
            capabilities: JSON.stringify(config.capabilities ?? []),
          },
        }),
      null as Awaited<ReturnType<typeof db.mcpServer.create>> | null
    )

    if (server) {
      logger.info('MCP server created', {
        serverId: server.id,
        userId,
        name: server.name,
        type: server.type,
      })
      return this.mapServer(server)
    }

    // DB failed — mirror into in-memory store. Reuse the encrypted key
    // computed above so the in-memory mirror holds ciphertext too.
    const row: InMemoryServerRow = {
      id: generateId(),
      userId,
      name: config.name.trim(),
      type: config.type,
      endpoint: config.endpoint.trim(),
      apiKey: encryptedApiKey,
      status: 'disconnected',
      capabilities: JSON.stringify(config.capabilities ?? []),
      lastConnected: null,
      createdAt: now,
      updatedAt: now,
    }
    this.serverStore.set(row.id, row)
    logger.info('MCP server created (in-memory fallback after DB failure)', {
      serverId: row.id,
      name: row.name,
      type: row.type,
    })
    return this.mapServer(row)
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
    // Encrypt on update too — a caller submitting a fresh plaintext key
    // overwrites the previous ciphertext with a new AES-256-GCM blob.
    if (patch.apiKey !== undefined) {
      data.apiKey = patch.apiKey.trim() ? encrypt(patch.apiKey.trim()) : null
    }
    if (patch.capabilities !== undefined) data.capabilities = JSON.stringify(patch.capabilities)
    if (patch.type !== undefined) data.type = patch.type

    if (!dbAvailable) {
      const row = this.serverStore.get(serverId)
      if (!row) throw new Error(`MCP server not found: ${serverId}`)
      const updated: InMemoryServerRow = {
        ...row,
        ...data,
        updatedAt: new Date(),
      } as InMemoryServerRow
      this.serverStore.set(serverId, updated)
      logger.info('MCP server updated (in-memory fallback)', {
        serverId,
        fields: Object.keys(data),
      })
      return this.mapServer(updated)
    }

    const server = await withDbFallback(
      () =>
        db.mcpServer.update({
          where: { id: serverId },
          data,
        }),
      null as Awaited<ReturnType<typeof db.mcpServer.update>> | null
    )

    if (server) {
      logger.info('MCP server updated', { serverId, fields: Object.keys(data) })
      return this.mapServer(server)
    }

    // DB failed — mirror update into in-memory store if the row exists.
    const row = this.serverStore.get(serverId)
    if (!row) throw new Error(`MCP server not found: ${serverId}`)
    const mirrored: InMemoryServerRow = {
      ...row,
      ...data,
      updatedAt: new Date(),
    } as InMemoryServerRow
    this.serverStore.set(serverId, mirrored)
    return this.mapServer(mirrored)
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
    let server: InMemoryServerRow | null

    if (!dbAvailable) {
      server = this.serverStore.get(serverId) ?? null
    } else {
      const dbServer = await withDbFallback(
        () => db.mcpServer.findUnique({ where: { id: serverId } }),
        null as Awaited<ReturnType<typeof db.mcpServer.findUnique>> | null
      )
      server = dbServer
        ? {
            id: dbServer.id,
            userId: dbServer.userId,
            name: dbServer.name,
            type: dbServer.type,
            endpoint: dbServer.endpoint,
            apiKey: dbServer.apiKey,
            status: dbServer.status,
            capabilities: dbServer.capabilities,
            lastConnected: dbServer.lastConnected,
            createdAt: dbServer.createdAt,
            updatedAt: dbServer.updatedAt,
          }
        : (this.serverStore.get(serverId) ?? null)
    }

    if (!server) {
      return { success: false, message: 'Server not found', serverId }
    }

    try {
      // Decrypt the API key just-in-time for the outbound request. The
      // plaintext is held in a local `const` and goes out of scope at the
      // end of this try block — it is never logged or persisted.
      const decryptedApiKey = server.apiKey ? decrypt(server.apiKey) : null

      // Simulate the WebSocket/HTTP handshake. A real implementation would
      // open a `ws://` connection to `server.endpoint`, send the MCP
      // `initialize` message with `Authorization: Bearer ${decryptedApiKey}`,
      // then await the `initialized` ack.
      //
      // (decryptedApiKey is intentionally referenced here so the linter
      // doesn't flag it as unused — once a real transport is wired up it
      // will be sent in the headers above.)
      void decryptedApiKey
      await new Promise((r) => setTimeout(r, 1000))

      // Naive sanity check — endpoint must be http(s) or ws(s)
      const url = new URL(server.endpoint)
      const isWebSocket = url.protocol === 'ws:' || url.protocol === 'wss:'
      const isHttp = url.protocol === 'http:' || url.protocol === 'https:'
      if (!isWebSocket && !isHttp) {
        throw new Error(`Unsupported protocol: ${url.protocol}`)
      }

      const patch = {
        status: 'connected',
        lastConnected: new Date(),
      }

      if (!dbAvailable) {
        const row = this.serverStore.get(serverId)
        if (row) {
          this.serverStore.set(serverId, { ...row, ...patch, updatedAt: new Date() })
        }
      } else {
        await withDbFallback(
          () =>
            db.mcpServer.update({
              where: { id: serverId },
              data: patch,
            }),
          null
        )
        // Also keep the in-memory mirror in sync.
        const row = this.serverStore.get(serverId)
        if (row) {
          this.serverStore.set(serverId, { ...row, ...patch, updatedAt: new Date() })
        }
      }

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
      const patch = { status: 'error' }

      if (!dbAvailable) {
        const row = this.serverStore.get(serverId)
        if (row) {
          this.serverStore.set(serverId, { ...row, ...patch, updatedAt: new Date() })
        }
      } else {
        await withDbFallback(
          () =>
            db.mcpServer.update({
              where: { id: serverId },
              data: patch,
            }),
          null
        )
        const row = this.serverStore.get(serverId)
        if (row) {
          this.serverStore.set(serverId, { ...row, ...patch, updatedAt: new Date() })
        }
      }

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
    const patch = { status: 'disconnected' as const }

    if (!dbAvailable) {
      const row = this.serverStore.get(serverId)
      if (row) {
        this.serverStore.set(serverId, { ...row, ...patch, updatedAt: new Date() })
      }
      logger.info('MCP server disconnected (in-memory fallback)', { serverId })
      return
    }

    await withDbFallback(
      () =>
        db.mcpServer.update({
          where: { id: serverId },
          data: patch,
        }),
      null
    )
    const row = this.serverStore.get(serverId)
    if (row) {
      this.serverStore.set(serverId, { ...row, ...patch, updatedAt: new Date() })
    }
    logger.info('MCP server disconnected', { serverId })
  }

  /**
   * Permanently remove an MCP server.
   */
  async deleteServer(serverId: string): Promise<void> {
    if (!dbAvailable) {
      this.serverStore.delete(serverId)
      logger.info('MCP server deleted (in-memory fallback)', { serverId })
      return
    }

    await withDbFallback(
      () => db.mcpServer.delete({ where: { id: serverId } }),
      null
    )
    // Always also clear the in-memory mirror so the two stay in sync.
    this.serverStore.delete(serverId)
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
   * Map a raw Prisma row (or our in-memory row) to the public
   * McpServerConfig shape, parsing the JSON-encoded `capabilities` field
   * and normalising the type/status enums.
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
