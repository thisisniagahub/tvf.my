# THEVIRALFINDSMY — MASTER IMPROVEMENT PLAN
## Version 8.0 → 10.0 | Comprehensive Checklist & Timeline

> **Generated:** 17 June 2026  
> **Current Score:** 7.5/10  
> **Target Score:** 10.0/10  
> **Total Effort:** ~260 hours (13 weeks)  
> **Team:** 1-2 developers

---

## SCORE TRACKER

| Kriteria | Before | After P0 | Target | Status |
|----------|--------|----------|--------|--------|
| Arsitektur | 7/10 | 7/10 | 10/10 | 🟡 In Progress |
| Type Safety | 3/10 | 6/10 | 10/10 | 🟡 In Progress |
| Code Quality | 4/10 | 7/10 | 10/10 | 🟡 In Progress |
| UI/UX | 9/10 | 9/10 | 10/10 | 🟢 Near Complete |
| Performance | 7/10 | 7/10 | 10/10 | 🔴 Not Started |
| Security | 5/10 | 7/10 | 10/10 | 🟡 In Progress |
| **Testing** | **0/10** | **0/10** | **10/10** | **🔴 Not Started** |
| Documentation | 6/10 | 6/10 | 10/10 | 🔴 Not Started |
| Database Design | 8/10 | 8/10 | 10/10 | 🟢 Near Complete |
| Feature Completeness | 10/10 | 10/10 | 10/10 | ✅ Complete |
| **OVERALL** | **6.0** | **7.5** | **10.0** | **🟡 50%** |

**Legend:** ✅ Complete | 🟢 Near Complete | 🟡 In Progress | 🔴 Not Started

---

## PHASE 0: P0 CRITICAL FIXES ✅ COMPLETE

| # | Task | File(s) | Status | Date |
|---|------|---------|--------|------|
| 0.1 | Fix ESLint — aktifkan rules kritis | `eslint.config.mjs` | ✅ | 17 Jun |
| 0.2 | Fix TypeScript — `noImplicitAny: true` | `tsconfig.json` | ✅ | 17 Jun |
| 0.3 | Hapus `ignoreBuildErrors` dari Next.js | `next.config.ts` | ✅ | 17 Jun |
| 0.4 | Aktifkan React StrictMode | `next.config.ts` | ✅ | 17 Jun |
| 0.5 | Hapus `.env` dari repo | — | ✅ | 17 Jun |
| 0.6 | Buat `.env.example` template | `.env.example` | ✅ | 17 Jun |
| 0.7 | Fix Tailwind v4 config mismatch | hapus `tailwind.config.ts` | ✅ | 17 Jun |

**Impact: +1.5 skor (6.0 → 7.5)**

---

## PHASE 1: CODE QUALITY & TYPE SAFETY (Week 1-2)
**Goal: 7.5 → 8.3 (+0.8)** | Effort: 40h

### 1.1 Fix All `any` Types 🔴

- [ ] Fix `src/app/api/live/script/route.ts` — `products: any[]` → `products: LiveProduct[]`
- [ ] Fix `src/app/api/live/script/route.ts` — `product: any` → `product: LiveProduct | undefined`
- [ ] Fix `src/components/pages/unified-page.tsx` — `ChartTooltip({ active, payload, label }: any)`
- [ ] Fix `src/components/pages/unified-page.tsx` — `entry: any` → proper Recharts type
- [ ] Fix `src/components/pages/profit-page.tsx` — `calcResult: any` → `ProfitResult`
- [ ] Fix `src/components/pages/profit-page.tsx` — `goalTracker.map((g: any))` → `GoalEntry`
- [ ] Fix `src/components/pages/autopost-page.tsx` — `platforms: any` → `PlatformResult`
- [ ] Fix `src/components/pages/autopost-page.tsx` — `timeSlots?.map((slot: any))` → `TimeSlot`
- [ ] Buat `src/types/recharts.ts` — shared Recharts tooltip types
- [ ] Buat `src/types/profit.ts` — `ProfitResult`, `GoalEntry`, `RevenueBreakdown`

### 1.2 Replace console.log with Logger 🔴

- [ ] Buat `src/lib/logger.ts` — structured logger with levels (debug/info/warn/error)
- [ ] Replace `console.log` di API routes (160 instances)
- [ ] Replace `console.error` dengan `logger.error`
- [ ] Replace `console.warn` dengan `logger.warn`
- [ ] Setup production-only error reporting (Sentry-ready)

### 1.3 Zod Input Validation 🔴

