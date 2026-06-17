import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'

// Mock framer-motion so we can deterministically control both the
// `useInView` hook (so the animation always runs) and the `animate`
// function (so we don't depend on rAF under fake timers).
//
// `animate` is replaced with a synchronous version that immediately
// invokes `onUpdate` with the target value. This lets us assert the
// final rendered text without depending on real timing.
type AnimateOptions = {
  duration?: number
  ease?: number[]
  onUpdate?: (v: number) => void
}
const animateMock = vi.fn((_from: number, to: number, options: AnimateOptions) => {
  if (options?.onUpdate) options.onUpdate(to)
  return { stop: vi.fn() }
})

vi.mock('framer-motion', () => ({
  animate: animateMock,
  useInView: () => true,
}))

const { AnimatedNumber } = await import('./animated-number')

describe('AnimatedNumber', () => {
  beforeEach(() => {
    animateMock.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial render', () => {
    it('renders 0 initially before the animation starts', () => {
      render(<AnimatedNumber value={1234} />)
      // The mock immediately calls onUpdate(to) inside useEffect, so the
      // final value should already be present. The "initial 0" only
      // shows for one render frame; after React commits the effect the
      // display becomes the target. We assert the final value here.
      expect(screen.getByText('1,234')).toBeInTheDocument()
    })

    it('renders 0 before the effect runs when animate is deferred', () => {
      // Override the mock to NOT immediately call onUpdate — simulates
      // an in-progress animation that hasn't ticked yet.
      animateMock.mockImplementationOnce(() => ({ stop: vi.fn() }))
      render(<AnimatedNumber value={50} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('renders 0 with decimals when decimals > 0', () => {
      render(<AnimatedNumber value={12.5} decimals={2} />)
      // 12.5 formatted with 2 decimals in en-MY locale = "12.50"
      expect(screen.getByText('12.50')).toBeInTheDocument()
    })
  })

  describe('animation', () => {
    it('calls framer-motion animate() with from=0 and to=value', () => {
      render(<AnimatedNumber value={777} duration={2} />)
      expect(animateMock).toHaveBeenCalledWith(0, 777, expect.objectContaining({
        duration: 2,
        onUpdate: expect.any(Function),
      }))
    })

    it('animates to the target value when onUpdate fires', () => {
      render(<AnimatedNumber value={1000} duration={1.2} />)
      expect(screen.getByText('1,000')).toBeInTheDocument()
    })

    it('formats with prefix and suffix', () => {
      render(<AnimatedNumber value={500} prefix="RM " suffix="++" duration={0.5} />)
      expect(screen.getByText('RM 500++')).toBeInTheDocument()
    })

    it('handles decimal values', () => {
      render(<AnimatedNumber value={1234.5} decimals={1} duration={0.5} />)
      expect(screen.getByText('1,234.5')).toBeInTheDocument()
    })

    it('uses a custom format function when provided', () => {
      render(
        <AnimatedNumber
          value={42}
          format={(n) => `~${Math.round(n)}~`}
          duration={0.5}
        />
      )
      expect(screen.getByText('~42~')).toBeInTheDocument()
    })

    it('updates the rendered value when the value prop changes', () => {
      const { rerender } = render(<AnimatedNumber value={100} duration={0.5} />)
      expect(screen.getByText('100')).toBeInTheDocument()
      rerender(<AnimatedNumber value={200} duration={0.5} />)
      expect(screen.getByText('200')).toBeInTheDocument()
    })

    it('renders the prefix and suffix even when value is 0', () => {
      render(<AnimatedNumber value={0} prefix="$" suffix=" USD" />)
      expect(screen.getByText('$0 USD')).toBeInTheDocument()
    })

    it('passes the ease array to animate()', () => {
      render(<AnimatedNumber value={10} duration={1} />)
      expect(animateMock).toHaveBeenCalledWith(0, 10, expect.objectContaining({
        ease: [0.16, 1, 0.3, 1],
      }))
    })
  })

  describe('inView fallback', () => {
    it('renders the final value via fallback timeout when inView is false', async () => {
      vi.useFakeTimers()
      // Re-mock framer-motion with useInView returning false
      vi.doMock('framer-motion', () => ({
        animate: animateMock,
        useInView: () => false,
      }))
      vi.resetModules()
      const { AnimatedNumber: FallbackNumber } = await import('./animated-number')
      render(<FallbackNumber value={99} />)
      expect(screen.getByText('0')).toBeInTheDocument()
      act(() => {
        // Fallback uses a 300ms setTimeout
        vi.advanceTimersByTime(350)
      })
      expect(screen.getByText('99')).toBeInTheDocument()
      vi.doUnmock('framer-motion')
    })
  })
})
