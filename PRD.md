# TheViralFindsMY — Product Requirements Document (PRD)

> **Version:** 6.0 | **Last Updated:** 20 June 2026 | **Status:** Production-Ready (theviralfinds.my)

---

## 1. Product Overview

### 1.1 Vision
TheViralFindsMY adalah platform AI-powered affiliate marketing management yang dibina khusus untuk pasaran Malaysia. Platform menggabungkan real-time analytics, AI content generation, autonomous agent (HERMES v2), computer-use agent (split-screen), dan social media management untuk Shopee, TikTok Shop, dan Lazada.

### 1.2 Key Differentiators
- ✅ Multi-platform: Shopee + TikTok Shop + Lazada (28 products tracked)
- ✅ HERMES v2 AI Agent dengan memory, skills, cron automation, subagent delegation
- ✅ Computer-Use Agent dengan Kimi-style split-screen workspace
- ✅ MCP plugin ecosystem (connect Hermes Agent / OpenClaw)
- ✅ Social Media Management (8 platforms: FB, IG, TikTok, X, YouTube, LinkedIn, WhatsApp, Telegram)
- ✅ 40 pages across 6 categories
- ✅ 30 API routes dengan NextAuth + CSRF + rate limiting + Zod validation
- ✅ AES-256-GCM encryption untuk credentials
- ✅ 394 unit tests (Vitest, 25 files)
- ✅ Retro-Futuristic Isometric Engine UI theme
- ✅ WCAG AA compliant + prefers-reduced-motion support
- ✅ Code splitting (settings: 88 lines, content-studio: 49 lines)
- ✅ Performance optimized (React.memo, useDeferredValue, useMemo)
- ✅ Prisma relations + indexes (6 relations, 3 composite indexes)

---

## 2. Feature Catalog

### 2.1 Core Pages (7)
Dashboard, Products, Affiliate Links, Analytics, Calculator, Campaigns, Earnings

### 2.2 AI Powered Pages (11)
HERMES AI Hub, Trend Spy, Profit Optimizer, Content Studio, Product Matcher, AI Recommender, AI Thumbnails, AI Calendar, Hashtag AI, Audience AI, A/B Testing

### 2.3 Platform Pages (5)
TikTok Shop, Lazada, Shopee Live, Unified Earnings, Compare

### 2.4 Advanced Pages (7)
Auto Post, XTRA Alerts, Pricing, Marketplace, Team Dashboard, White-Label, API Keys

### 2.5 Growth Pages (6)
Leaderboard, Achievements, Referrals, HERMES Hub, Notifications, Settings

### 2.6 Social Media Pages (4)
Social Dashboard, Content Scheduler, Social Analytics, Connected Accounts

---

## 3. Technical Architecture

### 3.1 Stats
| Metric | Value |
|--------|-------|
| Source files | 207 TS/TSX |
| API routes | 30 (7 ISR, 23 force-dynamic) |
| Page components | 40 (+ 9 sub-components) |
| Test files | 25 (394 tests, 100% pass) |
| Prisma models | 9 (6 with user relations) |
| Prisma indexes | 3 composite |
| TS errors | 0 |
| ESLint errors | 0 |

### 3.2 Tech Stack
Next.js 16.1.3, React 19, TypeScript 5 (strict), Tailwind CSS 4, shadcn/ui, Prisma 6.11.1 + SQLite, NextAuth v4, Zustand 5, TanStack Query 5, Framer Motion 12, Recharts 2, Vitest 4, Zod 4, z-ai-web-dev-sdk 0.0.18, Socket.io 4, canvas-confetti

### 3.3 Route Caching Strategy
| Type | Config | Routes |
|------|--------|--------|
| ISR 60s | `revalidate = 60` | dashboard, products, trends, skills, plugins, tasks |
| ISR 30s | `revalidate = 30` | search |
| Force-dynamic | `dynamic = 'force-dynamic'` | hermes/*, ai/*, content/*, agent/*, mcp/servers, auth/* |

### 3.4 Prisma Models
User, Post (default), AgentMemory, HermesSkill, HermesCronJob, HermesSubagent, McpServer, AgentCredential, Plugin

### 3.5 Security
NextAuth v4, AES-256-GCM, CSRF protection, SSRF protection, 6 security headers, rate limiting, ownership checks, CRON_SECRET, Zod validation, structured logging, Prisma relations with cascade

### 3.6 Performance
- React.memo on sidebar NavItem (40 items)
- useDeferredValue on products + header search
- useMemo on dashboard chart data
- React.memo on EarningsChart + ClicksOrdersChart
- Code splitting: settings-page (88 lines), content-studio (49 lines)

---

## 4. Deployment
- **Vercel** auto-deploy from GitHub `main`
- **Domain:** theviralfinds.my
- **Region:** sin1 (Singapore)
- **Cron:** `*/5 * * * *` → `/api/hermes/cron/execute?mode=allDue`

---

## 5. Future Roadmap
- PostgreSQL migration (when multi-user)
- Telegram Bot integration
- Sentry error monitoring
- CI/CD pipeline (GitHub Actions)
- OpenAPI/Swagger documentation
- Custom shortcut configuration