- [ ] Install `zod` (sudah ada di deps)
- [ ] Buat `src/lib/validation.ts` — schemas:
  - [ ] `registerSchema` (name, email, password)
  - [ ] `loginSchema` (email, password)
  - [ ] `createLinkSchema` (name, url, category, commission)
  - [ ] `createCampaignSchema` (name, budget, dates)
- [ ] Apply validation di `src/app/api/auth/register/route.ts`
- [ ] Apply validation di `src/app/api/links/route.ts`
- [ ] Apply validation di `src/app/api/campaigns/route.ts`

### 1.4 Fix Hardcoded Secrets 🔴

- [ ] Fix `NEXTAUTH_SECRET` fallback di `src/lib/auth.ts`
- [ ] Fail fast kalau `NEXTAUTH_SECRET` tidak di-set
- [ ] Validate env vars at startup
- [ ] Update `.env.example` dengan required vs optional fields

---

## PHASE 2: TESTING INFRASTRUCTURE (Week 2-4)
**Goal: 8.3 → 8.8 (+0.5)** | Effort: 48h

### 2.1 Setup Testing Framework 🔴

- [ ] Install dev dependencies:
  - [ ] `vitest`
  - [ ] `@testing-library/react`
  - [ ] `@testing-library/jest-dom`
  - [ ] `@testing-library/user-event`
  - [ ] `@vitest/coverage-v8`
  - [ ] `jsdom`
- [ ] Buat `vitest.config.ts`
- [ ] Buat `src/test/setup.ts` — mock next-auth, next-navigation
- [ ] Update `package.json` scripts:
  - [ ] `"test": "vitest"`
  - [ ] `"test:coverage": "vitest --coverage"`
  - [ ] `"test:ui": "vitest --ui"`

### 2.2 Unit Tests 🔴

- [ ] `src/lib/utils.test.ts` — `cn()` utility
- [ ] `src/lib/validation.test.ts` — Zod schemas
- [ ] `src/lib/whitelabel/applier.test.ts` — hex color functions
- [ ] `src/lib/auth.test.ts` — password hashing, JWT callbacks
- [ ] `src/lib/db.test.ts` — Prisma client singleton

### 2.3 Component Tests 🔴

- [ ] `src/components/ui/button.test.tsx` — rendering, variants
- [ ] `src/components/error-boundary.test.tsx` — error catching
- [ ] `src/components/layout/sidebar.test.tsx` — navigation

### 2.4 API Route Tests 🔴

- [ ] `src/app/api/dashboard/route.test.ts`
- [ ] `src/app/api/auth/register/route.test.ts`
- [ ] `src/app/api/auth/me/route.test.ts`
- [ ] `src/app/api/seed/route.test.ts`

### 2.5 Integration Tests 🔴

- [ ] Auth flow: register → login → protected route
- [ ] CRUD flow: create link → update → delete
- [ ] Dashboard: seed data → fetch stats → validate shape

### 2.6 Coverage Target 🔴

- [ ] 50% coverage by end of Week 3
- [ ] 70% coverage by end of Week 4

---

## PHASE 3: PERFORMANCE & ARCHITECTURE (Week 4-6)
**Goal: 8.8 → 9.3 (+0.5)** | Effort: 56h

### 3.1 Server Components Migration 🔴

- [ ] Refactor `DashboardPage` → Server Component (data fetching)
- [ ] Refactor `ProductsPage` → Server Component
- [ ] Refactor `AnalyticsPage` → Server Component
- [ ] Refactor `LeaderboardPage` → Server Component
- [ ] Split pages: `page.tsx` (server) + `*-client.tsx` (interactivity)

### 3.2 Rate Limiting 🔴

- [ ] Implement `src/lib/rate-limit.ts` — token bucket algorithm
- [ ] Apply ke semua API routes:
  - [ ] Auth routes: 5 req/min (brute force protection)
  - [ ] API data routes: 100 req/min
  - [ ] Seed/demo routes: 1 req/hour (admin only)
- [ ] Return `429 Too Many Requests` with `Retry-After` header

### 3.3 Bundle Optimization 🔴

- [ ] Analyse bundle size: `next bundle-analyzer`
- [ ] Code split large pages (>1000 lines):
  - [ ] `apikeys-page.tsx` (2,145 lines)
  - [ ] `marketplace-page.tsx` (2,033 lines)
  - [ ] `content-page.tsx` (1,682 lines)
  - [ ] `live-page.tsx` (1,713 lines)
  - [ ] `whitelabel-page.tsx` (1,574 lines)
  - [ ] `login-page.tsx` (1,488 lines)

### 3.4 Image Optimization 🔴

