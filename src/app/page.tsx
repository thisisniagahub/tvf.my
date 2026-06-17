'use client'

import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/app-store'
import { AppShell } from '@/components/layout/app-shell'
import { LandingPage } from '@/components/auth/landing-page'
import { OnboardingFlow } from '@/components/auth/onboarding'
import { KeyboardShortcutsModal } from '@/components/modals/keyboard-shortcuts'
import { ShortcutsModal } from '@/components/modals/shortcuts-modal'
import { CommandPalette } from '@/components/modals/command-palette'
import { ChangelogModal } from '@/components/modals/changelog-modal'
import { Skeleton } from '@/components/ui/skeleton'
import type { PageId } from '@/lib/types'

// Lazy load all pages for code splitting
const DashboardPage = lazy(() => import('@/components/pages/dashboard-page').then(m => ({ default: m.DashboardPage })))
const ProductsPage = lazy(() => import('@/components/pages/products-page').then(m => ({ default: m.ProductsPage })))
const LinksPage = lazy(() => import('@/components/pages/links-page').then(m => ({ default: m.LinksPage })))
const AnalyticsPage = lazy(() => import('@/components/pages/analytics-page').then(m => ({ default: m.AnalyticsPage })))
const CalculatorPage = lazy(() => import('@/components/pages/calculator-page').then(m => ({ default: m.CalculatorPage })))
const CampaignsPage = lazy(() => import('@/components/pages/campaigns-page').then(m => ({ default: m.CampaignsPage })))
const EarningsPage = lazy(() => import('@/components/pages/earnings-page').then(m => ({ default: m.EarningsPage })))
const AiContentPage = lazy(() => import('@/components/pages/ai-content-page').then(m => ({ default: m.AiContentPage })))
const TrendSpyPage = lazy(() => import('@/components/pages/trend-spy-page').then(m => ({ default: m.TrendSpyPage })))
const ProfitOptimizerPage = lazy(() => import('@/components/pages/profit-optimizer-page').then(m => ({ default: m.ProfitOptimizerPage })))
const ContentStudioPage = lazy(() => import('@/components/pages/content-studio-page').then(m => ({ default: m.ContentStudioPage })))
const ProductMatcherPage = lazy(() => import('@/components/pages/product-matcher-page').then(m => ({ default: m.ProductMatcherPage })))
const AiRecommenderPage = lazy(() => import('@/components/pages/ai-recommender-page').then(m => ({ default: m.AiRecommenderPage })))
const AiThumbnailsPage = lazy(() => import('@/components/pages/ai-thumbnails-page').then(m => ({ default: m.AiThumbnailsPage })))
const AiCalendarPage = lazy(() => import('@/components/pages/ai-calendar-page').then(m => ({ default: m.AiCalendarPage })))
const HashtagAiPage = lazy(() => import('@/components/pages/hashtag-ai-page').then(m => ({ default: m.HashtagAiPage })))
const AudienceAiPage = lazy(() => import('@/components/pages/audience-ai-page').then(m => ({ default: m.AudienceAiPage })))
const AbTestingPage = lazy(() => import('@/components/pages/ab-testing-page').then(m => ({ default: m.AbTestingPage })))
const TiktokPage = lazy(() => import('@/components/pages/tiktok-page').then(m => ({ default: m.TiktokPage })))
const LazadaPage = lazy(() => import('@/components/pages/lazada-page').then(m => ({ default: m.LazadaPage })))
const ShopeeLivePage = lazy(() => import('@/components/pages/shopee-live-page').then(m => ({ default: m.ShopeeLivePage })))
const UnifiedEarningsPage = lazy(() => import('@/components/pages/unified-earnings-page').then(m => ({ default: m.UnifiedEarningsPage })))
const ComparePage = lazy(() => import('@/components/pages/compare-page').then(m => ({ default: m.ComparePage })))
const AutoPostPage = lazy(() => import('@/components/pages/auto-post-page').then(m => ({ default: m.AutoPostPage })))
const XtraAlertsPage = lazy(() => import('@/components/pages/xtra-alerts-page').then(m => ({ default: m.XtraAlertsPage })))
const PricingPage = lazy(() => import('@/components/pages/pricing-page').then(m => ({ default: m.PricingPage })))
const MarketplacePage = lazy(() => import('@/components/pages/marketplace-page').then(m => ({ default: m.MarketplacePage })))
const TeamDashboardPage = lazy(() => import('@/components/pages/team-dashboard-page').then(m => ({ default: m.TeamDashboardPage })))
const WhiteLabelPage = lazy(() => import('@/components/pages/white-label-page').then(m => ({ default: m.WhiteLabelPage })))
const ApiKeysPage = lazy(() => import('@/components/pages/api-keys-page').then(m => ({ default: m.ApiKeysPage })))
const LeaderboardPage = lazy(() => import('@/components/pages/leaderboard-page').then(m => ({ default: m.LeaderboardPage })))
const AchievementsPage = lazy(() => import('@/components/pages/achievements-page').then(m => ({ default: m.AchievementsPage })))
const ReferralsPage = lazy(() => import('@/components/pages/referrals-page').then(m => ({ default: m.ReferralsPage })))
const HermesHubPage = lazy(() => import('@/components/pages/hermes-hub-page').then(m => ({ default: m.HermesHubPage })))
const NotificationsPage = lazy(() => import('@/components/pages/notifications-page').then(m => ({ default: m.NotificationsPage })))
const SettingsPage = lazy(() => import('@/components/pages/settings-page').then(m => ({ default: m.SettingsPage })))

