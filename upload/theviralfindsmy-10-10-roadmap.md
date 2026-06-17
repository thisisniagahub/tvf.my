# Roadmap ke Skor 10/10 — TheViralFindsMY

> Current: 7.5/10 | Target: 10/10 | Gap: 2.5 poin

---

## Executive Summary

Dengan P0 fixes sudah diterapkan, skor naik dari 6.0 ke 7.5. Untuk mencapai 10/10, kita perlu menutup gap di 6 area: **Testing**, **Type Safety**, **Performance**, **Security**, **Documentation**, dan **Infrastructure**.

---

## Score Breakdown — Current vs Target

| Kriteria | Current | Target | Gap | Priority |
|----------|---------|--------|-----|----------|
| Arsitektur | 7/10 | 10/10 | 3 | P1 |
| Type Safety | 6/10 | 10/10 | 4 | P0 |
| Code Quality | 7/10 | 10/10 | 3 | P1 |
| UI/UX | 9/10 | 10/10 | 1 | P3 |
| Performance | 7/10 | 10/10 | 3 | P1 |
| Security | 7/10 | 10/10 | 3 | P1 |
| **Testing** | **0/10** | **10/10** | **10** | **P0** |
| Documentation | 6/10 | 10/10 | 4 | P2 |
| Database Design | 8/10 | 10/10 | 2 | P2 |
| Feature Completeness | 10/10 | 10/10 | 0 | — |

---

## P0 — Fix Sekarang (Impact Tertinggi)

### 1. Testing: Dari 0 ke 80% Coverage (Impact: +3.0 skor)

**Masalah:** ZERO test. Ini adalah gap terbesar.

**Setup:**
```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8 msw
```

**File yang harus dibuat:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))
```

**Priority test files (critical path):**
1. `src/lib/auth.test.ts` — Auth flow, password hashing, JWT
2. `src/lib/utils.test.ts` — cn() utility
3. `src/lib/validation.test.ts` — Input validation
4. `src/app/api/dashboard/route.test.ts` — API response shape
5. `src/app/api/auth/register/route.test.ts` — Registration flow
6. `src/store/app-store.test.ts` — Zustand store actions
7. `src/components/ui/button.test.tsx` — Component rendering
8. `src/components/error-boundary.test.tsx` — Error handling

**Target:** 80% line coverage dalam 1 sprint.

---

### 2. Hilangkan Semua `any` Type (Impact: +1.5 skor)

**Temuan:** Hanya 10 instances nyata (bukan false positive):

| File | Line | Fix |
|------|------|-----|
| `api/live/script/route.ts` | 101-102 | `products: Product[]` |
| `api/live/script/route.ts` | 165-166 | `product: Product \| undefined` |
| `pages/unified-page.tsx` | 232 | `payload: TooltipPayload[]` |
| `pages/unified-page.tsx` | 238 | `entry: TooltipEntry` |
| `pages/unified-page.tsx` | 255 | `payload: TooltipPayload[]` |
| `pages/profit-page.tsx` | 26 | Definisikan `ProfitResult` interface |
| `pages/profit-page.tsx` | 244 | `g: GoalEntry` |
| `pages/autopost-page.tsx` | 237 | `p: PlatformResult` |
| `pages/autopost-page.tsx` | 575 | `slot: TimeSlot` |

**Definisikan types:**
```typescript
// src/types/recharts.ts
export interface TooltipPayload {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

export interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

// src/types/profit.ts
export interface ProfitResult {
  product: ProductCalc;
  inputs: ProfitInputs;
  daily: RevenueBreakdown;
  monthly: RevenueBreakdown;
  yearly: RevenueBreakdown;
  perConversion: number;
  breakEven: BreakEvenData;
  goalTracker: GoalEntry[];
}

export interface GoalEntry {
  goal: string;
  current: number;
  target: number;
  progress: number;
}
```

---

### 3. Replace 160 console.log dengan Proper Logger (Impact: +0.5 skor)

**Masalah:** 160 `console.*` statements tersebar di production code.

**Solusi:**
```typescript
// src/lib/logger.ts
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const CURRENT_LEVEL = process.env.NODE_ENV === 'production' 
  ? LogLevel.WARN 
  : LogLevel.DEBUG;

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (CURRENT_LEVEL <= LogLevel.DEBUG) console.debug(`[DEBUG] ${msg}`, meta ?? '');
  },
  info: (msg: string, meta?: Record<string, unknown>) => {
    if (CURRENT_LEVEL <= LogLevel.INFO) console.info(`[INFO] ${msg}`, meta ?? '');
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    if (CURRENT_LEVEL <= LogLevel.WARN) console.warn(`[WARN] ${msg}`, meta ?? '');
  },
  error: (msg: string, error?: unknown) => {
    if (CURRENT_LEVEL <= LogLevel.ERROR) {
      console.error(`[ERROR] ${msg}`, error);
      // TODO: Send to Sentry/Datadog in production
    }
  },
};
```

**Usage:** Replace semua `console.log/error/warn` dengan `logger.*`.

---

## P1 — Fix Dalam 1-2 Sprint (Impact Besar)

### 4. Leverage Next.js Server Components (Impact: +1.0 skor)

**Masalah:** Semua pages pakai `'use client'`. Next.js 16 Server Components tidak dimanfaikan sama sekali.

**Strategy — Gradual Migration:**

```tsx
// BEFORE: pages/dashboard-page.tsx (client, 500+ lines)
'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