- [ ] Replace `<img>` dengan Next.js `<Image>` component
- [ ] Setup image domains di `next.config.ts`
- [ ] Add `priority` ke LCP images

### 3.5 API Documentation (OpenAPI) 🔴

- [ ] Install `@asteasolutions/zod-to-openapi`
- [ ] Define OpenAPI spec untuk semua API routes
- [ ] Generate Swagger UI endpoint: `/api/docs`

---

## PHASE 4: HERMES AGENT v2.0 INTEGRATION (Week 6-10)
**Goal: 9.3 → 9.7 (+0.4)** | Effort: 80h

### 4.1 Memory System (Phase 1 dari Hermes) 🔴

- [ ] Buat `src/lib/hermes-v2/memory-service.ts`
  - [ ] `getAgentMemory(userId)` — fetch agent notes
  - [ ] `getUserProfile(userId)` — fetch user preferences
  - [ ] `addMemory(userId, content, tags)` — add with capacity check
  - [ ] `consolidateMemory(userId)` — AI-powered consolidation
- [ ] Update Prisma schema — `agent_memory` table
  - [ ] `type: 'agent' | 'user'`
  - [ ] `charLimit: 2200 (agent), 1375 (user)`
- [ ] Integrasi memory ke chat context

### 4.2 Skills System v2 (Phase 2 dari Hermes) 🔴

- [ ] Refactor `src/lib/hermes-v2/skills-engine.ts`
  - [ ] `loadSkill(skillId)` — progressive disclosure
  - [ ] `autoDetectSkill(query)` — auto-detect dari trigger
  - [ ] `createSkillFromExperience(...)` — learning loop
- [ ] Migrate existing skills ke agentskills.io format
- [ ] Buat affiliate-specific skills:
  - [ ] `affiliate-product-research.md`
  - [ ] `affiliate-content-generation.md`
  - [ ] `affiliate-trend-analysis.md`
  - [ ] `affiliate-competitor-spy.md`

### 4.3 Cron Automation (Phase 3 dari Hermes) 🔴

- [ ] Buat `src/lib/hermes-v2/cron-service.ts`
  - [ ] `scheduleJob(config)` — natural language parsing
  - [ ] `activateJob(jobId)` — node-cron integration
  - [ ] `executeJob(job)` — dengan subagent delegation
- [ ] UI untuk cron management di HERMES page
- [ ] Pre-built cron jobs:
  - [ ] Shopee trending check (every 2h)
  - [ ] Competitor analysis (daily 9am)
  - [ ] Content generation (3x daily)
  - [ ] Weekly earnings report (Monday 9am)

### 4.4 Subagent Delegation (Phase 4 dari Hermes) 🔴

- [ ] Buat `src/lib/hermes-v2/delegation-service.ts`
  - [ ] `delegateSingle(config)` — isolated context
  - [ ] `delegateBatch(tasks)` — up to 3 concurrent
  - [ ] `parallelProductResearch(products)` — parallel execution
- [ ] UI untuk monitoring subagents (`/agents` command)

### 4.5 Tool Gateway (Phase 5 dari Hermes) 🔴

- [ ] Buat `src/lib/hermes-v2/tool-gateway.ts`
  - [ ] `webSearch(query)` — via Firecrawl/Nous Portal
  - [ ] `generateImage(request)` — via FAL.ai
  - [ ] `textToSpeech(text)` — via OpenAI TTS
  - [ ] `browse(url, actions)` — Playwright automation
  - [ ] `scrapeShopeeProduct(url)` — anti-detection scraping
- [ ] Stealth browser layer:
  - [ ] Randomized viewport
  - [ ] Spoofed navigator
  - [ ] Malaysian geolocation (KL: 3.139, 101.6869)
  - [ ] Proxy rotation (Malaysian residential)

### 4.6 Computer-Use Agent (Gemini's Suggestion) 🔴

- [ ] **UI: Split-screen Dashboard**
  - [ ] Left panel: Chat + Accordion execution logs
  - [ ] Right panel: Virtual monitor (resizable)
  - [ ] Status bar: URL + status badge + controls
  - [ ] Screenshot: WebP compression + delta encoding
- [ ] **Agent Core**
  - [ ] Playwright browser controller (Node.js)
  - [ ] GPT-4o Vision integration
  - [ ] VLA loop: Screenshot → LLM → Action → Repeat
  - [ ] Action types: click, type, navigate, scroll, extract
- [ ] **Real-time Sync**
  - [ ] Socket.io WebSocket server
  - [ ] Binary frame untuk screenshots
  - [ ] Auto-reconnect logic
  - [ ] Session persistence

