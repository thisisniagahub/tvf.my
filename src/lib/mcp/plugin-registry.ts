/**
 * Plugin Registry
 *
 * Manages installable extensions (automation/agent/integration) for the
 * TheViralFindsMY platform. Plugins are seeded from a static catalog and
 * persisted per-user with an `enabled` flag and JSON-encoded config.
 *
 * Persistence notes:
 *  - SQLite does not support arbitrary JSON columns or list-of-primitives,
 *    so `config` is stored as a JSON-encoded string. The application layer
 *    handles (de)serialization via JSON.parse / JSON.stringify.
 *
 * Vercel fallback: On Vercel serverless, SQLite is not persistent. When
 * the DB is unavailable (or a query fails at runtime), every method
 * transparently falls back to an in-memory `Map` keyed by plugin id.
 * The API response shape is identical so callers (Plugin API, UI) keep
 * working in either mode.
 */

import { db, dbAvailable, withDbFallback } from '@/lib/db'
import { logger } from '@/lib/logger'

export type PluginType = 'agent' | 'integration' | 'automation'

export interface PluginConfig {
  id: string
  name: string
  description: string
  type: PluginType
  config: Record<string, unknown>
  enabled: boolean
  version: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CatalogPlugin {
  id: string
  name: string
  description: string
  type: PluginType
  version: string
  config: Record<string, unknown>
  icon: string // Lucide icon name hint for the UI
}

/**
 * Static catalog of pre-built plugins the user can install with one click.
 * These map to real automation/integration concepts for the Malaysian
 * affiliate marketing domain.
 */
export const PLUGIN_CATALOG: CatalogPlugin[] = [
  {
    id: 'auto-shopee-sync',
    name: 'Auto Shopee Sync',
    description:
      'Automatically sync commission data from the Shopee Affiliate Portal via browser automation.',
    type: 'automation',
    version: '1.0.0',
    config: {
      platform: 'shopee',
      syncInterval: '1h',
      dataPoints: ['earnings', 'clicks', 'orders'],
    },
    icon: 'ShoppingBag',
  },
  {
    id: 'tiktok-trend-spy',
    name: 'TikTok Trend Spy',
    description:
      'Scan TikTok for viral products with affiliate bags and extract product info.',
    type: 'automation',
    version: '1.0.0',
    config: {
      platform: 'tiktok',
      scanInterval: '2h',
      maxProducts: 20,
    },
    icon: 'Music',
  },
  {
    id: 'auto-content-deploy',
    name: 'Auto Content Deploy',
    description:
      'Publish AI-generated content to Facebook, Instagram, and TikTok automatically.',
    type: 'automation',
    version: '1.0.0',
    config: {
      platforms: ['facebook', 'instagram', 'tiktok'],
      schedule: 'optimal',
    },
    icon: 'Send',
  },
  {
    id: 'competitor-tracker',
    name: 'Competitor Tracker',
    description:
      'Monitor competitor affiliate activity and alert on new campaigns.',
    type: 'agent',
    version: '1.0.0',
    config: {
      competitors: [],
      alertThreshold: 'new-campaign',
    },
    icon: 'Eye',
  },
  {
    id: 'manglish-humanizer',
    name: 'Manglish Humanizer',
    description:
      'Convert AI-generated content to natural Manglish with local slang.',
    type: 'integration',
    version: '1.0.0',
    config: {
      style: 'casual',
      particles: ['lah', 'lor', 'meh', 'kan'],
    },
    icon: 'Languages',
  },
]

const VALID_TYPES: ReadonlyArray<PluginType> = ['agent', 'integration', 'automation']

function assertType(value: string): PluginType {
  if (!VALID_TYPES.includes(value as PluginType)) {
    return 'integration'
  }
  return value as PluginType
}

function parseConfig(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

/** Internal in-memory plugin row (mirrors the Prisma shape). */
interface InMemoryPluginRow {
  id: string
  userId: string
  name: string
  description: string
  type: string
  config: string
  enabled: boolean
  version: string
  createdAt: Date
  updatedAt: Date
}

/** Generate a cuid-ish id without pulling in a dependency. */
function generateId(): string {
  return `plg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export class PluginService {
  /**
   * In-memory plugin store keyed by plugin id. Used only when the DB is
   * unavailable (Vercel serverless / first runtime failure).
   */
  private pluginStore = new Map<string, InMemoryPluginRow>()

  /**
   * List every installed plugin for the given user (regardless of enabled
   * state). Ordered by most-recently-updated first.
   */
  async getInstalledPlugins(userId: string): Promise<PluginConfig[]> {
    if (!dbAvailable) {
      const rows = Array.from(this.pluginStore.values())
        .filter((p) => p.userId === userId)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      return rows.map((p) => this.mapPlugin(p))
    }

    const plugins = await withDbFallback(
      () =>
        db.plugin.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
        }),
      [] as Awaited<ReturnType<typeof db.plugin.findMany>>
    )

    if (plugins.length > 0) {
      return plugins.map((p) => this.mapPlugin(p))
    }

    // DB miss / fallback — also include in-memory rows.
    const memRows = Array.from(this.pluginStore.values())
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    return memRows.map((p) => this.mapPlugin(p))
  }

  /**
   * Fetch a single plugin by id (optionally scoped to a user).
   */
  async getPlugin(pluginId: string, userId?: string): Promise<PluginConfig | null> {
    if (!dbAvailable) {
      const row = this.pluginStore.get(pluginId)
      if (!row) return null
      if (userId && row.userId !== userId) return null
      return this.mapPlugin(row)
    }

    const plugin = await withDbFallback(
      () => db.plugin.findUnique({ where: { id: pluginId } }),
      null as Awaited<ReturnType<typeof db.plugin.findUnique>> | null
    )
    if (plugin) {
      if (userId && plugin.userId !== userId) return null
      return this.mapPlugin(plugin)
    }

    const memRow = this.pluginStore.get(pluginId)
    if (!memRow) return null
    if (userId && memRow.userId !== userId) return null
    return this.mapPlugin(memRow)
  }

  /**
   * Install a plugin from the static catalog by its `catalogId`. Throws
   * if the catalog entry doesn't exist or the plugin is already installed.
   */
  async installPlugin(userId: string, catalogId: string): Promise<PluginConfig> {
    const catalogPlugin = PLUGIN_CATALOG.find((p) => p.id === catalogId)
    if (!catalogPlugin) {
      throw new Error(`Plugin not found in catalog: ${catalogId}`)
    }

    // Idempotency: prevent duplicate installs of the same catalog plugin.
    if (!dbAvailable) {
      const existing = Array.from(this.pluginStore.values()).find(
        (p) => p.userId === userId && p.name === catalogPlugin.name
      )
      if (existing) {
        throw new Error(`Plugin already installed: ${catalogPlugin.name}`)
      }
      const now = new Date()
      const row: InMemoryPluginRow = {
        id: generateId(),
        userId,
        name: catalogPlugin.name,
        description: catalogPlugin.description,
        type: catalogPlugin.type,
        config: JSON.stringify(catalogPlugin.config),
        enabled: false,
        version: catalogPlugin.version,
        createdAt: now,
        updatedAt: now,
      }
      this.pluginStore.set(row.id, row)
      logger.info('Plugin installed (in-memory fallback)', {
        userId,
        pluginId: row.id,
        catalogId,
        name: catalogPlugin.name,
      })
      return this.mapPlugin(row)
    }

    const existing = await withDbFallback(
      () =>
        db.plugin.findFirst({
          where: { userId, name: catalogPlugin.name },
        }),
      null as Awaited<ReturnType<typeof db.plugin.findFirst>> | null
    )

    // Also check in-memory store to enforce idempotency in mixed mode.
    const memExisting = Array.from(this.pluginStore.values()).find(
      (p) => p.userId === userId && p.name === catalogPlugin.name
    )

    if (existing || memExisting) {
      throw new Error(`Plugin already installed: ${catalogPlugin.name}`)
    }

    const plugin = await withDbFallback(
      () =>
        db.plugin.create({
          data: {
            userId,
            name: catalogPlugin.name,
            description: catalogPlugin.description,
            type: catalogPlugin.type,
            config: JSON.stringify(catalogPlugin.config),
            enabled: false,
            version: catalogPlugin.version,
          },
        }),
      null as Awaited<ReturnType<typeof db.plugin.create>> | null
    )

    if (plugin) {
      logger.info('Plugin installed', {
        userId,
        pluginId: plugin.id,
        catalogId,
        name: catalogPlugin.name,
      })
      return this.mapPlugin(plugin)
    }

    // DB failed — mirror into in-memory store.
    const now = new Date()
    const row: InMemoryPluginRow = {
      id: generateId(),
      userId,
      name: catalogPlugin.name,
      description: catalogPlugin.description,
      type: catalogPlugin.type,
      config: JSON.stringify(catalogPlugin.config),
      enabled: false,
      version: catalogPlugin.version,
      createdAt: now,
      updatedAt: now,
    }
    this.pluginStore.set(row.id, row)
    logger.info('Plugin installed (in-memory fallback after DB failure)', {
      userId,
      pluginId: row.id,
      catalogId,
      name: catalogPlugin.name,
    })
    return this.mapPlugin(row)
  }

  /**
   * Enable or disable an installed plugin.
   */
  async togglePlugin(pluginId: string, enabled: boolean): Promise<PluginConfig> {
    if (!dbAvailable) {
      const row = this.pluginStore.get(pluginId)
      if (!row) throw new Error(`Plugin not found: ${pluginId}`)
      const updated: InMemoryPluginRow = {
        ...row,
        enabled,
        updatedAt: new Date(),
      }
      this.pluginStore.set(pluginId, updated)
      logger.info('Plugin toggled (in-memory fallback)', { pluginId, enabled })
      return this.mapPlugin(updated)
    }

    const plugin = await withDbFallback(
      () =>
        db.plugin.update({
          where: { id: pluginId },
          data: { enabled },
        }),
      null as Awaited<ReturnType<typeof db.plugin.update>> | null
    )

    if (plugin) {
      logger.info('Plugin toggled', { pluginId, enabled })
      return this.mapPlugin(plugin)
    }

    // DB failed — mirror the toggle into the in-memory store.
    const row = this.pluginStore.get(pluginId)
    if (!row) throw new Error(`Plugin not found: ${pluginId}`)
    const mirrored: InMemoryPluginRow = {
      ...row,
      enabled,
      updatedAt: new Date(),
    }
    this.pluginStore.set(pluginId, mirrored)
    return this.mapPlugin(mirrored)
  }

  /**
   * Permanently uninstall a plugin.
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    if (!dbAvailable) {
      this.pluginStore.delete(pluginId)
      logger.info('Plugin uninstalled (in-memory fallback)', { pluginId })
      return
    }

    await withDbFallback(
      () => db.plugin.delete({ where: { id: pluginId } }),
      null
    )
    // Always also clear the in-memory mirror so the two stay in sync.
    this.pluginStore.delete(pluginId)
    logger.info('Plugin uninstalled', { pluginId })
  }

  /**
   * Return the catalog of all installable plugins. The caller can pass the
   * list of already-installed plugin names so the UI can mark them as
   * "installed" without filtering them out of the catalog display.
   */
  getCatalog(installedNames: string[] = []): CatalogPlugin[] {
    // Currently a pass-through — kept as a method so future filtering /
    // version-bump logic lives in one place. `installedNames` is accepted
    // for API symmetry with future `getAvailablePlugins` callers.
    void installedNames
    return PLUGIN_CATALOG
  }

  /**
   * Convenience: which catalog plugin names are already installed for the
   * given user. Used by the UI to grey out the "Install" button.
   */
  async getInstalledCatalogNames(userId: string): Promise<Set<string>> {
    if (!dbAvailable) {
      const names = Array.from(this.pluginStore.values())
        .filter((p) => p.userId === userId)
        .map((p) => p.name)
      return new Set(names)
    }

    const installed = await withDbFallback(
      () =>
        db.plugin.findMany({
          where: { userId },
          select: { name: true },
        }),
      [] as { name: string }[]
    )

    const names = new Set<string>(installed.map((p) => p.name))
    // Also include in-memory installs (mixed mode).
    for (const p of this.pluginStore.values()) {
      if (p.userId === userId) names.add(p.name)
    }
    return names
  }

  private mapPlugin(p: {
    id: string
    userId: string
    name: string
    description: string
    type: string
    config: string
    enabled: boolean
    version: string
    createdAt?: Date
    updatedAt?: Date
  }): PluginConfig {
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      type: assertType(p.type),
      config: parseConfig(p.config),
      enabled: p.enabled,
      version: p.version,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }
  }
}

export const pluginService = new PluginService()
