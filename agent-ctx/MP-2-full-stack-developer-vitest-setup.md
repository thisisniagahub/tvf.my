# MP-2 — Phase 2.1 (Testing Framework Setup) + Phase 2.2 (Unit Tests)

**Agent:** full-stack-developer
**Task ID:** MP-2
**Parent task:** Setup Vitest and write unit tests for TheViralFindsMY

## What was done

### 2.1 — Testing framework setup

- Installed dev dependencies via `bun add -d`:
  - `vitest@4.1.9`
  - `@testing-library/react@16.3.2`
  - `@testing-library/jest-dom@6.9.1`
  - `@testing-library/user-event@14.6.1`
  - `@vitest/coverage-v8@4.1.9`
  - `jsdom@29.1.1`
  - `@vitejs/plugin-react@6.0.2`
- Created `/home/z/my-project/vitest.config.ts`:
  - `environment: 'jsdom'`
  - `globals: true` (so `describe`, `it`, `expect`, `vi` are auto-available)
  - `setupFiles: ['./src/test/setup.ts']`
  - V8 coverage with `text/json/html` reporters
  - Coverage includes `src/lib/**`, `src/components/**`, `src/app/api/**`
  - Coverage excludes `src/test/**`, `src/**/*.test.*`, `src/**/*.spec.*`
  - `@` alias resolves to `./src` (matches tsconfig paths)
- Created `/home/z/my-project/src/test/setup.ts`:
  - Imports `@testing-library/jest-dom/vitest` (custom matchers like `toBeInTheDocument`)
  - `afterEach(() => cleanup())` to unmount React components between tests
  - Mocks `next/navigation` (useRouter, useSearchParams, usePathname)
  - Mocks `next-themes` (useTheme, ThemeProvider)
- Added 4 npm scripts to `package.json` (existing scripts preserved):
  - `"test": "vitest run"` — single run
  - `"test:watch": "vitest"` — watch mode
  - `"test:coverage": "vitest run --coverage"` — with V8 coverage
  - `"test:ui": "vitest --ui"` — browser UI

### 2.2 — Unit tests

Created 4 test files covering the lib utilities (skipped `confetti.ts` and `sounds.ts` as
they are browser/DOM-only):

1. **`src/lib/utils.test.ts`** (17 tests, 3 describe blocks)
   - `cn()` merges classes (joins strings, twMerge resolves conflicts, dedupes)
   - `cn()` handles conditional classes (truthy/false/null/undefined/empty/object/array)
   - `cn()` handles empty input (no args, all falsy, empty object, empty array)

2. **`src/lib/logger.test.ts`** (12 tests, 3 describe blocks)
   - Uses `vi.stubEnv('NODE_ENV', ...)` + `vi.resetModules()` to re-import the
     logger with a fresh `isProduction`/`isDev`/`minLevel` snapshot
   - Production: `logger.debug` / `logger.info` are silent (no `console.debug`/`info` calls)
   - Production: `logger.warn` / `logger.error` always emit (with proper `WARN`/`ERROR` prefix)
   - Production: `logger.error` includes the Error stack as second arg
   - Development: `logger.debug` / `logger.info` emit
   - `handleApiError()` returns `{ error, status: 500 }` shape for Error / non-Error / null / undefined / number / string
   - Uses default message `"Internal server error"` when none provided
   - Always returns exactly the keys `{ error, status }`

3. **`src/lib/validation.test.ts`** (56 tests, 10 describe blocks)
   - `loginSchema` — accepts valid email+password; rejects bad email, empty email, empty password, missing email
   - `registerSchema` — requires 8+ char password (rejects 7, accepts exactly 8); rejects short name; rejects bad email
   - `createLinkSchema` — requires valid URL; rejects missing/empty productId, missing name, commission > 100; accepts all optional fields
   - `createCampaignSchema` — accepts valid; rejects negative budget, empty name
   - `hermesChatSchema` — rejects empty message, missing message, > 4000 chars; accepts exactly 4000; accepts optional history; rejects invalid history role
   - `contentScriptSchema` — accepts valid input; rejects invalid template/language/tone/duration enums; verifies all valid enum values for template and language; rejects empty productName
   - `aiThumbnailsSchema` — accepts valid; rejects invalid style; rejects empty productName
   - `aiVoiceoverSchema` — enforces 1024 char text limit (accepts exactly 1024, rejects 1025); rejects empty text; rejects invalid voice enum; rejects speed < 0.5 and > 2.0; accepts boundary values 0.5 and 2.0
   - `searchSchema` — accepts ≥2 chars, rejects 1 char, rejects >100 chars
   - `validateInput()` — returns `{ success: true, data }` for valid input; returns `{ success: false, error, status: 400 }` for invalid; aggregates multiple issues with `;` separator

