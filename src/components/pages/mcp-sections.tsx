'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SectionCard } from './_shared'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ============== Types ==============

type McpServerType = 'hermes' | 'openclaw' | 'custom'
type McpServerStatus = 'connected' | 'disconnected' | 'error'

interface McpServerConfig {
  id: string
  name: string
  type: McpServerType
  endpoint: string
  apiKey?: string
  status: McpServerStatus
  capabilities: string[]
  lastConnected?: string
}

interface PreBuiltProfile {
  type: McpServerType
  name: string
  endpoint: string
  capabilities: string[]
  description: string
  icon: string
}

type PluginType = 'agent' | 'integration' | 'automation'

interface PluginConfig {
  id: string
  name: string
  description: string
  type: PluginType
  config: Record<string, unknown>
  enabled: boolean
  version: string
}

interface CatalogPlugin {
  id: string
  name: string
  description: string
  type: PluginType
  version: string
  config: Record<string, unknown>
  icon: string
}

// ============== Capability catalog ==============

const ALL_CAPABILITIES = [
  { id: 'web-search', label: 'Web Search' },
  { id: 'image-gen', label: 'Image Gen' },
  { id: 'tts', label: 'Text-to-Speech' },
  { id: 'browser', label: 'Browser Automation' },
  { id: 'code', label: 'Code Execution' },
  { id: 'memory', label: 'Memory' },
  { id: 'skills', label: 'Skills' },
  { id: 'file-ops', label: 'File Ops' },
]

// ============== Status / type helpers ==============

