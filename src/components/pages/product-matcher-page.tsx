'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader, SectionCard } from './_shared'
import { niches, formatRM } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface MatchedProduct {
  id: string
  name: string
  category: string
  price: number
  commissionRate: number
  matchScore: number
  reason: string
  reasonTags: string[]
}

const allMatches: MatchedProduct[] = [
  {
    id: 'm1',
    name: 'Safi Balqis UV Sunblock SPF50 PA+++',
    category: 'Beauty',
    price: 24.9,
    commissionRate: 12,
    matchScore: 96,
    reason: 'Perfect fit for your halal beauty niche. Female audience 18-34 dominates your IG — this product converts at 31% for that segment.',
    reasonTags: ['Halal', 'Female 18-34', 'High CVR', 'Trending'],
  },
  {
    id: 'm2',
    name: 'Wardah Exclusive Matte Lipstick Halal',
    category: 'Beauty',
    price: 29.9,
    commissionRate: 14,
    matchScore: 92,
    reason: 'Aligns with your Raya prep content. Audience showed 4.2x engagement on previous halal makeup posts.',
    reasonTags: ['Halal', 'Raya ready', 'High comm', 'Engaging'],
  },
  {
    id: 'm3',
    name: 'Tudung Bawal Premium Soft Chiffon',
    category: 'Fashion',
    price: 35.0,
    commissionRate: 11,
    matchScore: 89,
    reason: 'Strong match with your modest fashion audience. 73% of your followers engage with tudung-related content.',
    reasonTags: ['Modest fashion', 'Trending', 'Female', 'High CTR'],
  },
  {
    id: 'm4',
    name: 'Cushion Foundation Matte Halal Wardah',
    category: 'Beauty',
    price: 45.0,
    commissionRate: 13,
    matchScore: 84,
    reason: 'Pairs well with your morning routine Reels. Higher price = higher absolute commission per sale.',
    reasonTags: ['Halal', 'Premium', 'Bundle friendly', 'Daily use'],
  },
  {
    id: 'm5',
    name: 'Portable Blender USB Rechargeable 380ml',
    category: 'Home',
    price: 39.9,
    commissionRate: 10,
    matchScore: 78,
    reason: 'Cross-sell opportunity — your healthy living audience overlaps 62% with beauty buyers.',
    reasonTags: ['Cross-sell', 'Healthy living', 'Trending', 'Affordable'],
  },
  {
    id: 'm6',
    name: 'RGB Mechanical Keyboard Hot-Swappable',
    category: 'Electronics',
    price: 129.9,
    commissionRate: 8.5,
    matchScore: 64,
    reason: 'Weaker match for current audience, but trending in your secondary niche (gaming).',
    reasonTags: ['Secondary niche', 'Trending', 'Higher price'],
  },
]

