# TheViralFindsMY — Project Worklog

**Last Updated:** 19 June 2026  
**Production URL:** https://theviralfinds.my  
**Repository:** https://github.com/thisisniagahub/tvf.my  
**Status:** Production-Ready (Vercel deployed, auto-deploy from main)

---

## Current Project Status

### Architecture
- **190** TypeScript/TSX source files
- **29** API routes (7 ISR cached, 22 force-dynamic)
- **40** page components (lazy-loaded, Zustand SPA routing)
- **19** test files (320 tests, 100% pass rate)
- **9** Prisma models (User, Post, AgentMemory, HermesSkill, HermesCronJob, HermesSubagent, McpServer, AgentCredential, Plugin)
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
- ✅ MCP API keys encrypted at rest, masked in responses
- ✅ SSRF protection (`validateUrl()` blocks internal IPs, metadata endpoints)
- ✅ 6 security headers (HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS, Referrer-Policy, Permissions-Policy)
- ✅ Rate limiting (token bucket: 5-100 req/min per route type)
- ✅ Ownership checks on all `[id]` routes (404 if not owned, no existence leak)
- ✅ Vercel Cron with CRON_SECRET verification (`crypto.timingSafeEqual`)
- ✅ Zod input validation on all POST routes
- ✅ Structured logging (`src/lib/logger.ts`, no `console.log` in API routes)
- ✅ Environment variable validation (`src/lib/env.ts`)

### Features
- **40 pages** across 6 categories: Core (7), AI Powered (11), Platforms (5), Advanced (7), Growth (6), Social Media (4)
- **Multi-platform:** Shopee (12 products) + TikTok Shop (8 products) + Lazada (8 products) = 28 total
- **HERMES v2 AI Agent:** Memory System, Skills System v2 (4 seed skills), Cron Automation, Subagent Delegation, Tool Gateway
- **MCP Server Config:** Connect Hermes Agent / OpenClaw / Custom endpoints
- **Plugin System:** 5 pre-built plugins (Auto Sync, Trend Spy, Content Deploy, Competitor Tracker, Manglish Humanizer)
- **Computer-Use Agent:** Split-screen workspace with virtual browser canvas, VLA loop, 6 automation tasks
- **Social Media Management:** 8 platforms (FB, IG, TikTok, X, YouTube, LinkedIn, WhatsApp, Telegram)
- **Productivity:** Command Palette (Cmd+K), keyboard shortcuts (G+X, B, F, /, ?), Focus Mode, confetti, notification sounds
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
- **AI routes:** maxDuration 60s (hermes/chat, ai/thumbnails, ai/voiceover, agent/execute, content/script)
- **Vercel Cron:** `*/5 * * * *` → `/api/hermes/cron/execute?mode=allDue`

### Known Limitations
- SQLite not persistent on Vercel → demo mode with in-memory fallback
- Mini-services (Socket.io port 3003/3004) don't run on Vercel → simulation mode
- NextAuth uses demo credentials (`demo@theviralfindsmy.com` / `demo1234`) — wire real auth for production
- `@prisma/client` loaded via `eval()` dynamic import to prevent build-time crashes

---

## Development History (Summary)

### Phase 0-3 (June 17)
- Built entire app from scratch: 40 pages, 29 API routes, 9 Prisma models
- Implemented logger, Zod validation, rate limiting, env validation
- 320 unit tests (Vitest)
- Bundle optimization (lazy loading, code splitting)
- Image optimization (SmartImage component)

### Phase 4: HERMES v2 (June 17-18)
- Memory System (AgentMemory model, 2200/1375 char limits, AI consolidation)
- Skills System v2 (HermesSkill model, regex auto-detection, 4 seed skills)
- Cron Automation (HermesCronJob model, NL schedule parser, Vercel Cron)
- Subagent Delegation (HermesSubagent model, batch max 3, timeout guard)
- Tool Gateway (web search, image gen, TTS, web reader via z-ai-web-dev-sdk)

### Phase 6: Computer-Use Agent (June 18)
- MCP Server Config + Plugin System (McpServer, Plugin models)
- Split-screen workspace (react-resizable-panels, 40/60 split)
- Virtual browser canvas with WebSocket streaming
- VLA Loop (Screenshot → LLM → Action → Repeat)
- 6 automation tasks (Shopee/Lazada sync, TikTok spy, FB/IG/TikTok auto-post)
- Legal disclaimer with per-platform risk badges

### Security Hardening (June 18)
- Batch 1: NextAuth wiring, security headers, SSRF allowlist
- Batch 2: Auth on all 25 remaining routes, ownership checks
- Batch 3: AES-256-GCM encryption, AgentCredential Prisma model
- Batch 4: Vercel Cron with CRON_SECRET, proper cron parser
- Batch 5: Rate limiter IP fix, Caddyfile hardening, Socket.io CORS restriction

### UI Upgrades (June 18-19)
- New logo (TheViralFinds — lightning bolt + magnifying glass)
- Retro-Futuristic Isometric Engine landing page (3D, glassmorphism, particles)
- 21st.dev Magic UI upgrade (MagicCard, glass-premium, 3D utilities)
- Multi-platform products (TikTok + Lazada added)
- Social Media Management (4 new pages, 8 platforms)
- 5-area architectural review (type safety, responsive, WCAG, animation perf, caching)
