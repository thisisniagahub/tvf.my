'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader, StatCard, SectionCard } from './_shared'
import { formatRM } from '@/lib/demo-data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Category = 'Templates' | 'Services' | 'Courses' | 'Tools' | 'E-books'

type Item = {
  id: string
  title: string
  seller: string
  sellerInitials: string
  price: number
  rating: number
  reviews: number
  category: Category
  type: 'template' | 'service' | 'course' | 'tool' | 'ebook'
  badge?: string
  gradient: string
}

const items: Item[] = [
  { id: 'm1', title: 'Manglish Caption Pack v3 (200 hooks)', seller: 'AffiliateKak Long', sellerInitials: 'AK', price: 49, rating: 4.9, reviews: 312, category: 'Templates', type: 'template', badge: 'Bestseller', gradient: 'from-shopee/20 to-shopee/5' },
  { id: 'm2', title: '30-Day Content Calendar (Shopee MY)', seller: 'SarahLim', sellerInitials: 'SL', price: 35, rating: 4.8, reviews: 184, category: 'Templates', type: 'template', gradient: 'from-hermes/20 to-hermes/5' },
  { id: 'm3', title: 'TikTok Affiliate Account Management (1 mo)', seller: 'KL Agency', sellerInitials: 'KL', price: 599, rating: 5.0, reviews: 42, category: 'Services', type: 'service', badge: 'Premium', gradient: 'from-success/20 to-success/5' },
  { id: 'm4', title: 'Pro Affiliate Content Creation (5 videos)', seller: 'Creative Studio MY', sellerInitials: 'CS', price: 299, rating: 4.7, reviews: 98, category: 'Services', type: 'service', gradient: 'from-warning/20 to-warning/5' },
  { id: 'm5', title: 'Shopee Affiliate Masterclass (8 hrs)', seller: 'Hermes Academy', sellerInitials: 'HA', price: 199, rating: 4.9, reviews: 542, category: 'Courses', type: 'course', badge: 'Top Rated', gradient: 'from-shopee/20 to-hermes/5' },
  { id: 'm6', title: 'XTRA Commission Crusher Course', seller: 'Hermes Academy', sellerInitials: 'HA', price: 149, rating: 4.8, reviews: 318, category: 'Courses', type: 'course', gradient: 'from-hermes/20 to-shopee/5' },
  { id: 'm7', title: 'Product Matcher Pro Tool (1 yr)', seller: 'TechTools MY', sellerInitials: 'TT', price: 89, rating: 4.6, reviews: 156, category: 'Tools', type: 'tool', gradient: 'from-success/20 to-shopee/5' },
  { id: 'm8', title: 'Trend Spy Excel Tracker', seller: 'AffiliateKak Long', sellerInitials: 'AK', price: 25, rating: 4.7, reviews: 203, category: 'Tools', type: 'tool', gradient: 'from-warning/20 to-success/5' },
  { id: 'm9', title: 'Affiliate Millionaire Mindset (e-book)', seller: 'Daniel Goh', sellerInitials: 'DG', price: 39, rating: 4.5, reviews: 87, category: 'E-books', type: 'ebook', gradient: 'from-shopee/15 to-warning/5' },
  { id: 'm10', title: 'Raya Sale Caption Pack (50 hooks)', seller: 'SarahLim', sellerInitials: 'SL', price: 29, rating: 4.8, reviews: 142, category: 'Templates', type: 'template', badge: 'Seasonal', gradient: 'from-shopee/20 to-success/5' },
  { id: 'm11', title: 'Influencer Outreach Service (10 KOLs)', seller: 'KL Agency', sellerInitials: 'KL', price: 449, rating: 4.9, reviews: 38, category: 'Services', type: 'service', gradient: 'from-hermes/20 to-success/5' },
  { id: 'm12', title: 'Affiliate Tax Guide for Malaysia 2025', seller: 'Daniel Goh', sellerInitials: 'DG', price: 19, rating: 4.4, reviews: 64, category: 'E-books', type: 'ebook', gradient: 'from-warning/15 to-shopee/5' },
]

const categories: { name: Category | 'All'; icon: Icons.LucideIcon; count: number }[] = [
  { name: 'All', icon: Icons.LayoutGrid, count: items.length },
  { name: 'Templates', icon: Icons.FileText, count: items.filter(i => i.category === 'Templates').length },
  { name: 'Services', icon: Icons.Briefcase, count: items.filter(i => i.category === 'Services').length },
  { name: 'Courses', icon: Icons.GraduationCap, count: items.filter(i => i.category === 'Courses').length },
  { name: 'Tools', icon: Icons.Wrench, count: items.filter(i => i.category === 'Tools').length },
  { name: 'E-books', icon: Icons.BookOpen, count: items.filter(i => i.category === 'E-books').length },
]

const topSellers = [
  { name: 'Hermes Academy', initials: 'HA', sales: 860, earnings: 124500, rating: 4.9 },
  { name: 'AffiliateKak Long', initials: 'AK', sales: 515, earnings: 28400, rating: 4.8 },
  { name: 'KL Agency', initials: 'KL', sales: 80, earnings: 43200, rating: 4.9 },
  { name: 'SarahLim', initials: 'SL', sales: 326, earnings: 11300, rating: 4.8 },
  { name: 'Creative Studio MY', initials: 'CS', sales: 98, earnings: 29202, rating: 4.7 },
]

