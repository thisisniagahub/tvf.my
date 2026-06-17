# Task 2-e — GROWTH pages agent

**Agent:** full-stack-developer (GROWTH pages)
**Task:** Build 5 growth/community page components for TheViralFindsMY

## Files delivered
All in `/home/z/my-project/src/components/pages/`:

1. **leaderboard-page.tsx** — `export function LeaderboardPage()`
2. **achievements-page.tsx** — `export function AchievementsPage()`
3. **referrals-page.tsx** — `export function ReferralsPage()`
4. **notifications-page.tsx** — `export function NotificationsPage()`
5. **settings-page.tsx** — `export function SettingsPage()`

## Convention alignment
- `'use client'` on every file
- Named exports matching page.tsx lazy imports (`m.LeaderboardPage` etc.)
- Imports: `PageHeader, StatCard, SectionCard` from `./_shared`; `formatRM, formatNumber` from `@/lib/demo-data`; `* as Icons` from `lucide-react`; `toast` from `sonner`
- Color tokens used: bg-shopee/text-shopee, bg-hermes/text-hermes, bg-success/text-success, bg-warning/text-warning. No indigo/blue in component theming.
- Tailwind amber/slate/orange used only for podium medal gradients (gold/silver/bronze).
- Facebook/Telegram brand colors only on share buttons (unavoidable for social recognition).

## Component inventory
- **Leaderboard**: 4 StatCards, period Tabs (week/month/all), 3-position podium with elevation, Your Rank #47 highlighted card, 12-row leaderboard Table, 4-card Rising Stars grid, CTA banner.
- **Achievements**: 4 StatCards, Level Progress card with badge + progress bar, category Tabs (6), 16 achievement cards with rarity color-coding, locked/unlocked states, progress bars, Recently Unlocked list, Next-up teaser.
- **Referrals**: Hero card with VIRAL2025 code + copy buttons, 4 StatCards, Share Your Link section (URL input + 4 social buttons), 3-step How It Works, 12-row referral history Table, Top Referrers mini-leaderboard.
- **Notifications**: 4 StatCards, 5 filter Tabs with counts, 15 notifications in scrollable list with type color-coding + read/unread borders, 5x3 preferences Switch matrix, Quiet Hours card with time inputs.
- **Settings**: 6-tab sidebar Tabs — Profile / Notifications / Billing / Integrations / Security / Appearance — each with form sections, Save buttons wired to sonner toasts, theme toggle wired to Zustand store.

## Malaysian context
Names: Ahmad Faizal, Siti Nurhaliza, Tan Wei Ming, Priya Devi, Lim Chee Keong, Nurul Aisyah, Rajesh Kumar, Farah Natasha, Kumar Subramaniam, Aishah Rahman, Daniel Wong, Mei Ling Chen, Hafiz Rahman, Jasmine Lee, Arjun Pillai, Sofia Abdullah, Marcus Tan, Priya Suresh, Faizal Ibrahim, Ling Wei, Nadia Hassan, Daniel Yong, Amira Yusof, Vincent Goh.

Locations: Kuala Lumpur, Petaling Jaya.
Manglish: "keep grinding lah!", "kawan-kawan", "rezeki", "wahabies", "smash it".
Currency: formatRM throughout.
Timezone: Asia/Kuala_Lumpur default in settings.

## Lint status
`bunx eslint` on all 5 new files: clean (0 errors, 0 warnings).
Pre-existing errors in content-studio-page.tsx and pricing-page.tsx belong to other agents.

## Notes for downstream agents
- The `dev.log` currently shows module-not-found errors for pages still being built by sibling agents (unified-earnings-page, lazada-page, etc.). Not blocking — these will resolve when those agents complete.
- My 5 pages are ready to render the moment page.tsx's lazy imports resolve.
- Settings page reads `theme`/`setTheme` from `useAppStore` — already exposed in the store interface.
