import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Tests for the Web Audio notification-sound helpers.
 *
 * The module caches a single `AudioContext` in module scope and exposes
 * `playSaleChime()` / `playNotificationBlip()` which both build oscillators
 * via `ctx.createOscillator()` + `ctx.createGain()`.
 *
 * We mock `window.AudioContext` with a Vi mock constructor and reset modules
 * between tests so the singleton cache starts fresh.
 */

function createMockAudioContextInstance() {
  return {
    state: 'running' as AudioContextState,
    currentTime: 0,
    destination: {} as AudioNode,
    resume: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn().mockReturnValue({
      type: 'sine' as OscillatorType,
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }),
    createGain: vi.fn().mockReturnValue({
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }),
  }
}

describe('sounds', () => {
  let mockInstance: ReturnType<typeof createMockAudioContextInstance>
  let MockAudioContextCtor: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockInstance = createMockAudioContextInstance()
    // NOTE: must be a regular `function` (not an arrow fn) so Vitest allows
    // `new` invocation. Returning an object from a constructor replaces `this`.
    MockAudioContextCtor = vi.fn(function () {
      return mockInstance
    })
    vi.stubGlobal('AudioContext', MockAudioContextCtor)
    // Remove any leftover webkit prefix to ensure the standard path is taken.
    // @ts-expect-error — intentionally deleting optional vendor prefix
    delete window.webkitAudioContext
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  describe('playSaleChime()', () => {
    it('creates 3 oscillators (C5 / E5 / G5 arpeggio)', async () => {
      const { playSaleChime } = await import('./sounds')
      playSaleChime()
      expect(mockInstance.createOscillator).toHaveBeenCalledTimes(3)
      expect(mockInstance.createGain).toHaveBeenCalledTimes(3)
    })

    it('starts and stops each oscillator', async () => {
      const { playSaleChime } = await import('./sounds')
      playSaleChime()
      const oscCalls = mockInstance.createOscillator.mock.results
      for (const result of oscCalls) {
        expect(result.value.start).toHaveBeenCalled()
        expect(result.value.stop).toHaveBeenCalled()
      }
    })

    it('resumes the context if it is suspended', async () => {
      mockInstance.state = 'suspended'
      const { playSaleChime } = await import('./sounds')
      playSaleChime()
      expect(mockInstance.resume).toHaveBeenCalledTimes(1)
    })
  })

  describe('playNotificationBlip()', () => {
    it('creates exactly one oscillator', async () => {
      const { playNotificationBlip } = await import('./sounds')
      playNotificationBlip()
      expect(mockInstance.createOscillator).toHaveBeenCalledTimes(1)
      expect(mockInstance.createGain).toHaveBeenCalledTimes(1)
    })

    it('starts and stops the oscillator', async () => {
      const { playNotificationBlip } = await import('./sounds')
      playNotificationBlip()
      const osc = mockInstance.createOscillator.mock.results[0]?.value
      expect(osc.start).toHaveBeenCalled()
      expect(osc.stop).toHaveBeenCalled()
    })

    it('resumes the context if it is suspended', async () => {
      mockInstance.state = 'suspended'
      const { playNotificationBlip } = await import('./sounds')
      playNotificationBlip()
      expect(mockInstance.resume).toHaveBeenCalledTimes(1)
    })
  })

  describe('getAudioContext() (singleton behaviour)', () => {
    it('constructs AudioContext only once across multiple play calls', async () => {
      const { playSaleChime, playNotificationBlip } = await import('./sounds')
      playSaleChime()
      playNotificationBlip()
      playSaleChime()
      expect(MockAudioContextCtor).toHaveBeenCalledTimes(1)
    })
  })
})
