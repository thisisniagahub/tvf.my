# P6-1 — MCP Server Config + Plugin System

**Agent:** full-stack-developer (MCP Server + Plugin System)
**Task ID:** P6-1
**Phase:** 6.1 — MCP Server Config + Plugin System

## Scope

Implement an MCP (Model Context Protocol) server configuration system plus a
plugin registry, surfacing both in the existing Settings → Integrations tab
without removing or breaking any existing features.

## Deliverables

### 1. Prisma schema (2 new models)

`prisma/schema.prisma` — appended two new models:

- `McpServer` (table `mcp_servers`) — id, userId, name, type
  (`hermes` | `openclaw` | `custom`), endpoint, apiKey, status, capabilities
  (JSON-encoded string, SQLite doesn't support `String[]`), lastConnected,
  timestamps. Indexed on `[userId]`.
- `Plugin` (table `plugins`) — id, userId, name, description, type
  (`agent` | `integration` | `automation`), config (JSON-encoded string),
  enabled, version, timestamps. Indexed on `[userId, enabled]`.

`bun run db:push` applied the schema and regenerated the Prisma Client
(v6.19.2).

### 2. Zod schemas (`src/lib/validation.ts`)

Added 4 schemas:

- `mcpServerSchema` — validates create-server payload (name, type, endpoint
  URL, optional apiKey, optional capabilities array).
- `mcpServerToggleSchema` — reserved for future status overrides.
- `pluginInstallSchema` — `{ catalogId: string }`.
- `pluginToggleSchema` — `{ enabled: boolean }`.

Also removed a pre-existing duplicate declaration of `agentExecuteSchema` and
`agentStopSchema` (dead second set at lines 212-224) that was breaking the
entire validation module's compile. The first set (lines 173-183, used by
`/api/agent/tasks`, `/api/agent/execute`, `/api/agent/stop`) is preserved.

### 3. MCP Server Service (`src/lib/mcp/mcp-server.ts`)

`McpServerService` class with singleton `mcpServerService`:

