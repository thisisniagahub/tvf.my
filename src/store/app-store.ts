'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PageId, User } from '@/lib/types'

interface AppState {
  isAuthenticated: boolean
  user: User | null
  hasSeenOnboarding: boolean
  hasSeenShortcuts: boolean
  activePage: PageId
  sidebarCollapsed: boolean
  pinnedPages: PageId[]
  commandPaletteOpen: boolean

  login: (user?: Partial<User>) => void
  logout: () => void
  setActivePage: (page: PageId) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  togglePin: (page: PageId) => void
  completeOnboarding: () => void
  completeShortcuts: () => void
  setCommandPaletteOpen: (open: boolean) => void
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
      activePage: 'dashboard',
      sidebarCollapsed: false,
      pinnedPages: ['dashboard', 'ai-content', 'earnings'],
      commandPaletteOpen: false,

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
      setActivePage: (page) => set({ activePage: page }),
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
    }),
    {
      name: 'tvfm-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        hasSeenOnboarding: state.hasSeenOnboarding,
        hasSeenShortcuts: state.hasSeenShortcuts,
        activePage: state.activePage,
        sidebarCollapsed: state.sidebarCollapsed,
        pinnedPages: state.pinnedPages,
      }),
    }
  )
)