export function ProductMatcherPage() {
  const [selectedNiches, setSelectedNiches] = useState<string[]>(['beauty', 'fashion'])
  const [audience, setAudience] = useState('Muslim women aged 18-34 in Klang Valley, interested in halal beauty, modest fashion, and Raya prep')
  const [contentStyle, setContentStyle] = useState('Tutorials, before/after, lifestyle vlogs')
  const [matches] = useState<MatchedProduct[]>(allMatches)
  const [creating, setCreating] = useState<string | null>(null)

  const toggleNiche = (id: string) => {
    setSelectedNiches((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    )
  }

  const createLink = (p: MatchedProduct) => {
    setCreating(p.id)
    setTimeout(() => {
      setCreating(null)
      toast.success(`Affiliate link created for ${p.name}! 🎉`)
    }, 900)
  }

  const avgMatch = Math.round(matches.reduce((s, m) => s + m.matchScore, 0) / matches.length)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Matcher"
        subtitle="AI matches products to your audience and content style — like a personal shopper for affiliates."
        icon={Icons.Boxes}
        accent="hermes"
      >
        <Badge className="bg-hermes-gradient text-white">
          <Icons.Sparkles className="mr-1 size-3" /> AI Powered
        </Badge>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left — audience input */}
        <div className="space-y-4">
          <Card className="border-hermes/30 bg-gradient-to-br from-hermes/[0.04] to-transparent">
            <div className="border-b p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-hermes-gradient text-white">
                  <Icons.Users className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Your Audience</h3>
                  <p className="text-xs text-muted-foreground">HERMES will match against this</p>
                </div>
              </div>
            </div>
            <CardContent className="space-y-4 p-4">
              {/* Niches */}
              <div className="space-y-2">
                <Label className="text-xs">Your Niches</Label>
                <div className="flex flex-wrap gap-1.5">
                  {niches.map((n) => {
                    const active = selectedNiches.includes(n.id)
                    return (
                      <button
                        key={n.id}
                        onClick={() => toggleNiche(n.id)}
                        className={cn(
                          'rounded-full border-2 px-2.5 py-1 text-xs font-medium transition-all',
                          active ? 'border-hermes bg-hermes/10 text-hermes' : 'border-border hover:border-hermes/40'
                        )}
                      >
                        {n.emoji} {n.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Audience description */}
              <div className="space-y-1.5">
                <Label htmlFor="audience" className="text-xs">Describe your audience</Label>
                <Textarea
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="min-h-[80px] resize-none text-xs"
                />
              </div>

              {/* Content style */}
              <div className="space-y-1.5">
                <Label htmlFor="style" className="text-xs">Content style</Label>
                <Input id="style" value={contentStyle} onChange={(e) => setContentStyle(e.target.value)} />
              </div>

              <Button className="w-full bg-hermes-gradient hover:opacity-90" onClick={() => toast.success('Re-matched with HERMES AI 🤖')}>
                <Icons.Sparkles className="mr-1.5 size-4" /> Re-match products
              </Button>
            </CardContent>
          </Card>

          {/* Match insights */}
          <SectionCard
            title="Match Insights"
            description="AI-computed audience profile"
            icon={Icons.Lightbulb}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5">
                <span className="text-xs text-muted-foreground">Avg match score</span>
                <span className="text-sm font-bold text-hermes">{avgMatch}%</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Icons.CircleDot className="size-3 text-hermes" />
                  <span className="text-muted-foreground">Top audience segment:</span>
                  <span className="font-medium">Muslim women 18-34</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.MapPin className="size-3 text-hermes" />
                  <span className="text-muted-foreground">Top location:</span>
                  <span className="font-medium">Klang Valley (47%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Clock className="size-3 text-hermes" />
                  <span className="text-muted-foreground">Peak active hours:</span>
                  <span className="font-medium">8-11PM MYT</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Heart className="size-3 text-hermes" />
                  <span className="text-muted-foreground">Top interest:</span>
                  <span className="font-medium">Halal beauty (82%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.ShoppingBag className="size-3 text-hermes" />
                  <span className="text-muted-foreground">Avg basket size:</span>
                  <span className="font-medium">RM 45-80</span>
                </div>
              </div>
              <div className="rounded-lg bg-hermes/5 p-2.5 text-xs">
                <p className="font-medium text-hermes">💡 HERMES Tip</p>
                <p className="mt-0.5 text-muted-foreground">
                  Lead with Safi Balqis — 96% match score means it should be your next 3 posts minimum lah.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right — AI matched products */}
        <SectionCard
          title="AI-Matched Products"
          description={`${matches.length} products ranked by match score`}
          icon={Icons.Sparkles}
          action={
            <Select defaultValue="score">
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="score">By match score</SelectItem>
                <SelectItem value="commission">By commission</SelectItem>
                <SelectItem value="price">By price</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          <ScrollArea className="max-h-[760px]">
            <div className="space-y-3">
              {matches.map((p, i) => (
                <Card key={p.id} className={cn(
                  'border-border/60 transition-all hover:shadow-md',
                  i === 0 && 'border-hermes/40 bg-hermes/[0.02]'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-muted/60 to-muted">
                        <Icons.Package className="size-6 text-muted-foreground/50" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-tight">{p.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                              <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                              <span className="text-muted-foreground">{formatRM(p.price)}</span>
                              <span className="text-muted-foreground">·</span>
                              <span className="font-medium text-success">{p.commissionRate}% comm</span>
                              {i === 0 && (
                                <Badge className="bg-hermes-gradient text-white text-[10px]">
                                  <Icons.Crown className="mr-0.5 size-3" /> Top match
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold text-hermes">{p.matchScore}%</span>
                              <Icons.Sparkles className="size-3.5 text-hermes" />
                            </div>
                            <p className="text-[10px] text-muted-foreground">match score</p>
                          </div>
                        </div>

                        <Progress value={p.matchScore} className="mt-2.5 h-1.5" />

                        {/* Why this matches */}
                        <div className="mt-3 rounded-lg bg-muted/40 p-2.5">
                          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-hermes">
                            <Icons.Bot className="size-3" /> Why this matches
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{p.reason}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {p.reasonTags.map((tag) => (
                              <Badge key={tag} variant="outline" className="bg-hermes/5 text-[10px] text-hermes">{tag}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-hermes-gradient hover:opacity-90"
                            disabled={creating === p.id}
                            onClick={() => createLink(p)}
                          >
                            {creating === p.id ? (
                              <><Icons.Loader2 className="mr-1 size-3 animate-spin" /> Creating…</>
                            ) : (
                              <><Icons.Link className="mr-1 size-3" /> Create Link</>
                            )}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toast.info('Opening preview…')}>
                            <Icons.Eye className="size-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toast.success('Saved to wishlist')}>
                            <Icons.Bookmark className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </SectionCard>
      </div>
    </div>
  )
}
