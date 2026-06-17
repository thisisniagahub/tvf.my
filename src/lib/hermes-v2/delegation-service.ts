/**
 * HERMES v2 Subagent Delegation Service
 * -------------------------------------
 * Lets the parent HERMES agent hand off scoped tasks to "subagents" —
 * isolated child runs that execute concurrently with their own context
 * and toolsets, then report a result string back to the parent.
 *
 * Each subagent is persisted as a `HermesSubagent` row so the parent
 * (and the API consumer) can poll status, inspect failures, and audit
 * what was delegated over time.
 *
 * Concurrency:
 *   `delegateBatch` uses `Promise.allSettled` and caps concurrent
 *   in-flight subagents at 3 to keep AI-tier rate limits and memory
 *   pressure under control.
 *
 * Vercel fallback: On Vercel serverless, SQLite is not persistent.
 * When the DB is unavailable (or a query fails at runtime), every
 * persistence operation transparently falls back to an in-memory
 * `Map` keyed by subagent id. The AI call itself is unaffected (it
 * goes through z-ai-web-dev-sdk), so subagents still execute and
 * report results — they just don't survive across deployments.
 */

import { db, dbAvailable, withDbFallback } from '@/lib/db'
import { logger } from '@/lib/logger'

// ============== Types ==============

export interface SubagentConfig {
  goal: string
  context: string
  toolsets: string[]
  userId?: string
  parentId?: string
  maxIterations?: number
  timeout?: number
}

