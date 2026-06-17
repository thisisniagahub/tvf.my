import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  describe('rendering', () => {
    it('renders its children', () => {
      render(<Button>Click me</Button>)
      expect(
        screen.getByRole('button', { name: /click me/i })
      ).toBeInTheDocument()
    })

    it('renders as a <button> element by default', () => {
      render(<Button>Default</Button>)
      const btn = screen.getByRole('button', { name: /default/i })
      expect(btn.tagName).toBe('BUTTON')
    })

    it('has a data-slot="button" attribute', () => {
      render(<Button>Slotted</Button>)
      const btn = screen.getByRole('button', { name: /slotted/i })
      expect(btn).toHaveAttribute('data-slot', 'button')
    })
  })

  describe('variants', () => {
    const variants = [
      'default',
      'destructive',
      'outline',
      'secondary',
      'ghost',
      'link',
    ] as const

    it.each(variants)('renders the "%s" variant without crashing', (variant) => {
      render(<Button variant={variant}>Variant {variant}</Button>)
      const btn = screen.getByRole('button', { name: new RegExp(variant, 'i') })
      expect(btn).toBeInTheDocument()
      expect(btn.className).toContain('inline-flex')
    })

    it('applies primary background classes for the default variant', () => {
      render(<Button variant="default">Default</Button>)
      const btn = screen.getByRole('button', { name: /default/i })
      expect(btn.className).toContain('bg-primary')
      expect(btn.className).toContain('text-primary-foreground')
    })

    it('applies destructive background classes for the destructive variant', () => {
      render(<Button variant="destructive">Destroy</Button>)
      const btn = screen.getByRole('button', { name: /destroy/i })
      expect(btn.className).toContain('bg-destructive')
    })

    it('applies border classes for the outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      const btn = screen.getByRole('button', { name: /outline/i })
      expect(btn.className).toContain('border')
      expect(btn.className).toContain('bg-background')
    })

    it('applies secondary background classes for the secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const btn = screen.getByRole('button', { name: /secondary/i })
      expect(btn.className).toContain('bg-secondary')
      expect(btn.className).toContain('text-secondary-foreground')
    })

    it('applies hover-only classes for the ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const btn = screen.getByRole('button', { name: /ghost/i })
      expect(btn.className).toContain('hover:bg-accent')
    })

    it('applies underline classes for the link variant', () => {
      render(<Button variant="link">Link</Button>)
      const btn = screen.getByRole('button', { name: /link/i })
      expect(btn.className).toContain('underline-offset-4')
      expect(btn.className).toContain('hover:underline')
    })
  })

  describe('sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const

    it.each(sizes)('renders the "%s" size without crashing', (size) => {
      render(<Button size={size}>Size {size}</Button>)
      const btn = screen.getByRole('button', { name: new RegExp(`size ${size}`, 'i') })
      expect(btn).toBeInTheDocument()
    })

    it('applies default size height class', () => {
      render(<Button size="default">Default Size</Button>)
      const btn = screen.getByRole('button', { name: /default size/i })
      expect(btn.className).toContain('h-9')
      expect(btn.className).toContain('px-4')
    })

    it('applies sm size height class', () => {
      render(<Button size="sm">Small</Button>)
      const btn = screen.getByRole('button', { name: /small/i })
      expect(btn.className).toContain('h-8')
      expect(btn.className).toContain('px-3')
    })

    it('applies lg size height class', () => {
      render(<Button size="lg">Large</Button>)
      const btn = screen.getByRole('button', { name: /large/i })
      expect(btn.className).toContain('h-10')
      expect(btn.className).toContain('px-6')
    })

    it('applies icon size square class', () => {
      render(<Button size="icon" aria-label="icon-btn">X</Button>)
      const btn = screen.getByRole('button', { name: /icon-btn/i })
      expect(btn.className).toContain('size-9')
    })
  })

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(<Button onClick={onClick}>Click</Button>)
      await user.click(screen.getByRole('button', { name: /click/i }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(
        <Button onClick={onClick} disabled>
          Disabled
        </Button>
      )
      const btn = screen.getByRole('button', { name: /disabled/i })
      expect(btn).toBeDisabled()
      await user.click(btn)
      expect(onClick).not.toHaveBeenCalled()
    })

    it('applies disabled styling when disabled', () => {
      render(<Button disabled>Disabled</Button>)
      const btn = screen.getByRole('button', { name: /disabled/i })
      expect(btn).toBeDisabled()
      expect(btn.className).toContain('disabled:opacity-50')
    })
  })

  describe('asChild prop', () => {
    it('renders as a child <a> element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/somewhere">Link Button</a>
        </Button>
      )
      // role=link is the default for <a href="...">
      const link = screen.getByRole('link', { name: /link button/i })
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', '/somewhere')
      // No <button> element should be rendered
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('preserves button variant classes when asChild is true', () => {
      render(
        <Button asChild variant="destructive">
          <a href="/x">Destructive Link</a>
        </Button>
      )
      const link = screen.getByRole('link', { name: /destructive link/i })
      expect(link.className).toContain('bg-destructive')
      expect(link).toHaveAttribute('data-slot', 'button')
    })

    it('forwards onClick through asChild to the child element', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(
        <Button asChild onClick={onClick}>
          <a href="/y">Click Link</a>
        </Button>
      )
      await user.click(screen.getByRole('link', { name: /click link/i }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('custom props', () => {
    it('passes through arbitrary HTML attributes like type and aria-label', () => {
      render(
        <Button type="submit" aria-label="submit-form">
          Submit
        </Button>
      )
      const btn = screen.getByRole('button', { name: /submit-form/i })
      expect(btn).toHaveAttribute('type', 'submit')
    })

    it('merges custom className with variant classes', () => {
      render(<Button className="my-custom-class">Custom</Button>)
      const btn = screen.getByRole('button', { name: /custom/i })
      expect(btn.className).toContain('my-custom-class')
      expect(btn.className).toContain('bg-primary')
    })
  })
})
