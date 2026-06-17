# TheViralFindsMY — Unified Implementation Plan
## Compiled from: Code Review + Hermes Agent Integration + Master Plan

> **Generated:** 17 June 2026  
> **Current Score:** 7.5/10 (after Phase 0 + partial Phase 1-3)  
> **Target Score:** 10.0/10  
> **Total Remaining Effort:** ~200 hours (10 weeks)  
> **Team:** 1-2 developers  
> **Philosophy:** Add-on & upgrade only — NEVER remove existing features

---

## 📊 SCORE TRACKER (Updated)

| Kriteria | Original | Current | Target | Status |
|----------|----------|---------|--------|--------|
| Arsitektur | 7/10 | 7/10 | 10/10 | 🟡 In Progress |
| Type Safety | 3/10 | 7/10 | 10/10 | 🟡 In Progress |
| Code Quality | 4/10 | 7/10 | 10/10 | 🟡 In Progress |
| UI/UX | 9/10 | 9/10 | 10/10 | 🟢 Near Complete |
| Performance | 7/10 | 7/10 | 10/10 | 🔴 Not Started |
| Security | 5/10 | 8/10 | 10/10 | 🟡 In Progress |
| **Testing** | **0/10** | **4/10** | **10/10** | **🟡 In Progress** |
| Documentation | 6/10 | 8/10 | 10/10 | 🟡 In Progress |
| Database Design | 8/10 | 8/10 | 10/10 | 🟢 Near Complete |
| Feature Completeness | 10/10 | 10/10 | 10/10 | ✅ Complete |
| **OVERALL** | **6.0** | **7.5** | **10.0** | **🟡 50%** |

**Legend:** ✅ Complete | 🟢 Near Complete | 🟡 In Progress | 🔴 Not Started

---

## ⚠️ CRITICAL NOTE: Local vs Deployed Codebase

> **PENTING:** Code Review merujuk kepada **deployed version** (98,393 baris, 60+ API routes, 25+ Prisma models, page components 2000+ baris). Local project kita adalah **rebuild dari scratch** yang lebih kecil (8 API routes, 36 pages, default Prisma schema). Beberapa task dalam Code Review (refactor page 2000+ baris, service layer untuk 60+ routes) **tidak applicable** ke local codebase. Tugas yang applicable sahaja dimasukkan dalam plan ini.

---

## ✅ PHASE 0: P0 CRITICAL FIXES — COMPLETED

| # | Task | File(s) | Status | Notes |
|---|------|---------|--------|-------|
| 0.1 | Fix ESLint — aktifkan rules kritis | `eslint.config.mjs` | ✅ DONE | Rules as warnings |
| 0.2 | Fix TypeScript — `noImplicitAny: true` | `tsconfig.json` | ✅ DONE | + strictNullChecks |
| 0.3 | Hapus `ignoreBuildErrors` dari Next.js | `next.config.ts` | ✅ DONE | |
| 0.4 | Aktifkan React StrictMode | `next.config.ts` | ✅ DONE | |
| 0.5 | Buat `.env.example` template | `.env.example` | ✅ DONE | All vars documented |
| 0.6 | Fix Tailwind v4 config mismatch | `tailwind.config.ts` | ✅ DONE | Already using CSS-first |
| 0.7 | Env validation utility | `src/lib/env.ts` | ✅ DONE | Lazy-loaded Proxy |

**Impact: +1.5 skor (6.0 → 7.5)**

---

## 📝 PHASE 1: CODE QUALITY & TYPE SAFETY (Week 1-2)
**Goal: 7.5 → 8.3 (+0.8)** | Effort: 30h remaining

### 1.1 Fix All `any` Types 🟡 PARTIAL

- [x] Fix `any` types di semua 8 API routes (hermes/chat, content/script, ai/thumbnails, ai/voiceover, search, dashboard, products, trends)
- [ ] Fix `any` types di page components (107 remaining warnings — mostly `(item: any)` di map callbacks)
- [ ] Fix `any` types di hooks (`use-live-notifications.tsx` — `event: LiveEvent` done, check others)
- [ ] Buat shared Recharts tooltip types (`src/types/recharts.ts`)
- [ ] Buat `src/types/api.ts` — standardized API response types

**Suggestion:** Jangan jadikan `any` sebagai error — biarkan warning. Page components yang guna demo data dengan shape dinamik kadang-kadang memerlukan `any` untuk flexibility. Prioritaskan API routes dan hooks sahaja.

