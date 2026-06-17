'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader, StatCard, SectionCard } from './_shared'
import { formatNumber } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Hashtag {
  tag: string
  reach: number
  trend: 'up' | 'down' | 'stable'
  trending: boolean
}

const trendingMY: Hashtag[] = [
  { tag: '#ShopeeMY', reach: 2400000, trend: 'up', trending: true },
  { tag: '#Raya2025', reach: 1850000, trend: 'up', trending: true },
  { tag: '#BarangMurah', reach: 1420000, trend: 'up', trending: true },
  { tag: '#TikTokShopMY', reach: 1280000, trend: 'up', trending: true },
  { tag: '#HalalBeauty', reach: 980000, trend: 'up', trending: true },
  { tag: '#KlangValleyDeals', reach: 760000, trend: 'stable', trending: false },
  { tag: '#TudungBawal', reach: 690000, trend: 'up', trending: true },
  { tag: '#ManglishVibes', reach: 540000, trend: 'up', trending: true },
  { tag: '#MurahGiler', reach: 480000, trend: 'stable', trending: false },
  { tag: '#BestBuyMY', reach: 420000, trend: 'down', trending: false },
  { tag: '#CantikMurah', reach: 380000, trend: 'up', trending: true },
  { tag: '#SahkanDulu', reach: 320000, trend: 'up', trending: true },
]

const platforms = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'shopee', label: 'Shopee' },
]

function buildHashtags(topic: string, platform: string, count: number): Hashtag[] {
  const cleanTopic = topic.trim() || 'Best Product'
  const topicTag = `#${cleanTopic.split(/\s+/).slice(0, 3).join('')}`
  const platformTag = platform === 'instagram' ? '#IGShopMY' : platform === 'tiktok' ? '#TikTokMadeMeBuyIt' : '#ShopeeAffiliateMY'

  const generated: Hashtag[] = [
    { tag: topicTag, reach: 580000 + Math.floor(Math.random() * 200000), trend: 'up', trending: true },
    { tag: platformTag, reach: 1240000, trend: 'up', trending: true },
    { tag: '#ShopeeMY', reach: 2400000, trend: 'up', trending: true },
    { tag: '#ShopeeAffiliateMY', reach: 680000, trend: 'up', trending: true },
    { tag: '#MalaysiaShopping', reach: 920000, trend: 'up', trending: true },
    { tag: '#BestDealMY', reach: 540000, trend: 'stable', trending: false },
    { tag: '#KakiBeli', reach: 420000, trend: 'up', trending: true },
    { tag: '#OnlineShoppingMY', reach: 380000, trend: 'stable', trending: false },
    { tag: '#CantikMurah', reach: 380000, trend: 'up', trending: true },
    { tag: '#ReviewMalaysia', reach: 290000, trend: 'up', trending: true },
    { tag: '#WorthIt', reach: 510000, trend: 'stable', trending: false },
    { tag: '#TrendingNow', reach: 880000, trend: 'up', trending: true },
    { tag: '#MustHaveMY', reach: 240000, trend: 'up', trending: true },
    { tag: '#BarangMurah', reach: 1420000, trend: 'up', trending: true },
    { tag: '#SaleMY', reach: 760000, trend: 'up', trending: true },
    { tag: '#MurahGiler', reach: 480000, trend: 'stable', trending: false },
    { tag: '#ViralMY', reach: 690000, trend: 'up', trending: true },
    { tag: '#BeliLah', reach: 180000, trend: 'up', trending: true },
    { tag: '#ConfirmBest', reach: 140000, trend: 'up', trending: true },
    { tag: '#RamaiYangCari', reach: 220000, trend: 'up', trending: true },
    { tag: '#KenaTry', reach: 160000, trend: 'up', trending: true },
    { tag: '#SedapGiler', reach: 340000, trend: 'up', trending: true },
    { tag: '#CantikBersih', reach: 200000, trend: 'stable', trending: false },
    { tag: '#PromosiMY', reach: 410000, trend: 'up', trending: true },
    { tag: '#JanganLupa', reach: 130000, trend: 'up', trending: true },
    { tag: '#StokTerhad', reach: 280000, trend: 'up', trending: true },
    { tag: '#FlashSaleMY', reach: 590000, trend: 'up', trending: true },
    { tag: '#MestiBeli', reach: 220000, trend: 'up', trending: true },
    { tag: '#TrendingMY', reach: 670000, trend: 'up', trending: true },
    { tag: '#BolehCuba', reach: 180000, trend: 'stable', trending: false },
  ]
  return generated.slice(0, count)
}

