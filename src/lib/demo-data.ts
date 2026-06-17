import type {
  Product,
  AffiliateLink,
  Campaign,
  Conversation,
  Notification,
  TrendProduct,
  EarningPoint,
  Activity,
  NavItem,
} from './types'

// Malaysian market demo products
export const demoProducts: Product[] = [
  { id: 'p1', name: 'RGB Mechanical Keyboard Hot-Swappable Brown Switch', image: '', price: 129.9, commissionRate: 8.5, commission: 11.04, category: 'Electronics', trendScore: 92, clicks: 342, orders: 89, conversion: 26.0, rating: 4.8, sales: 1240, source: 'shopee', hot: true },
  { id: 'p2', name: 'Safi Balqis UV Sunblock SPF50 PA+++', image: '', price: 24.9, commissionRate: 12, commission: 2.99, category: 'Beauty', trendScore: 88, clicks: 278, orders: 67, conversion: 24.1, rating: 4.9, sales: 3400, source: 'shopee', hot: true, xtra: true },
  { id: 'p3', name: 'Portable Blender USB Rechargeable 380ml', image: '', price: 39.9, commissionRate: 10, commission: 3.99, category: 'Home', trendScore: 85, clicks: 256, orders: 78, conversion: 30.5, rating: 4.7, sales: 890, source: 'shopee', hot: true },
  { id: 'p4', name: 'Wireless Earbuds Pro ANC Bluetooth 5.3', image: '', price: 59.9, commissionRate: 7.5, commission: 4.49, category: 'Electronics', trendScore: 80, clicks: 198, orders: 45, conversion: 22.7, rating: 4.6, sales: 670, source: 'shopee' },
  { id: 'p5', name: 'Instant Pot Pressure Cooker 6L', image: '', price: 199, commissionRate: 6, commission: 11.94, category: 'Home', trendScore: 75, clicks: 167, orders: 52, conversion: 31.1, rating: 4.8, sales: 450, source: 'shopee', xtra: true },
  { id: 'p6', name: 'Wardah Exclusive Matte Lipstick Halal', image: '', price: 29.9, commissionRate: 14, commission: 4.19, category: 'Beauty', trendScore: 84, clicks: 312, orders: 98, conversion: 31.4, rating: 4.7, sales: 2100, source: 'shopee', hot: true, xtra: true },
  { id: 'p7', name: 'Xiaomi Robot Vacuum Mop 2 Pro', image: '', price: 899, commissionRate: 5, commission: 44.95, category: 'Electronics', trendScore: 78, clicks: 145, orders: 23, conversion: 15.9, rating: 4.5, sales: 180, source: 'shopee' },
  { id: 'p8', name: 'Tudung Bawal Premium Soft Chiffon', image: '', price: 35, commissionRate: 11, commission: 3.85, category: 'Fashion', trendScore: 90, clicks: 289, orders: 102, conversion: 35.3, rating: 4.9, sales: 1850, source: 'shopee', hot: true },
  { id: 'p9', name: 'Gaming Mouse RGB 7200 DPI Wired', image: '', price: 49.9, commissionRate: 9, commission: 4.49, category: 'Gaming', trendScore: 72, clicks: 156, orders: 41, conversion: 26.3, rating: 4.6, sales: 520, source: 'shopee' },
  { id: 'p10', name: 'Anker Power Bank 20000mAh PD 22.5W', image: '', price: 119, commissionRate: 7, commission: 8.33, category: 'Electronics', trendScore: 70, clicks: 134, orders: 38, conversion: 28.4, rating: 4.7, sales: 410, source: 'shopee', xtra: true },
  { id: 'p11', name: 'Cushion Foundation Matte Halal Wardah', image: '', price: 45, commissionRate: 13, commission: 5.85, category: 'Beauty', trendScore: 82, clicks: 245, orders: 73, conversion: 29.8, rating: 4.6, sales: 980, source: 'shopee', xtra: true },
  { id: 'p12', name: 'Smart Watch Fitness Tracker AMOLED', image: '', price: 89, commissionRate: 8, commission: 7.12, category: 'Electronics', trendScore: 76, clicks: 178, orders: 44, conversion: 24.7, rating: 4.5, sales: 360, source: 'shopee' },
]