### 4.7 Messaging Gateway (Phase 6 dari Hermes) 🔴

- [ ] **Telegram Bot**
  - [ ] `/start` — welcome + menu
  - [ ] `/products [query]` — search trending products
  - [ ] `/content [product]` — generate social media content
  - [ ] `/earnings` — check earnings summary
  - [ ] Natural language chat
- [ ] **WhatsApp Business API**
  - [ ] Command mirroring (sama seperti Telegram)
  - [ ] Voice note support (TTS replies)
- [ ] **Discord Bot**
  - [ ] Slash commands
  - [ ] Voice channel support

---

## PHASE 5: POLISH & INFRASTRUCTURE (Week 10-13)
**Goal: 9.7 → 10.0 (+0.3)** | Effort: 36h

### 5.1 Accessibility Audit 🔴

- [ ] Semua `<img>` punya meaningful `alt` text
- [ ] Color contrast ratio ≥ 4.5:1 untuk semua text
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] ARIA labels untuk icon-only buttons
- [ ] Focus visible indicators
- [ ] Screen reader announcements (live regions)
- [ ] `prefers-reduced-motion` support (partially done)

### 5.2 Database Migration 🔴

- [ ] Migration guide: SQLite → PostgreSQL
- [ ] Update Prisma datasource
- [ ] Data migration script
- [ ] Connection pooling (PgBouncer)

### 5.3 Error Monitoring 🔴

- [ ] Install `@sentry/nextjs`
- [ ] Setup Sentry DSN
- [ ] Configure error boundaries
- [ ] Performance monitoring (Web Vitals)

### 5.4 CI/CD Pipeline 🔴

- [ ] GitHub Actions workflow:
  - [ ] `.github/workflows/ci.yml`
  - [ ] Run lint on PR
  - [ ] Run tests on PR
  - [ ] Run build on PR
  - [ ] Generate coverage report
- [ ] Branch protection rules
- [ ] PR template

### 5.5 Analytics 🔴

- [ ] Vercel Analytics (built-in)
- [ ] Google Analytics 4
- [ ] Custom event tracking (conversions, clicks)

### 5.6 Documentation 🔴

- [ ] API docs (OpenAPI/Swagger) — ✅ dari Phase 3
- [ ] Setup guide (README update)
- [ ] Deployment guide
- [ ] Environment variable documentation
- [ ] Contribution guidelines (CONTRIBUTING.md)

---

## WEEKLY TIMELINE

```
Week  1: Phase 1.1 + 1.2 + 1.3 (any types + logger + validation)
Week  2: Phase 1.4 + 2.1 + 2.2 (secrets + test setup + unit tests)
Week  3: Phase 2.3 + 2.4 + 2.5 (component + API + integration tests)
Week  4: Phase 2.6 + 3.1 (coverage target + Server Components)
Week  5: Phase 3.2 + 3.3 + 3.4 (rate limiting + bundle optimization)
Week  6: Phase 3.5 + 4.1 (OpenAPI docs + Memory System)
Week  7: Phase 4.2 + 4.3 (Skills System v2 + Cron Automation)
Week  8: Phase 4.4 + 4.5 (Subagent Delegation + Tool Gateway)
Week  9: Phase 4.6 part 1 (Computer-Use UI + Agent Core)
Week 10: Phase 4.6 part 2 (Real-time Sync + Stealth Browser)
Week 11: Phase 4.7 (Telegram + WhatsApp + Discord bots)
Week 12: Phase 5.1 + 5.2 + 5.3 (A11y + DB migration + Sentry)
Week 13: Phase 5.4 + 5.5 + 5.6 (CI/CD + Analytics + Docs)
```

---

## MASTER CHECKLIST (All Phases)

### Quick Status Overview

| Phase | Total Tasks | Completed | Progress |
|-------|-------------|-----------|----------|
| Phase 0: P0 Fixes | 7 | 7 | ✅ 100% |
| Phase 1: Code Quality | 23 | 0 | 🔴 0% |
| Phase 2: Testing | 23 | 0 | 🔴 0% |
| Phase 3: Performance | 21 | 0 | 🔴 0% |
| Phase 4: HERMES v2.0 | 46 | 0 | 🔴 0% |
| Phase 5: Polish | 22 | 0 | 🔴 0% |
| **TOTAL** | **142** | **7** | **5%** |

---