### 1.2 Replace console.log with Logger ✅ DONE

- [x] Buat `src/lib/logger.ts` — structured logger with levels (debug/info/warn/error) + `handleApiError()`
- [x] Replace `console.log`/`console.error` di semua 8 API routes
- [x] Replace `console.error` dengan `logger.error`
- [ ] Replace `console.log` di page components (jika ada)
- [ ] Setup production-only error reporting (Sentry-ready) — deferred to Phase 5.3

### 1.3 Zod Input Validation ✅ DONE

- [x] Buat `src/lib/validation.ts` — 9 schemas (login, register, createLink, createCampaign, hermesChat, contentScript, aiThumbnails, aiVoiceover, search) + `validateInput()`
- [x] Apply validation di `hermes/chat/route.ts`
- [x] Apply validation di `content/script/route.ts`
- [x] Apply validation di `ai/thumbnails/route.ts`
- [x] Apply validation di `ai/voiceover/route.ts`
- [x] Apply validation di `search/route.ts`
- [ ] Apply validation di future auth routes (bila ditambah)

### 1.4 Fix Hardcoded Secrets ✅ DONE

- [x] Buat `src/lib/env.ts` — validates required env vars at startup
- [x] `.env.example` dengan required vs optional fields
- [x] Fail-fast kalau `DATABASE_URL` atau `NEXTAUTH_SECRET` tidak di-set
- [ ] Validate env vars at startup (call `checkEnv()` in middleware) — low priority

---

## 🧪 PHASE 2: TESTING INFRASTRUCTURE (Week 2-4)
**Goal: 8.3 → 8.8 (+0.5)** | Effort: 30h remaining

### 2.1 Setup Testing Framework ✅ DONE

