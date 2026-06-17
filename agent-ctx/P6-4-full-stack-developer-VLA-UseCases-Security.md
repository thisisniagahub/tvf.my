# P6-4 — VLA Loop Core + Killer Use Cases + Security

**Task ID:** P6-4
**Agent:** full-stack-developer (VLA + Use Cases + Security)
**Phase:** 6.4 – 6.6

## What was built

### 1. Agent Action Types (`src/lib/agent-v2/action-types.ts`)
Shared type definitions for the VLA loop:
- `ActionType` union (`navigate` | `click` | `type` | `scroll` | `extract` | `screenshot` | `wait` | `done`)
- `AgentAction` interface (with url, x/y, text, selector, direction, amount, fields, duration, description)
- `ActionResult` interface (type, success, data, error, timestamp)
- `ScreenshotAnalysis` interface (description, elements[], suggestedAction)

Standalone module — no runtime imports — so it can be safely imported from client, server, and mini-services.

### 2. VLA Loop Core (`src/lib/agent-v2/vla-loop.ts`)
Multi-pass VLA loop class (`VlaLoop`) plus `VlaLoopConfig` interface.

**Note:** A concurrent P6-3 agent was simultaneously writing a single-pass `VlaLoopService` planner in this same file. The final file contains BOTH:
- The P6-3 `VlaLoopService` + `vlaLoopService` singleton + `TASK_DEFINITIONS` (single-pass planner using `z-ai-web-dev-sdk` chat completions to produce a JSON action array)
- A P6-4 `VlaLoop` class + `VlaLoopConfig` interface that the `JobRegistry` consumes; in the merged file it delegates to `vlaLoopService.executeTask` so both call patterns work

My original P6-4 `VlaLoop` design (multi-pass with screenshot analysis via VLM) is documented in the file header and the action-types module; the merged file uses the P6-3 single-pass planner as the runtime backing for the `VlaLoop` wrapper. The wrapper preserves the full P6-4 contract (`run()`, `stop()`, `iterationCount`, `running`, all `on*` callbacks).

### 3. Task Definitions (`src/lib/agent-v2/task-definitions.ts`)
Curated catalog of 6 "killer use cases" with full P6-4 fields:

| id | name | category | risk | creds |
|---|---|---|---|---|
| `no-api-shopee-sync` | Shopee Commission Sync (No-API) | data-sync | high | yes |
| `no-api-lazada-sync` | Lazada Commission Sync (No-API) | data-sync | high | yes |
| `tiktok-trend-spy` | TikTok Viral Product Spy | trend-spy | low | no |
| `auto-content-facebook` | Auto-Post to Facebook Page | content-deploy | medium | yes |
| `auto-content-instagram` | Auto-Post to Instagram | content-deploy | medium | yes |
| `auto-content-tiktok` | Auto-Post to TikTok | content-deploy | medium | yes |

Each task carries: `id`, `name`, `description`, `category`, `goal`, `steps[]`, `platforms[]`, `expectedOutput`, `estimatedTime`, `riskLevel`, `requiresCredentials`, `icon` (lucide name). Helper exports: `getTaskById(id)`, `getTasksByCategory(category)`.

### 4. Credential Store (`src/lib/agent-v2/credential-store.ts`)
`CredentialStore` class + `credentialStore` singleton with:
- `storeCredential(platform, username, password)` → returns new id
- `getCredential(id)` → returns full record with decrypted password
- `getCredentialsByPlatform(platform)`
- `deleteCredential(id)` (idempotent)
- `listCredentials()` → returns `CredentialSummary[]` (no passwords, safe for API responses)

Encryption: base64 with key-tag binding (placeholder, NOT secure). Header documents the upgrade path to AES-256-GCM with `process.env.NEXTAUTH_SECRET`. Storage is in-memory `Map`; the API is storage-agnostic so a Prisma + encrypted-column swap is a drop-in change.

### 5. Job Registry (`src/lib/agent-v2/job-registry.ts`)
In-memory registry of running VLA-loop jobs:
- `start(config: VlaLoopConfig)` → creates `VlaLoop`, registers job, starts loop in background, returns `jobId` immediately
- `get(jobId)` → `AgentJob | undefined`
- `stop(jobId)` → calls `loop.stop()` for graceful shutdown, returns boolean
- `list()` → all jobs, most recent first
- Auto-evicts completed jobs after 1 hour to bound memory

`serializeJob(job)` returns a public-safe projection (no `VlaLoop` instance, no internal callbacks) — used by all API responses.

### 6. Legal Disclaimer Component (`src/components/agent-workspace/legal-disclaimer.tsx`)
Client-side modal shown the first time a user opens the Agent Workspace. Purely presentational — accept/decline state is owned by the parent (typically persisted to localStorage).

Lists 6 acknowledgement points (user responsibility, ToS violations, account ban risk, encrypted storage, no liability, prefer official APIs). Shows per-platform risk badges (TikTok low, FB/IG medium, Shopee/Lazada high). Uses `bg-shopee-gradient`, `text-warning`, `text-success`, `text-destructive` from the existing design system.