function StatusBadge({ status }: { status: McpServerStatus }) {
  if (status === 'connected') {
    return (
      <Badge className="gap-1 bg-success text-white">
        <Icons.CheckCircle2 className="size-3" /> Connected
      </Badge>
    )
  }
  if (status === 'error') {
    return (
      <Badge variant="destructive" className="gap-1">
        <Icons.XCircle className="size-3" /> Error
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Icons.Circle className="size-3 text-muted-foreground" /> Disconnected
    </Badge>
  )
}

function TypeBadge({ type }: { type: McpServerType }) {
  const map: Record<McpServerType, { label: string; className: string }> = {
    hermes: { label: 'Hermes', className: 'border-hermes/30 bg-hermes/5 text-hermes' },
    openclaw: { label: 'OpenClaw', className: 'border-foreground/20 bg-foreground/5' },
    custom: { label: 'Custom', className: 'border-warning/30 bg-warning/5 text-warning' },
  }
  const cfg = map[type]
  return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
}

function PluginTypeBadge({ type }: { type: PluginType }) {
  const map: Record<PluginType, { label: string; className: string }> = {
    agent: { label: 'Agent', className: 'border-hermes/30 bg-hermes/5 text-hermes' },
    automation: { label: 'Automation', className: 'border-shopee/30 bg-shopee/5 text-shopee' },
    integration: { label: 'Integration', className: 'border-success/30 bg-success/5 text-success' },
  }
  const cfg = map[type]
  return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
}

function ProfileIcon({ name, className }: { name: string; className?: string }) {
  const Icon =
    (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Bot
  return <Icon className={className} />
}

function CatalogIcon({ name, className }: { name: string; className?: string }) {
  const Icon =
    (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Puzzle
  return <Icon className={className} />
}

// ============== Main component ==============

export function McpSections() {
  const [servers, setServers] = useState<McpServerConfig[]>([])
  const [profiles, setProfiles] = useState<PreBuiltProfile[]>([])
  const [plugins, setPlugins] = useState<PluginConfig[]>([])
  const [catalog, setCatalog] = useState<CatalogPlugin[]>([])
  const [loading, setLoading] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [installingId, setInstallingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Add-server form state
  const [form, setForm] = useState<{
    type: McpServerType
    name: string
    endpoint: string
    apiKey: string
    capabilities: string[]
  }>({
    type: 'hermes',
    name: '',
    endpoint: '',
    apiKey: '',
    capabilities: [],
  })

  // ============== Data fetching ==============

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [serversRes, pluginsRes] = await Promise.all([
        fetch('/api/mcp/servers'),
        fetch('/api/mcp/plugins'),
      ])

      if (serversRes.ok) {
        const data = await serversRes.json()
        setServers(data.servers ?? [])
        setProfiles(data.profiles ?? [])
      }

      if (pluginsRes.ok) {
        const data = await pluginsRes.json()
        setPlugins(data.installed ?? [])
        setCatalog(data.catalog ?? [])
      }
    } catch {
      // Silently fail — UI will just show empty state.
      toast.error('Failed to load MCP data', {
        description: 'Please check your connection and try again.',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // ============== Add-server dialog handlers ==============

  function selectProfile(p: PreBuiltProfile) {
    setForm({
      type: p.type,
      name: p.name,
      endpoint: p.endpoint,
      apiKey: '',
      capabilities: [...p.capabilities],
    })
  }

  function toggleCapability(id: string) {
    setForm((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(id)
        ? prev.capabilities.filter((c) => c !== id)
        : [...prev.capabilities, id],
    }))
  }

  async function handleCreate() {
    if (!form.name.trim()) {
      toast.error('Name is required lah', {
        description: 'Give your MCP server a friendly name.',
      })
      return
    }
    if (!form.endpoint.trim()) {
      toast.error('Endpoint URL is required', {
        description: 'Where should we connect to your MCP server?',
      })
      return
    }
    try {
      // Basic URL validation client-side
      new URL(form.endpoint)
    } catch {
      toast.error('Invalid endpoint URL', {
        description: 'Must include protocol (ws://, wss://, http://, or https://).',
      })
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/mcp/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          endpoint: form.endpoint.trim(),
          apiKey: form.apiKey.trim() || undefined,
          capabilities: form.capabilities,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Create failed' }))
        throw new Error(data.error ?? 'Create failed')
      }

      const data = await res.json()
      toast.success('MCP server added', {
        description: `${data.server.name} is ready. Test the connection to activate it.`,
      })
      setAddOpen(false)
      setForm({
        type: 'hermes',
        name: '',
        endpoint: '',
        apiKey: '',
        capabilities: [],
      })
      await refresh()
    } catch (error) {
      toast.error('Failed to add MCP server', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setCreating(false)
    }
  }

  // ============== Server actions ==============

  async function handleTestConnection(serverId: string, name: string) {
    setTestingId(serverId)
    try {
      const res = await fetch(`/api/mcp/servers/${serverId}/test`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({
        success: false,
        message: 'No response from server',
      }))
      if (data.success) {
        toast.success('Connection successful', {
          description: data.message ?? `Connected to ${name}`,
        })
      } else {
        toast.error('Connection failed', {
          description: data.message ?? `Could not reach ${name}`,
        })
      }
      await refresh()
    } catch {
      toast.error('Connection test failed', {
        description: 'Network error — please try again.',
      })
    } finally {
      setTestingId(null)
    }
  }

  async function handleDeleteServer(serverId: string, name: string) {
    try {
      const res = await fetch(`/api/mcp/servers/${serverId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Delete failed' }))
        throw new Error(data.error ?? 'Delete failed')
      }
      toast.success('MCP server removed', {
        description: `${name} has been disconnected and deleted.`,
      })
      await refresh()
    } catch (error) {
      toast.error('Failed to remove server', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // ============== Plugin actions ==============

  async function handleInstall(catalogId: string, name: string) {
    setInstallingId(catalogId)
    try {
      const res = await fetch('/api/mcp/plugins/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalogId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Install failed' }))
        throw new Error(data.error ?? 'Install failed')
      }
      toast.success('Plugin installed', {
        description: `${name} is ready. Toggle it on to activate.`,
      })
      await refresh()
    } catch (error) {
      toast.error('Failed to install plugin', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setInstallingId(null)
    }
  }

  async function handleTogglePlugin(pluginId: string, enabled: boolean, name: string) {
    setTogglingId(pluginId)
    try {
      const res = await fetch(`/api/mcp/plugins/${pluginId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Toggle failed' }))
        throw new Error(data.error ?? 'Toggle failed')
      }
      toast.success(enabled ? 'Plugin enabled' : 'Plugin disabled', {
        description: `${name} is now ${enabled ? 'active' : 'paused'}.`,
      })
      await refresh()
    } catch (error) {
      toast.error('Failed to toggle plugin', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setTogglingId(null)
    }
  }

  async function handleUninstall(pluginId: string, name: string) {
    try {
      const res = await fetch(`/api/mcp/plugins/${pluginId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Uninstall failed' }))
        throw new Error(data.error ?? 'Uninstall failed')
      }
      toast.success('Plugin uninstalled', {
        description: `${name} has been removed.`,
      })
      await refresh()
    } catch (error) {
      toast.error('Failed to uninstall plugin', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // ============== Render ==============

  const installedCatalogNames = new Set(plugins.map((p) => p.name))

  return (
    <>
      {/* ============ MCP Servers Section ============ */}
      <SectionCard
        title="MCP Servers"
        description="Connect your own Hermes Agent or OpenClaw"
        icon={Icons.Server}
        action={
          <Button
            size="sm"
            className="bg-shopee-gradient hover:opacity-90"
            onClick={() => setAddOpen(true)}
          >
            <Icons.Plus className="mr-1 size-3.5" /> Add Server
          </Button>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Icons.Loader2 className="mr-2 size-4 animate-spin" /> Loading MCP servers…
          </div>
        ) : servers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Icons.Server className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No MCP servers configured yet</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Add your Hermes Agent, OpenClaw, or a custom MCP endpoint to extend
              TheViralFindsMY with autonomous task execution.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setAddOpen(true)}
            >
              <Icons.Plus className="mr-1 size-3.5" /> Add your first server
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {servers.map((server, idx) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <Card className="border-border/60 transition-all hover:border-border hover:shadow-sm">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-hermes/10 text-hermes">
                      <ProfileIcon name={profiles.find((p) => p.type === server.type)?.icon ?? 'Bot'} className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{server.name}</p>
                        <TypeBadge type={server.type} />
                        <StatusBadge status={server.status} />
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-muted-foreground" title={server.endpoint}>
                        {server.endpoint}
                      </p>
                      {server.capabilities.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {server.capabilities.map((cap) => (
                            <Badge key={cap} variant="outline" className="text-[10px] font-normal">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {server.lastConnected && (
                        <p className="mt-2 text-[10px] text-muted-foreground">
                          Last connected: {new Date(server.lastConnected).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={testingId === server.id}
                        onClick={() => handleTestConnection(server.id, server.name)}
                      >
                        {testingId === server.id ? (
                          <Icons.Loader2 className="mr-1 size-3 animate-spin" />
                        ) : (
                          <Icons.Plug className="mr-1 size-3" />
                        )}
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteServer(server.id, server.name)}
                      >
                        <Icons.Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ============ Plugins Section ============ */}
      <SectionCard
        title="Plugins"
        description="Extend TheViralFindsMY with automation plugins"
        icon={Icons.Puzzle}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Installed */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Icons.Check className="size-4 text-success" />
              <h4 className="text-sm font-semibold">
                Installed
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {plugins.length} {plugins.length === 1 ? 'plugin' : 'plugins'}
                </span>
              </h4>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                <Icons.Loader2 className="mr-2 size-3.5 animate-spin" /> Loading…
              </div>
            ) : plugins.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 py-6 text-center">
                <Icons.PackageOpen className="size-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">No plugins installed yet</p>
                <p className="text-[10px] text-muted-foreground">
                  Browse the catalog →
                </p>
              </div>
            ) : (
              <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                {plugins.map((plugin, idx) => (
                  <motion.div
                    key={plugin.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                  >
                    <Card className={cn(
                      'border-border/60 transition-all hover:shadow-sm',
                      plugin.enabled && 'border-shopee/30 bg-shopee/[0.03]'
                    )}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            'flex size-8 shrink-0 items-center justify-center rounded-lg',
                            plugin.enabled ? 'bg-shopee/10 text-shopee' : 'bg-muted text-muted-foreground'
                          )}>
                            <Icons.Puzzle className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="text-sm font-medium">{plugin.name}</p>
                              <PluginTypeBadge type={plugin.type} />
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {plugin.description}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-muted-foreground">v{plugin.version}</span>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={plugin.enabled}
                                  disabled={togglingId === plugin.id}
                                  onCheckedChange={(checked) =>
                                    handleTogglePlugin(plugin.id, checked, plugin.name)
                                  }
                                  aria-label={`Toggle ${plugin.name}`}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                                  onClick={() => handleUninstall(plugin.id, plugin.name)}
                                >
                                  <Icons.Trash2 className="size-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Available (catalog) */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Icons.Store className="size-4 text-hermes" />
              <h4 className="text-sm font-semibold">
                Available
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {catalog.length} in catalog
                </span>
              </h4>
            </div>
            <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
              {catalog.map((plugin, idx) => {
                const isInstalled = installedCatalogNames.has(plugin.name)
                return (
                  <motion.div
                    key={plugin.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                  >
                    <Card className="border-border/60 transition-all hover:shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-hermes/10 text-hermes">
                            <CatalogIcon name={plugin.icon} className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="text-sm font-medium">{plugin.name}</p>
                              <PluginTypeBadge type={plugin.type} />
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {plugin.description}
                            </p>
                            <div className="mt-2 flex items-center justify-end">
                              {isInstalled ? (
                                <Badge variant="secondary" className="gap-1 text-[10px]">
                                  <Icons.Check className="size-3" /> Installed
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  disabled={installingId === plugin.id}
                                  onClick={() => handleInstall(plugin.id, plugin.name)}
                                >
                                  {installingId === plugin.id ? (
                                    <Icons.Loader2 className="mr-1 size-3 animate-spin" />
                                  ) : (
                                    <Icons.Download className="mr-1 size-3" />
                                  )}
                                  Install
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ============ Add Server Dialog ============ */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add MCP Server</DialogTitle>
            <DialogDescription>
              Connect your own Hermes Agent, OpenClaw, or any MCP-compatible endpoint.
            </DialogDescription>
          </DialogHeader>

          {/* Pre-built profiles */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pre-built Profiles
            </Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {profiles.map((p) => (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => selectProfile(p)}
                  className={cn(
                    'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all hover:border-shopee/40 hover:shadow-sm',
                    form.type === p.type
                      ? 'border-shopee bg-shopee/[0.04] ring-1 ring-shopee/30'
                      : 'border-border/60'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ProfileIcon name={p.icon} className="size-4 text-hermes" />
                    <span className="text-xs font-semibold">{p.name}</span>
                  </div>
                  <p className="line-clamp-2 text-[10px] text-muted-foreground">
                    {p.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="mcp-name">Server Name</Label>
              <Input
                id="mcp-name"
                placeholder="e.g. My Hermes Agent"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mcp-endpoint">Endpoint URL</Label>
              <Input
                id="mcp-endpoint"
                placeholder="wss://your-server.example/mcp"
                value={form.endpoint}
                onChange={(e) => setForm((p) => ({ ...p, endpoint: e.target.value }))}
              />
              <p className="text-[10px] text-muted-foreground">
                WebSocket (ws:// or wss://) or HTTP (http:// or https://) URL.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mcp-apikey">API Key (optional)</Label>
              <Input
                id="mcp-apikey"
                type="password"
                placeholder="sk-..."
                value={form.apiKey}
                onChange={(e) => setForm((p) => ({ ...p, apiKey: e.target.value }))}
              />
              <p className="text-[10px] text-muted-foreground">
                Stored encrypted at rest. Used only for outbound requests to your server.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Capabilities
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ALL_CAPABILITIES.map((cap) => {
                  const checked = form.capabilities.includes(cap.id)
                  return (
                    <label
                      key={cap.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md border p-2 text-xs transition-colors',
                        checked
                          ? 'border-shopee/40 bg-shopee/[0.04]'
                          : 'border-border/60 hover:bg-muted/50'
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleCapability(cap.id)}
                      />
                      <span>{cap.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="bg-shopee-gradient hover:opacity-90"
            >
              {creating ? (
                <Icons.Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <Icons.Plus className="mr-1 size-4" />
              )}
              Add Server
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
