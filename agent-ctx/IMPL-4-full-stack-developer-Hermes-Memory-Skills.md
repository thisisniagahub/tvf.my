# IMPL-4 — HERMES Memory System + Skills System v2

**Agent:** full-stack-developer (HERMES Memory + Skills)
**Task ID:** IMPL-4
**Scope:** Phase 4.1 (Memory System) + Phase 4.2 (Skills System v2) of the
unified implementation plan.

## Files created / modified

### Prisma schema
- `prisma/schema.prisma` — added two models:
  - `AgentMemory` (`@@map("agent_memories")`) — fields `id, userId, type,
    content, tags, createdAt, updatedAt`. Index on `(userId, type)`.
  - `HermesSkill` (`@@map("hermes_skills")`) — fields `id, name, description,
    category, content, trigger?, status, usageCount, successRate, version,
    createdAt, updatedAt`. Index on `(category, status)`.
- **IMPORTANT:** The original task spec used `tags String[]` (a list of
  primitives), but the project's current Prisma connector is SQLite, which
  does not support native primitive lists (per the project rule
  *"The Prisma schema primitive type cannot be a list"*). I changed `tags`
  to `String` and the `MemoryService` serializes/deserializes it as a
  JSON-encoded `string[]` (e.g. `'["trend","beauty"]'`) — transparent to
  callers.

### Service layer (`src/lib/hermes-v2/`)
- `memory-service.ts` — `MemoryService` class + `memoryService` singleton.
  Methods: `getAgentMemory`, `getUserProfile`, `addMemory`, `getMemorySize`,
  `consolidateMemory`, `clearMemory`, `buildMemoryContext`. Caps agent
  memory at 2200 chars and user-profile memory at 1375 chars; when adding
  a new entry would exceed the cap, oldest entries are evicted until total
  drops under 70% of the cap (LRU-style consolidation).
- `skills-engine.ts` — `SkillsEngine` class + `skillsEngine` singleton.
  Methods: `loadSkill`, `getAllSkills`, `autoDetectSkills`, `createSkill`,
  `updateSkill`, `updateSkillUsage`, `deleteSkill`, `buildSkillsContext`,
  `detectSkillIds`. Auto-detection uses each skill's `trigger` regex
  (case-insensitive); invalid regexes are caught and logged at debug level.
  Max 3 skills injected per system prompt.
- `seed-skills.ts` — exports `SEED_SKILLS: CreateSkillInput[]`, the four
  default affiliate skills (product-research, content-generation,
  trend-analysis, manglish-style) with full markdown content including
  process steps + output format.

### Validation schemas (`src/lib/validation.ts`)
Added 4 new Zod schemas at the end of the file (existing schemas untouched):
- `hermesMemoryCreateSchema` — `{ userId?, type: 'agent'|'user', content,
  tags? }` (userId defaults to `'demo-user'`).
- `hermesMemoryClearSchema` — `{ userId?, type? }` (optional type filter).
- `hermesSkillCreateSchema` — `{ name, description, category, content,
  trigger? }`.
- `hermesSkillUpdateSchema` — all fields optional + `status:
  'active'|'draft'|'archived'`.

### API routes
- `src/app/api/hermes/memory/route.ts` — GET / POST / DELETE.
  - GET returns `{ userId, agentMemory, userProfile, count }` for
    `?userId=<id>` (defaults to `demo-user`).
  - POST validates with `hermesMemoryCreateSchema`, calls
    `memoryService.addMemory` (auto-consolidates when over cap).
  - DELETE validates optional `?type=` filter via `hermesMemoryClearSchema`,
    calls `memoryService.clearMemory`.
- `src/app/api/hermes/skills/route.ts` — GET (list, optional `?category=`)
  + POST (create).
- `src/app/api/hermes/skills/[id]/route.ts` — GET / PUT / DELETE for a
  single skill. Returns 404 when not found. PUT rejects empty patch bodies
  with 400.
- `src/app/api/hermes/seed/route.ts` — GET (report which seed skills are
  present) + POST (idempotent seed: creates missing seed skills, skips
  existing ones by `name` match).