const pageComponents: Record<PageId, React.LazyExoticComponent<() => React.ReactElement>> = {
  dashboard: DashboardPage,
  products: ProductsPage,
  links: LinksPage,
  analytics: AnalyticsPage,
  calculator: CalculatorPage,
  campaigns: CampaignsPage,
  earnings: EarningsPage,
  'ai-content': AiContentPage,
  'trend-spy': TrendSpyPage,
  'profit-optimizer': ProfitOptimizerPage,
  'content-studio': ContentStudioPage,
  'product-matcher': ProductMatcherPage,
  'ai-recommender': AiRecommenderPage,
  'ai-thumbnails': AiThumbnailsPage,
  'ai-calendar': AiCalendarPage,
  'hashtag-ai': HashtagAiPage,
  'audience-ai': AudienceAiPage,
  'ab-testing': AbTestingPage,
  tiktok: TiktokPage,
  lazada: LazadaPage,
  'shopee-live': ShopeeLivePage,
  'unified-earnings': UnifiedEarningsPage,
  compare: ComparePage,
  'auto-post': AutoPostPage,
  'xtra-alerts': XtraAlertsPage,
  pricing: PricingPage,
  marketplace: MarketplacePage,
  'team-dashboard': TeamDashboardPage,
  'white-label': WhiteLabelPage,
  'api-keys': ApiKeysPage,
  leaderboard: LeaderboardPage,
  achievements: AchievementsPage,
  referrals: ReferralsPage,
  'hermes-hub': HermesHubPage,
  notifications: NotificationsPage,
  settings: SettingsPage,
}

function PageLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}

export default function Home() {
  const { isAuthenticated, hasSeenOnboarding, hasSeenShortcuts, activePage, completeOnboarding } = useAppStore()

  if (!isAuthenticated) {
    return <LandingPage />
  }

  if (!hasSeenOnboarding) {
    return <OnboardingFlow onComplete={completeOnboarding} />
  }

  const ActivePage = pageComponents[activePage] ?? DashboardPage

  return (
    <>
      <AppShell>
        <Suspense fallback={<PageLoader />}>
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <ActivePage />
          </motion.div>
        </Suspense>
      </AppShell>
      {!hasSeenShortcuts && <KeyboardShortcutsModal />}
      <ShortcutsModal />
      <CommandPalette />
      <ChangelogModal />
    </>
  )
}
