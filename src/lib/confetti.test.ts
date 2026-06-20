import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Tests for the confetti helpers. `canvas-confetti` is mocked so we can
 * assert on the call count without firing real browser animations.
 *
 * `celebrateSale()` uses `setTimeout` (150ms / 300ms) and a `requestAnimationFrame`
 * loop bounded by `Date.now() < end` (end = now + 800ms). We use fake timers
 * and stub `requestAnimationFrame` to a no-op so the loop terminates after its
 * first synchronous invocation.
 */
const confettiMock = vi.fn()
vi.mock('canvas-confetti', () => ({
  default: confettiMock,
}))

describe('confetti', () => {
  beforeEach(() => {
    confettiMock.mockClear()
    vi.useFakeTimers()
    // Stub rAF to no-op so the frame loop inside celebrateSale() terminates
    // after the initial IIFE call rather than recursing until Date.now() >= end.
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 0)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('celebrateSale()', () => {
    it('calls confetti multiple times (initial burst + frame IIFE + delayed bursts)', async () => {
      const { celebrateSale } = await import('./confetti')
      celebrateSale()

      // Synchronous portion: 1 initial burst + 2 calls inside the IIFE frame.
      expect(confettiMock.mock.calls.length).toBeGreaterThanOrEqual(3)

      // Advance past the two setTimeout bursts (150ms + 300ms).
      vi.advanceTimersByTime(400)
      expect(confettiMock.mock.calls.length).toBeGreaterThanOrEqual(5)
    })

    it('passes brand-coloured palette to confetti (shopee orange, hermes purple, success green)', async () => {
      const { celebrateSale } = await import('./confetti')
      celebrateSale()

      // The first confetti call should include the brand colour palette.
      const firstCallArgs = confettiMock.mock.calls[0]?.[0] as
        | { colors?: string[] }
        | undefined
      expect(firstCallArgs?.colors).toEqual(
        expect.arrayContaining(['#ee4d2d', '#8b5cf6', '#22c55e'])
      )
    })
  })

  describe('celebrateAchievement()', () => {
    it('calls confetti exactly once', async () => {
      const { celebrateAchievement } = await import('./confetti')
      celebrateAchievement()
      expect(confettiMock).toHaveBeenCalledTimes(1)
    })

    it('uses a centered origin for the achievement burst', async () => {
      const { celebrateAchievement } = await import('./confetti')
      celebrateAchievement()
      const args = confettiMock.mock.calls[0]?.[0] as
        | { origin?: { y?: number } }
        | undefined
      expect(args?.origin?.y).toBe(0.5)
    })
  })
})