export const demoLinks: AffiliateLink[] = [
  { id: 'l1', productId: 'p1', productName: 'RGB Mechanical Keyboard', shortUrl: 'shopee.com.my/aff/abc123', clicks: 342, orders: 89, earnings: 982.56, conversion: 26.0, createdAt: '2025-06-01', status: 'active', platform: 'Shopee' },
  { id: 'l2', productId: 'p2', productName: 'Safi Balqis UV Sunblock', shortUrl: 'shopee.com.my/aff/def456', clicks: 278, orders: 67, earnings: 200.33, conversion: 24.1, createdAt: '2025-06-03', status: 'active', platform: 'Shopee' },
  { id: 'l3', productId: 'p8', productName: 'Tudung Bawal Premium', shortUrl: 'shopee.com.my/aff/ghi789', clicks: 289, orders: 102, earnings: 392.70, conversion: 35.3, createdAt: '2025-06-05', status: 'active', platform: 'Shopee' },
  { id: 'l4', productId: 'p3', productName: 'Portable Blender USB', shortUrl: 'shopee.com.my/aff/jkl012', clicks: 256, orders: 78, earnings: 311.22, conversion: 30.5, createdAt: '2025-06-07', status: 'active', platform: 'Shopee' },
  { id: 'l5', productId: 'p6', productName: 'Wardah Matte Lipstick', shortUrl: 'shopee.com.my/aff/mno345', clicks: 312, orders: 98, earnings: 410.62, conversion: 31.4, createdAt: '2025-06-08', status: 'active', platform: 'Shopee' },
  { id: 'l6', productId: 'p4', productName: 'Wireless Earbuds Pro', shortUrl: 'shopee.com.my/aff/pqr678', clicks: 198, orders: 45, earnings: 202.05, conversion: 22.7, createdAt: '2025-06-10', status: 'paused', platform: 'Shopee' },
]

export const demoCampaigns: Campaign[] = [
  { id: 'c1', name: '11.11 Mega Sale Electronics', status: 'active', platform: 'Shopee', budget: 500, spent: 342, clicks: 1240, orders: 289, revenue: 37500, commission: 3187.5, roas: 9.32, startDate: '2025-10-15', endDate: '2025-11-15' },
  { id: 'c2', name: 'Raya Beauty Collection', status: 'active', platform: 'Shopee', budget: 300, spent: 198, clicks: 890, orders: 234, revenue: 12400, commission: 1488, roas: 7.52, startDate: '2025-06-01' },
  { id: 'c3', name: 'Back to School Gadgets', status: 'paused', platform: 'Shopee', budget: 200, spent: 145, clicks: 567, orders: 98, revenue: 6800, commission: 544, roas: 3.75, startDate: '2025-08-01', endDate: '2025-09-01' },
  { id: 'c4', name: 'Fashion Flash Sale', status: 'ended', platform: 'TikTok', budget: 150, spent: 150, clicks: 445, orders: 156, revenue: 5460, commission: 600.6, roas: 4.00, startDate: '2025-07-01', endDate: '2025-07-15' },
  { id: 'c5', name: '12.12 Year End Blowout', status: 'draft', platform: 'Shopee', budget: 800, spent: 0, clicks: 0, orders: 0, revenue: 0, commission: 0, roas: 0, startDate: '2025-12-01', endDate: '2025-12-12' },
]