## TECH STACK SUMMARY

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| Framework | Next.js | 16.1.1 | ✅ |
| Language | TypeScript | 5.x | ✅ |
| UI | React | 19.0.0 | ✅ |
| Styling | Tailwind CSS | 4.x | ✅ |
| Components | shadcn/ui | latest | ✅ |
| Database | Prisma + SQLite | 6.11.1 | 🟡 → PostgreSQL |
| Auth | NextAuth.js | 4.24.11 | ✅ |
| State | Zustand | 5.0.6 | ✅ |
| Query | TanStack Query | 5.82.0 | ✅ |
| Animation | Framer Motion | 12.23.2 | ✅ |
| Charts | Recharts | 2.15.4 | ✅ |
| **NEW: Testing** | **Vitest** | **latest** | **🔴** |
| **NEW: Validation** | **Zod** | **latest** | **🔴** |
| **NEW: Browser** | **Playwright** | **latest** | **🔴** |
| **NEW: AI** | **OpenAI SDK** | **latest** | **🔴** |
| **NEW: Real-time** | **Socket.io** | **latest** | **🔴** |
| **NEW: Monitoring** | **Sentry** | **latest** | **🔴** |

---

## BUDGET ESTIMATE

### Development Hours

| Phase | Hours | Cost (RM50/h) | Cost (RM100/h) |
|-------|-------|---------------|----------------|
| Phase 1: Code Quality | 40h | RM2,000 | RM4,000 |
| Phase 2: Testing | 48h | RM2,400 | RM4,800 |
| Phase 3: Performance | 56h | RM2,800 | RM5,600 |
| Phase 4: HERMES v2.0 | 80h | RM4,000 | RM8,000 |
| Phase 5: Polish | 36h | RM1,800 | RM3,600 |
| **TOTAL** | **260h** | **RM13,000** | **RM26,000** |

### Infrastructure Costs (Monthly)

| Service | Cost (USD) | Cost (MYR) |
|---------|-----------|-----------|
| Vercel Pro (hosting) | $20 | ~RM90 |
| PostgreSQL (Supabase/Railway) | $25 | ~RM115 |
| OpenAI API (GPT-4o) | ~$50 | ~RM230 |
| Playwright Browser (cloud) | $30 | ~RM140 |
| Sentry (error monitoring) | $26 | ~RM120 |
| **TOTAL** | **~$151** | **~RM695/mo** |

---

## RISK REGISTER

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Shopee changes anti-bot detection | High | High | Keep stealth layer updated, fallback ke manual input |
| OpenAI API rate limiting | Medium | Medium | Implement caching, queue system, fallback providers |
| Scope creep (140+ tasks) | High | Medium | Strict 13-week timeline, prioritasi P0/P1 |
| Testing takes longer than expected | Medium | Medium | Start dengan unit tests, integrate gradually |
| Team availability (1 dev) | High | High | Consider outsourcing Phase 4 (HERMES integration) |

---

## DECISION LOG

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| 1 | Gunakan TypeScript Strict Mode | `noImplicitAny: true`, `strictNullChecks: true` | ✅ Applied |
| 2 | Hapus `tailwind.config.ts` | Tailwind v4 uses CSS-first config | ✅ Applied |
| 3 | Aktifkan React StrictMode | Detect deprecated patterns & side effects | ✅ Applied |
| 4 | Logo: Lightning + Magnifier + Arrow | Viral + Search + Growth symbolism | ✅ Applied |
| 5 | Font: Space Grotesk untuk logo | Modern, geometric, tech-forward | ✅ Applied |
| 6 | Playwright (Node.js) vs browser-use (Python) | Aligned dengan existing TS stack | 📌 Pending |
| 7 | Next.js API Routes vs FastAPI | Simplify — satu codebase | 📌 Pending |
| 8 | Socket.io vs native WebSocket | Auto-reconnect, room management | 📌 Pending |
| 9 | SQLite → PostgreSQL | Production scale, connection pooling | 📌 Pending |
| 10 | Sentry untuk error monitoring | Industry standard, generous free tier | 📌 Pending |

---

## KEY METRICS TO TRACK

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| Code Coverage | 0% | 70%+ | `vitest --coverage` |
| TypeScript Errors | ~207 `any` | 0 `any` | `tsc --noEmit` |
| ESLint Warnings | 0 | <20 | `next lint` |
| Lighthouse Score | ? | >90 (all categories) | Chrome DevTools |
| Bundle Size | ? | <500KB initial | `next bundle-analyzer` |
| API Response Time | ? | <200ms p95 | Vercel Analytics |
| Test Pass Rate | 0% | >95% | `vitest` output |

---

*This master plan is a living document. Update checklist status as tasks are completed. Review weekly on Monday mornings.*
