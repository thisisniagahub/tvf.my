import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger, handleApiError } from '@/lib/logger'
import {
  validateInput,
  delegateSubagentSchema,
  delegateBatchSchema,
} from '@/lib/validation'
import {
  delegateSingle,
  delegateBatch,
  getSubagents,
  type SubagentConfig,
} from '@/lib/hermes-v2/delegation-service'

/**
 * HERMES v2 Subagent Delegation API
 *
 * GET  /api/hermes/delegate?userId=<id>
 *      Lists subagents for the user (defaults to 'demo-user').
 *
 * POST /api/hermes/delegate
 *      Single-task mode:
 *        Body: { goal, context?, toolsets?, maxIterations?, timeout?, userId?, parentId? }
 *        Returns { result: DelegationResult }.
 *      Batch mode:
 *        Body: { tasks: SubagentConfig[] }
 *        Returns { results: DelegationResult[] }.
 *
 * Rate-limited at the AI tier (10 req/min) because each call triggers
 * one or more chat completions.
 */

const DEFAULT_USER_ID = 'demo-user'

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(
    request,
    RATE_LIMITS.api,
    'hermes-delegate-get'
  )
  if (limited) return limited

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || DEFAULT_USER_ID

    const subagents = await getSubagents(userId)

    return NextResponse.json({
      userId,
      subagents,
      count: subagents.length,
    })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes delegate GET',
      'Failed to fetch subagents'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(
    request,
    RATE_LIMITS.ai,
    'hermes-delegate-post'
  )
  if (limited) return limited

  try {
    const body = await request.json()

    // Detect batch mode by the presence of a `tasks` array.
    if (
      body &&
      typeof body === 'object' &&
      Array.isArray((body as { tasks?: unknown }).tasks)
    ) {
      const validation = validateInput(delegateBatchSchema, body)
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error },
          { status: validation.status }
        )
      }

      const tasks: SubagentConfig[] = validation.data.tasks.map((t) => ({
        goal: t.goal,
        context: t.context,
        toolsets: t.toolsets,
        userId: t.userId ?? DEFAULT_USER_ID,
        parentId: t.parentId,
        maxIterations: t.maxIterations,
        timeout: t.timeout,
      }))

      const results = await delegateBatch(tasks)

      logger.info('Batch delegation via API', {
        total: results.length,
        succeeded: results.filter((r) => r.success).length,
      })

      return NextResponse.json({ results }, { status: 201 })
    }

    // Single-task mode
    const validation = validateInput(delegateSubagentSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { goal, context, toolsets, maxIterations, timeout, userId, parentId } =
      validation.data

    const config: SubagentConfig = {
      goal,
      context,
      toolsets,
      userId: userId ?? DEFAULT_USER_ID,
      parentId,
      maxIterations,
      timeout,
    }

    const result = await delegateSingle(config)

    logger.info('Subagent delegated via API', {
      subagentId: result.subagent.id,
      success: result.success,
    })

    return NextResponse.json({ result }, { status: 201 })
  } catch (error) {
    const { error: msg, status } = handleApiError(
      error,
      'Hermes delegate POST',
      'Failed to delegate subagent'
    )
    return NextResponse.json({ error: msg }, { status })
  }
}
