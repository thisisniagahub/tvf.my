# Contributing to TheViralFindsMY

## 🛠️ Development Setup

```bash
bun install
bun run dev

# Before committing:
bun run lint
bun run test
```

## 📋 Code Standards

### TypeScript
- **Strict mode ON** — `noImplicitAny: true`, `strictNullChecks: true`
- No `any` types in API routes — use proper interfaces or explicit casts in services
- All function parameters and return types should be explicitly typed

### API Routes
- **Authentication required**: Use `requireUser()` (soft) or `requireAuth()` (strict) from `@/lib/auth`
- Apply rate limiting: `applyRateLimit(request, RATE_LIMITS.api, 'route-name')`
- Validate input with Zod: `validateInput(schema, body)`
- Use `handleApiError()` for consistent error responses
- For `[id]` routes: verify ownership, return 404 if not owned
- Never accept `userId` from request body — resolve from session
- Route caching: Use `revalidate = 60` for read-heavy, `force-dynamic` for AI/sensitive

### Security
- **Credentials**: Use `@/lib/crypto` (`encrypt()`/`decrypt()`) — AES-256-GCM
- **MCP API keys**: Encrypt before storing, mask in responses
- **SSRF**: Use `validateUrl()` before fetching external URLs
- **WebSocket**: Skip on Vercel production (detect via hostname)
- **CORS**: Use `ALLOWED_ORIGINS` env var for Socket.io services

### Components
- Use shadcn/ui from `@/components/ui/` — don't recreate
- Use `'use client'` only when needed (hooks, state, event handlers)
- Use Framer Motion for animations
- Use shared `_shared.tsx` components (PageHeader, StatCard, SectionCard)
- Page components should be < 500 lines — extract sub-components

### Styling
- **No indigo/blue/sky colors** — use shopee (orange #ff6b00) or hermes (purple #8b5cf6)
- Tailwind CSS 4 with CSS variables
- Responsive: mobile-first (`sm:`, `md:`, `lg:`, `xl:`)
- Support foldable devices (280px min-width)
- WCAG AA contrast on glass panels
- `prefers-reduced-motion` must nullify ALL animations

### Logging
- Use `@/lib/logger` — NOT `console.log`
- `logger.debug()` / `logger.info()` — dev only
- `logger.warn()` / `logger.error()` — always emitted

### State Management
- Zustand for client state (`@/store/app-store`)
- TanStack Query for server state
- Persist preferences with `persist` middleware

## 🧪 Testing
- Write unit tests for all new utilities (`*.test.ts`)
- Use Vitest globals (`describe`, `it`, `expect`, `vi`)
- Target: 70%+ coverage on `src/lib/`

## 🚫 Don'ts
- ❌ Don't use `any` type in API routes
- ❌ Don't use `console.log` in API routes — use `logger`
- ❌ Don't use indigo/blue colors
- ❌ Don't recreate shadcn/ui components
- ❌ Don't import z-ai-web-dev-sdk in client components
- ❌ Don't accept `userId` from request body
- ❌ Don't use static `import { PrismaClient }` — use `@/lib/db` which handles dynamic import
