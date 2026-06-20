import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

/**
 * Mock framer-motion so the MagicCard's motion.div entrance animation
 * is short-circuited to a plain <div>. This lets us assert on the
 * rendered DOM without depending on rAF timing.
 */
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

const { MagicCard } = await import('./magic-card')

describe('MagicCard', () => {
  describe('children rendering', () => {
    it('renders its children', () => {
      render(<MagicCard>Card content</MagicCard>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      render(
        <MagicCard>
          <span>Title</span>
          <span>Body</span>
        </MagicCard>
      )
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Body')).toBeInTheDocument()
    })
  })

  describe('glow prop', () => {
    it('applies the shopee glow class when glow="shopee"', () => {
      const { container } = render(<MagicCard glow="shopee">Glow</MagicCard>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).toContain('shadow-[0_0_20px_rgba(238,77,45,0.15)]')
    })

    it('applies the hermes glow class when glow="hermes"', () => {
      const { container } = render(<MagicCard glow="hermes">Glow</MagicCard>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).toContain('shadow-[0_0_20px_rgba(139,92,246,0.15)]')
    })

    it('applies the success glow class when glow="success"', () => {
      const { container } = render(<MagicCard glow="success">Glow</MagicCard>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).toContain('shadow-[0_0_20px_rgba(34,197,94,0.15)]')
    })

    it('does not apply any glow class when glow="none"', () => {
      const { container } = render(<MagicCard glow="none">NoGlow</MagicCard>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).not.toContain('shadow-[0_0_20px_rgba')
    })

    it('defaults to no glow when the glow prop is omitted', () => {
      const { container } = render(<MagicCard>Default</MagicCard>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).not.toContain('shadow-[0_0_20px_rgba')
    })
  })

  describe('hover prop', () => {
    it('applies the lift hover class by default', () => {
      const { container } = render(<MagicCard>Hover</MagicCard>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).toContain('hover:-translate-y-1')
      expect(card?.className).toContain('hover:shadow-lg')
    })

    it('applies the tilt hover class when hover="tilt"', () => {
      const { container } = render(<MagicCard hover="tilt">Tilt</MagicCard>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).toContain('hover:[transform:perspective')
    })

    it('applies the glow hover class when hover="glow"', () => {
      const { container } = render(<MagicCard hover="glow">GlowHover</MagicCard>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).toContain('hover:shadow-[0_0_30px_rgba(238,77,45,0.2)]')
    })

    it('applies no hover class when hover="none"', () => {
      const { container } = render(<MagicCard hover="none">NoHover</MagicCard>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).not.toContain('hover:-translate-y-1')
      expect(card?.className).not.toContain('hover:[transform:perspective')
      expect(card?.className).not.toContain('hover:shadow-[0_0_30px')
    })
  })
})
