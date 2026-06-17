# MP-3 Phase 3.2 — Rate Limiting

## Summary
Implemented token-bucket rate limiting across all API routes for TheViralFindsMY.

## Files Created
- `src/lib/rate-limit.ts` — in-memory token bucket rate limiter with presets
  (`auth`, `api`, `ai`, `search`) and `applyRateLimit()` helper that emits a
  proper HTTP 429 response with `Retry-After` / `X-RateLimit-*` headers.

## Files Modified (rate limit added at top of handler)
| Route | Preset | Key Prefix |
|---|---|---|
| `src/app/api/dashboard/route.ts` | `api` (100/min) | `dashboard` |
| `src/app/api/products/route.ts` | `api` (100/min) | `products` |
| `src/app/api/trends/route.ts` | `api` (100/min) | `trends` |
| `src/app/api/search/route.ts` | `search` (30/min) | `search` |
| `src/app/api/hermes/chat/route.ts` | `ai` (10/min) | `hermes-chat` |
| `src/app/api/content/script/route.ts` | `ai` (10/min) | `content-script` |
| `src/app/api/ai/thumbnails/route.ts` | `ai` (10/min) | `ai-thumbnails` |
| `src/app/api/ai/voiceover/route.ts` | `ai` (10/min) | `ai-voiceover` |

## Notes
- `dashboard` and `trends` GET handlers had no `request` param — added
  `request: NextRequest` so `applyRateLimit` can read headers.
- Existing response formats / behavior preserved — only added the rate
  limit check at the very top of each handler.
- Also fixed a pre-existing ESLint config error: the rule
  `@typescript-eslint/no-unused-disable-directive` does not exist; replaced
  with the valid `linterOptions.reportUnusedDisableDirectives: "warn"` so
  `bun run lint` runs successfully (0 errors, 106 pre-existing warnings).

## Verification
- `bun run lint` → 0 errors, 106 warnings (all pre-existing)
- `curl` smoke-tested `/api/dashboard`, `/api/products`, `/api/trends`,
  `/api/search?q=test` → all return 200 OK
