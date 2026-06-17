'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
}

/**
 * AnimatedNumber — smoothly counts up from 0 to `value` when scrolled into view.
 * Uses framer-motion's `animate` for a buttery spring/ease animation.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 1.2,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [inView, value, duration])

  // Fallback: if inView never triggers (e.g. element already visible on mount),
  // set the final value after a short delay to avoid showing 0 forever
  useEffect(() => {
    if (inView) return
    const t = setTimeout(() => {
      setDisplay(value)
    }, 300)
    return () => clearTimeout(t)
  }, [inView, value])

  const formatted = format
    ? format(display)
    : display.toLocaleString('en-MY', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
