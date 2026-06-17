# Task P6-2 — Phase 6.2 Split-Screen Workspace UI

**Agent:** full-stack-developer (Split-Screen UI)
**Task ID:** P6-2
**Date:** 17 Jun 2026
**Scope:** Kimi Computer-style split-screen workspace for the HERMES agent

## Goal

Implement a Kimi Computer-style split-screen workspace where the existing
dashboard stays on the left and a HERMES agent workspace slides in on the
right (60% width) when the user clicks a floating "Run Agent Automation"
button. The agent workspace hosts a virtual browser canvas, a control bar
with URL/status/transport controls, and a task panel with 3 killer use
cases + a live action/log timeline.

## Files Touched

### New files (5)
- `src/components/agent-workspace/agent-workspace.tsx`
  — `react-resizable-panels` PanelGroup container. Keyed by `isOpen` so
  toggling fully remounts the group (the library only applies
  `defaultSize` on first mount). Dashboard panel = 100% width when
  closed → visually identical to before.
- `src/components/agent-workspace/agent-trigger-button.tsx`
  — Floating FAB at `fixed right-4 top-20 z-40`. Uses `bg-hermes-gradient`.
  Toggles to destructive "Close Agent" pill when open. Pulsing white dot
  when `agentStatus==='running'`. Hides on landing / onboarding / focus mode.
- `src/components/agent-workspace/agent-control-bar.tsx`
  — Sticky chrome with Hermes brand mark, free-text URL address input,
  transport controls (pause/resume/stop/refresh), status badge with
  pulsing dot when running. Status colours: idle=muted, running=success,
  paused=warning, completed=success, error=destructive.
- `src/components/agent-workspace/virtual-browser-canvas.tsx`
  — Browser viewport. Renders base64 `agentScreenshot` when present,
  spinning `LoaderCircle` overlay while running, `bg-grid` gradient
  placeholder when idle. Click-to-steer: drops a cursor marker at the
  click % and pushes a `click` action onto the timeline.
- `src/components/agent-workspace/agent-task-panel.tsx`
  — Left sidebar of the agent area. Select dropdown with 3 use cases
  (No-API Data Sync, TikTok Trend Spy, Auto Content Deploy), description
  card, Start/Stop buttons, plus two collapsible accordions: Execution
  Logs (max-h-48, colour-coded by level) and Actions (max-h-64, per-action
  icon + status icon + target/value + timestamp). Includes a front-end
  simulation that drives the store through a fixed per-task timeline
  (navigate → click → type → extract → done) with inline-SVG mock
  screenshots per platform. Pause/resume/stop honoured via abort ref +
  status polling loop.

### Modified files (4)
- `src/lib/types.ts` — Added `AgentStatus`, `AgentAction`, `AgentLog`
  types (exported for reuse).
- `src/store/app-store.ts` — Added the full agent workspace slice
  (state + actions). `partialize` persists only `agentWorkspaceOpen`
  (screenshot/actions/logs/status/url/task are ephemeral). `resetAllSettings`
  also clears the agent slice.
- `src/components/layout/app-shell.tsx` — Wraps the dashboard in
  `<AgentWorkspace>` and renders `<AgentTriggerButton />`. Mobile
  bottom-nav + command-palette FAB are suppressed while the workspace
  is open to avoid overlap with the right panel.
- `src/hooks/use-agent-browser.ts` — Fixed pre-existing type drift so
  it aligns with the new spec'd types (removed `AgentActionType` /
  `AgentLogLevel` imports, replaced `'connecting'` / `'connected'`
  statuses with `'idle'` + log messages, replaced non-spec `payload`
  field with typed `target` / `value` extraction).

## Design Decisions

1. **PanelGroup keying** — `react-resizable-panels` only applies
   `defaultSize` on first mount of a panel. The cleanest way to honour
   40/60 proportions on every workspace open is to key the PanelGroup
   by `isOpen` so it fully remounts. This also resets any user-resized
   proportions when the workspace is reopened.

2. **No `AnimatePresence` around `Panel`** — The spec template wrapped
   panels in `AnimatePresence`, but `Panel` from `react-resizable-panels`
   is not a motion component, so `AnimatePresence` would have no effect
   on it. Instead, the inner `<motion.div>` of the right panel handles
   the entrance animation (opacity + x-slide). Exit animations are
   sacrificed for layout simplicity — the panel just unmounts on close.

3. **`agentWorkspaceOpen` persisted only** — `agentScreenshot` is a
   base64 data URL which can easily exceed localStorage quotas
   (~5MB). The other agent fields (actions, logs, status, url, task)
   are ephemeral run-scoped state — no value in persisting them across
   reloads. Only the open/closed preference survives.

4. **Front-end simulation** — Phase 6.2 is UI-only. The
   `agent-task-panel.tsx` includes a fixed-timeline simulation per task
   that drives every store field the future real socket hook
   (`use-agent-browser.ts`) will write to. This means Phase 6.3+ backend
   wiring is a drop-in swap — replace the simulation with `io()` calls
   and the UI keeps working.

5. **Mock screenshots via inline SVG** — Generated per-task as
   `data:image/svg+xml;utf8,...` URLs. Each shows a fake browser chrome
   with the target URL, page title and phase, plus a grid of product
   cards tinted with the platform accent colour. Real headless-browser
   captures will replace this in Phase 6.3+.

6. **Mobile chrome suppression** — When the agent workspace is open,
   the mobile bottom-nav and the command-palette FAB are hidden to
   avoid overlap with the right panel. Desktop sidebar + header remain
   fully usable inside the left dashboard panel.

## Verification

- `bunx tsc --noEmit` — Clean for all `src/` files. Remaining errors
  are pre-existing in `examples/` and `skills/` directories (out of
  scope).
- `bun run lint` — 0 errors. 92 remaining warnings are pre-existing
  (`tailwind.config.ts` mixed-spaces-and-tabs, `logger.ts` console
  statements, `header.tsx` unused vars). New agent-workspace files are
  lint-clean.
- `GET /` returns 200. No compile errors in `dev.log` after the edits.
- When the workspace is closed (default state), the dashboard renders
  identically to before — the dashboard panel takes 100% width and no
  resize handle or agent chrome is visible.

## Phase 6.3+ Hooks

The simulation in `agent-task-panel.tsx` writes to the same store fields
the real `useAgentBrowser()` hook will write to:
- `setAgentStatus`, `setAgentUrl`, `setAgentScreenshot`
- `addAgentAction`, `addAgentLog`

Swapping the simulation for live socket events is a drop-in change.
The hook is already wired to the same port (3004) and Caddy gateway
convention (`/?XTransformPort=3004`) used elsewhere in the project.
