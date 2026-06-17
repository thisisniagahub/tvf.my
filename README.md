# TheViralFindsMY — AI-Powered Shopee Affiliate Manager Pro

> The only AI-powered platform built exclusively for Malaysian Shopee affiliates. Discover trending products, generate Manglish-perfect captions, and track every commission in real-time. 🇲🇾

## ✨ Features

### Core (7 Pages)
- **Dashboard** — Real-time earnings, clicks, conversions with live activity feed
- **Products** — 12+ Malaysian market products with HOT/XTRA badges
- **Affiliate Links** — Manage and track affiliate links with CVR analytics
- **Analytics** — Revenue charts, traffic sources, geographic distribution
- **Calculator** — Commission calculator with XTRA boost projections
- **Campaigns** — Campaign management with ROAS tracking
- **Earnings** — Multi-platform earnings with withdrawal management

### AI Powered (11 Pages)
- **HERMES AI Hub** — Chat with AI assistant (powered by z-ai-web-dev-sdk)
- **Trend Spy** — Real-time trending products with velocity heatmap
- **Content Studio** — AI script generator + TTS voiceover studio
- **AI Thumbnails** — AI image generation for product thumbnails
- **Profit Optimizer** — AI recommendations for commission optimization
- Plus: Product Matcher, AI Recommender, AI Calendar, Hashtag AI, Audience AI, A/B Testing

### Platforms (5 Pages)
- Shopee, TikTok Shop, Lazada, Shopee Live (80% commission), Unified Earnings, Compare

### Advanced (7 Pages)
- Auto Post, XTRA Alerts, Pricing, Marketplace, Team Dashboard, White-Label, API Keys

### Growth (6 Pages)
- Leaderboard, Achievements, Referrals, Hermes AI Hub, Notifications, Settings

### Productivity Features
- ⌨️ **Command Palette** (Cmd+K) — Global search across pages + content
- 🎯 **Focus Mode** (F key) — Hide sidebar for distraction-free work
- 📝 **Keyboard Shortcuts** — G+X navigation, B/F/? direct shortcuts
- 🎉 **Confetti Celebrations** — On live sale notifications
- 🔔 **Live Notifications** — WebSocket + fallback simulation
- 📊 **Animated Number Counters** — Count-up on stat cards
- 🎨 **Dark/Light Theme** — With animated preview
- 📱 **Mobile FAB** — Command palette access on mobile
- 📋 **Changelog Modal** — Auto-shows new features on update
- 💾 **Settings Export/Import** — JSON-based portability

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- SQLite (default) or PostgreSQL

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd theviralfindsmy

# Install dependencies
bun install

# Copy environment template
cp .env.example .env
# Edit .env and set NEXTAUTH_SECRET (required)
# Generate secret: openssl rand -base64 32

# Push database schema
bun run db:push

# Start development server
bun run dev
```

Visit `http://localhost:3000` — click "Continue with demo account".

### Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start dev server (port 3000) |
| `bun run lint` | Run ESLint |
| `bun run test` | Run unit tests (Vitest) |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests with coverage report |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Regenerate Prisma client |

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/              # 8 API routes (with rate limiting + Zod validation)
│   ├── layout.tsx        # Root layout with providers
│   ├── page.tsx          # SPA entry (Zustand-driven routing)
│   └── globals.css       # Tailwind 4 + theme variables
├── components/
│   ├── auth/             # Landing page, onboarding
│   ├── layout/           # Sidebar, header, mobile nav, app shell
│   ├── modals/           # Command palette, changelog, shortcuts, etc.
│   ├── pages/            # 36 page components (lazy-loaded)
│   └── ui/               # 46+ shadcn/ui components
├── hooks/                # use-live-notifications, use-keyboard-shortcuts
├── lib/
│   ├── confetti.ts       # Confetti celebrations
│   ├── demo-data.ts      # Malaysian market demo data
│   ├── env.ts            # Environment variable validation
│   ├── logger.ts         # Structured logger
│   ├── rate-limit.ts     # Token bucket rate limiter
│   ├── sounds.ts         # Web Audio API notification sounds
│   ├── types.ts          # TypeScript interfaces
│   ├── utils.ts          # cn() utility
│   └── validation.ts     # Zod schemas
├── store/
│   └── app-store.ts      # Zustand store (persisted)
└── test/
    └── setup.ts          # Vitest setup
```

## 🔧 Configuration

### Environment Variables

See [`.env.example`](.env.example) for all variables. Required:
- `DATABASE_URL` — Database connection string
- `NEXTAUTH_SECRET` — Auth secret (generate with `openssl rand -base64 32`)

### Rate Limiting

API routes are rate-limited using a token bucket algorithm:

| Route Type | Limit | Window |
|-----------|-------|--------|
| Auth | 5 req | per minute |
| Standard API | 100 req | per minute |
| AI Generation | 10 req | per minute |
| Search | 30 req | per minute |

### Keyboard Shortcuts

Press `?` to view the full cheat sheet. Key shortcuts:
- `Cmd+K` — Command palette
- `G then D/P/L/A/E/C/M/T/H/S/N/O` — Navigate to pages
- `B` — Toggle sidebar
- `F` — Focus mode
- `/` — Focus header search

## 🧪 Testing

```bash
# Run all tests
bun run test

# Run with coverage
bun run test:coverage

# Watch mode
bun run test:watch
```

Current coverage: `src/lib/` utilities (100% line coverage on tested files).

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 📄 License

Proprietary — © 2025 TheViralFindsMY. Built with love for Malaysian affiliates. 🇲🇾