- [x] Install: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@vitest/coverage-v8`, `jsdom`, `@vitejs/plugin-react`
- [x] Buat `vitest.config.ts` — jsdom env, globals, coverage
- [x] Buat `src/test/setup.ts` — mock next-navigation, next-themes
- [x] Update `package.json` scripts: `test`, `test:watch`, `test:coverage`, `test:ui`

### 2.2 Unit Tests ✅ PARTIAL (121 tests passing)

- [x] `src/lib/utils.test.ts` — `cn()` utility (17 tests)
- [x] `src/lib/logger.test.ts` — logger levels + handleApiError (12 tests)
- [x] `src/lib/validation.test.ts` — all 9 Zod schemas (56 tests)
- [x] `src/lib/demo-data.test.ts` — formatRM, formatNumber, navItems (36 tests)
- [ ] `src/lib/env.test.ts` — env validation
- [ ] `src/lib/rate-limit.test.ts` — rate limiter logic
- [ ] `src/lib/sounds.test.ts` — Web Audio API (mock)
- [ ] `src/lib/confetti.test.ts` — confetti functions (mock canvas)

### 2.3 Component Tests 🔴 NOT STARTED

- [ ] `src/components/ui/button.test.tsx` — rendering, variants
- [ ] `src/components/ui/animated-number.test.tsx` — count-up animation
- [ ] `src/components/modals/command-palette.test.tsx` — search, navigation
- [ ] `src/components/modals/changelog-modal.test.tsx` — auto-show, dismiss
- [ ] `src/components/modals/shortcuts-modal.test.tsx` — cheat sheet rendering
- [ ] `src/components/layout/sidebar.test.tsx` — navigation, pin/unpin
- [ ] `src/components/layout/header.test.tsx` — search, theme toggle, notifications

### 2.4 API Route Tests 🔴 NOT STARTED

- [ ] `src/app/api/dashboard/route.test.ts`
- [ ] `src/app/api/products/route.test.ts`
- [ ] `src/app/api/trends/route.test.ts`
- [ ] `src/app/api/search/route.test.ts`
- [ ] `src/app/api/hermes/chat/route.test.ts` — mock z-ai-web-dev-sdk
- [ ] `src/app/api/content/script/route.test.ts`
- [ ] `src/app/api/ai/thumbnails/route.test.ts`
- [ ] `src/app/api/ai/voiceover/route.test.ts`

### 2.5 Integration Tests 🔴 NOT STARTED

- [ ] Dashboard: fetch stats → validate shape → render charts
- [ ] Products: filter by category → search → detail dialog
- [ ] Command palette: search → navigate → recent pages
- [ ] Live notifications: WebSocket connect → event → toast → confetti
- [ ] Theme: toggle dark/light → persist → all components adapt

### 2.6 Coverage Target 🟡

- [x] Current: ~20% (4 lib files at 100%)
- [ ] 50% coverage by end of Week 3
- [ ] 70% coverage by end of Week 4

---

## ⚡ PHASE 3: PERFORMANCE & ARCHITECTURE (Week 4-6)
**Goal: 8.8 → 9.3 (+0.5)** | Effort: 40h

### 3.1 Server Components Migration 🟡 CAUTION

> **⚠️ SUGGESTION:** App kita guna Zustand-driven SPA routing (bukan Next.js file routing). Full Server Component migration akan break SPA experience (instant page transitions, command palette, keyboard navigation). Suggest **HYBRID approach** sahaja:
> - Keep page components as Client Components (Zustand routing)
> - Move data-fetching logic to API routes (already done)
> - Add Server Components untuk static content (landing page, documentation)

- [ ] Refactor `LandingPage` → Server Component (static marketing content)
- [ ] Add `generateMetadata` untuk SEO di layout.tsx
- [ ] Add `generateStaticParams` untuk potential SSG routes
- [ ] ~~Refactor DashboardPage → Server Component~~ ❌ NOT SUITABLE (needs Zustand state)

### 3.2 Rate Limiting ✅ DONE

- [x] Implement `src/lib/rate-limit.ts` — token bucket algorithm
- [x] Apply ke semua 8 API routes:
  - [x] Auth routes: 5 req/min (preset ready, no auth routes yet)
  - [x] API data routes: 100 req/min (dashboard, products, trends)
  - [x] AI routes: 10 req/min (hermes/chat, content/script, ai/thumbnails, ai/voiceover)
  - [x] Search routes: 30 req/min
- [x] Return `429 Too Many Requests` with `Retry-After` header

### 3.3 Bundle Optimization 🔴 NOT STARTED

- [ ] Analyse bundle size: `next bundle-analyzer`
- [ ] Code split large dependencies:
  - [ ] Lazy load `recharts` (only when chart pages active)
  - [ ] Lazy load `canvas-confetti` (already dynamic import ✅)
  - [ ] Lazy load `framer-motion` (currently loaded globally)
  - [ ] Lazy load `socket.io-client` (already dynamic ✅)
- [ ] Tree-shake unused lucide-react icons (use specific imports)
- [ ] Target: <500KB initial bundle

### 3.4 Image Optimization 🔴 NOT STARTED

- [ ] Replace `<img>` dengan Next.js `<Image>` component
- [ ] Setup image domains di `next.config.ts` (shopee.com.my, etc.)
- [ ] Add `priority` ke LCP images (product thumbnails, hero)
- [ ] Add `placeholder="blur"` untuk above-the-fold images
- [ ] Convert product placeholder to use `<Image>` with gradient fallback

### 3.5 API Documentation (OpenAPI) 🔴 NOT STARTED

- [ ] Install `@asteasolutions/zod-to-openapi`
- [ ] Define OpenAPI spec dari Zod schemas (already have 9 schemas)
- [ ] Generate Swagger UI endpoint: `/api/docs`
- [ ] Add API documentation link di Settings → About tab

---

## 🤖 PHASE 4: HERMES AGENT v2.0 INTEGRATION (Week 6-10)
**Goal: 9.3 → 9.7 (+0.4)** | Effort: 80h

> **🔑 KEY DECISION:** Hermes Agent plan merujuk kepada external services (FAL.ai, OpenAI TTS, Browserbase, Telegraf). **SUGGESTION:** Guna `z-ai-web-dev-sdk` yang suda terintegrasi untuk AI capabilities (LLM, image gen, TTS, web search). Hanya tambah external services bila z-ai-web-dev-sdk tak support feature tersebut.

### 4.1 Memory System (Phase 1 dari Hermes) 🔴 NOT STARTED

- [ ] Update Prisma schema — `AgentMemory` model:
  ```prisma
  model AgentMemory {
    id        String   @id @default(cuid())
    userId    String
    type      String   // 'agent' | 'user'
    content   String
    tags      String[]
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    @@index([userId, type])
  }
  ```
- [ ] Buat `src/lib/hermes-v2/memory-service.ts`:
  - [ ] `getAgentMemory(userId)` — fetch agent notes (MEMORY.md equivalent)
  - [ ] `getUserProfile(userId)` — fetch user preferences (USER.md equivalent)
  - [ ] `addMemory(userId, content, tags)` — add with capacity check (2200 chars agent, 1375 user)
  - [ ] `consolidateMemory(userId)` — AI-powered consolidation via z-ai-web-dev-sdk
- [ ] Integrasi memory ke HERMES chat context (prepend to system prompt)
- [ ] UI: "Memory" tab di Hermes Hub showing agent notes + user profile
- [ ] Auto-capture: save successful interactions as memory entries

### 4.2 Skills System v2 (Phase 2 dari Hermes) 🔴 NOT STARTED

- [ ] Update Prisma schema — `HermesSkill` model:
  ```prisma
  model HermesSkill {
    id          String   @id @default(cuid())
    name        String
    description String
    category    String
    content     String   // Markdown
    trigger     String?  // Regex pattern
    status      String   @default("active")
    usageCount  Int      @default(0)
    successRate Float    @default(0)
    version     Int      @default(1)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }
  ```
- [ ] Buat `src/lib/hermes-v2/skills-engine.ts`:
  - [ ] `loadSkill(skillId)` — progressive disclosure (load on-demand)
  - [ ] `autoDetectSkill(query)` — auto-detect dari trigger regex
  - [ ] `createSkillFromExperience(...)` — learning loop (create dari successful interactions)
  - [ ] `updateSkillSuccessRate(skillId, success)` — track performance
- [ ] Migrate hardcoded affiliate knowledge ke skills format
- [ ] Buat affiliate-specific skills (markdown files):
  - [ ] `skills/affiliate-product-research.md`
  - [ ] `skills/affiliate-content-generation.md`
  - [ ] `skills/affiliate-trend-analysis.md`
  - [ ] `skills/affiliate-competitor-spy.md`
  - [ ] `skills/affiliate-manglish-style.md`
- [ ] UI: "Skills" tab di Hermes Hub showing skill catalog + create/edit

### 4.3 Cron Automation (Phase 3 dari Hermes) 🔴 NOT STARTED

> **⚠️ SUGGESTION:** Node-cron dalam Next.js serverless ada limitation (cron restarts on cold start). Suggest guna **Vercel Cron Jobs** atau **external cron service** yang trigger API endpoint. Untuk dev/local, guna `node-cron` di mini-service.

- [ ] Buat `src/lib/hermes-v2/cron-service.ts`:
  - [ ] `scheduleJob(config)` — parse natural language schedule
  - [ ] `activateJob(jobId)` — node-cron integration (local) / Vercel Cron (prod)
  - [ ] `executeJob(job)` — dengan skill loading + subagent delegation
  - [ ] `parseSchedule(nl)` — "every 2h" → cron expression
- [ ] Update Prisma schema — `HermesCronJob` model
- [ ] UI untuk cron management di Hermes Hub → "Automations" tab
- [ ] Pre-built cron jobs:
  - [ ] Shopee trending check (every 2h) → deliver to notifications
  - [ ] Daily earnings summary (9am MYT) → deliver to dashboard
  - [ ] Content generation reminder (3x daily) → deliver to toast
  - [ ] Weekly performance report (Monday 9am) → deliver to earnings page

### 4.4 Subagent Delegation (Phase 4 dari Hermes) 🔴 NOT STARTED

- [ ] Buat `src/lib/hermes-v2/delegation-service.ts`:
  - [ ] `delegateSingle(config)` — isolated context, run one task
  - [ ] `delegateBatch(tasks)` — up to 3 concurrent (Promise.allSettled)
  - [ ] `parallelProductResearch(products)` — parallel execution
- [ ] Update Prisma schema — `HermesSubagent` model (track status, result)
- [ ] UI: "Agents" tab di Hermes Hub showing active/completed subagents
- [ ] `/agents` command di chat untuk monitoring

### 4.5 Tool Gateway (Phase 5 dari Hermes) 🟡 ADAPTED

> **🔑 ADAPTATION:** Original plan suggests FAL.ai, OpenAI TTS, Browserbase. Kita **sudah ada** `z-ai-web-dev-sdk` yang support LLM, image gen, TTS, dan web search. Guna yang sedia ada sahaja.

- [ ] Buat `src/lib/hermes-v2/tool-gateway.ts`:
  - [x] `webSearch(query)` — via z-ai-web-dev-sdk (web-search skill) ✅ AVAILABLE
  - [x] `generateImage(request)` — via z-ai-web-dev-sdk (image-generation skill) ✅ AVAILABLE
  - [x] `textToSpeech(text)` — via z-ai-web-dev-sdk (TTS skill) ✅ AVAILABLE
  - [ ] `readWebPage(url)` — via z-ai-web-dev-sdk (web-reader skill)
  - [ ] `videoUnderstanding(videoUrl)` — via z-ai-web-dev-sdk (video-understand skill)
- [ ] ~~Browser automation (Playwright/Browserbase)~~ ❌ DEFERRED — Shopee anti-bot too aggressive
- [ ] ~~Stealth browser layer~~ ❌ NOT SUITABLE — Legal/ToS concerns with scraping

**Suggestion:** Untuk Shopee product data, guna **official Shopee Affiliate API** (already have `src/lib/shopee/affiliate-api.ts` mock) dengan fallback ke demo data. Jangan scrape — risiko ban tinggi.

### 4.6 Computer-Use Agent 🔴 NOT STARTED (ADVANCED)

> **⚠️ SUGGESTION:** Ini adalah feature paling complex (VLA loop: Screenshot → LLM → Action → Repeat). Suggest defer ke Phase 6+ selepas core Hermes v2 stable. Untuk sekarang, focus pada text-based agent sahaja.

- [ ] ~~Split-screen Dashboard~~ → DEFERRED
- [ ] ~~Playwright browser controller~~ → DEFERRED
- [ ] ~~GPT-4o Vision integration~~ → Use z-ai-web-dev-sdk VLM instead
- [ ] ~~Real-time WebSocket sync~~ → Already have notification-service

### 4.7 Messaging Gateway (Phase 6 dari Hermes) 🟡 PHASED

> **⚠️ SUGGESTION:** Original plan suggests Telegram + WhatsApp + Discord + Slack + Email. Untuk Malaysian market, **Telegram adalah priority #1** (paling popular di kalangan affiliate marketers MY). Defer yang lain.

- [ ] **Telegram Bot** (Phase 6a — Week 10):
  - [ ] Install `node-telegram-bot-api` atau `telegraf`
  - [ ] `/start` — welcome + menu
  - [ ] `/products [query]` — search trending products
  - [ ] `/content [product]` — generate social media content
  - [ ] `/earnings` — check earnings summary
  - [ ] `/trends` — trending categories
  - [ ] Natural language chat (delegate to HERMES)
  - [ ] Cron delivery (scheduled reports to Telegram)
- [ ] ~~WhatsApp Business API~~ → DEFERRED (requires Meta approval, complex)
- [ ] ~~Discord Bot~~ → DEFERRED (not primary market for MY affiliates)
- [ ] ~~Slack Bot~~ → DEFERRED (enterprise, not relevant)
- [ ] ~~Email~~ → DEFERRED (use existing notification system instead)

---

## 🎨 PHASE 5: POLISH & INFRASTRUCTURE (Week 10-13)
**Goal: 9.7 → 10.0 (+0.3)** | Effort: 30h

### 5.1 Accessibility Audit 🔴 NOT STARTED

- [ ] Semua `<img>` punya meaningful `alt` text
- [ ] Color contrast ratio ≥ 4.5:1 untuk semua text (use axe DevTools)
- [ ] Keyboard navigation (Tab, Enter, Escape) — partially done (command palette, shortcuts)
- [ ] ARIA labels untuk icon-only buttons — partially done
- [ ] Focus visible indicators (add `focus-visible:ring-2` to all buttons)
- [ ] Screen reader announcements (live regions for notifications)
- [x] `prefers-reduced-motion` support (partially done via Framer Motion config)
- [ ] Add skip-to-content link
- [ ] Add ARIA live regions untuk live notifications

### 5.2 Database Migration 🟡 DEFERRED

> **⚠️ SUGGESTION:** SQLite cukup untuk current single-user demo. PostgreSQL migration hanya perlu bila:
> - Multi-user concurrent (team collaboration feature aktif)
> - Data volume > 100K records
> - Multi-instance deployment (Vercel scaling)
> Suggest defer ke Phase 6+ atau bila user base grow.

- [ ] ~~Migration guide: SQLite → PostgreSQL~~ → DEFERRED
- [ ] ~~Update Prisma datasource~~ → DEFERRED
- [ ] ~~Data migration script~~ → DEFERRED
- [ ] ~~Connection pooling (PgBouncer)~~ → DEFERRED
- [ ] Add Prisma schema untuk Hermes models (AgentMemory, HermesSkill, HermesCronJob, HermesSubagent) — Phase 4

### 5.3 Error Monitoring 🟡 DEFERRED

> **⚠️ SUGGESTION:** Sentry free tier terhad (5K errors/month). Untuk sekarang, `logger.error` + error boundaries cukup. Add Sentry bila production traffic meningkat.

- [ ] ~~Install `@sentry/nextjs`~~ → DEFERRED
- [ ] ~~Setup Sentry DSN~~ → DEFERRED
- [x] Configure error boundaries (already have Global + per-page)
- [ ] Add custom error page (`src/app/error.tsx`) dengan error ID
- [ ] Performance monitoring (Web Vitals) — use Vercel Analytics instead

### 5.4 CI/CD Pipeline 🔴 NOT STARTED

- [ ] GitHub Actions workflow:
  - [ ] `.github/workflows/ci.yml`
  - [ ] Run lint on PR
  - [ ] Run tests on PR (`bun run test`)
  - [ ] Run TypeScript check (`bunx tsc --noEmit`)
  - [ ] Run build on PR
  - [ ] Generate coverage report
- [ ] Branch protection rules (require PR review + CI pass)
- [ ] PR template (`.github/pull_request_template.md`)
- [ ] Pre-commit hooks (husky + lint-staged)

### 5.5 Analytics 🔴 NOT STARTED

- [ ] Vercel Analytics (built-in — just enable)
- [ ] ~~Google Analytics 4~~ → OPTIONAL (privacy concerns, use Vercel instead)
- [ ] Custom event tracking:
  - [ ] Page navigation (Zustand store → analytics)
  - [ ] Command palette usage
  - [ ] Feature discovery (changelog views)
  - [ ] AI feature usage (hermes chat, content gen, thumbnails, voiceover)

### 5.6 Documentation ✅ PARTIAL

- [x] README.md — features, quick start, architecture, config, testing
- [x] CONTRIBUTING.md — code standards, TypeScript rules, logging, testing, git workflow
- [x] `.env.example` — all env vars documented
- [ ] API docs (OpenAPI/Swagger) — Phase 3.5
- [ ] Deployment guide (Vercel + Docker)
- [ ] Environment variable documentation (detailed)
- [ ] Architecture decision records (ADR)
- [ ] Changelog (VERSIONED.md)

---

## 💡 MY SUGGESTIONS & CAVEATS

### 1. Server Component Migration — HYBRID Approach
**Original:** Full Server Component migration untuk semua pages
**Suggestion:** App kita guna Zustand SPA routing. Full migration akan break:
- Instant page transitions (Framer Motion)
- Command palette (needs client state)
- Keyboard navigation (needs client event listeners)
- Live notifications (needs client WebSocket)

**Recommendation:** Keep pages as Client Components. Hanya jadikan LandingPage dan static content sebagai Server Components.

### 2. External AI Services — Use z-ai-web-dev-sdk
**Original:** FAL.ai (images), OpenAI TTS, Browserbase
**Suggestion:** Kita sudah ada `z-ai-web-dev-sdk` yang support:
- LLM chat (HERMES)
- Image generation (AI Thumbnails) ✅
- TTS (AI Voiceover) ✅
- Web search
- Web page reading
- Video understanding

**Recommendation:** Guna z-ai-web-dev-sdk untuk semua AI capabilities. Hanya tambah external service bila z-ai-web-dev-sdk tak support.

### 3. PostgreSQL Migration — DEFER
**Original:** Migrate SQLite → PostgreSQL
**Suggestion:** SQLite cukup untuk:
- Single-user demo
- Development environment
- Small team (< 10 users)

**Recommendation:** Defer ke Phase 6+ atau bila:
- Multi-user concurrent aktif
- Data volume > 100K records
- Multi-instance deployment diperlukan

### 4. Browser Automation/Scraping — AVOID
**Original:** Stealth browser layer dengan Playwright, proxy rotation, spoofed navigator
**Suggestion:** Shopee anti-bot detection sangat aggressive. Scraping boleh sebabkan:
- IP ban
- Account suspension
- Legal/ToS violation

**Recommendation:** Guna **official Shopee Affiliate API** sahaja (already ada `src/lib/shopee/affiliate-api.ts`). Fallback ke demo data bila API unavailable. Jangan scrape.

### 5. Messaging Gateway — Telegram First
**Original:** Telegram + WhatsApp + Discord + Slack + Email
**Suggestion:** Untuk Malaysian affiliate market:
- **Telegram** = priority #1 (paling popular di MY)
- WhatsApp = perlu Meta Business approval (complex)
- Discord = bukan primary market untuk MY affiliates
- Slack = enterprise, tak relevant
- Email = guna existing notification system

**Recommendation:** Implement Telegram bot sahaja dulu (Phase 6a). Defer yang lain.

### 6. Computer-Use Agent — DEFER
**Original:** Split-screen VLA loop dengan Playwright + GPT-4o Vision
**Suggestion:** Ini feature paling complex (80h+ effort). Untuk sekarang, text-based agent (HERMES chat) dah cukup powerful.

**Recommendation:** Defer ke Phase 6+ atau bila core Hermes v2 (Memory + Skills + Cron + Delegation) dah stable.

### 7. Sentry — DEFER
**Original:** Install Sentry untuk error monitoring
**Suggestion:** Sentry free tier terhad (5K errors/month). Kita sudah ada:
- Structured logger (`src/lib/logger.ts`)
- Error boundaries (Global + per-page)
- `handleApiError()` helper

**Recommendation:** Defer Sentry ke bila production traffic meningkat. Untuk sekarang, logger + error boundaries cukup.

### 8. Page Component Refactoring — PRIORITIZE
**Original:** Refactor page components > 1000 baris
**Suggestion:** Local codebase kita tak ada page > 500 baris (most are 200-400). Tapi kalau future pages grow besar, refactor ke sub-components.

**Recommendation:** Tambah rule di CONTRIBUTING.md: "Page components should be < 500 lines. Extract sub-components untuk complex sections."

---

## 📅 WEEKLY TIMELINE (Revised)

```
Week  1: Phase 1.1 (fix remaining any types) + 2.2 (remaining unit tests)
Week  2: Phase 2.3 (component tests) + 2.4 (API route tests)
Week  3: Phase 2.5 (integration tests) + 2.6 (coverage 50%)
Week  4: Phase 3.1 (hybrid server components) + 3.3 (bundle optimization)
Week  5: Phase 3.4 (image optimization) + 3.5 (OpenAPI docs)
Week  6: Phase 4.1 (Memory System) + Prisma schema update
Week  7: Phase 4.2 (Skills System v2) + affiliate skills
Week  8: Phase 4.3 (Cron Automation) + pre-built jobs
Week  9: Phase 4.4 (Subagent Delegation) + 4.5 (Tool Gateway)
Week 10: Phase 4.7a (Telegram Bot) + 5.1 (Accessibility)
Week 11: Phase 5.4 (CI/CD) + 5.5 (Analytics)
Week 12: Phase 5.6 (Documentation) + polish
Week 13: Buffer + final QA + deployment prep
```

---

## 📊 MASTER CHECKLIST STATUS

| Phase | Total Tasks | Completed | In Progress | Remaining | Progress |
|-------|-------------|-----------|-------------|-----------|----------|
| Phase 0: P0 Fixes | 7 | 7 | 0 | 0 | ✅ 100% |
| Phase 1: Code Quality | 15 | 11 | 2 | 2 | 🟡 73% |
| Phase 2: Testing | 23 | 8 | 0 | 15 | 🟡 35% |
| Phase 3: Performance | 15 | 4 | 1 | 10 | 🟡 27% |
| Phase 4: HERMES v2.0 | 30 | 0 | 0 | 30 | 🔴 0% |
| Phase 5: Polish | 18 | 4 | 2 | 12 | 🟡 22% |
| **TOTAL** | **108** | **34** | **5** | **69** | **🟡 35%** |

> **Note:** Total tasks dikurangkan dari 142 (master plan) ke 108 selepas remove duplicates dan mark yang tak applicable ke local codebase.

---

## 🛠️ TECH STACK SUMMARY

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| Framework | Next.js | 16.1.1 | ✅ |
| Language | TypeScript | 5.x | ✅ (strict mode ON) |
| UI | React | 19.0.0 | ✅ |
| Styling | Tailwind CSS | 4.x | ✅ (CSS-first config) |
| Components | shadcn/ui | latest | ✅ |
| Database | Prisma + SQLite | 6.11.1 | 🟡 → PostgreSQL (deferred) |
| Auth | NextAuth.js | 4.24.11 | ✅ |
| State | Zustand | 5.0.6 | ✅ |
| Query | TanStack Query | 5.82.0 | ✅ |
| Animation | Framer Motion | 12.23.2 | ✅ |
| Charts | Recharts | 2.15.4 | ✅ |
| **Testing** | **Vitest** | **4.1.9** | **✅ NEW** |
| **Validation** | **Zod** | **4.x** | **✅ NEW** |
| **Logging** | **Custom Logger** | **1.0** | **✅ NEW** |
| **Rate Limiting** | **Custom Token Bucket** | **1.0** | **✅ NEW** |
| AI | z-ai-web-dev-sdk | 0.0.18 | ✅ (4 AI routes) |
| Real-time | Socket.io | 4.8.3 | ✅ (notification-service) |
| Confetti | canvas-confetti | 1.9.4 | ✅ NEW |
| ~~Monitoring~~ | ~~Sentry~~ | — | ❌ DEFERRED |
| ~~Browser~~ | ~~Playwright~~ | — | ❌ DEFERRED |

---

## 🎯 KEY METRICS TO TRACK

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| Code Coverage | ~20% | 70%+ | `bun run test:coverage` |
| TypeScript Errors | 0 in src/ | 0 | `bunx tsc --noEmit` |
| ESLint Warnings | 107 | <20 | `bun run lint` |
| `any` Types | ~107 | <20 | grep `: any` in src/ |
| Lighthouse Score | ? | >90 | Chrome DevTools |
| Bundle Size | ? | <500KB initial | `next bundle-analyzer` |
| API Response Time | <10ms | <200ms p95 | Vercel Analytics |
| Test Pass Rate | 100% (121/121) | >95% | `bun run test` |
| Unit Tests | 121 | 300+ | `bun run test` |

---

## 🔄 IMPLEMENTATION PRIORITY MATRIX

### 🔴 P0 — Critical (Do First)
1. ~~Fix ESLint config~~ ✅
2. ~~Fix TypeScript config~~ ✅
3. ~~Create logger~~ ✅
4. ~~Create Zod validation~~ ✅
5. ~~Create env validation~~ ✅
6. ~~Setup Vitest~~ ✅
7. ~~Create rate limiting~~ ✅

### 🟡 P1 — High Priority (Next 2 Weeks)
8. Fix remaining `any` types in page components
9. Write component tests (button, command palette, sidebar, header)
10. Write API route tests (8 routes)
11. Bundle optimization (lazy load recharts, framer-motion)
12. Image optimization (Next.js Image component)

### 🟢 P2 — Medium Priority (Week 3-6)
13. Integration tests (dashboard, products, command palette, live notifications)
14. OpenAPI documentation
15. HERMES Memory System (Phase 4.1)
16. HERMES Skills System v2 (Phase 4.2)
17. Accessibility audit

### 🔵 P3 — Lower Priority (Week 7+)
18. HERMES Cron Automation (Phase 4.3)
19. HERMES Subagent Delegation (Phase 4.4)
20. HERMES Tool Gateway (Phase 4.5)
21. Telegram Bot (Phase 4.7a)
22. CI/CD Pipeline
23. Analytics

### ⚪ P4 — Deferred (When Needed)
24. PostgreSQL migration
25. Sentry error monitoring
26. Computer-Use Agent (VLA loop)
27. WhatsApp/Discord/Slack bots
28. Browser automation/scraping

---

## 📝 CONCLUSION

Plan ini menggabungkan 3 dokumen:
1. **Code Review** — 10 kriteria, score 6.0 → target 10.0
2. **Hermes Agent Integration** — 6 fasa, 132h, transform HERMES ke autonomous agent
3. **Master Plan** — 142 tasks, 5 fasa, 260h

**Selepas merge & filter:**
- 108 total tasks (34 completed, 5 in progress, 69 remaining)
- ~200h remaining effort (10 weeks)
- 8 suggestions untuk adaptasi (defer/avoid yang tak sesuai)

**Key principles:**
- ✅ NEVER remove existing features — add-on & upgrade only
- ✅ Use z-ai-web-dev-sdk for AI (already integrated)
- ✅ Use official APIs, not scraping
- ✅ Telegram first for messaging (Malaysian market)
- ✅ SQLite for now, PostgreSQL when needed
- ✅ Logger + error boundaries, Sentry when scaling
- ✅ Hybrid Server Components (don't break SPA)

**Dengan implementation plan ini, TheViralFindsMY akan mencapai score 10.0/10 dalam 10 minggu.** 🚀

---

*This implementation plan is a living document. Update checklist status as tasks are completed. Review weekly on Monday mornings.*