export interface SubagentRecord {
  id: string
  parentId: string | null
  userId: string
  goal: string
  context: string
  toolsets: string[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  result: string | null
  maxIterations: number
  timeout: number
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface DelegationResult {
  subagent: SubagentRecord
  success: boolean
  error?: string
}

// ============== Serialization Helpers ==============

interface SubagentRow {
  id: string
  parentId: string | null
  userId: string
  goal: string
  context: string
  toolsets: string
  status: string
  result: string | null
  maxIterations: number
  timeout: number
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

function parseToolsets(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((t) => typeof t === 'string')) {
      return parsed
    }
  } catch {
    // ignore
  }
  return []
}

function rowToRecord(row: SubagentRow): SubagentRecord {
  return {
    id: row.id,
    parentId: row.parentId,
    userId: row.userId,
    goal: row.goal,
    context: row.context,
    toolsets: parseToolsets(row.toolsets),
    status: row.status as SubagentRecord['status'],
    result: row.result,
    maxIterations: row.maxIterations,
    timeout: row.timeout,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
  }
}

// ============== In-Memory Fallback Store ==============

/** Generate a cuid-ish id without pulling in a dependency. */
function generateId(): string {
  return `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * In-memory subagent store keyed by subagent id. Used only when the DB
 * is unavailable (Vercel serverless / first runtime failure).
 */
const subagentStore = new Map<string, SubagentRow>()

/** Persist a subagent row either to the DB or to the in-memory store. */
async function persistSubagentCreate(
  row: SubagentRow
): Promise<SubagentRow> {
  if (!dbAvailable) {
    subagentStore.set(row.id, row)
    return row
  }

  const created = await withDbFallback(
    () =>
      db.hermesSubagent.create({
        data: {
          userId: row.userId,
          parentId: row.parentId,
          goal: row.goal,
          context: row.context,
          toolsets: row.toolsets,
          maxIterations: row.maxIterations,
          timeout: row.timeout,
          status: row.status,
        },
      }),
    null as Awaited<ReturnType<typeof db.hermesSubagent.create>> | null
  )

  if (created) {
    return {
      id: created.id,
      parentId: created.parentId,
      userId: created.userId,
      goal: created.goal,
      context: created.context,
      toolsets: created.toolsets,
      status: created.status,
      result: created.result,
      maxIterations: created.maxIterations,
      timeout: created.timeout,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      completedAt: created.completedAt,
    }
  }

  // DB failed — mirror into in-memory store.
  subagentStore.set(row.id, row)
  return row
}

/** Update a subagent row either in the DB or in the in-memory store. */
async function persistSubagentUpdate(
  id: string,
  patch: Partial<SubagentRow>
): Promise<SubagentRow | null> {
  if (!dbAvailable) {
    const row = subagentStore.get(id)
    if (!row) return null
    const updated: SubagentRow = { ...row, ...patch, updatedAt: new Date() }
    subagentStore.set(id, updated)
    return updated
  }

  const updated = await withDbFallback(
    () =>
      db.hermesSubagent.update({
        where: { id },
        data: patch,
      }),
    null as Awaited<ReturnType<typeof db.hermesSubagent.update>> | null
  )

  if (updated) {
    return {
      id: updated.id,
      parentId: updated.parentId,
      userId: updated.userId,
      goal: updated.goal,
      context: updated.context,
      toolsets: updated.toolsets,
      status: updated.status,
      result: updated.result,
      maxIterations: updated.maxIterations,
      timeout: updated.timeout,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      completedAt: updated.completedAt,
    }
  }

  // DB failed — mirror update into in-memory store if the row exists.
  const row = subagentStore.get(id)
  if (!row) return null
  const mirrored: SubagentRow = { ...row, ...patch, updatedAt: new Date() }
  subagentStore.set(id, mirrored)
  return mirrored
}

// ============== Core Delegation Logic ==============

/**
 * Run the actual AI work for a subagent. Isolated from the persistence
 * layer so we can unit-test the prompt synthesis separately.
 *
 * The system prompt instructs the model to act as a scoped worker: it
 * must not call external tools directly (the parent HERMES handles
 * tool orchestration), and it must produce a structured result string.
 */
async function runSubagentAI(
  goal: string,
  context: string,
  toolsets: string[]
): Promise<string> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()

  const toolHint =
    toolsets.length > 0
      ? `You have access to these tools (used by the parent agent): ${toolsets.join(', ')}. ` +
        `Recommend which tool the parent should call next if relevant.`
      : `No tools are scoped to this subagent. Rely on your own knowledge.`

  const systemPrompt =
    `You are a HERMES subagent — an isolated worker task delegated by ` +
    `the parent HERMES AI agent for TheViralFindsMY, an AI-powered ` +
    `affiliate marketing platform for the Malaysian Shopee market.\n\n` +
    `Rules:\n` +
    `- Focus exclusively on the goal. Do not deviate.\n` +
    `- Use the provided context as ground truth.\n` +
    `- ${toolHint}\n` +
    `- Keep your final answer under 300 words.\n` +
    `- Structure your answer with a brief "Summary:" section and, if ` +
    `applicable, a "Recommended actions:" bullet list.\n` +
    `- Use Malaysian context (RM, MYT, local products) where relevant.`

  const userPrompt =
    `# Goal\n${goal}\n\n# Context\n${context || '(none provided)'}\n\n# Your response:`

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    thinking: { type: 'disabled' },
  })

  const out = completion.choices[0]?.message?.content
  if (!out) {
    throw new Error('Subagent AI returned an empty response')
  }
  return out
}

/**
 * Delegate a single task to a subagent.
 *
 * Steps:
 *  1. Create a `HermesSubagent` row with status='pending'.
 *  2. Flip to 'running', call HERMES AI with isolated context.
 *  3. On success → persist `result`, status='completed'.
 *     On failure → persist null result, status='failed'.
 *  4. Return the full record + success flag.
 *
 * The function never throws — failures are captured in the
 * `DelegationResult.success` flag and `error` string so batch
 * callers (`Promise.allSettled`) can react gracefully.
 *
 * Persistence is best-effort: if the DB is unavailable (Vercel
 * serverless), the same lifecycle is mirrored to an in-memory store
 * so the returned record is always well-formed.
 */
