/* eslint-disable no-console */
/**
 * Structured Logger Utility
 *
 * Provides leveled logging with consistent formatting.
 * In production, only warn/error are emitted to console.
 * In development, all levels are emitted with colorized output.
 *
 * Ready for Sentry integration — call logger.error() and it will
 * be picked up by Sentry's Next.js integration automatically.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

const isProduction = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const minLevel: LogLevel = isProduction ? 'warn' : 'debug'

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const ctxStr = context ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${ctxStr}`
}

function log(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
  if (levelPriority[level] < levelPriority[minLevel]) return

  const formatted = formatMessage(level, message, context)

  switch (level) {
    case 'debug':
      if (isDev) console.debug(formatted)
      break
    case 'info':
      if (isDev) console.info(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    case 'error':
      console.error(formatted, error instanceof Error ? `\n${error.stack}` : '')
      break
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext, error?: unknown) =>
    log('error', message, context, error),
}

/**
 * API route error handler — logs the error and returns a consistent
 * NextResponse JSON error.
 */
export function handleApiError(
  error: unknown,
  context: string,
  defaultMessage: string = 'Internal server error'
): { error: string; status: number } {
  if (error instanceof Error) {
    logger.error(`${context}: ${error.message}`, { context }, error)
    return { error: defaultMessage, status: 500 }
  }
  logger.error(`${context}: Unknown error`, { context })
  return { error: defaultMessage, status: 500 }
}