All API routes:
- Apply rate limiting via `applyRateLimit(request, RATE_LIMITS.api, '<name>')`.
- Use `validateInput` for any request body / query params.
- Wrap the handler in `try/catch` with `handleApiError` returning a
  consistent `{ error, status: 500 }` shape.

### Updated chat route (`src/app/api/hermes/chat/route.ts`)
This was the largest single edit. The route now:
1. Accepts an optional `userId` in the request body (defaults to
   `'demo-user'`).
2. **Pre-AI:** builds memory context (`memoryService.buildMemoryContext`)
   and skills context (`skillsEngine.buildSkillsContext`) in parallel,
   plus fetches the list of detected skill IDs (`skillsEngine.detectSkillIds`).
   These three calls share a single `Promise.all` so the added latency is
   ~max(memory) ≈ a few ms for the demo user. All context-building is
   wrapped in its own try/catch — a failure here logs a warn and falls
   back to the bare system prompt rather than blocking the chat.
3. The system prompt is composed as `SYSTEM_PROMPT + memoryContext +
   skillsContext` before being sent to the z-ai-web-dev-sdk.
4. **Post-AI:** `persistPostChat(userId, message, response, source,
   detectedSkillIds)` runs after the AI returns (or after the fallback
   fires), performing three best-effort operations in parallel:
   - Adds an agent-memory note categorising the question
     (`categorizeQuestion` heuristic: trend-analysis / content-generation /
     product-research / manglish-style / earnings / optimization / general).
   - If the message matched an explicit first-person interest pattern
     (`extractInterest` regex: "I like X", "interested in X", "my niche is
     X", "I sell X", "I promote X"), adds a user-profile memory entry.
   - Updates `usageCount` and `successRate` for each detected skill.
     Success = `source === 'ai' && response.length > 0`. Fallback responses
     count as failure (the skill didn't actually help).
5. The response body now includes a `meta` field:
   `{ memoryUsed: boolean, skillsUsed: string[] }` so the client can
   surface what context was injected.

All post-chat persistence is wrapped in `.catch()` blocks that log at warn
level and swallow the error — a memory-write failure never blocks the chat
response. The existing fallback path (when the AI SDK throws) is preserved
verbatim; only the addition of memory persistence and the `meta` field
distinguish it.

## Verification

### Schema + DB
```
$ bun run db:push
🚀  Your database is now in sync with your Prisma schema. Done in 11ms
✔ Generated Prisma Client (v6.19.2)
```

### TypeScript
```
$ bunx tsc --noEmit
(no new errors in src/ — only pre-existing errors in
examples/websocket/server.ts, skills/image-edit/scripts/image-edit.ts,
skills/stock-analysis-skill/src/analyzer.ts which are out of scope)
```

### ESLint
```
$ bunx eslint src/app/api/hermes/memory src/app/api/hermes/skills \
              src/app/api/hermes/seed src/app/api/hermes/chat/route.ts \
              src/lib/hermes-v2/ src/lib/validation.ts
exit 0  (0 errors, 0 warnings on all files I created or modified)
```
Project-wide `bun run lint` still reports 0 errors; warning count is
unchanged (94 warnings — all pre-existing in tailwind.config.ts, logger.ts,
page components, and the test file at `hermes/chat/route.test.ts` written
by another agent).

### Unit tests
```
$ bun run test
Test Files  15 passed (15)
     Tests  262 passed (262)
```
My validation.ts additions (4 new Zod schemas) didn't break any of the
56 existing validation tests. The 11 tests in
`src/app/api/hermes/chat/route.test.ts` (written by a concurrent agent
for the chat route) all pass against my updated implementation.

### End-to-end smoke tests (via curl)
1. `POST /api/hermes/seed` → `{success:true, created:[4 skills], skipped:[]}`.
2. Re-running seed → `{created:[], skipped:[4 skills]}` (idempotent ✓).
3. `POST /api/hermes/memory` with `{type:'user', content:'User prefers
   Manglish content for beauty products', tags:['manglish','beauty']}` →
   200 OK, then `GET /api/hermes/memory` correctly returns the entry with
   `tags` deserialized back to `['manglish','beauty','preference']`.
4. `POST /api/hermes/chat` with `message:"What are the trending beauty
   products in Malaysia right now?"` → 200 OK with
   ```
   "meta": {
     "memoryUsed": true,
     "skillsUsed": ["cmqi7xo5a...","cmqi7xo5f...","cmqi7xo5h..."]
   }
   ```
   The AI response was visibly shaped by the auto-detected skills (it
   followed the trend-digest output format from the trend-analysis skill
   and the RM-prefixed product list from the product-research skill).
5. After the chat, `GET /api/hermes/memory` showed a new agent-memory
   entry: `Discussed trend-analysis: "What are the trending beauty
   products in Malaysia right now?" (ai)` with tags
   `["trend-analysis","ai"]`.
6. `GET /api/hermes/skills` showed the first skill's `usageCount` bumped
   from 0 to 1 and `successRate` from 0 to 1.
7. `GET /api/hermes/skills/<id>` returns the full skill record; PUT
   updates fields; GET on a nonexistent id returns 404 with
   `{error:"Skill not found"}`.
8. `DELETE /api/hermes/memory?type=agent` → cleared only agent memories;
   `DELETE /api/hermes/memory` (no type) → cleared all. Both returned
   `{success:true, cleared:"agent"|"all"}`.

### Dev log
Inspected `/home/z/my-project/dev.log` after testing — all HERMES routes
return 200/201/404 as expected, structured `logger.info` calls are emitted
for skill creation, memory add/clear, seed completion, and skill update.
No 500 errors, no unhandled rejections.

## Design decisions worth noting

1. **`tags` as JSON string (SQLite constraint).** The task spec asked for
   `tags String[]`, but the project uses the SQLite Prisma connector,
   which doesn't support primitive lists. I stored `tags` as a JSON
   string and serialized/deserialized inside `MemoryService` so the
   public API still exposes `tags: string[]`. This matches the project's
   stated rule *"The Prisma schema primitive type cannot be a list"*.

2. **Conservative interest extraction.** The `extractInterest` heuristic
   in the chat route only fires on explicit first-person interest
   statements ("I like X", "my niche is X", etc.). This is deliberate —
   a more aggressive extractor would pollute the user profile with every
   question the user asks, drowning the signal in noise. The
   consolidation algorithm would eventually evict the noise, but the
   short-term profile would be misleading.

3. **Skill usage success = AI source, not response quality.** I count a
   skill use as "successful" when the AI returned a non-empty response
   (`source === 'ai'`), and "failed" when we fell back to the hardcoded
   response. This is a coarse signal but it's the only one available
   without a feedback loop (thumbs up/down). A future iteration could
   let the user explicitly rate responses and feed that into
   `successRate` instead.

4. **Best-effort context building.** `buildMemoryContext` and
   `buildSkillsContext` are wrapped in a try/catch so a Prisma error
   (or a malformed trigger regex) doesn't break the chat. The route
   falls back to the bare system prompt and logs a warn. This matches
   the existing pattern in the chat route where the AI SDK error is
   caught and we fall back to a hardcoded response.

5. **Idempotent seed endpoint.** The seed POST checks existing skill
   names before inserting, so it's safe to call multiple times. This
   is important because the demo database can be wiped at any time and
   we want the seed endpoint to be the single source of truth for the
   default skill catalog.

6. **Background persistence doesn't block response, but is awaited.**
   `persistPostChat` is awaited before returning the chat response so
   that:
   - The user sees a consistent state (the memory GET immediately after
     a chat will reflect what was just discussed).
   - If a memory write fails, we still log it before the response leaves
     the server.
   The await adds ~5-15ms in practice (parallel Prisma writes). Trade-off
   accepted for consistency over raw latency.

## What I did NOT touch
- `src/components/pages/hermes-hub-page.tsx` — the task didn't ask for
  UI changes, and the existing page already calls `/api/hermes/chat`
  with `{message, history}`. My chat route still accepts that exact
  payload (the optional `userId` field is additive). The response shape
  is also backward-compatible (`response` and `source` fields
  preserved; `meta` is new and additive).
- The cron / delegate / tools API routes that another agent (likely
  IMPL-5) created concurrently. My code is independent of theirs.
- All 8 existing API routes (dashboard, products, trends, search,
  hermes/chat (only the parts I had to modify), content/script,
  ai/thumbnails, ai/voiceover) — no behavior changes anywhere else.
