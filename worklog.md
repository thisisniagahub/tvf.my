# TheViralFindsMY — Project Worklog

**Last Updated:** 20 June 2026  
**Production URL:** https://theviralfinds.my  
**Repository:** https://github.com/thisisniagahub/tvf.my  
**Status:** Production-Ready (Vercel deployed, auto-deploy from main)

---

## Current Project Status

### Architecture
- **207** TypeScript/TSX source files
- **30** API routes (7 ISR cached, 23 force-dynamic)
- **40** page components + **9** sub-components (lazy-loaded, Zustand SPA routing)
- **25** test files (**394** tests, 100% pass rate)
- **9** Prisma models (6 with user relations, 3 composite indexes)
- **0** TypeScript errors, **0** ESLint errors

### Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | 16.1.3 |
| Language | TypeScript 5 (strict mode) | 5.x |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui | 19.0.0 |
| Database | Prisma ORM + SQLite (dev) → PostgreSQL (roadmap) | 6.11.1 |
| Auth | NextAuth v4 (CredentialsProvider, JWT) | 4.24.13 |
| State | Zustand 5 (persisted) + TanStack Query 5 | 5.0.10 |
| Animation | Framer Motion 12 | 12.26.2 |
| Charts | Recharts 2 | 2.15.4 |
| Testing | Vitest 4 + Testing Library | 4.1.9 |
| Validation | Zod 4 | 4.3.5 |
| AI | z-ai-web-dev-sdk (LLM, image gen, TTS, web search, web reader, VLM) | 0.0.18 |
| Real-time | Socket.io 4 (dev only, simulation on Vercel) | 4.8.3 |
| Confetti | canvas-confetti | 1.9.4 |

### Security Implementation
- ✅ NextAuth v4 authentication on all API routes (`requireUser()` / `requireAuth()`)
- ✅ AES-256-GCM encryption for credentials (`src/lib/crypto.ts`)
- ✅ CSRF protection (`src/lib/csrf.ts` — token + httpOnly cookie + timing-safe)
- ✅ MCP API keys encrypted at rest, masked in responses
- ✅ SSRF protection (`validateUrl()` blocks internal IPs, metadata endpoints)
- ✅ 6 security headers (HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS, Referrer-Policy, Permissions-Policy)
- ✅ Rate limiting (token bucket: 5-100 req/min per route type)
- ✅ Ownership checks on all `[id]` routes (404 if not owned, no existence leak)
- ✅ Vercel Cron with CRON_SECRET verification (`crypto.timingSafeEqual`)
- ✅ Zod input validation on all POST routes
- ✅ Structured logging (`src/lib/logger.ts`, no `console.log` in API routes)
- ✅ Prisma relations with `onDelete: Cascade` (referential integrity)

### Performance Optimizations
- ✅ Code splitting: settings-page (1100→88 lines), content-studio (901→49 lines)
- ✅ React.memo on sidebar NavItem (40 items → 1-2 re-render on page switch)
- ✅ useDeferredValue on products + header search (1 fetch on settle)
- ✅ useMemo on dashboard chart data (stable references)
- ✅ React.memo on EarningsChart + ClicksOrdersChart
- ✅ Hybrid route caching (7 ISR 60s/30s, 23 force-dynamic)

### Features
- **40 pages** across 6 categories: Core (7), AI Powered (11), Platforms (5), Advanced (7), Growth (6), Social Media (4)
- **Multi-platform:** Shopee (12 products) + TikTok Shop (8 products) + Lazada (8 products) = 28 total
- **HERMES v2 AI Agent:** Memory System, Skills System v2, Cron Automation, Subagent Delegation, Tool Gateway
- **MCP Server Config:** Connect Hermes Agent / OpenClaw / Custom endpoints
- **Plugin System:** 5 pre-built plugins
- **Computer-Use Agent:** Split-screen workspace, VLA loop, 6 automation tasks
- **Social Media Management:** 8 platforms (FB, IG, TikTok, X, YouTube, LinkedIn, WhatsApp, Telegram)
- **Productivity:** Command Palette (Cmd+K), keyboard shortcuts, Focus Mode, confetti, notification sounds
- **Premium UI:** Retro-Futuristic Isometric Engine landing page, glassmorphism, 3D animations, WCAG AA compliant

### Route Caching Strategy
| Type | Config | Routes |
|------|--------|--------|
| ISR 60s | `revalidate = 60` | dashboard, products, trends, skills, plugins, tasks |
| ISR 30s | `revalidate = 30` | search |
| Force-dynamic | `dynamic = 'force-dynamic'` | hermes/*, ai/*, content/*, agent/*, mcp/servers, auth/* |

### Deployment
- **Vercel** auto-deploy from GitHub `main` branch
- **Domain:** theviralfinds.my
- **Region:** sin1 (Singapore)
- **Build:** `bun install` → `prisma generate` (postinstall) → `next build`
- **AI routes:** maxDuration 60s
- **Vercel Cron:** `*/5 * * * *` → `/api/hermes/cron/execute?mode=allDue`

### Known Limitations
- SQLite not persistent on Vercel → demo mode with in-memory fallback
- Mini-services (Socket.io port 3003/3004) don't run on Vercel → simulation mode
- NextAuth uses demo credentials — wire real auth for production
- `@prisma/client` loaded via `eval()` dynamic import to prevent build-time crashes

---

## Development History (Summary)

### Phase 0-3 (June 17)
- Built entire app from scratch: 40 pages, 30 API routes, 9 Prisma models
- Logger, Zod validation, rate limiting, env validation
- 320 unit tests (Vitest)
- Bundle optimization, image optimization

### Phase 4: HERMES v2 (June 17-18)
- Memory System, Skills System v2, Cron Automation, Subagent Delegation, Tool Gateway

### Phase 6: Computer-Use Agent (June 18)
- MCP Server Config + Plugin System
- Split-screen workspace, VLA Loop, 6 automation tasks
- Legal disclaimer with per-platform risk badges

### Security Hardening (June 18)
- Batch 1-5: NextAuth, AES-256-GCM, Vercel Cron, SSRF, CORS, CRON_SECRET

### UI Upgrades (June 18-19)
- New logo, Retro-Futuristic Isometric Engine landing page
- Multi-platform products (TikTok + Lazada)
- Social Media Management (4 new pages, 8 platforms)
- 5-area architectural review (type safety, responsive, WCAG, animation perf, caching)

### Comprehensive Improvements (June 20)
- Code splitting: settings-page (1100→88), content-studio (901→49) — 9 sub-components
- Performance: React.memo, useDeferredValue, useMemo on charts
- Tests: 320→394 (+74 new tests — app-store, crypto, confetti, sounds, logo, magic-card)
- Database: 6 Prisma relations + 3 composite indexes
- Security: CSRF protection (token + httpOnly cookie + timing-safe)
- Bug fixes: ProgressPrimitive import, tailwind.config.ts deleted