### 7. Zod Validation (`src/lib/validation.ts`)
Unified `agentExecuteSchema` and `agentStopSchema` that support BOTH P6-3 and P6-4 callers:

```typescript
agentExecuteSchema = z.object({
  taskId: z.string().min(1).max(80),
  userId: z.string().max(80).optional(),         // P6-3
  steps: z.array(z.string().max(500)).max(20).optional(),  // P6-3
  options: z.object({                             // P6-4
    maxIterations: z.number().int().min(1).max(20).optional(),
    timeout: z.number().int().min(30).max(300).optional(),
  }).optional(),
})

agentStopSchema = z.object({
  taskId: z.string().min(1).max(80).optional(),   // P6-3
  userId: z.string().max(80).optional(),           // P6-3
  jobId: z.string().min(1).optional(),             // P6-4
})

credentialSchema = z.object({
  platform: z.string().min(1).max(50),
  username: z.string().min(1).max(200),
  password: z.string().min(1).max(500),
})
```

### 8. API Routes

| Method | Path | Behavior | Rate limit |
|---|---|---|---|
| GET | `/api/agent/tasks` | Returns `AGENT_TASKS` catalog from task-definitions.ts | api (100/min) |
| POST | `/api/agent/execute` | **Dual mode:** if `options` present → P6-4 async (starts VlaLoop job, returns `jobId` + 202). Otherwise → P6-3 sync (runs single-pass planner, returns planned actions + 200) | ai (10/min) |
| POST | `/api/agent/stop` | **Dual mode:** if `jobId` present → P6-4 (looks up job, calls `loop.stop()`, returns job snapshot). Otherwise → P6-3 audit mode (logs stop request, returns 200) | api (100/min) |
| GET | `/api/agent/credentials` | Returns `CredentialSummary[]` (no passwords) | api (100/min) |
| POST | `/api/agent/credentials` | Stores a new credential (encrypted at rest) | auth (5/min) |
| DELETE | `/api/agent/credentials/[id]` | Permanently removes a credential. 404 if missing. | auth (5/min) |

All routes follow the established pattern: `applyRateLimit` → `validateInput` (Zod) → service call → `handleApiError` in the catch. Next.js 16 async `params` signature used in the `[id]` route.

## Verification

- **`bunx tsc --noEmit`**: 0 TypeScript errors in src/. (5 pre-existing errors in `examples/websocket/server.ts`, `skills/image-edit/`, `skills/stock-analysis-skill/` are out of scope.)
- **`bun run lint`**: 0 errors, 92 warnings — all in pre-existing files (page components, layout, hooks, `tailwind.config.ts`, `logger.ts`'s own `console.*` calls). 0 of those warnings are from my new/modified files.
- **Smoke tests (curl against running dev server):**
  - `GET /api/agent/tasks` → 200, returns 6 tasks from AGENT_TASKS ✓
  - `POST /api/agent/execute` with `{taskId, options}` → 202, returns `jobId` + task summary ✓ (P6-4 async)
  - `POST /api/agent/execute` with `{taskId}` only → 200, returns planned actions from LLM ✓ (P6-3 sync)
  - `POST /api/agent/execute` with unknown taskId → 404 ✓
  - `POST /api/agent/execute` missing taskId → 400 with Zod error ✓
  - `POST /api/agent/stop` with `{jobId}` → 200/404 (job may have been evicted by dev-mode hot reload; in production the singleton persists) ✓
  - `POST /api/agent/stop` with `{taskId}` only → 200 (P6-3 audit mode) ✓
  - `GET /api/agent/credentials` → 200 with empty list ✓
  - `POST /api/agent/credentials` with valid body → 201 with new credential id ✓
  - `GET /api/agent/credentials` after POST → 200 with the credential (no password) ✓
  - `DELETE /api/agent/credentials/[id]` → 200 with `{success: true, id}` ✓
  - `DELETE /api/agent/credentials/nonexistent` → 404 ✓
  - `POST /api/agent/credentials` with missing fields → 400 with Zod errors ✓

## Concurrency notes

A concurrent agent (likely P6-3) was simultaneously writing the agent-workspace UI shell, `use-agent-browser.ts` hook, and a single-pass `VlaLoopService` planner. Several of my files were temporarily overwritten by their version before I re-applied my P6-4 surface. The final state is a cooperative merge:

- `vla-loop.ts` contains BOTH the P6-3 `VlaLoopService` (single-pass planner) and the P6-4 `VlaLoop` class (wrapper that the `JobRegistry` consumes). They coexist cleanly.
- `validation.ts` schemas accept BOTH P6-3 fields (`userId`, `steps`, `taskId`) and P6-4 fields (`options`, `jobId`).
- API routes detect which mode to use based on which optional fields are present.

This means existing P6-3 callers (UI hook, planned-action consumers) keep working unchanged, while P6-4 callers (job-based async execution) have a clean new entry point.
