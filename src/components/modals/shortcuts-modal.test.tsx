import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShortcutsModal } from './shortcuts-modal'
import { useAppStore } from '@/store/app-store'

// jsdom doesn't implement scrollIntoView — Radix calls it during dialog mount.
Element.prototype.scrollIntoView = vi.fn()

function resetStore() {
  useAppStore.setState({
    shortcutsOpen: false,
  })
}

describe('ShortcutsModal', () => {
  beforeEach(() => {
    resetStore()
  })

  afterEach(() => {
    resetStore()
  })

  describe('rendering', () => {
    it('does not render when closed', () => {
      render(<ShortcutsModal />)
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
      expect(screen.queryByText('Quick Actions')).not.toBeInTheDocument()
    })

    it('renders the modal title when open', () => {
      useAppStore.setState({ shortcutsOpen: true })
      render(<ShortcutsModal />)
      // Visible banner h2 "Keyboard Shortcuts"
      const headings = screen.getAllByRole('heading', { level: 2, name: /Keyboard Shortcuts/i })
      expect(headings.length).toBeGreaterThan(0)
    })

    it('renders all 4 shortcut group categories', () => {
      useAppStore.setState({ shortcutsOpen: true })
      render(<ShortcutsModal />)
      // Group titles are rendered as <h3> elements.
      expect(screen.getByRole('heading', { level: 3, name: 'Navigation' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: 'Quick Actions' })).toBeInTheDocument()
      // "Command Palette" appears both as a group title (h3) and as a
      // Global-group shortcut label, so scope to the heading role.
      expect(screen.getByRole('heading', { level: 3, name: 'Command Palette' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: 'Global' })).toBeInTheDocument()
    })
  })

  describe('shortcut counts', () => {
    it('renders the correct number of total shortcuts in the footer', () => {
      useAppStore.setState({ shortcutsOpen: true })
      render(<ShortcutsModal />)
      // 12 (Navigation) + 5 (Quick Actions) + 4 (Command Palette) + 2 (Global) = 23
      expect(screen.getByText(/23 shortcuts available/i)).toBeInTheDocument()
    })

    it('shows a count badge next to each category', () => {
      useAppStore.setState({ shortcutsOpen: true })
      render(<ShortcutsModal />)
      // Navigation group has a badge with "12"
      expect(screen.getByText('12')).toBeInTheDocument()
      // Quick Actions group has a badge with "5"
      expect(screen.getByText('5')).toBeInTheDocument()
      // Command Palette group has a badge with "4"
      expect(screen.getByText('4')).toBeInTheDocument()
      // Global group has a badge with "2"
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('renders specific Navigation shortcuts', () => {
      useAppStore.setState({ shortcutsOpen: true })
      render(<ShortcutsModal />)
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Go to Products')).toBeInTheDocument()
      expect(screen.getByText('Go to Affiliate Links')).toBeInTheDocument()
      expect(screen.getByText('Go to Analytics')).toBeInTheDocument()
      expect(screen.getByText('Go to Earnings')).toBeInTheDocument()
      expect(screen.getByText('Go to Settings')).toBeInTheDocument()
    })

    it('renders specific Quick Actions shortcuts', () => {
      useAppStore.setState({ shortcutsOpen: true })
      render(<ShortcutsModal />)
      expect(screen.getByText('Open Command Palette')).toBeInTheDocument()
      expect(screen.getByText('Focus Header Search')).toBeInTheDocument()
      expect(screen.getByText('Toggle Sidebar')).toBeInTheDocument()
      expect(screen.getByText('Focus Mode')).toBeInTheDocument()
      expect(screen.getByText('Show this cheat sheet')).toBeInTheDocument()
    })

    it('renders Command Palette shortcuts', () => {
      useAppStore.setState({ shortcutsOpen: true })
      render(<ShortcutsModal />)
      expect(screen.getByText('Navigate results')).toBeInTheDocument()
      expect(screen.getByText('Select result')).toBeInTheDocument()
      expect(screen.getByText('Cycle results')).toBeInTheDocument()
      expect(screen.getByText('Close palette')).toBeInTheDocument()
    })
  })

  describe('close button', () => {
    it('renders the "Got it" close button', () => {
      useAppStore.setState({ shortcutsOpen: true })
      render(<ShortcutsModal />)
      expect(screen.getByRole('button', { name: /Got it/i })).toBeInTheDocument()
    })

    it('closes the modal when "Got it" is clicked', async () => {
      const user = userEvent.setup()
      useAppStore.setState({ shortcutsOpen: true })
      render(<ShortcutsModal />)

      const closeBtn = screen.getByRole('button', { name: /Got it/i })
      await user.click(closeBtn)

      expect(useAppStore.getState().shortcutsOpen).toBe(false)
    })

    it('closes the modal when the dialog X button is clicked', async () => {
      const user = userEvent.setup()
      useAppStore.setState({ shortcutsOpen: true })
      render(<ShortcutsModal />)

      // Radix Dialog renders a "Close" button labelled "Close" (sr-only text)
      const closeX = screen.getByRole('button', { name: /close/i })
      await user.click(closeX)

      expect(useAppStore.getState().shortcutsOpen).toBe(false)
    })
  })
})
