# IMPL-3 — full-stack-developer (Bundle + Image Optimization)

## Task
Phase 3.3 (Bundle Optimization) and Phase 3.4 (Image Optimization) for
TheViralFindsMY — verify existing code-splitting, tighten anything loose,
add next/image config + a `SmartImage` fallback wrapper, and replace the
one stray `<img>` tag.

## Work Log

### 3.3 Bundle Optimization

1. **page.tsx audit** — `src/app/page.tsx` already lazy-loads all 36 pages
   via `React.lazy(() => import(...).then(m => ({ default: m.X })))`. No
   changes needed.

2. **recharts** — `rg "from 'recharts'"` shows 13 chart-heavy pages import
   recharts. Because each page is itself a lazy chunk, recharts is split
   per page automatically. Confirmed no chart page is statically imported
   anywhere outside its own `lazy()` declaration. No changes needed.

3. **framer-motion** — `rg "from 'framer-motion'"` shows 11 import sites.
   Every single one uses the named-import form
   (`import { motion }` or `import { motion, AnimatePresence }`) — none
   use `import * as`. The shared `_shared.tsx` only pulls in `motion`, so
   tree-shaking keeps the bundle minimal. Per task suggestion, left as-is.

4. **next.config.ts** — updated `/home/z/my-project/next.config.ts` to:
   - Keep `output: "standalone"` and `reactStrictMode: true`.
   - Add an inline comment noting that bundle-analyzer config would go
     here in production, and that the existing per-page lazy loading
     already handles code splitting for recharts/framer-motion.
   - Add the `images.remotePatterns` config (see step 9 below).

5. **canvas-confetti** — `src/lib/confetti.ts` uses a *static*
   `import confetti from 'canvas-confetti'`, BUT the only callers
   (`src/hooks/use-live-notifications.tsx` lines 123 & 128) invoke it via
   `import('@/lib/confetti').then(({ celebrateSale }) => celebrateSale())`.
   This means the entire `@/lib/confetti` module — and its
   `canvas-confetti` dependency — lives in a separate dynamic chunk that
   is only fetched when a sale/xtra event actually fires. The library is
   effectively code-split out of the main bundle. **No change required.**
   (Forcing `confetti.ts` itself to use `await import('canvas-confetti')`
   would add an extra async hop on the critical sale-toast path for
   zero additional bundle savings — declined.)

6. **z-ai-web-dev-sdk** — `rg "z-ai-web-dev-sdk"` shows 4 API route sites:
   `api/ai/thumbnails/route.ts:30`,
   `api/ai/voiceover/route.ts:22`,
   `api/content/script/route.ts:57`,
   `api/hermes/chat/route.ts:62`.
   All 4 use `const ZAI = (await import('z-ai-web-dev-sdk')).default`
   inside a try block — already dynamic. No changes needed.

### 3.4 Image Optimization

7. **Stray `<img>` tag** — `rg "<img"` found exactly one: in
   `src/components/pages/ai-thumbnails-page.tsx:344`. The `src` was
   `t.image` which is a `data:image/png;base64,...` URL returned by the
   `/api/ai/thumbnails` route (verified at
   `api/ai/thumbnails/route.ts:45`). Data URLs are supported by
   `next/image` natively (no remotePatterns needed).
   - Replaced `<img src={t.image} ...>` with `<SmartImage src={t.image}
     alt={...} width={1024} height={1024} priority={idx === 0}
     className="size-full object-cover" />`.
   - Added `import { SmartImage } from '@/components/ui/smart-image'`
     alongside the existing UI imports.
   - `priority={idx === 0}` marks the first thumbnail as LCP-eligible.

8. **Placeholder-image comments** — added JSX comments documenting how to
   swap the placeholder `<Icons.Package>` block for a `<SmartImage>` (or
   raw `<Image>`) once real product imagery lands, at:
   - `products-page.tsx` — product card thumbnail (grid view).
   - `products-page.tsx` — product detail modal thumbnail.
   - `dashboard-page.tsx` — "Top Performing Products" rank badge slot
     (this page uses `#{i+1}` instead of a Package icon; the comment
     notes that a 32×32 thumbnail would slot in cleanly here).
   Each comment block includes a ready-to-paste `<SmartImage>` snippet
   and points readers at `images.remotePatterns` in `next.config.ts`.

