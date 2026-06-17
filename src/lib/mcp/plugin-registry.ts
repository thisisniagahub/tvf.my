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
 */

import { db } from '@/lib/db'
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

export class PluginService {
  /**
   * List every installed plugin for the given user (regardless of enabled
   * state). Ordered by most-recently-updated first.
   */
  async getInstalledPlugins(userId: string): Promise<PluginConfig[]> {
    const plugins = await db.plugin.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
    return plugins.map((p) => this.mapPlugin(p))
  }

  /**
   * Fetch a single plugin by id (optionally scoped to a user).
   */
  async getPlugin(pluginId: string, userId?: string): Promise<PluginConfig | null> {
    const plugin = await db.plugin.findUnique({ where: { id: pluginId } })
    if (!plugin) return null
    if (userId && plugin.userId !== userId) return null
    return this.mapPlugin(plugin)
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
    const existing = await db.plugin.findFirst({
      where: { userId, name: catalogPlugin.name },
    })
    if (existing) {
      throw new Error(`Plugin already installed: ${catalogPlugin.name}`)
    }

    const plugin = await db.plugin.create({
      data: {
        userId,
        name: catalogPlugin.name,
        description: catalogPlugin.description,
        type: catalogPlugin.type,
        config: JSON.stringify(catalogPlugin.config),
        enabled: false,
        version: catalogPlugin.version,
      },
    })

    logger.info('Plugin installed', {
      userId,
      pluginId: plugin.id,
      catalogId,
      name: catalogPlugin.name,
    })

    return this.mapPlugin(plugin)
  }

  /**
   * Enable or disable an installed plugin.
   */
  async togglePlugin(pluginId: string, enabled: boolean): Promise<PluginConfig> {
    const plugin = await db.plugin.update({
      where: { id: pluginId },
      data: { enabled },
    })
    logger.info('Plugin toggled', { pluginId, enabled })
    return this.mapPlugin(plugin)
  }

  /**
   * Permanently uninstall a plugin.
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    await db.plugin.delete({ where: { id: pluginId } })
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
    const installed = await db.plugin.findMany({
      where: { userId },
      select: { name: true },
    })
    return new Set(installed.map((p) => p.name))
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
