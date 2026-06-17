import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommandPalette } from './command-palette'
import { useAppStore } from '@/store/app-store'

// Stub global fetch — the command palette fires /api/search for queries >= 2 chars
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

// Stub sonner.toast.success so we don't depend on portal rendering of toasts
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// jsdom doesn't implement scrollIntoView — Radix calls it when bringing the
// active list item into view during keyboard navigation.
Element.prototype.scrollIntoView = vi.fn()

function resetStore() {
  useAppStore.setState({
    commandPaletteOpen: false,
    recentPages: [],
    pageVisitCounts: {},
    activePage: 'dashboard',
  })
}

describe('CommandPalette', () => {
  beforeEach(() => {
    resetStore()
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response)
  })

  afterEach(() => {
    resetStore()
  })

  describe('rendering', () => {
    it('does not render the dialog when closed', () => {
      render(<CommandPalette />)
      expect(screen.queryByPlaceholderText(/search pages, actions/i)).not.toBeInTheDocument()
    })

    it('renders the search input when open', () => {
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)
      expect(
        screen.getByPlaceholderText(/search pages, actions, or type a command/i)
      ).toBeInTheDocument()
    })

    it('shows the "Quick Actions" header when there are no recent pages and no query', () => {
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)
      expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument()
    })

    it('renders quick action items when open with empty query', () => {
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)
      // A few quick actions should be visible
      expect(screen.getByText(/Toggle dark mode/i)).toBeInTheDocument()
      expect(screen.getByText(/Create new affiliate link/i)).toBeInTheDocument()
      expect(screen.getByText(/Ask HERMES AI/i)).toBeInTheDocument()
    })
  })

  describe('search filtering', () => {
    it('filters results based on the query', async () => {
      const user = userEvent.setup()
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)

      const input = screen.getByPlaceholderText(/search pages, actions/i)
      await user.type(input, 'trend')

      // Should show the Trend Spy nav item
      expect(await screen.findByText('Trend Spy')).toBeInTheDocument()
      // Should NOT show unrelated actions like "Create new affiliate link"
      expect(screen.queryByText(/Create new affiliate link/i)).not.toBeInTheDocument()
    })

    it('filters nav items by label match', async () => {
      const user = userEvent.setup()
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)

      const input = screen.getByPlaceholderText(/search pages, actions/i)
      await user.type(input, 'earnings')

      expect(await screen.findByText('Earnings')).toBeInTheDocument()
    })

    it('shows a "No results" message for unmatched queries', async () => {
      const user = userEvent.setup()
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)

      const input = screen.getByPlaceholderText(/search pages, actions/i)
      await user.type(input, 'zzznotfoundzzz')

      expect(await screen.findByText(/No results for/i)).toBeInTheDocument()
    })

    it('triggers a fetch to /api/search when query length >= 2', async () => {
      const user = userEvent.setup()
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)

      const input = screen.getByPlaceholderText(/search pages, actions/i)
      await user.type(input, 'keyboard')

      // The command palette debounces the search by 250ms — wait for it to fire
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('/api/search?q=keyboard')
        )
      })
    })

    it('does not trigger /api/search for single-character queries', async () => {
      const user = userEvent.setup()
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)

      const input = screen.getByPlaceholderText(/search pages, actions/i)
      await user.type(input, 'k')

      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe('keyboard navigation', () => {
    it('ArrowDown moves the active index forward', async () => {
      const user = userEvent.setup()
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)

      const input = screen.getByPlaceholderText(/search pages, actions/i)

      // The first quick action should be active by default
      const buttons = screen.getAllByRole('button')
      // Filter to result item buttons (they have data-idx attribute)
      const resultButtons = buttons.filter((b) => b.hasAttribute('data-idx'))
      expect(resultButtons.length).toBeGreaterThan(0)

      // Press ArrowDown — should highlight the second item
      await user.type(input, '{ArrowDown}')

      // The first item had bg-accent + ring-1 ring-shopee/30 when active;
      // after ArrowDown, the second item should have those classes instead.
      expect(resultButtons[1].className).toContain('bg-accent')
    })

    it('ArrowUp moves the active index backward and clamps at 0', async () => {
      const user = userEvent.setup()
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)

      const input = screen.getByPlaceholderText(/search pages, actions/i)
      const resultButtons = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-idx'))

      // Press ArrowDown to move to index 1, then ArrowUp to go back to 0
      await user.type(input, '{ArrowDown}')
      await user.type(input, '{ArrowUp}')

      expect(resultButtons[0].className).toContain('bg-accent')
    })

    it('Enter selects the active item and closes the palette', async () => {
      const user = userEvent.setup()
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)

      const input = screen.getByPlaceholderText(/search pages, actions/i)
      await user.type(input, '{Enter}')

      // After selecting, the palette should be closed
      expect(useAppStore.getState().commandPaletteOpen).toBe(false)
    })
  })

  describe('recent pages', () => {
    it('shows the "Recently Visited" header when recentPages is non-empty', () => {
      useAppStore.setState({
        commandPaletteOpen: true,
        recentPages: ['products', 'links'],
      })
      render(<CommandPalette />)
      // Use exact case-sensitive match — the recent item descriptions
      // are lowercase "Recently visited", which would otherwise collide.
      expect(screen.getByText('Recently Visited')).toBeInTheDocument()
    })

    it('renders the recent page labels', () => {
      useAppStore.setState({
        commandPaletteOpen: true,
        recentPages: ['products', 'links'],
      })
      render(<CommandPalette />)
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('Affiliate Links')).toBeInTheDocument()
    })

    it('shows the "Clear" button when recentPages is non-empty', () => {
      useAppStore.setState({
        commandPaletteOpen: true,
        recentPages: ['products'],
      })
      render(<CommandPalette />)
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('clears recent pages when the Clear button is clicked', async () => {
      const user = userEvent.setup()
      useAppStore.setState({
        commandPaletteOpen: true,
        recentPages: ['products', 'links', 'campaigns'],
      })
      render(<CommandPalette />)

      const clearBtn = screen.getByRole('button', { name: /clear/i })
      await user.click(clearBtn)

      expect(useAppStore.getState().recentPages).toEqual([])
    })

    it('does not show the Clear button when recentPages is empty', () => {
      useAppStore.setState({ commandPaletteOpen: true, recentPages: [] })
      render(<CommandPalette />)
      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    })
  })

  describe('selecting an item', () => {
    it('sets the active page when a page-type item is clicked', async () => {
      const user = userEvent.setup()
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)

      // Type a query that matches the Products page, then click the result
      const input = screen.getByPlaceholderText(/search pages, actions/i)
      await user.type(input, 'products')
      const result = await screen.findByText('Products')
      await user.click(result)

      expect(useAppStore.getState().activePage).toBe('products')
      expect(useAppStore.getState().commandPaletteOpen).toBe(false)
    })
  })

  describe('dialog footer', () => {
    it('renders the navigate / select / cycle footer hints', () => {
      useAppStore.setState({ commandPaletteOpen: true })
      render(<CommandPalette />)
      // The dialog renders to a portal in document.body, so use `screen`.
      expect(screen.getByText('Navigate')).toBeInTheDocument()
      expect(screen.getByText('Select')).toBeInTheDocument()
    })
  })
})
