export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { AGENT_TASKS } from '@/lib/agent-v2/task-definitions'
import { requireUser } from '@/lib/auth'

/**
 * Agent v2 — Task Catalog (P6-4)
 *
 * GET /api/agent/tasks
 *   Returns the full catalog of curated agent tasks (data-sync,
 *   trend-spy, content-deploy). Read-only and cheap, so it's
 *   rate-limited at the standard API tier.
 *
 * The authenticated user is resolved server-side via `requireUser()`
 * (demo-mode fallback allowed) so the audit log records who browsed
 * the catalog. The catalog itself is shared, so the response shape is
 * identical regardless of who the caller is.
 */

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'agent-tasks')
  if (limited) return limited

  try {
    const user = await requireUser()
    logger.info('Agent task catalog requested', {
      userId: user.id,
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
