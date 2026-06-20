import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Tests for the global Zustand app store.
 *
 * The store is wrapped in `persist` middleware, so each test:
 *  1. Clears localStorage so the persist hydration layer starts clean.
 *  2. Re-imports the module fresh so the in-memory state is reset.
 *  3. Restores default state via `useAppStore.setState(...)` where needed.
 */
describe('app-store', () => {
  let useAppStore: typeof import('./app-store')['useAppStore']

  beforeEach(async () => {
    localStorage.clear()
    vi.resetModules()
    ;({ useAppStore } = await import('./app-store'))
  })

  afterEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  describe('login()', () => {
    it('sets isAuthenticated=true and populates user with defaults', () => {
      useAppStore.getState().login()
      const state = useAppStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).not.toBeNull()
      expect(state.user?.id).toBe('demo-user')
      expect(state.user?.name).toBe('TheViralFindsMY')
      expect(state.user?.email).toBe('demo@theviralfindsmy.com')
      expect(state.user?.plan).toBe('pro')
    })

    it('overrides default user fields with the provided partial', () => {
      useAppStore.getState().login({ name: 'Alice', plan: 'business' })
      const state = useAppStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user?.name).toBe('Alice')
      expect(state.user?.plan).toBe('business')
      // Untouched fields keep the default
      expect(state.user?.email).toBe('demo@theviralfindsmy.com')
    })
  })

  describe('logout()', () => {
    it('resets isAuthenticated to false and clears user', () => {
      useAppStore.getState().login()
      expect(useAppStore.getState().isAuthenticated).toBe(true)
      useAppStore.getState().logout()
      const state = useAppStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
    })

    it('resets activePage back to "dashboard"', () => {
      useAppStore.getState().login()
      useAppStore.getState().setActivePage('products')
      expect(useAppStore.getState().activePage).toBe('products')
      useAppStore.getState().logout()
      expect(useAppStore.getState().activePage).toBe('dashboard')
    })

    it('resets hasSeenOnboarding back to false', () => {
      useAppStore.getState().login()
      useAppStore.getState().completeOnboarding()
      expect(useAppStore.getState().hasSeenOnboarding).toBe(true)
      useAppStore.getState().logout()
      expect(useAppStore.getState().hasSeenOnboarding).toBe(false)
    })
  })

  describe('setActivePage()', () => {
    it('updates activePage', () => {
      useAppStore.getState().setActivePage('products')
      expect(useAppStore.getState().activePage).toBe('products')
    })

    it('prepends the new page to recentPages and dedupes', () => {
      useAppStore.getState().setActivePage('products')
      useAppStore.getState().setActivePage('analytics')
      // Visit products again — should move to front, not duplicate
      useAppStore.getState().setActivePage('products')
      const { recentPages } = useAppStore.getState()
      expect(recentPages[0]).toBe('products')
      expect(recentPages.filter((p) => p === 'products').length).toBe(1)
    })

    it('caps recentPages at 8 entries', () => {
      const pages = [
        'dashboard',
        'products',
        'links',
        'analytics',
        'calculator',
        'campaigns',
        'earnings',
        'ai-content',
        'trend-spy',
      ] as const
      for (const p of pages) useAppStore.getState().setActivePage(p)
      expect(useAppStore.getState().recentPages.length).toBeLessThanOrEqual(8)
    })

    it('increments pageVisitCounts each time a page is visited', () => {
      useAppStore.getState().setActivePage('products')
      useAppStore.getState().setActivePage('products')
      useAppStore.getState().setActivePage('products')
      expect(useAppStore.getState().pageVisitCounts['products']).toBe(3)
    })

    it('does not increment visit count for other pages', () => {
      useAppStore.getState().setActivePage('products')
      useAppStore.getState().setActivePage('analytics')
      const counts = useAppStore.getState().pageVisitCounts
      expect(counts['products']).toBe(1)
      expect(counts['analytics']).toBe(1)
      expect(counts['earnings']).toBeUndefined()
    })
  })

  describe('toggleSidebar()', () => {
    it('flips sidebarCollapsed from false to true', () => {
      expect(useAppStore.getState().sidebarCollapsed).toBe(false)
      useAppStore.getState().toggleSidebar()
      expect(useAppStore.getState().sidebarCollapsed).toBe(true)
    })

    it('flips sidebarCollapsed back to false on second call', () => {
      useAppStore.getState().toggleSidebar()
      useAppStore.getState().toggleSidebar()
      expect(useAppStore.getState().sidebarCollapsed).toBe(false)
    })
  })

  describe('togglePin()', () => {
    it('removes a page from pinnedPages if already pinned', () => {
      // 'dashboard' is pinned by default
      expect(useAppStore.getState().pinnedPages).toContain('dashboard')
      useAppStore.getState().togglePin('dashboard')
      expect(useAppStore.getState().pinnedPages).not.toContain('dashboard')
    })

    it('adds a page to pinnedPages if not already pinned', () => {
      useAppStore.getState().togglePin('analytics')
      expect(useAppStore.getState().pinnedPages).toContain('analytics')
    })

    it('does not duplicate a page when toggled twice', () => {
      useAppStore.getState().togglePin('analytics')
      useAppStore.getState().togglePin('analytics')
      expect(useAppStore.getState().pinnedPages.filter((p) => p === 'analytics').length).toBe(0)
    })
  })

  describe('clearRecentPages()', () => {
    it('empties recentPages', () => {
      useAppStore.getState().setActivePage('products')
      useAppStore.getState().setActivePage('analytics')
      expect(useAppStore.getState().recentPages.length).toBeGreaterThan(0)
      useAppStore.getState().clearRecentPages()
      expect(useAppStore.getState().recentPages).toEqual([])
    })

    it('does not affect pageVisitCounts', () => {
      useAppStore.getState().setActivePage('products')
      useAppStore.getState().setActivePage('products')
      useAppStore.getState().clearRecentPages()
      expect(useAppStore.getState().pageVisitCounts['products']).toBe(2)
    })
  })

  describe('resetAllSettings()', () => {
    it('restores sidebarCollapsed to default (false)', () => {
      useAppStore.getState().toggleSidebar()
      useAppStore.getState().resetAllSettings()
      expect(useAppStore.getState().sidebarCollapsed).toBe(false)
    })

    it('restores the default pinnedPages list', () => {
      useAppStore.getState().togglePin('dashboard')
      useAppStore.getState().togglePin('analytics')
      useAppStore.getState().resetAllSettings()
      expect(useAppStore.getState().pinnedPages).toEqual([
        'dashboard',
        'ai-content',
        'earnings',
      ])
    })

    it('clears recentPages and pageVisitCounts', () => {
      useAppStore.getState().setActivePage('products')
      useAppStore.getState().setActivePage('analytics')
      useAppStore.getState().resetAllSettings()
      expect(useAppStore.getState().recentPages).toEqual([])
      expect(useAppStore.getState().pageVisitCounts).toEqual({})
    })

    it('restores focusMode to false', () => {
      useAppStore.getState().toggleFocusMode()
      useAppStore.getState().resetAllSettings()
      expect(useAppStore.getState().focusMode).toBe(false)
    })

    it('marks onboarding/shortcuts/changelog as seen', () => {
      useAppStore.getState().resetAllSettings()
      const state = useAppStore.getState()
      expect(state.hasSeenOnboarding).toBe(true)
      expect(state.hasSeenShortcuts).toBe(true)
      expect(state.hasSeenChangelog).toBe(true)
      expect(state.changelogOpen).toBe(false)
    })

    it('resets activePage back to "dashboard"', () => {
      useAppStore.getState().setActivePage('products')
      useAppStore.getState().resetAllSettings()
      expect(useAppStore.getState().activePage).toBe('dashboard')
    })
  })

  describe('setCommandPaletteOpen()', () => {
    it('toggles commandPaletteOpen to true', () => {
      useAppStore.getState().setCommandPaletteOpen(true)
      expect(useAppStore.getState().commandPaletteOpen).toBe(true)
    })

    it('toggles commandPaletteOpen back to false', () => {
      useAppStore.getState().setCommandPaletteOpen(true)
      useAppStore.getState().setCommandPaletteOpen(false)
      expect(useAppStore.getState().commandPaletteOpen).toBe(false)
    })
  })

  describe('setChangelogOpen()', () => {
    it('opens the changelog', () => {
      useAppStore.getState().setChangelogOpen(true)
      expect(useAppStore.getState().changelogOpen).toBe(true)
    })

    it('closes the changelog', () => {
      useAppStore.getState().setChangelogOpen(true)
      useAppStore.getState().setChangelogOpen(false)
      expect(useAppStore.getState().changelogOpen).toBe(false)
    })
  })

  describe('toggleFocusMode()', () => {
    it('flips focusMode from false to true', () => {
      expect(useAppStore.getState().focusMode).toBe(false)
      useAppStore.getState().toggleFocusMode()
      expect(useAppStore.getState().focusMode).toBe(true)
    })

    it('flips focusMode back to false on second call', () => {
      useAppStore.getState().toggleFocusMode()
      useAppStore.getState().toggleFocusMode()
      expect(useAppStore.getState().focusMode).toBe(false)
    })
  })
})