9. **next.config.ts images config** — added:
   ```ts
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: '**.shopee.com.my' },
       { protocol: 'https', hostname: '**.shopee.com' },
     ],
   },
   ```
   This covers the Shopee Malaysia CDN (and the global shopee.com host
   as a fallback). TikTok/Lazada CDNs can be appended when their
   product-card integrations land.

10. **SmartImage component** — created
    `src/components/ui/smart-image.tsx`:
    - `'use client'` (uses `useState` for the error flag).
    - Props: `src?`, `alt`, `width=200`, `height=200`, `className?`,
      `priority?`.
    - Behavior: if `src` is missing/empty OR the underlying `<Image>`
      fires `onError`, render a muted gradient div with aspect-ratio
      matching `width/height` and a centered "No image" label.
    - `className` is applied to BOTH the fallback div and the real
      `<Image>` so consumers can control sizing/rounding consistently.
    - Documented in a JSDoc block that data URLs work out of the box
      (no remotePatterns entry needed) and that `priority` is forwarded
      for above-the-fold LCP images.

## Verification

- **`bun run lint`** → `0 errors, 105 warnings`. None of my touched
  files (`smart-image.tsx`, `ai-thumbnails-page.tsx`,
  `products-page.tsx`'s new comments, `dashboard-page.tsx`'s new
  comment, `next.config.ts`) appear in the warning list. The 105
  warnings are all pre-existing in unrelated files
  (`tailwind.config.ts` mixed-tabs, `logger.ts` internal `console.*`
  needed for the logger to function, `dashboard-page.tsx`/`products-page.tsx`/
  `team-dashboard-page.tsx` `any` types in Recharts tooltip callbacks,
  `sounds.ts` `any`, `command-palette.tsx` etc.) and pre-date this task.

- **`bunx tsc --noEmit`** → 0 errors in any touched file. The 6 errors
  reported are all pre-existing in out-of-skill files
  (`examples/websocket/server.ts`,
  `skills/image-edit/scripts/image-edit.ts`,
  `skills/stock-analysis-skill/src/analyzer.ts`) — same as noted in the
  MP-1 / MP-2 worklog entries.

- **`dev.log` (most recent ~80 lines)** — all `GET / 200` responses,
  compile times 4–9ms, render times 10–22ms. No `Module not found`,
  no `SyntaxError`, no `Cannot find` entries since my edits. The dev
  server is healthy.

## Stage Summary

- **3.3 Bundle Optimization**: Verified that the existing code-splitting
  is already doing the right thing — all 36 pages lazy-loaded, recharts
  split per-page via page-level chunks, framer-motion only used via
  named imports (tree-shaken), canvas-confetti dynamically imported
  through the hook → confetti.ts indirection, and z-ai-web-dev-sdk
  dynamically imported in all 4 API routes. The only code change in
  this phase was adding documentation comments to `next.config.ts`.
  No behavior change, no regressions.

- **3.4 Image Optimization**:
  - New `SmartImage` component (`src/components/ui/smart-image.tsx`)
    provides a graceful fallback for any product/affiliate image that
    might not exist yet — keeps layout stable, avoids broken-image
    icons.
  - Replaced the one `<img>` tag in `ai-thumbnails-page.tsx` with
    `<SmartImage>` (which wraps `next/image`). The first thumbnail is
    marked `priority` for LCP.
  - `next.config.ts` now declares `images.remotePatterns` for the
    Shopee Malaysia + global CDNs so `next/image` will optimize real
    product images when they're wired up.
  - Added inline JSX comments at the three product-thumbnail placeholder
    sites (`products-page.tsx` ×2, `dashboard-page.tsx` ×1) with
    ready-to-paste `<SmartImage>` snippets so the future migration is
    trivial.

- **No regressions**: 0 lint errors, 0 TS errors in touched files, dev
  server healthy, no behavior change to any existing page or API route.
- The app's bundle is already optimally split thanks to the prior
  `React.lazy()` work in `page.tsx`; this task primarily added image
  optimization infrastructure (next/image config + SmartImage) and
  documented the remaining migration path for real product imagery.
