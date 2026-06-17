import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { AGENT_TASKS } from '@/lib/agent-v2/task-definitions'

/**
 * Agent v2 — Task Catalog (P6-4)
 *
 * GET /api/agent/tasks
 *   Returns the full catalog of curated agent tasks (data-sync,
 *   trend-spy, content-deploy). Read-only and cheap, so it's
 *   rate-limited at the standard API tier.
 *
 * This is the canonical P6-4 surface. The task catalog is sourced
 * from `AGENT_TASKS` in `src/lib/agent-v2/task-definitions.ts`.
 */

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'agent-tasks')
  if (limited) return limited

  try {
    logger.info('Agent task catalog requested', {
      count: AGENT_TASKS.length,
    })

    return NextResponse.json({
      tasks: AGENT_TASKS,
      total: AGENT_TASKS.length,
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Agent tasks list',
      'Failed to list agent tasks'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