export function DashboardPage() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard })
  // ... all rendering + data fetching + state management in one file
}
```

```tsx
// AFTER: Split into Server Component + Client Components

// src/app/page.tsx (Server Component — data fetching)
import { DashboardClient } from '@/components/pages/dashboard-page'
import { db } from '@/lib/db'

export default async function DashboardPage() {
  const stats = await db.affiliateLink.aggregate({ ... })
  const recentActivity = await db.clickRecord.findMany({ ... })
  
  return <DashboardClient initialData={{ stats, recentActivity }} />
}

// src/components/pages/dashboard-page.tsx (Client Component — interaksi)
'use client'
export function DashboardClient({ initialData }) {
  const [filter, setFilter] = useState('7d') // client state only
  // TanStack Query untuk real-time updates
  const { data } = useQuery({ 
    queryKey: ['dashboard', filter], 
    queryFn: () => fetchDashboard(filter),
    initialData 
  })
  // ... rendering only
}
```

**Priority pages untuk migration:**
1. Dashboard (data-heavy, perfect for SSR)
2. Products (read-only list)
3. Analytics (static charts dengan initial data)
4. Leaderboard (daily snapshot)

---

### 5. Input Validation dengan Zod di Semua API Routes (Impact: +0.5 skor)

**Masalah:** API routes tidak punya proper input validation. Raw body langsung dipakai.

**Contoh fix:**
```typescript
// src/lib/validation.ts (expand)
import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
})

export const createLinkSchema = z.object({
  name: z.string().min(1).max(200),
  productUrl: z.string().url(),
  category: z.string().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  tags: z.string().optional(),
})
```

**Usage di API routes:**
```typescript
// app/api/auth/register/route.ts
import { registerSchema } from '@/lib/validation'

export async function POST(req: Request) {
  const body = await req.json()
  const result = registerSchema.safeParse(body)
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    )
  }
  
  const { name, email, password } = result.data
  // ... proceed with validated data
}
```

---

### 6. Rate Limiting untuk Semua API Routes (Impact: +0.5 skor)

**Current:** Hanya beberapa route yang punya rate limiting.

**Target:** Semua API routes terlindungi.

```typescript
// src/lib/rate-limit.ts (existing — expand to all routes)

// Apply ke semua route handlers:
export async function GET(req: Request) {
  const rateLimit = await checkRateLimit(req, { max: 100, window: 60 }) // 100 req/minute
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  // ... handler logic
}
```

**Tiered rate limits:**
- Auth routes: 5 req/minute (prevent brute force)
- API data routes: 100 req/minute
- Seed/demo routes: 1 req/hour (admin only)

---

### 7. Replace Hardcoded Secrets (Impact: +0.5 skor)

**Temuan di `src/lib/auth.ts`:**
```typescript
secret: process.env.NEXTAUTH_SECRET || 'theviralfindsmy-secret-key-2025'
```

**Fix:**
```typescript
const secret = process.env.NEXTAUTH_SECRET
if (!secret) {
  throw new Error('NEXTAUTH_SECRET environment variable is required')
}

export const authOptions: NextAuthOptions = {
  secret,
  // ...
}
```

**.env.example update:**
```env
# Required
NEXTAUTH_SECRET=change-me-in-production-min-32-chars

