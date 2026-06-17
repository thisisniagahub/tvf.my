import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangelogModal } from './changelog-modal'
import { useAppStore } from '@/store/app-store'

// Stub sonner so toasts don't leak across tests
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// jsdom doesn't implement scrollIntoView — Radix calls it during dialog mount.
Element.prototype.scrollIntoView = vi.fn()

function resetStore() {
  useAppStore.setState({
    changelogOpen: false,
    hasSeenChangelog: true, // prevent auto-show timer firing in tests
  })
}

describe('ChangelogModal', () => {
  beforeEach(() => {
    resetStore()
  })

  afterEach(() => {
    resetStore()
  })

  describe('rendering', () => {
    it('does not render when closed', () => {
      render(<ChangelogModal />)
      expect(screen.queryByRole('heading', { level: 2, name: /What's New/i })).not.toBeInTheDocument()
    })

    it('renders the "What\'s New" header when open', () => {
      useAppStore.setState({ changelogOpen: true })
      render(<ChangelogModal />)
      // There are two matches (sr-only DialogTitle + visible banner h2),
      // so scope to the visible <h2> heading role.
      const headings = screen.getAllByRole('heading', { level: 2, name: /What's New/i })
      expect(headings.length).toBeGreaterThan(0)
    })

    it('renders the first changelog entry title', () => {
      useAppStore.setState({ changelogOpen: true })
      render(<ChangelogModal />)
      // First entry title is "Global Search & Skeletons"
      expect(screen.getByText('Global Search & Skeletons')).toBeInTheDocument()
    })

    it('renders multiple changelog entry titles', () => {
      useAppStore.setState({ changelogOpen: true })
      render(<ChangelogModal />)
      expect(screen.getByText('Global Search & Skeletons')).toBeInTheDocument()
      expect(screen.getByText('Command Palette UX')).toBeInTheDocument()
      expect(screen.getByText('Celebrations & Micro-interactions')).toBeInTheDocument()
      expect(screen.getByText('AI Features & Live Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Full App Build')).toBeInTheDocument()
    })

    it('renders version badges for entries', () => {
      useAppStore.setState({ changelogOpen: true })
      render(<ChangelogModal />)
      // The latest badge + version text
      expect(screen.getByText('LATEST')).toBeInTheDocument()
      expect(screen.getByText('v2.4')).toBeInTheDocument()
    })

    it('renders the footer buttons', () => {
      useAppStore.setState({ changelogOpen: true })
      render(<ChangelogModal />)
      expect(screen.getByRole('button', { name: /View later/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Got it, dismiss/i })).toBeInTheDocument()
    })
  })

  describe('dismiss button', () => {
    it('marks the changelog as seen when "Got it, dismiss" is clicked', async () => {
      const user = userEvent.setup()
      useAppStore.setState({
        changelogOpen: true,
        hasSeenChangelog: false,
      })
      render(<ChangelogModal />)

      const dismissBtn = screen.getByRole('button', { name: /Got it, dismiss/i })
      await user.click(dismissBtn)

      // dismissChangelog() sets hasSeenChangelog=true and changelogOpen=false
      expect(useAppStore.getState().hasSeenChangelog).toBe(true)
      expect(useAppStore.getState().changelogOpen).toBe(false)
    })
  })

  describe('"View later" button', () => {
    it('closes the modal without marking the changelog as seen', async () => {
      const user = userEvent.setup()
      useAppStore.setState({
        changelogOpen: true,
        hasSeenChangelog: false,
      })
      render(<ChangelogModal />)

      const viewLaterBtn = screen.getByRole('button', { name: /View later/i })
      await user.click(viewLaterBtn)

      // changelogOpen=false but hasSeenChangelog should still be false
      expect(useAppStore.getState().changelogOpen).toBe(false)
      expect(useAppStore.getState().hasSeenChangelog).toBe(false)
    })
  })

  describe('auto-show on first visit', () => {
    it('auto-shows the modal after 1.5s when hasSeenChangelog is false', () => {
      vi.useFakeTimers()
      useAppStore.setState({
        changelogOpen: false,
        hasSeenChangelog: false,
      })
      render(<ChangelogModal />)
      // Initially not rendered
      expect(screen.queryAllByRole('heading', { level: 2, name: /What's New/i })).toHaveLength(0)

      // Advance past the 1.5s auto-show timer
      act(() => {
        vi.advanceTimersByTime(1600)
      })
      // The banner h2 ("What's New") plus the sr-only DialogTitle both match.
      const headings = screen.getAllByRole('heading', { level: 2, name: /What's New/i })
      expect(headings.length).toBeGreaterThan(0)
      vi.useRealTimers()
    })

    it('does not auto-show when hasSeenChangelog is true', () => {
      useAppStore.setState({
        changelogOpen: false,
        hasSeenChangelog: true,
      })
      render(<ChangelogModal />)
      expect(screen.queryByRole('heading', { level: 2, name: /What's New/i })).not.toBeInTheDocument()
    })
  })
})
