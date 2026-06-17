// Core types for TheViralFindsMY

export type PageId =
  // CORE
  | 'dashboard'
  | 'products'
  | 'links'
  | 'analytics'
  | 'calculator'
  | 'campaigns'
  | 'earnings'
  // AI POWERED
  | 'ai-content'
  | 'trend-spy'
  | 'profit-optimizer'
  | 'content-studio'
  | 'product-matcher'
  | 'ai-recommender'
  | 'ai-thumbnails'
  | 'ai-calendar'
  | 'hashtag-ai'
  | 'audience-ai'
  | 'ab-testing'
  // PLATFORMS
  | 'tiktok'
  | 'lazada'
  | 'shopee-live'
  | 'unified-earnings'
  | 'compare'
  // ADVANCED
  | 'auto-post'
  | 'xtra-alerts'
  | 'pricing'
  | 'marketplace'
  | 'team-dashboard'
  | 'white-label'
  | 'api-keys'
  // GROWTH
  | 'leaderboard'
  | 'achievements'
  | 'referrals'
  | 'hermes-hub'
  | 'notifications'
  | 'settings'

export type PageCategory = 'pinned' | 'core' | 'ai' | 'platforms' | 'advanced' | 'growth'

export interface User {
  id: string
  name: string
  email: string
  plan: 'free' | 'pro' | 'business' | 'enterprise'
  avatar?: string
  joinedAt: string
  niches: string[]
}

export interface Product {
  id: string
  name: string
  image: string
  price: number
  commissionRate: number
  commission: number
  category: string
  trendScore: number
  clicks: number
  orders: number
  conversion: number
  rating: number
  sales: number
  source: 'shopee' | 'tiktok' | 'lazada'
  hot?: boolean
  xtra?: boolean
}

export interface AffiliateLink {
  id: string
  productId: string
  productName: string
  shortUrl: string
  clicks: number
  orders: number
  earnings: number
  conversion: number
  createdAt: string
  status: 'active' | 'paused'
  platform: string
}

export interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'ended' | 'draft'
  platform: string
  budget: number
  spent: number
  clicks: number
  orders: number
  revenue: number
  commission: number
  roas: number
  startDate: string
  endDate?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  lastActivity: string
  messageCount: number
}

export interface Notification {
  id: string
  type: 'sale' | 'alert' | 'info' | 'achievement' | 'trend'
  title: string
  message: string
  timestamp: string
  read: boolean
  icon?: string
}

export interface TrendProduct {
  id: string
  name: string
  category: string
  velocity: number
  status: 'hot' | 'warm' | 'cool'
  competitors: number
  avgCommission: number
  trendScore: number
}

export interface EarningPoint {
  date: string
  earnings: number
  clicks: number
  orders: number
}

export interface Activity {
  id: string
  type: 'sale' | 'click' | 'commission' | 'alert'
  message: string
  amount?: number
  timestamp: string
}

export interface NavItem {
  id: PageId
  label: string
  icon: string
  badge?: string
  category: PageCategory
}

/**
 * A category trend row used by Trend Spy's heatmap and the trends API.
 */
export interface CategoryTrend {
  name: string
  emoji: string
  velocity: number
  status: 'hot' | 'warm'
  products: number
}

/**
 * Response shape of GET /api/products.
 */
export interface ProductsResponse {
  products: Product[]
  source: string
  count: number
}

/**
 * Response shape of GET /api/trends.
 */
export interface TrendsResponse {
  categories: CategoryTrend[]
  trends: TrendProduct[]
  lastUpdated: string
  source: string
}

/**
 * Response shape of GET /api/dashboard.
 */
export interface DashboardStats {
  earnings: EarningPoint[]
  activities: Activity[]
  topProducts: Product[]
  stats: {
    totalEarnings: number
    totalClicks: number
    conversionRate: number
    activeLinks: number
  }
}

/**
 * A unified activity feed item as rendered on the dashboard. Extends {@link Activity}
 * with the `live` flag (true when sourced from the live WebSocket feed, false when
 * sourced from the demo API) and a wider `type` union that covers live event types
 * mapped into the dashboard's vocabulary.
 */
export interface DashboardActivity {
  id: string
  type: 'sale' | 'click' | 'commission' | 'alert' | 'achievement' | 'info'
  message: string
  amount?: number
  timestamp: string
  live: boolean
}

/**
 * A single search result returned by GET /api/search.
 * The `icon` field is the name of a lucide-react icon (e.g. "Package").
 */
export interface SearchResultItem {
  type: 'product' | 'link' | 'campaign'
  id: string
  label: string
  desc: string
  page: PageId
  icon: string
  badge?: string
}
