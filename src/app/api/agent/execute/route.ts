import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import { validateInput, agentExecuteSchema } from '@/lib/validation'
import {
  vlaLoopService,
  type AgentAction,
} from '@/lib/agent-v2/vla-loop'
import { getTaskById } from '@/lib/agent-v2/task-definitions'
import { jobRegistry, serializeJob } from '@/lib/agent-v2/job-registry'
import type { VlaLoopConfig } from '@/lib/agent-v2/vla-loop'

/**
 * Agent V2 — Task Execute API (P6-4 unified)
 *
 * POST /api/agent/execute
 *   Body: {
 *     taskId: string,
 *     userId?: string,           // P6-3
 *     steps?: string[],          // P6-3 (override planned steps)
 *     options?: {                // P6-4 — switches to async job mode
 *       maxIterations?: number,  //   1..20
 *       timeout?: number,        //   30..300 seconds
 *     },
 *   }
 *
 * Two response modes:
 *
 *   1. P6-3 sync mode (no `options` field):
 *      Runs the single-pass VLA planner synchronously and returns
 *      the planned action sequence. Used by the agent-workspace UI
 *      to stream actions to the agent-browser mini-service via
 *      Socket.io.
 *
 *   2. P6-4 async mode (`options` field present):
 *      Starts a multi-pass VlaLoop job in the background and
 *      returns the new job id immediately (HTTP 202). The client
 *      can poll status via /api/agent/stop (or a future
 *      /api/agent/jobs/[id]).
 *
 * Rate-limited at the AI tier (10 req/min) because every call
 * triggers at least one chat completion.
 */

const DEFAULT_MAX_ITERATIONS = 10
const DEFAULT_TIMEOUT_SECONDS = 120

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.ai, 'agent-execute')
  if (limited) return limited

  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const validation = validateInput(agentExecuteSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { taskId, userId, options } = validation.data

    // ---- P6-4 async job mode ----
    if (options) {
      const task = getTaskById(taskId)
      if (!task) {
        return NextResponse.json(
          { error: `Unknown task: ${taskId}` },
          { status: 404 }
        )
      }

      const config: VlaLoopConfig = {
        taskId: task.id,
        goal: task.goal,
        maxIterations: options.maxIterations ?? DEFAULT_MAX_ITERATIONS,
        timeout: options.timeout ?? DEFAULT_TIMEOUT_SECONDS,
        userId: userId ?? 'demo-user',
      }

      const jobId = jobRegistry.start(config)
      const job = jobRegistry.get(jobId)
      if (!job) {
        // Should be impossible — we just registered it — but guard anyway.
        return NextResponse.json(
          { error: 'Failed to start agent job' },
          { status: 500 }
        )
      }

      logger.info('Agent job started (P6-4)', {
        jobId,
        taskId: task.id,
        taskName: task.name,
        maxIterations: config.maxIterations,
        timeout: config.timeout,
      })

      return NextResponse.json(
        {
          jobId,
          task: {
            id: task.id,
            name: task.name,
            category: task.category,
            riskLevel: task.riskLevel,
            requiresCredentials: task.requiresCredentials,
          },
          job: serializeJob(job),
        },
        { status: 202 }
      )
    }

    // ---- P6-3 sync planner mode ----
    const task = vlaLoopService.getTask(taskId)
    if (!task) {
      return NextResponse.json(
        { error: `Unknown task: ${taskId}` },
        { status: 404 }
      )
    }

    const plannedActions: AgentAction[] = []
    let planRaw = ''
    let execError: string | null = null

    await vlaLoopService.executeTask(taskId, {
      userId,
      onAction: (action) => {
        plannedActions.push(action)
      },
      onLog: (level, message) => {
        logger.info('VLA task log', { taskId, level, message })
      },
      onComplete: (result) => {
        planRaw = result
      },
      onError: (error) => {
        execError = error
      },
    })

    if (execError) {
      return NextResponse.json(
        { error: execError, taskId, taskName: task.name },
        { status: 500 }
      )
    }

    logger.info('Agent task executed via API (P6-3 sync)', {
      taskId,
      userId: userId ?? 'demo-user',
      actionCount: plannedActions.length,
    })

    return NextResponse.json({
      taskId,
      taskName: task.name,
      goal: task.goal,
      platforms: task.platforms,
      expectedOutput: task.expectedOutput,
      actions: plannedActions,
      plan: planRaw,
      count: plannedActions.length,
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Agent execute',
      'Failed to execute agent task'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
