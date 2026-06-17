# Task MP-1 — Phase 1.1 (fix `any` types) + Phase 1.2 (replace `console.log` with logger)

**Agent:** full-stack-developer (Phase 1.1+1.2)
**Date:** 17 Jun 2026
**Scope:** 8 API route files under `src/app/api/`

## Goal

Per the master plan (`upload/TVF-MASTER-PLAN.md`):
- Phase 1.1 — Fix all `any` types in API routes.
- Phase 1.2 — Replace `console.log` / `console.error` in API routes with the
  structured `logger` (`@/lib/logger`), and use `handleApiError()` for the
  `catch (error) + console.error + NextResponse.json({...}, { status: 500 })`
  pattern.

## Files touched (8)

1. `src/app/api/dashboard/route.ts`
2. `src/app/api/products/route.ts`
3. `src/app/api/trends/route.ts`
4. `src/app/api/search/route.ts`
5. `src/app/api/hermes/chat/route.ts`
6. `src/app/api/content/script/route.ts`
7. `src/app/api/ai/thumbnails/route.ts`
8. `src/app/api/ai/voiceover/route.ts`

## What changed

### Logging — uniform pattern across all 8 routes

| Route file | Inner AI-error log | Outer catch log |
|---|---|---|
| dashboard | — | `handleApiError(error, 'Dashboard API', 'Failed to fetch dashboard data')` |
| products | — | `handleApiError(error, 'Products API', 'Failed to fetch products')` |
| trends | — | `handleApiError(error, 'Trends API', 'Failed to fetch trends')` |
| search | — | `handleApiError(error, 'Search API', 'Search failed')` |
| hermes/chat | `logger.warn('Hermes AI unavailable, using fallback response', { error })` (200 + `source:'fallback'`) | `handleApiError(error, 'Hermes chat', 'Failed to process message')` |
| content/script | `logger.warn('Content script AI unavailable, using fallback', { error })` (200 + `source:'fallback'`) | `handleApiError(error, 'Content script', 'Failed to generate script')` |
| ai/thumbnails | `logger.error('Image generation AI error', { productName, style }, aiError)` (503) | `handleApiError(error, 'Thumbnails API', 'Failed to generate thumbnail')` |
| ai/voiceover | `logger.error('TTS AI error', { voice, textLength: truncatedText.length }, aiError)` (503) | `handleApiError(error, 'Voiceover API', 'Failed to generate voiceover')` |

### Type fix — hermes/chat/route.ts

The only explicit `any` annotation across all 8 API routes was
`(m: any)` in the chat-history `.map()` callback. Fixed by:

```ts
import type { ChatMessage } from '@/lib/types'

interface HermesChatRequestBody {
  message: string
  history?: Pick<ChatMessage, 'role' | 'content'>[]
}

// inside POST handler:
const { message, history }: HermesChatRequestBody = await request.json()

const messages: Array<{
  role: 'system' | 'user' | 'assistant'
  content: string
}> = [
  { role: 'system', content: SYSTEM_PROMPT },
  ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
  { role: 'user', content: message },
]
```

The explicit `Array<{ role: 'system' | 'user' | 'assistant'; content: string }>`
annotation is needed because without it TypeScript widens `'system'` / `'user'`
literals to `string`, which would no longer satisfy the
`z-ai-web-dev-sdk` `ChatMessage[]` parameter type. The annotation replaces
the previous reliance on `any` to bypass type-checking.

## Why `logger.warn` for hermes-chat + content-script inner catches

Both routes still return HTTP 200 with `source: 'fallback'` when the AI is
unavailable — the user gets a working response, just not from the LLM. That's
**graceful degradation**, not a failure, so `logger.warn` is the correct
level. Using `logger.error` here would spam Sentry / production error
dashboards with non-actionable alerts whenever the AI provider rate-limits
us.

## Why `logger.error` (not `handleApiError`) for thumbnails + voiceover inner catches

Both routes return HTTP 503 to the client (real failure — the user has to
retry). `handleApiError` always returns `status: 500`, which would be wrong
here. So the inner catch uses `logger.error(message, context, error)` to log
the failure with stack trace, then returns the original 503 + custom message
unchanged.

## Behavior preservation

- Same response bodies (`{ error: 'Failed to ...' }`) — `handleApiError`'s
  `defaultMessage` arg matches the original string verbatim.
- Same status codes (200 success, 400 missing-field, 503 AI-down for
  thumbnails/voiceover, 500 unexpected).
- Same rate-limit guards (MP-3's `applyRateLimit` calls untouched).
- Same ZAI SDK invocations and fallback strings.
- No `'use client'` directives added (API routes stay server-only).

## Verification

| Check | Result |
|---|---|
| `bunx eslint src/app/api/` | exit 0, **0 errors, 0 warnings** on all 8 API route files |
| `bun run lint` (full project) | **0 errors**, 106 warnings — all in non-API files |
| `bunx tsc --noEmit` on `src/app/api/**` | **0 errors** in any API route file |
| `dev.log` tail | Next.js 16.1.3 serving `/api/dashboard`, `/api/products`, `/api/trends`, `/api/search` with HTTP 200 — no regressions |

The 1 API-route lint warning that existed before this task
(`@typescript-eslint/no-explicit-any` on `hermes/chat/route.ts:57`) is gone.
No new warnings were introduced.

## Remaining warnings (out of scope, listed for downstream agents)

- `src/lib/logger.ts` lines 43 + 46 — internal `console.debug` / `console.info`
  used by the logger itself. These need a local `/* eslint-disable no-console */`
  block or a single guarded `emit()` wrapper.
- `src/lib/sounds.ts` line 12 — `any` in Web Audio API wrapper.
- `tailwind.config.ts` — 40+ `no-mixed-spaces-and-tabs` (re-indent with
  consistent tabs OR spaces).
- Component pages (`command-palette.tsx`, `dashboard-page.tsx`,
  `products-page.tsx`, `trend-spy-page.tsx`) — explicit `any` annotations
  matching the original Phase 1.1 checklist items for `unified-page.tsx`,
  `profit-page.tsx`, `autopost-page.tsx` (file names have shifted during
  refactors but the pattern is the same — Recharts tooltip `any` and inline
  state `any`).
