# TheViralFindsMY — Product Requirements Document (PRD)

> **Version:** 3.0 | **Last Updated:** 17 June 2026 | **Status:** Production-Ready

---

## 1. Product Overview

### 1.1 Vision
TheViralFindsMY adalah platform AI-powered affiliate marketing management yang dibina khusus untuk pasaran Malaysia. Platform ini menggabungkan real-time analytics, AI content generation, dan autonomous agent (HERMES v2) untuk membantu affiliate marketers meningkatkan komisen Shopee, Lazada, dan TikTok Shop mereka.

### 1.2 Target Market
- **Primary:** Malaysian Shopee affiliates (RM currency, Manglish content)
- **Secondary:** Lazada & TikTok Shop affiliates di Malaysia
- **Tertiary:** Southeast Asian affiliates (expandable)

### 1.3 Key Differentiators
- ✅ Built exclusively for Malaysian market (Manglish, RM, local events)
- ✅ HERMES v2 AI Agent dengan memory, skills, cron automation, dan subagent delegation
- ✅ Real-time live notifications dengan confetti celebrations
- ✅ Command palette (Cmd+K) dengan global content search
- ✅ 36 pages across 5 categories
- ✅ 20+ API routes dengan rate limiting + Zod validation
- ✅ 320+ unit tests (Vitest)
- ✅ PWA-ready dengan mobile-first design

---

## 2. Feature Catalog

### 2.1 Core Pages (7)
| Page | Description | Status |
|------|-------------|--------|
| Dashboard | Real-time earnings, clicks, conversions, live activity feed | ✅ |
| Products | 12+ Malaysian products with HOT/XTRA badges, detail dialog | ✅ |
| Affiliate Links | Link management with CVR analytics, create dialog | ✅ |
| Analytics | Revenue charts, traffic sources, geographic distribution | ✅ |
| Calculator | Commission calculator with XTRA boost projections | ✅ |
| Campaigns | Campaign management with ROAS tracking | ✅ |
| Earnings | Multi-platform earnings with withdrawal management | ✅ |

### 2.2 AI Powered Pages (11)
| Page | Description | Status |
|------|-------------|--------|
| AI Content | AI content generator (captions, hashtags, scripts) | ✅ |
| Trend Spy | Real-time trending products with velocity heatmap | ✅ |
| Profit Optimizer | AI recommendations for commission optimization | ✅ |
| Content Studio | Script generator + TTS voiceover studio (7 voices) | ✅ |
| Product Matcher | AI product-to-audience matching | ✅ |
| AI Recommender | Personalized recommendation feed | ✅ |
| AI Thumbnails | AI image generation for product thumbnails | ✅ |
| AI Calendar | Monthly content calendar with AI suggestions | ✅ |
| Hashtag AI | Hashtag generator with reach estimates | ✅ |
| Audience AI | Audience persona cards with insights | ✅ |
| A/B Testing | Experiment management with variant tracking | ✅ |

### 2.3 Platform Pages (5)
| Page | Description | Status |
|------|-------------|--------|
| TikTok Shop | TikTok affiliate integration | ✅ |
| Lazada | Lazada affiliate integration | ✅ |
| Shopee Live | Shopee Live (80% commission) sessions | ✅ |
| Unified Earnings | All-platform earnings in one view | ✅ |
| Compare | Platform comparison with radar chart | ✅ |

### 2.4 Advanced Pages (7)
| Page | Description | Status |
|------|-------------|--------|
| Auto Post | Automation rules with scheduling | ✅ |
| XTRA Alerts | Commission XTRA offer alerts | ✅ |
| Pricing | 4 pricing tiers with usage tracking | ✅ |
| Marketplace | Affiliate tools/templates marketplace | ✅ |
| Team Dashboard | Team member management | ✅ |
| White-Label | Custom branding solution | ✅ |
| API Keys | API key management with webhooks | ✅ |

### 2.5 Growth Pages (6)
| Page | Description | Status |
|------|-------------|--------|
| Leaderboard | Top affiliates ranking with podium | ✅ |
| Achievements | 16 badges with XP and levels | ✅ |
| Referrals | Referral program with RM 50 reward | ✅ |
| HERMES AI Hub | AI chat + tasks + automations + skills + memory | ✅ |
| Notifications | Notification history with preferences | ✅ |
| Settings | 7 tabs: Profile, Notifications, Billing, Integrations, Security, Appearance, About | ✅ |

