'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader, SectionCard } from './_shared'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface Persona {
  id: string
  name: string
  emoji: string
  tagline: string
  demographics: string
  interests: string[]
  bestProducts: string[]
  postingTimes: string
  conversion: number
  size: string
  accent: 'shopee' | 'hermes' | 'success' | 'warning'
}

const personas: Persona[] = [
  {
    id: 'bargain',
    name: 'The Bargain Hunter',
    emoji: '🛒',
    tagline: 'Will scroll 100 posts to save RM 5',
    demographics: 'Female, 25-44, Klang Valley & Penang',
    interests: ['Flash sales', 'Coupon stacking', 'Free shipping', 'Bundle deals'],
    bestProducts: ['Portable Blender', 'Anker Power Bank', 'Smart Watch'],
    postingTimes: '12-2PM & 9-11PM',
    conversion: 28.4,
    size: '34% of audience',
    accent: 'shopee',
  },
  {
    id: 'beauty',
    name: 'The Beauty Enthusiast',
    emoji: '💄',
    tagline: 'Halal & cruelty-free is non-negotiable',
    demographics: 'Female, 18-34, Nationwide (urban)',
    interests: ['Halal beauty', 'Skincare routines', 'Tudung styling', 'Before/after'],
    bestProducts: ['Safi Balqis Sunblock', 'Wardah Lipstick', 'Cushion Foundation'],
    postingTimes: '7-9PM golden hour',
    conversion: 31.2,
    size: '28% of audience',
    accent: 'hermes',
  },
  {
    id: 'tech',
    name: 'The Tech Geek',
    emoji: '🎮',
    tagline: 'Reads spec sheets before buying anything',
    demographics: 'Male, 22-40, KL, Selangor & JB',
    interests: ['Gaming gear', 'Smart home', 'Gadget reviews', 'Spec comparisons'],
    bestProducts: ['RGB Keyboard', 'Wireless Earbuds', 'Robot Vacuum'],
    postingTimes: '9PM-12AM impulse window',
    conversion: 18.6,
    size: '22% of audience',
    accent: 'success',
  },
  {
    id: 'raya',
    name: 'The Raya Shopper',
    emoji: '🌙',
    tagline: 'Bulk-buys 2 months before Raya',
    demographics: 'Female, 28-45, Nationwide',
    interests: ['Baju Raya', 'Tudung premium', 'Raya hampers', 'Decorations'],
    bestProducts: ['Tudung Bawal', 'Wardah Lipstick', 'Cushion Foundation'],
    postingTimes: '8-10PM (Ramadan: 2-4AM supper)',
    conversion: 24.8,
    size: '16% of audience',
    accent: 'warning',
  },
]

const ageData = [
  { age: '13-17', value: 6, color: 'var(--chart-5)' },
  { age: '18-24', value: 28, color: 'var(--hermes)' },
  { age: '25-34', value: 38, color: 'var(--shopee)' },
  { age: '35-44', value: 19, color: 'var(--success)' },
  { age: '45-54', value: 7, color: 'var(--warning)' },
  { age: '55+', value: 2, color: 'var(--muted-foreground)' },
]

const genderData = [
  { name: 'Female', value: 68, color: 'var(--hermes)' },
  { name: 'Male', value: 30, color: 'var(--shopee)' },
  { name: 'Other', value: 2, color: 'var(--success)' },
]

const locationData = [
  { state: 'Selangor', pct: 24 },
  { state: 'KL', pct: 18 },
  { state: 'Johor', pct: 12 },
  { state: 'Penang', pct: 9 },
  { state: 'Perak', pct: 8 },
  { state: 'Sabah', pct: 7 },
  { state: 'Sarawak', pct: 6 },
  { state: 'N. Sembilan', pct: 5 },
  { state: 'Kedah', pct: 4 },
  { state: 'Others', pct: 7 },
]

// 7 days x 24 hours heat intensity (mocked as hour-by-day)
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = Array.from({ length: 24 }, (_, i) => i)
const heatData: number[][] = days.map((_, d) =>
  hours.map((h) => {
    // Boost 7-9PM, 12-2PM, weekend nights
    let base = 30
    if (h >= 7 && h <= 9) base = 75 + Math.random() * 20
    else if (h >= 12 && h <= 14) base = 55 + Math.random() * 15
    else if (h >= 19 && h <= 22) base = 80 + Math.random() * 18
    else if (h >= 0 && h <= 5) base = 12 + Math.random() * 8
    else base = 35 + Math.random() * 20
    if (d >= 5) base = Math.min(100, base * 1.15) // weekend boost
    return Math.round(base)
  })
)

