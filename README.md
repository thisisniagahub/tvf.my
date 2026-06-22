# TheViralFindsMY — AI-Powered Multi-Platform Affiliate Manager Pro

> The only AI-powered platform built exclusively for Malaysian affiliates. Track 8M+ products across Shopee, TikTok Shop & Lazada. Generate Manglish captions. Auto-post to 8 social media platforms. 🇲🇾

**Live:** [theviralfinds.my](https://theviralfinds.my) | **Repo:** [github.com/thisisniagahub/tvf.my](https://github.com/thisisniagahub/tvf.my)

## ✨ Features

### Multi-Platform Affiliate Management
- **Shopee** (12 products) + **TikTok Shop** (8 products) + **Lazada** (8 products) = 28 tracked products
- **Shopee Live** (up to 80% commission) + **Unified Earnings** + **Platform Compare**
- Commission calculator with XTRA boost projections

### HERMES v2 AI Agent
- **Memory System** — Agent memory (2200 chars) + user profile (1375 chars) with AI consolidation
- **Skills System v2** — Dynamic skills with regex auto-detection, 4 seed affiliate skills
- **Cron Automation** — Natural language scheduling + Vercel Cron (every 5 min)
- **Subagent Delegation** — Single + batch (max 3 concurrent) with isolated context
- **Tool Gateway** — Web search, image gen, TTS, web reader via z-ai-web-dev-sdk

### Computer-Use Agent (Kimi-Style Split-Screen)
- Split-screen workspace with virtual browser canvas
- VLA Loop: Screenshot → LLM → Action → Repeat
- 6 automation tasks: No-API data sync, TikTok trend spy, auto-content deploy
- MCP Server Config: Connect Hermes Agent / OpenClaw / Custom endpoints
- Plugin System: 5 pre-built automation plugins

### Social Media Management (8 Platforms)
- Facebook, Instagram, TikTok, Twitter, YouTube, LinkedIn, WhatsApp, Telegram
- Social Dashboard, Content Scheduler, Social Analytics, Connected Accounts

### 40 Pages Across 6 Categories
- **Core (7):** Dashboard, Products, Links, Analytics, Calculator, Campaigns, Earnings
- **AI Powered (11):** HERMES Hub, Trend Spy, Profit Optimizer, Content Studio, Product Matcher, AI Recommender, AI Thumbnails, AI Calendar, Hashtag AI, Audience AI, A/B Testing
- **Platforms (5):** TikTok Shop, Lazada, Shopee Live, Unified Earnings, Compare
- **Advanced (7):** Auto Post, XTRA Alerts, Pricing, Marketplace, Team Dashboard, White-Label, API Keys
- **Growth (6):** Leaderboard, Achievements, Referrals, HERMES Hub, Notifications, Settings
- **Social Media (4):** Social Dashboard, Content Scheduler, Social Analytics, Connected Accounts

### Productivity & UX
- ⌨️ **Command Palette** (Cmd+K) — Global search across pages + content
- 🎯 **Focus Mode** (F) — Hide sidebar for distraction-free work
- 📝 **Keyboard Shortcuts** — G+X navigation (12 pages), B/F/?/ direct shortcuts
- 🎉 **Confetti** + notification sounds on live sales
- 🎨 **Dark/Light Theme** with animated preview
- 📱 **Mobile FAB** + responsive (Galaxy Z Fold supported)
- 🦴 **Skeleton Loading** on all data-fetching pages

## 🚀 Quick Start

```bash
bun install
cp .env.example .env  # Set NEXTAUTH_SECRET: openssl rand -base64 32
bun run db:push
bun run dev
```

## 📋 Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start dev server (port 3000) |
| `bun run build` | Production build |
| `bun run lint` | Run ESLint |
| `bun run test` | Run 394 unit tests (Vitest, 25 files) |
| `bun run test:coverage` | Tests with coverage report |
| `bun run db:push` | Push Prisma schema to database |

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/              # 30 API routes (7 ISR, 23 force-dynamic)
│   │   ├── ai/           # AI image gen + TTS
│   │   ├── agent/        # VLA loop, credentials, tasks
│   │   ├── auth/         # NextAuth v4 + CSRF
│   │   ├── content/      # AI script generation
│   │   ├── hermes/       # Chat, memory, skills, cron, delegate, tools, seed
│   │   ├── mcp/          # MCP servers + plugins
│   │   └── ...           # dashboard, products, search, trends
│   ├── page.tsx          # SPA entry (Zustand-driven routing)
│   └── globals.css       # Tailwind 4 + theme + WCAG + 3D utilities
├── components/
│   ├── agent-workspace/  # Split-screen + virtual browser + VLA
│   ├── auth/             # Landing page (Retro-Futuristic Engine theme)
│   ├── layout/           # Sidebar (React.memo), header, mobile nav
│   ├── modals/           # Command palette, changelog, shortcuts, legal
│   ├── pages/            # 40 page components (lazy-loaded)
│   │   ├── settings/     # 7 sub-components (profile, notifications, etc.)
│   │   └── content-studio/ # 2 sub-components (script-generator, voiceover-studio)
│   └── ui/               # 46+ shadcn/ui + Logo + MagicCard + SmartImage
├── hooks/                # use-live-notifications, use-keyboard-shortcuts, use-agent-browser
├── lib/
│   ├── agent-v2/         # VLA Loop, Task Definitions, Credential Store (AES-256-GCM)
│   ├── hermes-v2/        # Memory, Skills, Cron, Delegation, Tool Gateway
│   ├── mcp/              # MCP Server + Plugin Registry
│   ├── auth-config.ts    # NextAuth configuration
│   ├── auth.ts           # requireUser() / requireAuth() wrappers
│   ├── crypto.ts         # AES-256-GCM encryption
│   ├── csrf.ts           # CSRF token generation + verification
│   ├── db.ts             # Prisma client with type-safe fallback
│   ├── logger.ts         # Structured logger
│   ├── rate-limit.ts     # Token bucket rate limiter
│   ├── route-config.ts   # ISR vs force-dynamic presets
│   └── validation.ts     # 9 Zod schemas
├── store/app-store.ts    # Zustand store (persisted)
└── test/                 # Vitest setup + jest-dom types
```

## 🔒 Security

- ✅ NextAuth v4 authentication on all API routes
- ✅ AES-256-GCM encryption for credentials & MCP API keys
- ✅ CSRF protection (httpOnly cookie + timing-safe verification)
- ✅ SSRF protection (blocks internal IPs, AWS/GCP metadata)
- ✅ 6 security headers (HSTS, X-Frame-Options, CSP, etc.)
- ✅ Rate limiting (5-100 req/min per route type)
- ✅ Ownership checks on all `[id]` routes
- ✅ Vercel Cron with CRON_SECRET verification
- ✅ Zod input validation on all POST routes
- ✅ Structured logging (no console.log in API routes)
- ✅ Prisma relations with onDelete: Cascade (referential integrity)

## 🧪 Testing

```bash
bun run test          # 394 tests, 25 files
bun run test:coverage # Coverage report
```

## 📄 Documentation

- [PRD.md](PRD.md) — Product Requirements Document
- [CONTRIBUTING.md](CONTRIBUTING.md) — Development guidelines
- [implementation.md](implementation.md) — Implementation plan
- [worklog.md](worklog.md) — Development history

## 📄 License

Proprietary — © 2026 TheViralFindsMY. Built for Malaysian affiliates. 🇲🇾