### 2.6 Productivity Features
| Feature | Description | Status |
|---------|-------------|--------|
| Command Palette | Cmd+K search across pages + content (products, links, campaigns) | ✅ |
| Keyboard Shortcuts | G+X navigation (12 pages), B/F/? direct, ↑↓ Enter Tab in palette | ✅ |
| Focus Mode | Hide sidebar + mobile nav for distraction-free work (F key) | ✅ |
| Changelog Modal | Auto-show new features on update + manual access via header | ✅ |
| Live Notifications | WebSocket + fallback simulation with confetti + sound | ✅ |
| Celebration Toasts | Custom gradient toast for sales with pulsing dot | ✅ |
| Animated Counters | Count-up animation on all stat cards | ✅ |
| Dark/Light Theme | next-themes with animated preview in settings | ✅ |
| Mobile FAB | Floating command palette button on mobile | ✅ |
| Skeleton Loading | Detailed skeletons on all data-fetching pages | ✅ |
| Breadcrumb Trail | Header breadcrumb showing page hierarchy | ✅ |
| Frequently Visited | Command palette section based on visit count | ✅ |
| Recently Visited | Command palette section with clear button | ✅ |
| Settings Export/Import | JSON-based settings portability | ✅ |
| Reset All Settings | AlertDialog confirmation with detailed warning | ✅ |

### 2.7 HERMES v2 Agent Features
| Feature | Description | Status |
|---------|-------------|--------|
| AI Chat | Contextual chat with Malaysian market system prompt | ✅ |
| Memory System | Agent memory (2200 chars) + user profile (1375 chars) with consolidation | ✅ |
| Skills System v2 | Dynamic skills with regex auto-detection, 4 seed affiliate skills | ✅ |
| Cron Automation | Natural language scheduling, manual execute endpoint | ✅ |
| Subagent Delegation | Single + batch (max 3 concurrent) with isolated context | ✅ |
| Tool Gateway | Web search, image gen, TTS, web reader via z-ai-web-dev-sdk | ✅ |
| Tasks Tab | Automated task management (active/paused/draft) | ✅ |

---

## 3. Technical Architecture

### 3.1 Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | 16.1.1 |
| Language | TypeScript 5 (strict mode) | 5.x |
| UI | React 19 | 19.0.0 |
| Styling | Tailwind CSS 4 (CSS-first) | 4.x |
| Components | shadcn/ui (New York) | latest |
| Database | Prisma ORM + SQLite | 6.11.1 |
| Auth | NextAuth.js v4 | 4.24.11 |
| State | Zustand 5 (persisted) | 5.0.6 |
| Server State | TanStack Query 5 | 5.82.0 |
| Animation | Framer Motion 12 | 12.23.2 |
| Charts | Recharts 2 | 2.15.4 |
| Testing | Vitest 4 + Testing Library | 4.1.9 |
| Validation | Zod 4 | 4.x |
| AI | z-ai-web-dev-sdk | 0.0.18 |
| Real-time | Socket.io 4 | 4.8.3 |
| Confetti | canvas-confetti | 1.9.4 |

### 3.2 Project Structure
```
src/
├── app/
│   ├── api/                    # 20+ API routes (rate-limited, Zod-validated)
│   │   ├── ai/                 # thumbnails, voiceover
│   │   ├── content/            # script generation
│   │   ├── dashboard/          # dashboard stats
│   │   ├── hermes/             # chat, memory, skills, cron, delegate, tools, seed
│   │   ├── products/           # product listing
│   │   ├── search/             # global content search
│   │   └── trends/             # trend data
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # SPA entry (Zustand-driven routing)
│   └── globals.css             # Tailwind 4 + theme variables + animations
├── components/
│   ├── auth/                   # Landing page, onboarding flow
│   ├── layout/                 # AppShell, Sidebar, Header, MobileNav
│   ├── modals/                 # CommandPalette, ChangelogModal, ShortcutsModal, etc.
│   ├── pages/                  # 36 page components (lazy-loaded)
│   └── ui/                     # 46+ shadcn/ui + AnimatedNumber + SmartImage
├── hooks/                      # useLiveNotifications, useKeyboardShortcuts
├── lib/
│   ├── hermes-v2/              # Memory, Skills, Cron, Delegation, ToolGateway
│   ├── confetti.ts             # Celebration animations
│   ├── demo-data.ts            # Malaysian market demo data
│   ├── env.ts                  # Environment variable validation
│   ├── logger.ts               # Structured logger
│   ├── rate-limit.ts           # Token bucket rate limiter
│   ├── sounds.ts               # Web Audio API notification sounds
│   ├── types.ts                # TypeScript interfaces
│   ├── utils.ts                # cn() utility
│   └── validation.ts           # 9 Zod schemas
├── store/
│   └── app-store.ts            # Zustand store (persisted)
└── test/
    └── setup.ts                # Vitest setup
```