export const demoConversations: Conversation[] = [
  {
    id: 'conv1',
    title: 'Product Analysis Q1',
    lastActivity: '5m ago',
    messageCount: 12,
    messages: [
      { id: 'm1', role: 'user', content: 'Analyze my top performing products this quarter', timestamp: '2025-06-15T10:00:00Z' },
      { id: 'm2', role: 'assistant', content: 'Your top 3 products have seen a 45% increase in conversions this quarter. The RGB Mechanical Keyboard leads with 26% conversion rate, followed by Tudung Bawal Premium at 35.3%. I recommend increasing your ad spend on these and creating bundle deals.', timestamp: '2025-06-15T10:00:30Z' },
    ],
  },
  {
    id: 'conv2',
    title: 'Content Strategy',
    lastActivity: '1h ago',
    messageCount: 8,
    messages: [
      { id: 'm3', role: 'user', content: 'Give me content ideas for my audience', timestamp: '2025-06-15T09:00:00Z' },
      { id: 'm4', role: 'assistant', content: 'Here are 5 content ideas for your audience: 1) Before/after skincare routine with Safi Balqis, 2) Unboxing RGB keyboard ASMR, 3) Tudung styling tutorial, 4) Portable blender smoothie recipe, 5) Wardah halal makeup lookbook.', timestamp: '2025-06-15T09:00:25Z' },
    ],
  },
  {
    id: 'conv3',
    title: 'Link Optimization',
    lastActivity: '3h ago',
    messageCount: 15,
    messages: [],
  },
  {
    id: 'conv4',
    title: 'Market Trends MY',
    lastActivity: '1d ago',
    messageCount: 20,
    messages: [],
  },
  {
    id: 'conv5',
    title: 'Campaign Review',
    lastActivity: '2d ago',
    messageCount: 6,
    messages: [],
  },
]

export const demoNotifications: Notification[] = [
  { id: 'n1', type: 'sale', title: 'New Sale!', message: 'RGB Mechanical Keyboard sold — you earned RM 11.04', timestamp: '2m ago', read: false },
  { id: 'n2', type: 'trend', title: 'Trending Alert', message: 'Fashion category velocity up 92% — tap to see products', timestamp: '15m ago', read: false },
  { id: 'n3', type: 'achievement', title: 'Achievement Unlocked', message: 'You crossed RM 5,000 in total commissions! 🎉', timestamp: '1h ago', read: false },
  { id: 'n4', type: 'alert', title: 'Commission XTRA Live', message: 'Safi Balqis Sunblock now offers 40% extra commission', timestamp: '3h ago', read: true },
  { id: 'n5', type: 'sale', title: 'New Sale!', message: 'Tudung Bawal Premium sold — you earned RM 3.85', timestamp: '5h ago', read: true },
  { id: 'n6', type: 'info', title: 'Weekly Report Ready', message: 'Your weekly performance summary is available', timestamp: '1d ago', read: true },
]

export const demoTrends: TrendProduct[] = [
  { id: 't1', name: 'RGB Mechanical Keyboard Hot-Swappable Brown Switch', category: 'Electronics', velocity: 78, status: 'hot', competitors: 234, avgCommission: 8.5, trendScore: 92 },
  { id: 't2', name: 'Safi Balqis UV Sunblock SPF50 PA+++', category: 'Beauty', velocity: 64, status: 'hot', competitors: 189, avgCommission: 12, trendScore: 88 },
  { id: 't3', name: 'Tudung Bawal Premium Soft Chiffon', category: 'Fashion', velocity: 92, status: 'hot', competitors: 312, avgCommission: 11, trendScore: 90 },
  { id: 't4', name: 'Xiaomi Robot Vacuum Mop 2 Pro', category: 'Home', velocity: 55, status: 'hot', competitors: 145, avgCommission: 5, trendScore: 78 },
  { id: 't5', name: 'Portable Blender USB Rechargeable', category: 'Home', velocity: 67, status: 'hot', competitors: 201, avgCommission: 10, trendScore: 85 },
  { id: 't6', name: 'Wardah Matte Lipstick Halal', category: 'Beauty', velocity: 84, status: 'hot', competitors: 267, avgCommission: 14, trendScore: 84 },
  { id: 't7', name: 'Wireless Earbuds Pro ANC', category: 'Electronics', velocity: 71, status: 'hot', competitors: 198, avgCommission: 7.5, trendScore: 80 },
  { id: 't8', name: 'Anker Power Bank 20000mAh', category: 'Electronics', velocity: 58, status: 'hot', competitors: 167, avgCommission: 7, trendScore: 70 },
]

