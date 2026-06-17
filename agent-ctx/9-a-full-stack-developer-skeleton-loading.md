# Task 9-a — Skeleton Loading States

**Agent:** full-stack-developer (skeleton loading)
**Task:** Add skeleton loading states to Leaderboard, Campaigns, and Links pages
**Files touched:**
- `src/components/pages/leaderboard-page.tsx`
- `src/components/pages/campaigns-page.tsx`
- `src/components/pages/links-page.tsx`

## Approach

Each page received a lightweight `useQuery` hook from `@tanstack/react-query` with a
500 ms simulated fetch (`new Promise((resolve) => setTimeout(() => resolve({}), 500))`)
to drive an `isLoading` boolean. Stable query keys (`['leaderboard-data']`,
`['campaigns-data']`, `['links-data']`) ensure the loading state only fires on
initial mount.

When `isLoading` is true, the affected sections swap to skeleton placeholders that
fill the same grid cells / container heights as the real content. Everything else
(header, search/filter cards, dialogs, encouragement banners) stays mounted.

## Per-page edits

### leaderboard-page.tsx
- New imports: `Skeleton` (`@/components/ui/skeleton`), `useQuery`
  (`@tanstack/react-query`), `ListRowSkeleton` (added to `./_shared` import).
- `useQuery({ queryKey: ['leaderboard-data'], ... })` added inside `LeaderboardPage`.
- Podium grid wrapped with `isLoading ? <skeleton grid> : <real grid>`. The skeleton
  renders 3 cards, each containing `Skeleton className="h-40 w-full rounded-xl"` plus
  smaller blocks for the avatar circle, name, niche badge, and three stats rows.
- "Full Leaderboard" `SectionCard` body wrapped with `isLoading ? <8 ListRowSkeleton
  in a divide-y container> : <Table>`. The SectionCard title/description/action stays.
- "Rising Stars" `SectionCard` body wrapped with `isLoading ? <3 ListRowSkeleton>
  : <grid of star cards>`.
- The stat cards grid, period Tabs, "Your rank highlighted" card, and the
  encouragement banner remain always visible (no skeleton specified for them).

### campaigns-page.tsx
- New imports: `Skeleton`, `useQuery`, `StatCardSkeleton` (added to `./_shared`).
- `useQuery({ queryKey: ['campaigns-data'], ... })` added inside `CampaignsPage`
  after the `form` state.
- Stat cards grid wrapped with `isLoading ? <4 StatCardSkeleton in same grid>
  : <4 real StatCards>`.
- Campaign cards grid wrapped with `isLoading ? <5 skeleton campaign cards> :
  <existing filtered.length === 0 ? empty-state : grid>` ternary — turned the
  existing ternary into a nested ternary so the original empty-state + filtered
  grid render exactly the same when not loading.
- Each skeleton campaign card uses `Skeleton className="h-48 w-full rounded-xl"`
  as the main block, with smaller Skeleton blocks for name, platform badge,
  budget bar, and a 2-column stats grid.
- PageHeader, filter Tabs, Create dialog, and Details dialog remain untouched.

### links-page.tsx
- New imports: `useQuery`, `StatCardSkeleton`, `ListRowSkeleton` (added to `./_shared`).
  No `Skeleton` import needed — all skeletons are shared components.
- `useQuery({ queryKey: ['links-data'], ... })` added inside `LinksPage`.
- Stat cards grid wrapped with `isLoading ? <4 StatCardSkeleton> : <real grid>`.
- Links table `CardContent` wrapped with `isLoading ? <6 ListRowSkeleton in a
  divide-y container> : <Table>`. The card header (showing link count + Shopee MY
  badge) stays mounted so the user sees the table shell while rows load.
- Search/filter card, Create link dialog remain untouched.

## Verification

- `bun run lint` → passes with no errors.
- `tail -40 /home/z/my-project/dev.log` → recent compiles all clean, `GET / 200`
  responses, no runtime errors.
- Existing functionality (state, handlers, dialogs, animations) preserved — only
  loading conditional rendering + useQuery + skeleton imports added.

## Conventions followed

- `'use client'` directive preserved on all 3 files.
- No export names changed (`LeaderboardPage`, `CampaignsPage`, `LinksPage`).
- Shared skeleton components used where they fit (`StatCardSkeleton`,
  `ListRowSkeleton`); inline `Skeleton` only for custom podium / campaign card
  shapes.
- Skeletons fill the same grid/layout containers (same Tailwind grid classes) so
  layout doesn't shift when loading completes.
- Stable queryKey per page so TanStack Query caches the result and only loads on
  initial mount.