### 3.3 API Routes (20+)
| Route | Method | Rate Limit | Validation | Description |
|-------|--------|-----------|------------|-------------|
| /api/dashboard | GET | 100/min | — | Dashboard stats |
| /api/products | GET | 100/min | — | Product listing |
| /api/trends | GET | 100/min | — | Trend data |
| /api/search | GET | 30/min | searchSchema | Global content search |
| /api/hermes/chat | POST | 10/min | hermesChatSchema | AI chat with memory + skills |
| /api/hermes/memory | GET/POST/DELETE | 10/min | — | Agent memory management |
| /api/hermes/skills | GET/POST | 10/min | — | Skills management |
| /api/hermes/skills/[id] | GET/PUT/DELETE | 10/min | — | Single skill CRUD |
| /api/hermes/cron | GET/POST | 10/min | — | Cron job management |
| /api/hermes/cron/[id] | GET/PUT/DELETE | 10/min | — | Single cron job CRUD |
| /api/hermes/cron/execute | POST | 10/min | — | Manual cron execution |
| /api/hermes/delegate | GET/POST | 10/min | — | Subagent delegation |
| /api/hermes/delegate/[id] | GET/DELETE | 10/min | — | Subagent status/cancel |
| /api/hermes/tools | POST | 10/min | — | Tool gateway (search, image, TTS, reader) |
| /api/hermes/seed | GET/POST | 10/min | — | Seed affiliate skills |
| /api/content/script | POST | 10/min | contentScriptSchema | AI script generation |
| /api/ai/thumbnails | POST | 10/min | aiThumbnailsSchema | AI image generation |
| /api/ai/voiceover | POST | 10/min | aiVoiceoverSchema | AI TTS generation |

### 3.4 Security
- ✅ Zod input validation on all POST routes
- ✅ Rate limiting (token bucket: 5-100 req/min per route type)
- ✅ Structured logging (no console.log in API routes)
- ✅ Environment variable validation at startup
- ✅ React StrictMode enabled
- ✅ TypeScript strict mode (noImplicitAny: true)
- ✅ Error boundaries (Global + per-page)

### 3.5 Testing
- ✅ Vitest + Testing Library + jsdom
- ✅ 320 tests across 19 files (100% pass rate)
- ✅ Unit tests: utils, logger, validation, demo-data, rate-limit, env
- ✅ Component tests: button, animated-number, command-palette, changelog-modal, shortcuts-modal
- ✅ API route tests: dashboard, products, trends, search, hermes/chat, content/script, ai/thumbnails, ai/voiceover

---

## 4. Database Schema

### 4.1 Prisma Models
| Model | Description | Status |
|-------|-------------|--------|
| User | User accounts | ✅ (default) |
| Post | Demo posts | ✅ (default) |
| AgentMemory | HERMES agent/user memory | ✅ NEW |
| HermesSkill | HERMES skills catalog | ✅ NEW |
| HermesCronJob | Scheduled automation tasks | ✅ NEW |
| HermesSubagent | Subagent delegation records | ✅ NEW |

---

## 5. Performance Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Code Coverage | ~25% | 70%+ |
| TypeScript Errors | 0 in src/ | 0 |
| ESLint Warnings | 93 | <20 |
| Test Count | 320 | 400+ |
| Test Pass Rate | 100% | >95% |
| Bundle Size | <500KB (estimated) | <500KB |
| API Response Time | <10ms (local) | <200ms p95 |

---

## 6. Malaysian Market Specifications

### 6.1 Currency
- All prices in RM (Ringgit Malaysia) format: `RM 19.90`
- 2 decimal places, comma thousands separator

### 6.2 Languages
- **Manglish** — Malaysian English with "lah", "lor", "meh", "kan" particles
- **Bahasa Malaysia** — standard Malay
- **English** — standard English
- **Rojak** — mixed language

### 6.3 Peak Times (MYT, UTC+8)
| Time | Engagement |
|------|-----------|
| 7-9 PM | Golden Hour (highest) |
| 12-2 PM | Lunch Rush |
| 9 PM-12 AM | Impulse Hour |
| 6-8 AM | Morning Commute |

### 6.4 Seasonal Events
- Chinese New Year (Jan-Feb): 2-3x commission
- Ramadan/Raya (variable): 3-5x commission
- 9.9, 10.10, 11.11, 12.12 Sales: 2-5x commission

### 6.5 Commission Structure
- Base: 2.5-12%
- Commission XTRA: Up to 40-50% extra
- Shopee Live: Up to 80%

---

## 7. Future Roadmap

### Phase 6 (Post-Launch)
- Telegram Bot integration
- PostgreSQL migration (when multi-user)
- Sentry error monitoring
- CI/CD pipeline (GitHub Actions)
- OpenAPI/Swagger documentation
- Accessibility audit (WCAG 2.1 AA)
- Vercel Analytics

### Phase 7 (Long-term)
- Computer-Use Agent (VLA loop)
- WhatsApp Business API
- Discord Bot
- PostgreSQL + connection pooling
- Sentry + Web Vitals monitoring
- Custom shortcut configuration

---

*This PRD is a living document. Update with each release.*