4. **`src/lib/demo-data.test.ts`** (36 tests, 6 describe blocks)
   - `formatRM(19.9) === 'RM 19.90'` ✓
   - `formatRM(0) === 'RM 0.00'` ✓
   - `formatRM(1240) === 'RM 1,240.00'` (thousands separator) ✓
   - `formatRM` rounds 11.039 → 'RM 11.04' ✓
   - `formatNumber(2847) === '2,847'` ✓
   - `formatNumber(999) === '999'` (no separator under 1000) ✓
   - `formatNumber(1234567) === '1,234,567'` (multiple separators) ✓
   - `formatNumber(-2847) === '-2,847'` (negatives) ✓
   - `demoProducts` has exactly 12 entries; every product has id/name/price/commissionRate/category/source='shopee'; at least one hot and one xtra; all ids unique
   - `demoLinks` non-empty; every link has shortUrl + platform
   - `demoCampaigns` non-empty; covers multiple statuses
   - `demoNotifications` non-empty; has at least one unread
   - `navItems` has exactly 36 entries (7 core + 11 ai + 5 platforms + 7 advanced + 6 growth)
   - Every navItem has id/label/icon/category; covers exactly 5 categories
   - First entry is `dashboard`; last entry is `settings`; all ids unique

## Verification

```
$ bun run test
 ✓ src/lib/logger.test.ts (12 tests) 29ms
 ✓ src/lib/demo-data.test.ts (36 tests) 27ms
 ✓ src/lib/validation.test.ts (56 tests) 18ms
 ✓ src/lib/utils.test.ts (17 tests) 12ms
 Test Files  4 passed (4)
      Tests  121 passed (121)
   Duration  1.53s
```

```
$ bun run test:coverage
 lib
  demo-data.ts    |     100 |      100 |     100 |     100 |
  logger.ts       |     100 |    89.47 |     100 |     100 | 43-46
  utils.ts        |     100 |      100 |     100 |     100 |
  validation.ts   |     100 |      100 |     100 |     100 |
```

100% line coverage on all four tested lib files.

```
$ bunx eslint src/lib/utils.test.ts src/lib/logger.test.ts \
              src/lib/validation.test.ts src/lib/demo-data.test.ts \
              src/test/setup.ts vitest.config.ts
(no output — zero issues)
```

All new test/config files pass ESLint with **zero warnings and zero errors**.

The 106 pre-existing lint warnings (in `logger.ts`, `sounds.ts`, `tailwind.config.ts`)
were already present before this task — they are caused by the strengthened ESLint
config from a prior MP-1 agent (which turned `no-console`, `no-explicit-any`,
`no-mixed-spaces-and-tabs`, etc. from `"off"` to `"warn"`). They are not introduced
by this task and are out of scope for MP-2.

Dev server log shows no new errors after the test framework was added:
Next.js 16.1.3 still serves `/`, `/api/dashboard`, `/api/products`, `/api/trends`,
and `/api/search` with HTTP 200.

## Files created

- `/home/z/my-project/vitest.config.ts`
- `/home/z/my-project/src/test/setup.ts`
- `/home/z/my-project/src/lib/utils.test.ts`
- `/home/z/my-project/src/lib/logger.test.ts`
- `/home/z/my-project/src/lib/validation.test.ts`
- `/home/z/my-project/src/lib/demo-data.test.ts`

## Files modified

- `/home/z/my-project/package.json` — added 4 test scripts, kept all existing scripts intact
- `/home/z/my-project/bun.lock` — updated by `bun add -d`

## Notes for downstream agents

- The vitest setup uses **globals**, so test files do NOT need to import
  `describe`/`it`/`expect`/`vi` (although importing them explicitly is fine and
  is what I did for IDE friendliness).
- To re-test a module that reads `process.env.NODE_ENV` at import time, use
  `vi.stubEnv('NODE_ENV', '<value>')` followed by `vi.resetModules()` and
  `await import('./module')`. See `logger.test.ts` for the pattern.
- Coverage exclude patterns already filter `*.test.*` and `*.spec.*`, so test
  files themselves are not counted in coverage stats.
- When adding tests for React components, the `next/navigation` and `next-themes`
  mocks in `src/test/setup.ts` are applied globally — no need to re-mock them
  in each component test file.
- 0 lint errors, 0 TypeScript errors, 121 tests passing.