export const categoryTrends = [
  { name: 'Electronics', emoji: '📱', velocity: 78, status: 'hot' as const, products: 342 },
  { name: 'Beauty', emoji: '💄', velocity: 64, status: 'hot' as const, products: 289 },
  { name: 'Fashion', emoji: '👗', velocity: 92, status: 'hot' as const, products: 456 },
  { name: 'Home', emoji: '🏠', velocity: 55, status: 'hot' as const, products: 234 },
  { name: 'Food', emoji: '🍜', velocity: 67, status: 'hot' as const, products: 178 },
  { name: 'Baby', emoji: '🍼', velocity: 47, status: 'hot' as const, products: 134 },
  { name: 'Sports', emoji: '⚽', velocity: 38, status: 'warm' as const, products: 98 },
  { name: 'Gaming', emoji: '🎮', velocity: 71, status: 'hot' as const, products: 167 },
  { name: 'Auto', emoji: '🚗', velocity: 51, status: 'hot' as const, products: 87 },
  { name: 'Books', emoji: '📚', velocity: 33, status: 'warm' as const, products: 65 },
  { name: 'Health', emoji: '💊', velocity: 58, status: 'hot' as const, products: 145 },
  { name: 'Pets', emoji: '🐾', velocity: 49, status: 'hot' as const, products: 112 },
]

// Earnings chart data - last 30 days
export const demoEarnings: EarningPoint[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  const base = 150 + Math.sin(i / 3) * 60 + i * 4
  return {
    date: `Jun ${day}`,
    earnings: Math.round(base + Math.random() * 80),
    clicks: Math.round(40 + Math.random() * 60 + i * 2),
    orders: Math.round(8 + Math.random() * 15 + i * 0.5),
  }
})

export const demoActivities: Activity[] = [
  { id: 'a1', type: 'sale', message: 'Sale: RGB Mechanical Keyboard', amount: 11.04, timestamp: '2m ago' },
  { id: 'a2', type: 'click', message: 'New click on Safi Balqis Sunblock link', timestamp: '4m ago' },
  { id: 'a3', type: 'commission', message: 'Commission earned: Tudung Bawal Premium', amount: 3.85, timestamp: '8m ago' },
  { id: 'a4', type: 'sale', message: 'Sale: Portable Blender USB', amount: 3.99, timestamp: '12m ago' },
  { id: 'a5', type: 'click', message: 'New click on Wireless Earbuds Pro link', timestamp: '18m ago' },
  { id: 'a6', type: 'commission', message: 'Commission earned: Wardah Lipstick', amount: 4.19, timestamp: '25m ago' },
  { id: 'a7', type: 'alert', message: 'Trend alert: Fashion velocity +92%', timestamp: '32m ago' },
  { id: 'a8', type: 'sale', message: 'Sale: Smart Watch Fitness Tracker', amount: 7.12, timestamp: '45m ago' },
]