const aiRecommendations = [
  { id: 'ar1', text: 'Lead next 3 posts with halal beauty — 82% audience overlap', icon: Icons.Sparkles, action: 'Create beauty post' },
  { id: 'ar2', text: 'Schedule your Sunday post at 8PM — peak engagement window', icon: Icons.Clock, action: 'Schedule post' },
  { id: 'ar3', text: 'Test Tudung Bawal for Raya persona — 16% audience ready to buy', icon: Icons.Target, action: 'Promote tudung' },
  { id: 'ar4', text: 'Avoid posting 2-4AM — your audience is sleeping', icon: Icons.Moon, action: 'Set quiet hours' },
  { id: 'ar5', text: 'Klang Valley is 42% of audience — localize with Manglish captions', icon: Icons.MapPin, action: 'Localize captions' },
]

export function AudienceAiPage() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>('beauty')
  const selected = personas.find((p) => p.id === selectedPersona)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audience AI"
        subtitle="HERMES profiles your followers into personas — know exactly who you&apos;re selling to."
        icon={Icons.Users}
        accent="hermes"
      >
        <Badge className="bg-hermes-gradient text-white">
          <Icons.Sparkles className="mr-1 size-3" /> AI Powered
        </Badge>
        <Button variant="outline" size="sm" onClick={() => toast.success('Audience report exported!')}>
          <Icons.Download className="mr-1 size-4" /> Export
        </Button>
      </PageHeader>

      {/* Persona cards */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Icons.UserCircle className="size-4 text-hermes" />
          <h3 className="text-sm font-semibold">Audience Personas</h3>
          <span className="text-xs text-muted-foreground">— click to see details below</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {personas.map((p) => {
            const active = selectedPersona === p.id
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                  active ? 'border-hermes bg-hermes/5' : 'border-border/60 hover:border-hermes/40'
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{p.emoji}</span>
                  <Badge variant="outline" className={cn(
                    'text-[10px]',
                    p.accent === 'shopee' && 'bg-shopee/5 text-shopee',
                    p.accent === 'hermes' && 'bg-hermes/5 text-hermes',
                    p.accent === 'success' && 'bg-success/5 text-success',
                    p.accent === 'warning' && 'bg-warning/5 text-warning',
                  )}>{p.size}</Badge>
                </div>
                <p className="mt-2 text-sm font-bold">{p.name}</p>
                <p className="text-xs text-muted-foreground italic">&quot;{p.tagline}&quot;</p>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">CVR</span>
                  <span className="font-bold text-success">{p.conversion}%</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected persona detail */}
      {selected && (
        <Card className={cn(
          'border-2 bg-gradient-to-br to-transparent',
          selected.accent === 'shopee' && 'border-shopee/30 from-shopee/[0.04]',
          selected.accent === 'hermes' && 'border-hermes/30 from-hermes/[0.04]',
          selected.accent === 'success' && 'border-success/30 from-success/[0.04]',
          selected.accent === 'warning' && 'border-warning/30 from-warning/[0.04]',
        )}>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{selected.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{selected.name}</h3>
                    <Badge className={cn(
                      selected.accent === 'shopee' && 'bg-shopee/15 text-shopee',
                      selected.accent === 'hermes' && 'bg-hermes/15 text-hermes',
                      selected.accent === 'success' && 'bg-success/15 text-success',
                      selected.accent === 'warning' && 'bg-warning/15 text-warning',
                    )}>{selected.size}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground italic">&quot;{selected.tagline}&quot;</p>
                  <p className="mt-1 flex items-center gap-1 text-xs">
                    <Icons.Users className="size-3 text-muted-foreground" />
                    {selected.demographics}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase text-muted-foreground">Conversion rate</span>
                <span className="text-2xl font-bold text-success">{selected.conversion}%</span>
                <span className="text-[10px] text-muted-foreground">Best posting: {selected.postingTimes}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground">
                  <Icons.Heart className="size-3" /> Interests
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {selected.interests.map((i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{i}</Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground">
                  <Icons.Package className="size-3" /> Best products
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {selected.bestProducts.map((p) => (
                    <Badge key={p} variant="outline" className="text-[10px] bg-hermes/5 text-hermes">{p}</Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground">
                  <Icons.Clock className="size-3" /> Best posting time
                </p>
                <p className="mt-1.5 text-xs font-medium">{selected.postingTimes}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">MYT (UTC+8)</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" className="bg-hermes-gradient hover:opacity-90" onClick={() => toast.success('Targeting this persona for next post!')}>
                <Icons.Target className="mr-1 size-3" /> Target this persona
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info('Generating tailored content…')}>
                <Icons.Sparkles className="mr-1 size-3" /> Generate content for them
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audience insights dashboard */}
      <Tabs defaultValue="demographics">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="demographics"><Icons.Users className="mr-1.5 size-4" /> Demographics</TabsTrigger>
          <TabsTrigger value="locations"><Icons.MapPin className="mr-1.5 size-4" /> Locations</TabsTrigger>
          <TabsTrigger value="active-hours"><Icons.Clock className="mr-1.5 size-4" /> Active Hours</TabsTrigger>
          <TabsTrigger value="recommendations"><Icons.Sparkles className="mr-1.5 size-4" /> AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Age Distribution" description="Where your followers fall" icon={Icons.BarChart3}>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="age" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {ageData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Gender Split" description="Audience gender breakdown" icon={Icons.UserCheck}>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                      {genderData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="mt-4">
          <SectionCard title="Top Locations" description="Malaysian states — your top audience regions" icon={Icons.MapPin}>
            <div className="grid gap-2 sm:grid-cols-2">
              {locationData.map((loc, i) => (
                <div key={loc.state} className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-hermes/10 text-xs font-bold text-hermes">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">{loc.state}</p>
                      <span className="text-xs font-bold text-hermes">{loc.pct}%</span>
                    </div>
                    <Progress value={loc.pct * 4} className="mt-1 h-1" />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="active-hours" className="mt-4">
          <SectionCard title="Active Hours Heatmap" description="Engagement intensity by day & hour (MYT)" icon={Icons.Clock}>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="flex">
                  <div className="w-10" />
                  {hours.map((h) => (
                    <div key={h} className="flex-1 text-center text-[8px] text-muted-foreground">
                      {h % 3 === 0 ? `${h}h` : ''}
                    </div>
                  ))}
                </div>
                {days.map((day, d) => (
                  <div key={day} className="mt-0.5 flex items-center">
                    <div className="w-10 text-[10px] font-semibold">{day}</div>
                    {hours.map((h) => {
                      const val = heatData[d][h]
                      const intensity = val / 100
                      const bg = val > 75 ? `rgba(96, 60, 200, ${intensity})` :
                                 val > 50 ? `rgba(96, 60, 200, ${intensity * 0.7})` :
                                 val > 30 ? `rgba(96, 60, 200, ${intensity * 0.4})` :
                                 `rgba(120, 120, 130, ${intensity * 0.2})`
                      return (
                        <div
                          key={h}
                          className="mx-0.5 flex-1 rounded-sm"
                          style={{
                            height: '20px',
                            backgroundColor: bg,
                          }}
                          title={`${day} ${h}:00 — ${val}% active`}
                        />
                      )
                    })}
                  </div>
                ))}
                <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>Less active</span>
                  <div className="flex gap-0.5">
                    {[0.2, 0.4, 0.6, 0.8, 1].map((o) => (
                      <div key={o} className="size-3 rounded-sm" style={{ backgroundColor: `rgba(96, 60, 200, ${o})` }} />
                    ))}
                  </div>
                  <span>More active</span>
                  <Badge variant="outline" className="ml-auto text-[10px] bg-success/5 text-success">Peak: 7-9PM daily</Badge>
                </div>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <SectionCard title="AI Recommendations" description="Based on your audience profile" icon={Icons.Sparkles}>
            <div className="space-y-2">
              {aiRecommendations.map((r) => {
                const Icon = r.icon
                return (
                  <div key={r.id} className="flex items-start gap-3 rounded-lg border border-border/60 p-3 hover:bg-accent/40">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-hermes/10 text-hermes">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{r.text}</p>
                      <Button size="sm" variant="outline" className="mt-2 h-7" onClick={() => toast.success(`${r.action} — applied!`)}>
                        <Icons.Zap className="mr-1 size-3" /> {r.action}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
