import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('logger', () => {
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  describe('in production (debug/info silent)', () => {
    beforeEach(async () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.resetModules()
    })

    it('logger.debug is silent in production', async () => {
      const { logger } = await import('./logger')
      logger.debug('debug message', { foo: 'bar' })
      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })

    it('logger.info is silent in production', async () => {
      const { logger } = await import('./logger')
      logger.info('info message')
      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })

    it('logger.warn always emits in production', async () => {
      const { logger } = await import('./logger')
      logger.warn('warn message')
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      const firstArg = String(consoleWarnSpy.mock.calls[0]?.[0])
      expect(firstArg).toContain('WARN')
      expect(firstArg).toContain('warn message')
    })

    it('logger.error always emits in production', async () => {
      const { logger } = await import('./logger')
      logger.error('error message')
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      const firstArg = String(consoleErrorSpy.mock.calls[0]?.[0])
      expect(firstArg).toContain('ERROR')
      expect(firstArg).toContain('error message')
    })

    it('logger.error includes the stack when an Error is passed', async () => {
      const { logger } = await import('./logger')
      const err = new Error('boom')
      logger.error('something failed', { route: '/api/x' }, err)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      // second argument should contain the stack trace string
      const secondArg = String(consoleErrorSpy.mock.calls[0]?.[1])
      expect(secondArg).toContain('Error: boom')
    })
  })

  describe('in development (debug/info emit)', () => {
    beforeEach(async () => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.resetModules()
    })

    it('logger.debug emits in development', async () => {
      const { logger } = await import('./logger')
      logger.debug('debug message')
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1)
    })

    it('logger.info emits in development', async () => {
      const { logger } = await import('./logger')
      logger.info('info message')
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleApiError()', () => {
    it('returns the correct shape for an Error instance', async () => {
      const { handleApiError } = await import('./logger')
      const err = new Error('boom')
      const result = handleApiError(err, 'someContext', 'Custom default')
      expect(result).toEqual({ error: 'Custom default', status: 500 })
      // error path should log to console.error
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('returns the correct shape for a non-Error value', async () => {
      const { handleApiError } = await import('./logger')
      const result = handleApiError('just a string', 'ctx')
      expect(result).toEqual({ error: 'Internal server error', status: 500 })
    })

    it('uses "Internal server error" as the default message when none is provided', async () => {
      const { handleApiError } = await import('./logger')
      const result = handleApiError(new Error('x'), 'ctx')
      expect(result.error).toBe('Internal server error')
      expect(result.status).toBe(500)
    })

    it('always returns status 500', async () => {
      const { handleApiError } = await import('./logger')
      const cases = [
        new Error('a'),
        'string',
        { random: 'object' },
        null,
        undefined,
        42,
      ]
      for (const c of cases) {
        const result = handleApiError(c, 'ctx')
        expect(result.status).toBe(500)
        expect(result).toHaveProperty('error')
        expect(typeof result.error).toBe('string')
      }
    })

    it('returns an object with exactly { error, status } keys', async () => {
      const { handleApiError } = await import('./logger')
      const result = handleApiError(new Error('x'), 'ctx')
      expect(Object.keys(result).sort()).toEqual(['error', 'status'])
    })
  })
})