export function HashtagAiPage() {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [count, setCount] = useState(20)
  const [loading, setLoading] = useState(false)
  const [hashtags, setHashtags] = useState<Hashtag[]>([])

  const generate = async () => {
    if (!topic.trim()) {
      toast.error('Type your product or niche first lah!')
      return
    }
    setLoading(true)
    setHashtags([])
    await new Promise((r) => setTimeout(r, 1000))
    setHashtags(buildHashtags(topic, platform, count))
    setLoading(false)
    toast.success(`${count} hashtags generated by HERMES! 🎯`)
  }

  const totalReach = hashtags.reduce((s, h) => s + h.reach, 0)
  const trendingCount = hashtags.filter((h) => h.trending).length
  const trendingScore = hashtags.length ? Math.round((trendingCount / hashtags.length) * 100) : 0

  const copyAll = () => {
    navigator.clipboard.writeText(hashtags.map((h) => h.tag).join(' '))
    toast.success(`Copied ${hashtags.length} hashtags! 📋`)
  }

  const copyOne = (tag: string) => {
    navigator.clipboard.writeText(tag)
    toast.success(`${tag} copied`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hashtag AI"
        subtitle="HERMES generates hashtags tuned for the Malaysian market — with reach estimates."
        icon={Icons.Hash}
        accent="hermes"
      >
        <Badge className="bg-hermes-gradient text-white">
          <Icons.Sparkles className="mr-1 size-3" /> AI Powered
        </Badge>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Generator */}
          <Card className="border-hermes/30 bg-gradient-to-br from-hermes/[0.04] to-transparent">
            <div className="border-b p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-hermes-gradient text-white">
                  <Icons.Hash className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Hashtag Generator</h3>
                  <p className="text-xs text-muted-foreground">Tuned for Malaysian reach</p>
                </div>
              </div>
            </div>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="topic" className="text-xs">Product / Niche description</Label>
                <Textarea
                  id="topic"
                  placeholder="e.g., Safi Balqis UV Sunblock SPF50 — halal beauty for daily use"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-[70px] resize-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Hashtag count</Label>
                    <Badge variant="outline" className="text-[10px] text-hermes">{count}</Badge>
                  </div>
                  <Slider value={[count]} onValueChange={(v) => setCount(v[0])} min={10} max={30} step={1} />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>10</span>
                    <span>30</span>
                  </div>
                </div>
              </div>

              <Button onClick={generate} disabled={loading} className="w-full bg-hermes-gradient hover:opacity-90">
                {loading ? (
                  <><Icons.Loader2 className="mr-1.5 size-4 animate-spin" /> HERMES is researching trends…</>
                ) : (
                  <><Icons.Sparkles className="mr-1.5 size-4" /> Generate Hashtags</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          {hashtags.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Total Reach Estimate"
                value={formatNumber(totalReach)}
                delta="+12% above niche avg"
                deltaType="up"
                icon={Icons.Eye}
                accent="hermes"
              />
              <StatCard
                label="Trending Hashtags"
                value={`${trendingCount}/${hashtags.length}`}
                icon={Icons.TrendingUp}
                accent="shopee"
                subtitle="Hot right now in MY"
              />
              <StatCard
                label="Trending Score"
                value={`${trendingScore}/100`}
                delta={trendingScore > 70 ? 'Excellent' : trendingScore > 50 ? 'Good' : 'Low'}
                deltaType={trendingScore > 70 ? 'up' : trendingScore > 50 ? 'neutral' : 'down'}
                icon={Icons.Gauge}
                accent="success"
                subtitle="HERMES computed"
              />
            </div>
          )}

          {/* Results */}
          <SectionCard
            title="Generated Hashtags"
            description={hashtags.length ? `${hashtags.length} hashtags ready` : 'Run generator to see results'}
            icon={Icons.Tags}
            action={hashtags.length > 0 && (
              <Button size="sm" variant="outline" onClick={copyAll}>
                <Icons.Copy className="mr-1 size-3" /> Copy all
              </Button>
            )}
          >
            {loading ? (
              <div className="flex h-48 flex-col items-center justify-center">
                <div className="relative">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-hermes-gradient text-white">
                    <Icons.Hash className="size-7 animate-pulse" />
                  </div>
                  <div className="pulse-ring absolute inset-0 rounded-2xl text-hermes/60" />
                </div>
                <p className="mt-3 text-sm font-medium text-hermes">Researching Malaysian trends…</p>
              </div>
            ) : hashtags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => copyOne(h.tag)}
                    className="group relative overflow-hidden rounded-lg border-2 border-border/60 px-3 py-1.5 text-left transition-all hover:border-hermes/40 hover:bg-hermes/5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-hermes">{h.tag}</span>
                      {h.trending && (
                        <Badge className="bg-shopee/15 text-shopee text-[9px] py-0 px-1">
                          <Icons.Flame className="mr-0.5 size-2.5" /> Hot
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Icons.Eye className="size-2.5" />
                      {formatNumber(h.reach)}
                      {h.trend === 'up' && <Icons.TrendingUp className="ml-0.5 size-2.5 text-success" />}
                      {h.trend === 'down' && <Icons.TrendingDown className="ml-0.5 size-2.5 text-destructive" />}
                      {h.trend === 'stable' && <Icons.Minus className="ml-0.5 size-2.5 text-muted-foreground" />}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <Icons.Hash className="size-12 text-hermes/30" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">Hashtags will appear here</p>
                <p className="text-xs text-muted-foreground">Fill in the form and hit Generate</p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <SectionCard
            title="Trending in Malaysia"
            description="Live feed — top tags now"
            icon={Icons.Activity}
            action={
              <Badge variant="outline" className="bg-success/5 text-success text-[10px]">
                <span className="relative mr-1 flex size-1.5">
                  <span className="pulse-ring absolute inline-flex size-1.5 rounded-full text-success/60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-success" />
                </span>
                Live
              </Badge>
            }
          >
            <ScrollArea className="max-h-[560px]">
              <div className="space-y-1.5">
                {trendingMY.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => copyOne(h.tag)}
                    className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-accent/50"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="truncate text-xs font-semibold text-hermes">{h.tag}</p>
                        {h.trending && <Icons.Flame className="size-3 text-shopee" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{formatNumber(h.reach)} reach</p>
                    </div>
                    {h.trend === 'up' && <Icons.TrendingUp className="size-3 text-success" />}
                    {h.trend === 'down' && <Icons.TrendingDown className="size-3 text-destructive" />}
                    {h.trend === 'stable' && <Icons.Minus className="size-3 text-muted-foreground" />}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </SectionCard>

          <Card className="border-hermes/30 bg-gradient-to-br from-hermes/[0.05] to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-hermes-gradient text-white">
                  <Icons.Bot className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Hashtag Strategy</p>
                  <p className="text-[10px] text-muted-foreground">HERMES best practice</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5">
                  <Icons.Check className="mt-0.5 size-3 shrink-0 text-success" />
                  Mix 3-5 broad tags (1M+ reach) + 5-10 niche tags
                </li>
                <li className="flex items-start gap-1.5">
                  <Icons.Check className="mt-0.5 size-3 shrink-0 text-success" />
                  Always include #ShopeeMY & your product tag
                </li>
                <li className="flex items-start gap-1.5">
                  <Icons.Check className="mt-0.5 size-3 shrink-0 text-success" />
                  Use Manglish tags for local engagement boost
                </li>
                <li className="flex items-start gap-1.5">
                  <Icons.Check className="mt-0.5 size-3 shrink-0 text-success" />
                  IG max 30, TikTok optimal 4-6
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
