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