export const niches = [
  { id: 'electronics', label: 'Electronics', emoji: '📱', desc: 'Gadgets, audio, accessories' },
  { id: 'beauty', label: 'Beauty', emoji: '💄', desc: 'Skincare, makeup, fragrance' },
  { id: 'fashion', label: 'Fashion', emoji: '👗', desc: 'Apparel, tudung, shoes' },
  { id: 'home', label: 'Home & Living', emoji: '🏠', desc: 'Decor, kitchen, furniture' },
  { id: 'food', label: 'Food & Beverage', emoji: '🍜', desc: 'Snacks, supplements, drinks' },
  { id: 'baby', label: 'Baby & Kids', emoji: '👶', desc: 'Toys, diapers, kiddie care' },
  { id: 'sports', label: 'Sports & Fitness', emoji: '🏋️', desc: 'Gear, supplements, apparel' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮', desc: 'Consoles, accessories, merch' },
]

// Navigation config
export const navItems: NavItem[] = [
  // CORE
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', category: 'core' },
  { id: 'products', label: 'Products', icon: 'Package', category: 'core' },
  { id: 'links', label: 'Affiliate Links', icon: 'Link', category: 'core' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', category: 'core' },
  { id: 'calculator', label: 'Calculator', icon: 'Calculator', category: 'core' },
  { id: 'campaigns', label: 'Campaigns', icon: 'Megaphone', category: 'core' },
  { id: 'earnings', label: 'Earnings', icon: 'Wallet', category: 'core' },
  // AI POWERED
  { id: 'ai-content', label: 'AI Content', icon: 'Sparkles', category: 'ai', badge: 'AI' },
  { id: 'trend-spy', label: 'Trend Spy', icon: 'Radar', category: 'ai' },
  { id: 'profit-optimizer', label: 'Profit Optimizer', icon: 'TrendingUp', category: 'ai', badge: 'AI' },
  { id: 'content-studio', label: 'Content Studio', icon: 'Clapperboard', category: 'ai' },
  { id: 'product-matcher', label: 'Product Matcher', icon: 'Boxes', category: 'ai' },
  { id: 'ai-recommender', label: 'AI Recommender', icon: 'Brain', category: 'ai', badge: 'AI' },
  { id: 'ai-thumbnails', label: 'AI Thumbnails', icon: 'Image', category: 'ai', badge: 'AI' },
  { id: 'ai-calendar', label: 'AI Calendar', icon: 'CalendarDays', category: 'ai', badge: 'AI' },
  { id: 'hashtag-ai', label: 'Hashtag AI', icon: 'Hash', category: 'ai', badge: 'AI' },
  { id: 'audience-ai', label: 'Audience AI', icon: 'Users', category: 'ai', badge: 'AI' },
  { id: 'ab-testing', label: 'A/B Testing', icon: 'FlaskConical', category: 'ai', badge: 'AI' },
  // PLATFORMS
  { id: 'tiktok', label: 'TikTok Shop', icon: 'Music', category: 'platforms', badge: 'New' },
  { id: 'lazada', label: 'Lazada', icon: 'ShoppingBag', category: 'platforms', badge: 'New' },
  { id: 'shopee-live', label: 'Shopee Live', icon: 'Radio', category: 'platforms', badge: '80%' },
  { id: 'unified-earnings', label: 'Unified Earnings', icon: 'Layers', category: 'platforms' },
  { id: 'compare', label: 'Compare', icon: 'GitCompare', category: 'platforms' },
  // ADVANCED
  { id: 'auto-post', label: 'Auto Post', icon: 'Zap', category: 'advanced', badge: 'New' },
  { id: 'xtra-alerts', label: 'XTRA Alerts', icon: 'BellRing', category: 'advanced' },
  { id: 'pricing', label: 'Pricing', icon: 'CreditCard', category: 'advanced', badge: 'PRO' },
  { id: 'marketplace', label: 'Marketplace', icon: 'Store', category: 'advanced', badge: 'New' },
  { id: 'team-dashboard', label: 'Team Dashboard', icon: 'UsersRound', category: 'advanced', badge: 'New' },
  { id: 'white-label', label: 'White-Label', icon: 'Palette', category: 'advanced', badge: 'ENT' },
  { id: 'api-keys', label: 'API Keys', icon: 'KeyRound', category: 'advanced', badge: 'API' },
  // GROWTH
  { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy', category: 'growth' },
  { id: 'achievements', label: 'Achievements', icon: 'Award', category: 'growth' },
  { id: 'referrals', label: 'Referrals', icon: 'Gift', category: 'growth' },
  { id: 'hermes-hub', label: 'Hermes AI Hub', icon: 'Bot', category: 'growth', badge: 'AI' },
  { id: 'notifications', label: 'Notifications', icon: 'Bell', category: 'growth' },
  { id: 'settings', label: 'Settings', icon: 'Settings', category: 'growth' },
]

export const formatRM = (amount: number): string =>
  `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatNumber = (n: number): string =>
  n.toLocaleString('en-MY')