# Optional OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

---

## P2 — Fix Dalam 2-4 Sprint (Impact Moderat)

### 8. Accessibility Audit (Impact: +0.5 skor)

**Checklist:**
- [ ] Semua `<img>` punya `alt` text (bukan empty string kecuali decorative)
- [ ] Color contrast ratio 4.5:1 minimum untuk text
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] ARIA labels untuk icon-only buttons
- [ ] Focus visible indicators
- [ ] Screen reader announcements untuk live regions (toast, notifications)
- [ ] `prefers-reduced-motion` sudah dihandle (partially done)

**Quick win:**
```tsx
// BAD
<button onClick={...}><Icon /></button>

// GOOD
<button onClick={...} aria-label="Close dialog"><Icon aria-hidden /></button>
```

---

### 9. Database Migration Strategy (Impact: +0.5 skor)

**Current:** SQLite — cocok untuk dev, tidak untuk production scale.

**Target:** PostgreSQL via Prisma.

**Migration plan:**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Steps:**
1. Setup PostgreSQL instance (Supabase/Railway/AWS RDS)
2. `prisma migrate dev --name init`
3. Data migration script dari SQLite ke PostgreSQL
4. Update `.env.example`
5. Dokumentasi deployment

---

### 10. API Documentation dengan OpenAPI (Impact: +0.5 skor)

```typescript
// src/lib/openapi.ts
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

export const registry = new OpenAPIRegistry()

registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
            email: z.string().email(),
            password: z.string().min(8),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: 'User registered successfully' },
    400: { description: 'Validation failed' },
    409: { description: 'Email already exists' },
  },
})
```

---

## P3 — Polish & Monitoring (Impact Kecil)

### 11. Error Monitoring (Sentry)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
})
```

### 12. Analytics & Observability

- Vercel Analytics (built-in)
- Google Analytics 4 untuk user behavior
- Custom event tracking untuk affiliate conversions

### 13. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run build
```

### 14. Performance Monitoring

- Core Web Vitals tracking (LCP, FID, CLS)
- Bundle size analysis
- Lighthouse CI

---

## Implementation Timeline

### Sprint 1 (Week 1-2)
| Task | Effort | Impact |
|------|--------|--------|
| Setup testing (Vitest + Testing Library) | 4h | +1.5 |
| Write critical tests (auth, utils, store) | 8h | +1.0 |
| Fix all `any` types | 3h | +1.0 |
| Replace console.log dengan logger | 4h | +0.3 |

**Sprint 1 Score: 7.5 → 8.8**

### Sprint 2 (Week 3-4)
| Task | Effort | Impact |
|------|--------|--------|
| Server Components migration (dashboard, products) | 12h | +0.8 |
| Zod validation semua API routes | 6h | +0.4 |
| Rate limiting semua routes | 4h | +0.3 |
| Hardcoded secrets fix | 1h | +0.2 |

**Sprint 2 Score: 8.8 → 9.5**

### Sprint 3 (Week 5-6)
| Task | Effort | Impact |
|------|--------|--------|
| Accessibility audit & fix | 6h | +0.3 |
| Database migration guide (SQLite → PostgreSQL) | 4h | +0.2 |
| API Documentation (OpenAPI) | 4h | +0.2 |
| Error monitoring (Sentry) | 2h | +0.1 |
| CI/CD pipeline | 2h | +0.1 |

**Sprint 3 Score: 9.5 → 10.0**

---

## Total Investment

| Resource | Sprint 1 | Sprint 2 | Sprint 3 | Total |
|----------|----------|----------|----------|-------|
| Developer Hours | 19h | 23h | 18h | **60h** |
| Score Gain | +1.3 | +0.7 | +0.5 | **+2.5** |

**ROI: 2.5 poin per 60 jam = 0.04 poin/jam**

---

## Kesimpulan

Path ke 10/10 membutuhkan **~60 jam** distributed over **6 minggu**. Prioritas tertinggi adalah **testing** (0→80% coverage) dan **type safety** (fix `any` types). Kedua area ini saja sudah menambah +2.5 poin.

Sisa gap (+0.5) datang dari polish: accessibility, documentation, monitoring, dan infrastructure — yang bisa dikerjakan paralel dengan development fitur baru.
