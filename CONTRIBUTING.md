# Contributing to TheViralFindsMY

Thank you for your interest in contributing! This guide covers the development workflow, code standards, and review process.

## 🛠️ Development Setup

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Run checks before committing
bun run lint
bun run test
bunx tsc --noEmit
```

## 📋 Code Standards

### TypeScript
- **Strict mode is ON** — `noImplicitAny: true`, `strictNullChecks: true`
- No `any` types — use proper interfaces from `@/lib/types` or inline types
- All function parameters and return types should be explicitly typed
- Use `zod` schemas for API input validation (see `@/lib/validation`)

### ESLint
- Critical rules are enabled as **warnings** (not errors) to avoid blocking development
- Fix all new warnings before submitting a PR
- Run `bun run lint` before committing

### Logging
- Use the structured logger (`@/lib/logger`) — NOT `console.log`
- `logger.debug()` / `logger.info()` — dev only (silent in production)
- `logger.warn()` / `logger.error()` — always emitted
- Use `handleApiError()` in API route catch blocks

### API Routes
- Apply rate limiting: `applyRateLimit(request, RATE_LIMITS.api, 'route-name')`
- Validate input with Zod: `validateInput(schema, body)`
- Use `handleApiError()` for consistent error responses
- Always include try/catch with proper logging

### Components
- Use shadcn/ui components from `@/components/ui/` — don't recreate
- Use `'use client'` only when needed (hooks, state, event handlers)
- Use Framer Motion for animations
- Use the shared `_shared.tsx` components (PageHeader, StatCard, SectionCard, etc.)

### Styling
- **No indigo or blue colors** — use shopee (orange) or hermes (purple) theme
- Use Tailwind CSS 4 classes with CSS variables
- Responsive: mobile-first (`sm:`, `md:`, `lg:`, `xl:`)
- Dark mode: use `dark:` variants (CSS variables handle the switch)

### State Management
- **Zustand** for client state (`@/store/app-store`)
- **TanStack Query** for server state (`@tanstack/react-query`)
- Persist user preferences in the Zustand store with `persist` middleware

## 🧪 Testing

- Write unit tests for all new utility functions (`*.test.ts`)
- Use Vitest globals (`describe`, `it`, `expect`, `vi`)
- Test file naming: `src/lib/foo.test.ts` for `src/lib/foo.ts`
- Run `bun run test` before submitting PRs
- Target: 70%+ coverage on `src/lib/`

## 📝 Git Workflow

1. **Branch naming**: `feature/description`, `fix/description`, `chore/description`
2. **Commit format**: Conventional commits
   - `feat: add notification sound option`
   - `fix: AnimatedNumber stuck at zero`
   - `docs: update README with testing instructions`
   - `refactor: replace console.log with logger`
3. **PR requirements**:
   - All checks pass (`lint`, `test`, `tsc`)
   - No new `any` types
   - No new `console.log` in API routes
   - Description explains what + why

## 🏗️ Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Zustand for routing (not Next.js file routing) | SPA experience with instant page transitions |
| Tailwind CSS 4 (CSS-first config) | No `tailwind.config.ts` needed, faster builds |
| z-ai-web-dev-sdk (backend only) | AI capabilities without exposing API keys to client |
| In-memory rate limiting | Simple for single-instance; upgrade to Redis for multi-instance |
| WebSocket + fallback simulation | Live notifications work even if WebSocket service is down |

## 🚫 Don'ts

- ❌ Don't use `any` type — define proper interfaces
- ❌ Don't use `console.log` in API routes — use `logger`
- ❌ Don't use indigo/blue colors — use shopee/hermes/success/warning
- ❌ Don't recreate shadcn/ui components — use existing ones
- ❌ Don't import z-ai-web-dev-sdk in client components — backend only
- ❌ Don't use absolute URLs in fetch — use relative paths with `XTransformPort`
- ❌ Don't skip error handling — always wrap API logic in try/catch

---

Questions? Check the worklog at `/home/z/my-project/worklog.md` for project history and decisions.
