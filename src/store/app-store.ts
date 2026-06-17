'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PageId, User } from '@/lib/types'

interface AppState {
  isAuthenticated: boolean
  user: User | null
  hasSeenOnboarding: boolean
  hasSeenShortcuts: boolean
  hasSeenChangelog: boolean
  changelogOpen: boolean
  activePage: PageId
  sidebarCollapsed: boolean
  pinnedPages: PageId[]
  recentPages: PageId[]
  pageVisitCounts: Record<string, number>
  commandPaletteOpen: boolean
  liveNotificationsEnabled: boolean
  focusMode: boolean
  notificationSoundEnabled: boolean
  shortcutsOpen: boolean

  login: (user?: Partial<User>) => void
  logout: () => void
  setActivePage: (page: PageId) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  togglePin: (page: PageId) => void
  completeOnboarding: () => void
  completeShortcuts: () => void
  setCommandPaletteOpen: (open: boolean) => void
  setLiveNotificationsEnabled: (enabled: boolean) => void
  clearRecentPages: () => void
  setChangelogOpen: (open: boolean) => void
  dismissChangelog: () => void
  toggleFocusMode: () => void
  setFocusMode: (on: boolean) => void
  setNotificationSoundEnabled: (enabled: boolean) => void
  setShortcutsOpen: (open: boolean) => void
  resetAllSettings: () => void
  importSettings: (settings: Partial<AppState>) => void
}

const defaultUser: User = {
  id: 'demo-user',
  name: 'TheViralFindsMY',
  email: 'demo@theviralfindsmy.com',
  plan: 'pro',
  joinedAt: '2024-06-01',
  niches: ['Electronics', 'Beauty', 'Fashion'],
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      hasSeenOnboarding: false,
      hasSeenShortcuts: false,
      hasSeenChangelog: false,
      changelogOpen: false,
      activePage: 'dashboard',
      sidebarCollapsed: false,
      pinnedPages: ['dashboard', 'ai-content', 'earnings'],
      recentPages: [],
      pageVisitCounts: {},
      commandPaletteOpen: false,
      liveNotificationsEnabled: true,
      focusMode: false,
      notificationSoundEnabled: false,
      shortcutsOpen: false,

      login: (user) =>
        set((state) => ({
          isAuthenticated: true,
          user: { ...defaultUser, ...user, ...state.user },
        })),
      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          activePage: 'dashboard',
          hasSeenOnboarding: false,
        }),
      setActivePage: (page) =>
        set((state) => ({
          activePage: page,
          recentPages: [
            page,
            ...state.recentPages.filter((p) => p !== page),
          ].slice(0, 8),
          pageVisitCounts: {
            ...state.pageVisitCounts,
            [page]: (state.pageVisitCounts[page] ?? 0) + 1,
          },
        })),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      togglePin: (page) =>
        set((state) => ({
          pinnedPages: state.pinnedPages.includes(page)
            ? state.pinnedPages.filter((p) => p !== page)
            : [...state.pinnedPages, page],
        })),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      completeShortcuts: () => set({ hasSeenShortcuts: true }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setLiveNotificationsEnabled: (enabled) => set({ liveNotificationsEnabled: enabled }),
      clearRecentPages: () => set({ recentPages: [] }),
      setChangelogOpen: (open) => set({ changelogOpen: open }),
      dismissChangelog: () => set({ hasSeenChangelog: true, changelogOpen: false }),
      toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
      setFocusMode: (on) => set({ focusMode: on }),
      setNotificationSoundEnabled: (enabled) => set({ notificationSoundEnabled: enabled }),
      setShortcutsOpen: (open) => set({ shortcutsOpen: open }),
      resetAllSettings: () =>
        set({
          sidebarCollapsed: false,
          pinnedPages: ['dashboard', 'ai-content', 'earnings'],
          recentPages: [],
          pageVisitCounts: {},
          liveNotificationsEnabled: true,
          notificationSoundEnabled: false,
          focusMode: false,
          hasSeenOnboarding: true,
          hasSeenShortcuts: true,
          hasSeenChangelog: true,
          changelogOpen: false,
          commandPaletteOpen: false,
          shortcutsOpen: false,
          activePage: 'dashboard',
        }),
      importSettings: (settings) => set(settings),
    }),
    {
      name: 'tvfm-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        hasSeenOnboarding: state.hasSeenOnboarding,
        hasSeenShortcuts: state.hasSeenShortcuts,
        hasSeenChangelog: state.hasSeenChangelog,
        activePage: state.activePage,
        sidebarCollapsed: state.sidebarCollapsed,
        pinnedPages: state.pinnedPages,
        recentPages: state.recentPages,
        pageVisitCounts: state.pageVisitCounts,
        liveNotificationsEnabled: state.liveNotificationsEnabled,
        notificationSoundEnabled: state.notificationSoundEnabled,
        focusMode: state.focusMode,
      }),
    }
  )
)
