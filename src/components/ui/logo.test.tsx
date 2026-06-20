import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

/**
 * Mock next/image so we can assert on the rendered <img>'s src attribute
 * without Next's image optimizer kicking in.
 */
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    className,
    width,
    height,
  }: {
    src: string
    alt: string
    className?: string
    width?: number
    height?: number
  }) => <img src={src} alt={alt} className={className} width={width} height={height} />,
}))

const { Logo } = await import('./logo')

describe('Logo', () => {
  describe('image rendering', () => {
    it('renders an image with the correct src', () => {
      const { container } = render(<Logo />)
      const img = container.querySelector('img')
      expect(img).not.toBeNull()
      expect(img).toHaveAttribute('src', '/logo.png')
    })

    it('uses an accessible alt text', () => {
      render(<Logo />)
      const img = screen.getByRole('img', { name: /theviralfinds logo/i })
      expect(img).toBeInTheDocument()
    })
  })

  describe('showText prop', () => {
    it('renders the wordmark text when showText=true', () => {
      render(<Logo showText={true} />)
      expect(screen.getByText('The')).toBeInTheDocument()
      expect(screen.getByText('Viral')).toBeInTheDocument()
      expect(screen.getByText('Finds')).toBeInTheDocument()
    })

    it('hides the wordmark text when showText=false', () => {
      render(<Logo showText={false} />)
      expect(screen.queryByText('The')).not.toBeInTheDocument()
      expect(screen.queryByText('Viral')).not.toBeInTheDocument()
      expect(screen.queryByText('Finds')).not.toBeInTheDocument()
    })

    it('defaults to showing text when showText is omitted', () => {
      render(<Logo />)
      expect(screen.getByText('The')).toBeInTheDocument()
    })
  })

  describe('size classes', () => {
    it('applies the sm size class to the image', () => {
      const { container } = render(<Logo size="sm" showText={false} />)
      const img = container.querySelector('img')
      expect(img?.className).toContain('h-7')
    })

    it('applies the md size class by default', () => {
      const { container } = render(<Logo showText={false} />)
      const img = container.querySelector('img')
      expect(img?.className).toContain('h-9')
    })

    it('applies the lg size class to the image', () => {
      const { container } = render(<Logo size="lg" showText={false} />)
      const img = container.querySelector('img')
      expect(img?.className).toContain('h-12')
    })

    it('applies the sm text size class when size="sm"', () => {
      render(<Logo size="sm" />)
      // "The" span inherits the text-sm class via the parent <span>
      const textSpan = screen.getByText('The').parentElement
      expect(textSpan?.className).toContain('text-sm')
    })

    it('applies the lg text size class when size="lg"', () => {
      render(<Logo size="lg" />)
      const textSpan = screen.getByText('The').parentElement
      expect(textSpan?.className).toContain('text-xl')
    })
  })
})
