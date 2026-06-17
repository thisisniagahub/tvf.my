/**
 * Agent v2 — Job Registry
 * -----------------------
 * In-memory registry of running VLA-loop jobs. Each call to the
 * `/api/agent/execute` endpoint creates a `VlaLoop`, registers it
 * here under a unique `jobId`, and starts it in the background.
 *
 * The `/api/agent/stop` endpoint looks the job up by id and calls
 * `loop.stop()` for a graceful shutdown after the current iteration.
 *
 * This is intentionally a process-local Map. For multi-instance
 * deployments, swap in a Redis-backed registry — the public API is
 * stable.
 */

import { randomUUID } from 'crypto'
import { VlaLoop, type VlaLoopConfig } from './vla-loop'

export interface AgentJob {
  id: string
  taskId: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  startedAt: string
  endedAt?: string
  /** Final summary message from the loop (success or failure). */
  result?: string
  error?: string
  iterations: number
  /** Captured log lines for the UI console. */
  logs: Array<{ level: 'info' | 'warn' | 'error' | 'success'; message: string; ts: string }>
  loop: VlaLoop
}

class JobRegistry {
  private jobs = new Map<string, AgentJob>()

  /**
   * Create + register a new job, kick off the VLA loop in the
   * background (non-blocking), and return the job id immediately.
   */
  start(config: VlaLoopConfig): string {
    const jobId = `job-${randomUUID()}`
    const job: AgentJob = {
      id: jobId,
      taskId: config.taskId,
      status: 'running',
      startedAt: new Date().toISOString(),
      iterations: 0,
      logs: [],
      loop: new VlaLoop(config),
    }

    // Wire loop callbacks into the job record so the API can poll
    // status without subscribing to a stream.
    const augmented: VlaLoopConfig = {
      ...config,
      onLog: (level, message) => {
        job.logs.push({ level, message, ts: new Date().toISOString() })
        // Cap the log buffer to prevent unbounded growth.
        if (job.logs.length > 200) job.logs.shift()
        config.onLog?.(level, message)
      },
      onComplete: (result) => {
        job.status = 'completed'
        job.endedAt = new Date().toISOString()
        job.result = result
        config.onComplete?.(result)
      },
      onError: (error) => {
        job.status = 'failed'
        job.endedAt = new Date().toISOString()
        job.error = error
        config.onError?.(error)
      },
    }
    // Re-create the loop with augmented callbacks.
    job.loop = new VlaLoop(augmented)

    this.jobs.set(jobId, job)

    // Fire-and-forget — the registry tracks lifecycle via callbacks.
    void job.loop.run().then(() => {
      if (job.status === 'running') {
        // Loop exited without onComplete/onError firing — mark stopped.
        job.status = 'stopped'
        job.endedAt = new Date().toISOString()
      }
      // Auto-evict completed jobs older than 1 hour to bound memory.
      setTimeout(() => this.jobs.delete(jobId), 60 * 60 * 1000)
    })

    return jobId
  }

  /** Look up a job by id. Returns `undefined` if not found. */
  get(jobId: string): AgentJob | undefined {
    return this.jobs.get(jobId)
  }

  /** Request graceful stop. Returns true if the job existed. */
  stop(jobId: string): boolean {
    const job = this.jobs.get(jobId)
    if (!job) return false
    job.loop.stop()
    job.status = 'stopped'
    job.endedAt = new Date().toISOString()
    return true
  }

  /** List all jobs (most recent first). */
  list(): AgentJob[] {
    return Array.from(this.jobs.values()).sort((a, b) =>
      b.startedAt.localeCompare(a.startedAt)
    )
  }

  /** Internal: remove a job (used by tests / cleanup). */
  delete(jobId: string): void {
    this.jobs.delete(jobId)
  }
}

/** Singleton shared across the server runtime. */
export const jobRegistry = new JobRegistry()

/**
 * Public-safe projection of a job (no VlaLoop instance, no internal
 * callbacks). Used by API responses.
 */
export function serializeJob(job: AgentJob) {
  return {
    id: job.id,
    taskId: job.taskId,
    status: job.status,
    startedAt: job.startedAt,
    endedAt: job.endedAt,
    iterations: job.loop.iterationCount,
    result: job.result,
    error: job.error,
    logs: job.logs,
  }
}