const itemIcon = (type: Item['type']) => {
  switch (type) {
    case 'template': return Icons.FileText
    case 'service': return Icons.Briefcase
    case 'course': return Icons.GraduationCap
    case 'tool': return Icons.Wrench
    case 'ebook': return Icons.BookOpen
  }
}

export function MarketplacePage() {
  const [activeCat, setActiveCat] = useState<Category | 'All'>('All')
  const [search, setSearch] = useState('')

  const filtered = items.filter(
    (i) =>
      (activeCat === 'All' || i.category === activeCat) &&
      (search === '' || i.title.toLowerCase().includes(search.toLowerCase()) || i.seller.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Affiliate Marketplace"
        subtitle="Buy and sell affiliate tools, templates, and services"
        icon={Icons.Store}
        accent="hermes"
      >
        <Badge className="bg-hermes text-white">
          <Icons.Sparkles className="size-3" /> New
        </Badge>
        <Button size="sm" className="bg-hermes-gradient hover:opacity-90" onClick={() => toast.success('Opening seller onboarding...')}>
          <Icons.Store className="mr-1 size-4" /> Sell on Marketplace
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Featured Items" value={items.length} icon={Icons.Package} accent="hermes" subtitle="Curated for Malaysian market" />
        <StatCard label="Active Sellers" value={topSellers.length} icon={Icons.Users} accent="shopee" subtitle="Verified & rated" />
        <StatCard label="Total Sales" value={formatRM(224602)} icon={Icons.ShoppingBag} accent="success" subtitle="All-time marketplace" />
        <StatCard label="Avg Rating" value="4.8 ★" icon={Icons.Star} accent="warning" subtitle="From 1,800+ reviews" />
      </div>

      {/* Sell on marketplace CTA */}
      <Card className="overflow-hidden border-hermes/30 bg-gradient-to-r from-hermes/[0.06] to-shopee/[0.04]">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-hermes-gradient text-white">
              <Icons.Store className="size-6" />
            </div>
            <div>
              <p className="text-sm font-bold">Got something to sell? Become a seller.</p>
              <p className="text-xs text-muted-foreground">
                List templates, services, or courses. Earn 85% per sale. Withdraw to Maybank / TnG in 24h.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info('Opening seller guide...')}>
              <Icons.BookOpen className="mr-1 size-4" /> Learn more
            </Button>
            <Button size="sm" className="bg-hermes-gradient hover:opacity-90" onClick={() => toast.success('Seller onboarding started!')}>
              Start Selling
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Categories sidebar */}
        <div className="space-y-4 lg:col-span-1">
          <SectionCard title="Categories" icon={Icons.Folder}>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCat(cat.name)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    activeCat === cat.name
                      ? 'bg-hermes/10 font-medium text-hermes'
                      : 'hover:bg-accent'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <cat.icon className="size-4" />
                    {cat.name}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{cat.count}</Badge>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Top sellers leaderboard */}
          <SectionCard
            title="Top Sellers"
            description="This month's leaderboard"
            icon={Icons.Trophy}
          >
            <div className="space-y-3">
              {topSellers.map((seller, i) => (
                <div key={seller.name} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      i === 0 && 'bg-warning/15 text-warning',
                      i === 1 && 'bg-muted text-muted-foreground',
                      i === 2 && 'bg-shopee/15 text-shopee',
                      i > 2 && 'bg-muted/50 text-muted-foreground'
                    )}
                  >
                    {i + 1}
                  </span>
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-hermes/10 text-xs font-semibold text-hermes">
                      {seller.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{seller.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {seller.sales} sales · {seller.rating}★
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-success">{formatRM(seller.earnings)}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Featured items grid */}
        <div className="space-y-3 lg:col-span-3">
          <div className="relative w-full sm:max-w-xs">
            <Icons.Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search marketplace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => {
              const Icon = itemIcon(item.type)
              return (
                <Card
                  key={item.id}
                  className="group flex flex-col overflow-hidden border-border/60 transition-all hover:-translate-y-0.5 hover:border-hermes/40 hover:shadow-lg"
                >
                  {/* Image placeholder */}
                  <div className={cn('relative aspect-[4/3] bg-gradient-to-br', item.gradient)}>
                    <div className="flex h-full items-center justify-center">
                      <Icon className="size-12 text-muted-foreground/40" />
                    </div>
                    {item.badge && (
                      <div className="absolute left-2 top-2">
                        <Badge className="bg-hermes text-white text-[10px]">
                          {item.badge}
                        </Badge>
                      </div>
                    )}
                    <div className="absolute right-2 top-2">
                      <Badge variant="secondary" className="bg-background/90 text-[10px] backdrop-blur">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="flex flex-1 flex-col p-3">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Avatar className="size-4">
                        <AvatarFallback className="bg-muted text-[8px]">{item.sellerInitials}</AvatarFallback>
                      </Avatar>
                      <span className="truncate">{item.seller}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <Icons.Star className="size-3 fill-warning text-warning" />
                      <span className="font-semibold">{item.rating}</span>
                      <span className="text-muted-foreground">({item.reviews})</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-hermes">{formatRM(item.price)}</span>
                      <Button
                        size="sm"
                        className="bg-hermes-gradient hover:opacity-90"
                        onClick={() => toast.success(`Added "${item.title}" to cart!`)}
                      >
                        <Icons.ShoppingCart className="mr-1 size-3.5" /> Buy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
              <Icons.SearchX className="size-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-medium">No items found</p>
              <p className="text-xs text-muted-foreground">Try a different category or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