- `getServers(userId)` / `getServer(serverId, userId?)` — list/fetch.
- `createServer(userId, config)` — persists with status `disconnected`.
- `updateServer(serverId, patch)` — partial update.
- `testConnection(serverId)` — simulated 1s handshake, validates endpoint
  protocol (ws(s):// or http(s)://), flips status to `connected` /
  `error`, sets `lastConnected`. Never throws — returns
  `{ success, message, serverId }`.
- `disconnect(serverId)` — flips status to `disconnected` without deleting.
- `deleteServer(serverId)` — permanent remove.
- `getPreBuiltProfiles()` — 3 profiles (Hermes Agent, OpenClaw, Custom).
- `mapServer()` — Prisma row → `McpServerConfig`, parses JSON capabilities
  and **masks the API key** (`sk-1234••••5678`) so the raw key is never
  returned in the public API.

### 4. Plugin Registry (`src/lib/mcp/plugin-registry.ts`)

Static catalog of 5 installable plugins:

- Auto Shopee Sync (automation)
- TikTok Trend Spy (automation)
- Auto Content Deploy (automation)
- Competitor Tracker (agent)
- Manglish Humanizer (integration)

`PluginService` class with singleton `pluginService`:

- `getInstalledPlugins(userId)` / `getPlugin(pluginId, userId?)`.
- `installPlugin(userId, catalogId)` — installs from catalog. Throws on
  unknown catalog id or duplicate install (caught at the API layer and
  returned as 400).
- `togglePlugin(pluginId, enabled)`.
- `uninstallPlugin(pluginId)`.
- `getCatalog(installedNames)` — pass-through for future filtering.
- `getInstalledCatalogNames(userId)` — `Set<string>` of installed plugin
  names for UI greying.
- `mapPlugin()` — Prisma row → `PluginConfig`, parses JSON config.

### 5. API routes (6 files)

All routes follow the established pattern: `applyRateLimit` →
`validateInput` → service call → `handleApiError` in the catch. Next.js 16
async `params` signature used throughout.

| Route | Method(s) | Rate limit | Notes |
|---|---|---|---|
| `/api/mcp/servers` | GET, POST | api | GET returns `{ servers, profiles }` in one round-trip |
| `/api/mcp/servers/[id]` | GET, DELETE | api | 404 on missing / unauthorised |
| `/api/mcp/servers/[id]/test` | POST | ai | Returns `{ success, message, serverId }` |
| `/api/mcp/plugins` | GET | api | Returns `{ installed, catalog, installedNames }` |
| `/api/mcp/plugins/[id]` | PUT, DELETE | api | PUT toggles enabled; DELETE uninstalls |
| `/api/mcp/plugins/install` | POST | ai | Returns 400 on duplicate / unknown catalog id |

### 6. Settings UI — MCP Servers + Plugins sections

Created a self-contained `src/components/pages/mcp-sections.tsx` component
(`McpSections`) and mounted it at the top of the Integrations tab in
`src/components/pages/settings-page.tsx` (BEFORE the existing "Connected
Platforms" SectionCard). Existing integrations, security, appearance, etc.
tabs are untouched.

**MCP Servers Section:**
- SectionCard titled "MCP Servers" with description "Connect your own
  Hermes Agent or OpenClaw", icon = `Icons.Server`.
- "Add Server" button (shopee-gradient) opens a Dialog with:
  - Pre-built profile cards (Hermes, OpenClaw, Custom) — clicking
    pre-fills the form.
  - Name, endpoint, password-masked API key inputs.
  - Capabilities checkboxes (8 capabilities: web-search, image-gen, tts,
    browser, code, memory, skills, file-ops).
  - "Add Server" submit button (shopee-gradient) with loading spinner.
- Server list: each row shows the profile icon, name, type badge, status
  badge (green Connected / grey Disconnected / red Error), monospace
  endpoint (truncated with title tooltip), capability chips, last
  connected timestamp. Per-row actions: "Test" button (spinner during
  test) + trash icon (delete).

**Plugins Section:**
- SectionCard titled "Plugins" with description "Extend TheViralFindsMY
  with automation plugins", icon = `Icons.Puzzle`.
- Two-column responsive layout: "Installed" (left) and "Available"
  (right). Each side has `max-h-96 overflow-y-auto` for long lists.
- Installed plugin card: Puzzle icon (shopee-tinted when enabled), name,
  type badge, line-clamped description, version, Switch (aria-labelled),
  uninstall trash button. Enabled plugins get a shopee-tinted border.
- Available plugin card: catalog icon (hermes-tinted), name, type badge,
  description, "Install" button (with spinner). If already installed,
  shows an "Installed" badge instead of the install button.

### 7. UI behaviors

- All state changes use sonner toasts with Manglish flavour
  ("Name is required lah", "Pick a profile first", etc.).
- Optimistic refresh via `useEffect` + `useCallback` after each mutation.
- Empty-state cards with friendly copy and CTA when no servers / no
  plugins installed.
- Client-side URL validation before POST so the user gets immediate
  feedback (server-side Zod still enforces).
- Loading spinners on every async action (creating, testing, installing,
  toggling, deleting).
- Mobile-responsive: server cards stack vertically on small screens;
  plugin two-column grid collapses to one column.

## Verification

- `bun run db:push` — schema applied successfully, Prisma Client
  regenerated.
- `bunx tsc --noEmit` — 0 TypeScript errors in any new/modified file.
  Remaining errors are all in pre-existing files owned by other agents
  (`examples/websocket/server.ts`, `skills/*`, `src/hooks/use-agent-browser.ts`,
  `src/lib/agent-v2/job-registry.ts`, `src/components/agent-workspace/*`).
- `bunx eslint src/lib/mcp src/app/api/mcp src/components/pages/mcp-sections.tsx src/components/pages/settings-page.tsx src/lib/validation.ts` — 0 errors, 0 warnings.
- Smoke-tested all 6 API endpoints via curl against the running dev server:
  - GET /api/mcp/servers → 200 with `{ servers: [], profiles: [...] }`
  - POST /api/mcp/servers (valid) → 201 with created server
  - POST /api/mcp/servers (missing type) → 400 with Zod error
  - POST /api/mcp/servers (invalid URL) → 400 with Zod error
  - GET /api/mcp/servers/{id} → 200
  - GET /api/mcp/servers/nonexistent → 404
  - POST /api/mcp/servers/{id}/test → 200 with `{ success: true, message: "Connected to Test Hermes" }`
  - DELETE /api/mcp/servers/{id} → 200 with `{ success: true, id }`
  - GET /api/mcp/plugins → 200 with `{ installed: [], catalog: [...] }`
  - POST /api/mcp/plugins/install (valid) → 201 with created plugin
  - POST /api/mcp/plugins/install (duplicate) → 400 with "Plugin already installed"
  - POST /api/mcp/plugins/install (invalid catalogId) → 400 with "Plugin not found in catalog"
  - PUT /api/mcp/plugins/{id} → 200 with toggled plugin
  - DELETE /api/mcp/plugins/{id} → 200 with `{ success: true, id }`
- Dev log shows structured `logger.info` calls emitting correctly
  (`MCP server created`, `MCP server connected`, `Plugin installed`,
  `Plugin toggled via API`, `Plugin uninstalled via API`, etc.).
- Prisma queries show the JSON-encoded `capabilities` and `config`
  columns being read/written correctly.

## Notes

- The dev server's Turbopack cache had a transient stale-cache episode
  after `db:push` (it reported `vlaLoopService` / `TASK_DEFINITIONS` as
  not exported, even though they are). This was resolved by touching
  `vla-loop.ts` to invalidate the cache. All MCP endpoints then returned
  to 200/201/400/404 as expected.
- The pre-existing duplicate `agentExecuteSchema` / `agentStopSchema`
  declarations in `validation.ts` (added by an earlier concurrent agent)
  were blocking the entire validation module from compiling, which made
  `mcpServerSchema` unreachable. Removed the second (dead, unused) set;
  kept the first (live) set that's actually imported by
  `/api/agent/tasks`, `/api/agent/execute`, `/api/agent/stop`.
- No existing features were removed or modified. The Integrations tab's
  existing "Connected Platforms" cards, security, appearance, profile,
  notifications, billing, and about tabs are all untouched.
- API key is stored as plaintext in SQLite for the demo. The service
  layer masks it (`sk-1234••••5678`) before returning it from the API,
  so the raw key is never exposed to the client. A real deployment would
  encrypt at rest with a KMS-backed key.