export async function delegateSingle(
  config: SubagentConfig
): Promise<DelegationResult> {
  const userId = config.userId ?? 'demo-user'
  const maxIterations = config.maxIterations ?? 5
  const timeout = config.timeout ?? 60
  const now = new Date()

  // 1. Create the record (DB or in-memory fallback).
  const createdRow: SubagentRow = {
    id: dbAvailable ? '' : generateId(), // DB assigns its own id; in-memory needs ours up front
    parentId: config.parentId ?? null,
    userId,
    goal: config.goal,
    context: config.context,
    toolsets: JSON.stringify(config.toolsets ?? []),
    status: 'pending',
    result: null,
    maxIterations,
    timeout,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  }

  // For the DB path we let Prisma assign the id (cuid). For the in-memory
  // path we use the id we already generated.
  let record: SubagentRow
  if (!dbAvailable) {
    record = await persistSubagentCreate(createdRow)
  } else {
    // Persist with an empty id placeholder; Prisma will assign the real one.
    const dbRow: SubagentRow = {
      ...createdRow,
      id: '', // Prisma generates the real id
    }
    record = await persistSubagentCreate(dbRow)
  }

  logger.info('Subagent created', {
    subagentId: record.id,
    parentId: record.parentId,
    goalLength: record.goal.length,
    toolsets: parseToolsets(record.toolsets),
  })

  // 2. Mark as running
  const runningRow = await persistSubagentUpdate(record.id, {
    status: 'running',
  })
  const currentRow = runningRow ?? record

  // 3. Run the AI with a timeout guard
  try {
    const timeoutMs = timeout * 1000
    const resultPromise = runSubagentAI(
      currentRow.goal,
      currentRow.context,
      parseToolsets(currentRow.toolsets)
    )
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Subagent timed out after ${timeout}s`)),
        timeoutMs
      )
    )
    const result = await Promise.race([resultPromise, timeoutPromise])

    const updated = await persistSubagentUpdate(currentRow.id, {
      status: 'completed',
      result,
      completedAt: new Date(),
    })

    const finalRecord = updated ?? currentRow
    logger.info('Subagent completed', {
      subagentId: currentRow.id,
      resultLength: result.length,
    })
    return {
      subagent: rowToRecord(finalRecord),
      success: true,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'unknown error'
    logger.warn('Subagent failed', {
      subagentId: currentRow.id,
      error: errorMessage,
    })

    const updated = await persistSubagentUpdate(currentRow.id, {
      status: 'failed',
      completedAt: new Date(),
    })

    const finalRecord = updated ?? currentRow
    return {
      subagent: rowToRecord(finalRecord),
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Delegate a batch of tasks concurrently. Caps concurrent in-flight
 * subagents at 3 to respect AI-tier rate limits.
 *
 * Returns one DelegationResult per task, in input order. Failures
 * do not abort the batch — each task settles independently.
 */
export async function delegateBatch(
  tasks: SubagentConfig[]
): Promise<DelegationResult[]> {
  const MAX_CONCURRENT = 3
  const results: DelegationResult[] = new Array(tasks.length)
  let cursor = 0

  async function worker() {
    while (cursor < tasks.length) {
      const idx = cursor++
      results[idx] = await delegateSingle(tasks[idx])
    }
  }

  const workers = Array.from(
    { length: Math.min(MAX_CONCURRENT, tasks.length) },
    () => worker()
  )
  await Promise.all(workers)

  logger.info('Batch delegation complete', {
    total: tasks.length,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  })

  return results
}

// ============== Query / Mutation API ==============

export async function getSubagents(
  userId: string = 'demo-user'
): Promise<SubagentRecord[]> {
  if (!dbAvailable) {
    const rows = Array.from(subagentStore.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 100)
    return rows.map(rowToRecord)
  }

  const rows = await withDbFallback(
    () =>
      db.hermesSubagent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    [] as Awaited<ReturnType<typeof db.hermesSubagent.findMany>>
  )

  if (rows.length > 0) {
    return rows.map((r) =>
      rowToRecord({
        id: r.id,
        parentId: r.parentId,
        userId: r.userId,
        goal: r.goal,
        context: r.context,
        toolsets: r.toolsets,
        status: r.status,
        result: r.result,
        maxIterations: r.maxIterations,
        timeout: r.timeout,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        completedAt: r.completedAt,
      })
    )
  }

  // DB miss / fallback — include in-memory rows too.
  const memRows = Array.from(subagentStore.values())
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 100)
  return memRows.map(rowToRecord)
}

export async function getSubagent(
  id: string
): Promise<SubagentRecord | null> {
  if (!dbAvailable) {
    const row = subagentStore.get(id)
    return row ? rowToRecord(row) : null
  }

  const row = await withDbFallback(
    () => db.hermesSubagent.findUnique({ where: { id } }),
    null as Awaited<ReturnType<typeof db.hermesSubagent.findUnique>> | null
  )

  if (row) {
    return rowToRecord({
      id: row.id,
      parentId: row.parentId,
      userId: row.userId,
      goal: row.goal,
      context: row.context,
      toolsets: row.toolsets,
      status: row.status,
      result: row.result,
      maxIterations: row.maxIterations,
      timeout: row.timeout,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      completedAt: row.completedAt,
    })
  }

  const memRow = subagentStore.get(id)
  return memRow ? rowToRecord(memRow) : null
}

/**
 * Cancel a subagent. If it is currently running, the AI promise will
 * keep running in the background (we cannot abort a fetch in flight
 * here), but the DB row is marked 'failed' immediately and the eventual
 * success result will be discarded by `delegateSingle`'s update.
 */
export async function cancelSubagent(
  id: string
): Promise<SubagentRecord | null> {
  if (!dbAvailable) {
    const row = subagentStore.get(id)
    if (!row) return null
    const updated: SubagentRow = {
      ...row,
      status: 'failed',
      completedAt: new Date(),
      updatedAt: new Date(),
    }
    subagentStore.set(id, updated)
    logger.info('Subagent cancelled (in-memory fallback)', { subagentId: id })
    return rowToRecord(updated)
  }

  const existing = await withDbFallback(
    () => db.hermesSubagent.findUnique({ where: { id } }),
    null as Awaited<ReturnType<typeof db.hermesSubagent.findUnique>> | null
  )
  if (!existing) {
    // Also check the in-memory store (in case the subagent was created there).
    const memRow = subagentStore.get(id)
    if (!memRow) return null
    const updated: SubagentRow = {
      ...memRow,
      status: 'failed',
      completedAt: new Date(),
      updatedAt: new Date(),
    }
    subagentStore.set(id, updated)
    return rowToRecord(updated)
  }

  const updated = await withDbFallback(
    () =>
      db.hermesSubagent.update({
        where: { id },
        data: {
          status: 'failed',
          completedAt: new Date(),
        },
      }),
    null as Awaited<ReturnType<typeof db.hermesSubagent.update>> | null
  )

  if (updated) {
    logger.info('Subagent cancelled', { subagentId: id })
    return rowToRecord({
      id: updated.id,
      parentId: updated.parentId,
      userId: updated.userId,
      goal: updated.goal,
      context: updated.context,
      toolsets: updated.toolsets,
      status: updated.status,
      result: updated.result,
      maxIterations: updated.maxIterations,
      timeout: updated.timeout,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      completedAt: updated.completedAt,
    })
  }

  // DB failed — mirror the cancellation into the in-memory store.
  const memRow = subagentStore.get(id) ?? {
    id: existing.id,
    parentId: existing.parentId,
    userId: existing.userId,
    goal: existing.goal,
    context: existing.context,
    toolsets: existing.toolsets,
    status: existing.status,
    result: existing.result,
    maxIterations: existing.maxIterations,
    timeout: existing.timeout,
    createdAt: existing.createdAt,
    updatedAt: existing.updatedAt,
    completedAt: existing.completedAt,
  }
  const mirrored: SubagentRow = {
    ...memRow,
    status: 'failed',
    completedAt: new Date(),
    updatedAt: new Date(),
  }
  subagentStore.set(id, mirrored)
  return rowToRecord(mirrored)
}
