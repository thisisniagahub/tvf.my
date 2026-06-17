'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader, StatCard, SectionCard } from './_shared'
import { formatRM, formatNumber } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const REFERRAL_CODE = 'VIRAL2025'
const REFERRAL_URL = `https://theviralfindsmy.space-z.ai/r/${REFERRAL_CODE}`

interface Referral {
  id: string
  name: string
  email: string
  joinedDate: string
  status: 'joined' | 'upgraded' | 'pending'
  reward: number
  initials: string
}

const referrals: Referral[] = [
  { id: 'r1', name: 'Hafiz Rahman', email: 'hafiz.r@gmail.com', joinedDate: '14 Nov 2025', status: 'upgraded', reward: 50, initials: 'HR' },
  { id: 'r2', name: 'Jasmine Lee', email: 'jasmine.l@gmail.com', joinedDate: '08 Nov 2025', status: 'upgraded', reward: 50, initials: 'JL' },
  { id: 'r3', name: 'Arjun Pillai', email: 'arjun.p@gmail.com', joinedDate: '02 Nov 2025', status: 'upgraded', reward: 50, initials: 'AP' },
  { id: 'r4', name: 'Sofia Abdullah', email: 'sofia.a@gmail.com', joinedDate: '28 Oct 2025', status: 'upgraded', reward: 50, initials: 'SA' },
  { id: 'r5', name: 'Marcus Tan', email: 'marcus.t@gmail.com', joinedDate: '21 Oct 2025', status: 'upgraded', reward: 50, initials: 'MT' },
  { id: 'r6', name: 'Priya Suresh', email: 'priya.s@gmail.com', joinedDate: '15 Nov 2025', status: 'joined', reward: 0, initials: 'PS' },
  { id: 'r7', name: 'Faizal Ibrahim', email: 'faizal.i@gmail.com', joinedDate: '12 Nov 2025', status: 'pending', reward: 25, initials: 'FI' },
  { id: 'r8', name: 'Ling Wei', email: 'ling.w@gmail.com', joinedDate: '09 Nov 2025', status: 'pending', reward: 25, initials: 'LW' },
  { id: 'r9', name: 'Nadia Hassan', email: 'nadia.h@gmail.com', joinedDate: '07 Nov 2025', status: 'pending', reward: 25, initials: 'NH' },
  { id: 'r10', name: 'Daniel Yong', email: 'daniel.y@gmail.com', joinedDate: '04 Nov 2025', status: 'joined', reward: 0, initials: 'DY' },
  { id: 'r11', name: 'Amira Yusof', email: 'amira.y@gmail.com', joinedDate: '01 Nov 2025', status: 'joined', reward: 0, initials: 'AY' },
  { id: 'r12', name: 'Vincent Goh', email: 'vincent.g@gmail.com', joinedDate: '28 Oct 2025', status: 'joined', reward: 0, initials: 'VG' },
]

const topReferrers = [
  { name: 'Lim Chee Keong', count: 47, earned: 2350, initials: 'LC' },
  { name: 'Siti Nurhaliza', count: 38, earned: 1900, initials: 'SN' },
  { name: 'Ahmad Faizal', count: 31, earned: 1550, initials: 'AF' },
  { name: 'Priya Devi', count: 24, earned: 1200, initials: 'PD' },
]

const shareButtons = [
  { label: 'WhatsApp', icon: Icons.MessageCircle, color: 'bg-success text-white hover:opacity-90' },
  { label: 'Facebook', icon: Icons.Facebook, color: 'bg-blue-600 text-white hover:opacity-90' },
  { label: 'Telegram', icon: Icons.Send, color: 'bg-sky-500 text-white hover:opacity-90' },
  { label: 'Email', icon: Icons.Mail, color: 'bg-foreground text-background hover:opacity-90' },
]

const steps = [
  {
    step: 1,
    title: 'Share Your Link',
    desc: 'Send your unique referral link to kawan-kawan via WhatsApp, Facebook, or any channel.',
    icon: Icons.Share2,
  },
  {
    step: 2,
    title: 'Friend Joins & Upgrades',
    desc: 'When your friend signs up and upgrades to Pro or Business plan, you both get rewarded.',
    icon: Icons.UserPlus,
  },
  {
    step: 3,
    title: 'You Earn RM 50',
    desc: 'Get RM 50 cash for every successful upgrade. No cap — refer more, earn more!',
    icon: Icons.Gift,
  },
]

export function ReferralsPage() {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  const copy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard?.writeText(text)
    setCopied(type)
    toast.success(`${type === 'code' ? 'Referral code' : 'Referral link'} copied!`, {
      description: 'Paste it anywhere and start earning',
    })
    setTimeout(() => setCopied(null), 2000)
  }

  const share = (platform: string) => {
    toast.success(`Sharing via ${platform}`, { description: 'Opening share dialog...' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refer & Earn"
        subtitle="Invite friends to TheViralFindsMY and earn RM 50 per upgrade"
        icon={Icons.Gift}
        accent="shopee"
      >
        <Button variant="outline" size="sm">
          <Icons.Download className="mr-1 size-4" /> Export History
        </Button>
      </PageHeader>

      {/* Hero card */}
      <Card className="relative overflow-hidden border-shopee/30">
        <div className="absolute inset-0 bg-gradient-to-br from-shopee/10 via-shopee/5 to-transparent" />
        <div className="absolute -right-12 -top-12 size-48 rounded-full bg-shopee/10 blur-3xl" />
        <CardContent className="relative p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <Badge className="mb-3 gap-1 bg-shopee text-white">
                <Icons.Sparkles className="size-3" /> Limited Time Bonus
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Earn <span className="text-shopee">RM 50</span> for every friend who upgrades!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Share your referral link with kawan-kawan. When they upgrade to Pro or Business, you pocket RM 50 cash — no limit, no cap, just pure rezeki.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-shopee/40 bg-background/80 px-4 py-2">
                  <span className="text-xs font-medium uppercase text-muted-foreground">Your Code</span>
                  <span className="font-mono text-lg font-bold text-shopee">{REFERRAL_CODE}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => copy(REFERRAL_CODE, 'code')}
                  >
                    {copied === 'code' ? <Icons.Check className="size-3.5 text-success" /> : <Icons.Copy className="size-3.5" />}
                  </Button>
                </div>
                <Button
                  className="bg-shopee-gradient hover:opacity-90"
                  onClick={() => copy(REFERRAL_URL, 'link')}
                >
                  <Icons.Link className="mr-1 size-4" /> Copy Referral Link
                </Button>
              </div>
            </div>
            <div className="flex size-32 shrink-0 items-center justify-center rounded-2xl bg-shopee-gradient text-white shadow-xl md:size-40">
              <Icons.Gift className="size-16 md:size-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Friends Referred" value="12" icon={Icons.Users} accent="shopee" subtitle="All time" delta="+3 this month" deltaType="up" />
        <StatCard label="Successful Upgrades" value="5" icon={Icons.CheckCircle2} accent="success" subtitle="41% conversion rate" />
        <StatCard label="Total Earned" value={formatRM(250)} icon={Icons.Wallet} accent="warning" subtitle="Paid out" delta="+RM 50 last week" deltaType="up" />
        <StatCard label="Pending Rewards" value={formatRM(150)} icon={Icons.Clock} accent="hermes" subtitle="3 friends trialing" />
      </div>

      {/* Share link section */}
      <SectionCard
        title="Share Your Link"
        description="Spread the word across your favourite platforms"
        icon={Icons.Share2}
        action={<Badge variant="outline" className="gap-1"><Icons.Eye className="size-3" /> 47 link views</Badge>}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={REFERRAL_URL}
              className="font-mono text-sm"
            />
            <Button
              variant={copied === 'link' ? 'default' : 'outline'}
              onClick={() => copy(REFERRAL_URL, 'link')}
              className={cn(copied === 'link' && 'bg-success text-white hover:opacity-90')}
            >
              {copied === 'link' ? <Icons.Check className="mr-1 size-4" /> : <Icons.Copy className="mr-1 size-4" />}
              {copied === 'link' ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {shareButtons.map((btn) => {
              const BtnIcon = btn.icon
              return (
                <Button
                  key={btn.label}
                  variant="outline"
                  className={cn('h-auto justify-start gap-2 py-3', btn.color, 'border-0')}
                  onClick={() => share(btn.label)}
                >
                  <BtnIcon className="size-4" />
                  <span className="text-sm font-medium">{btn.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </SectionCard>

      {/* How it works */}
      <SectionCard
        title="How It Works"
        description="Three easy steps to start earning"
        icon={Icons.Lightbulb}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => {
            const StepIcon = step.icon
            return (
              <div
                key={step.step}
                className="relative rounded-xl border border-border/60 bg-muted/30 p-5 transition-colors hover:bg-muted/60"
              >
                <div className="absolute right-3 top-3 text-5xl font-black text-shopee/10">
                  {step.step}
                </div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-shopee-gradient text-white">
                  <StepIcon className="size-6" />
                </div>
                <h4 className="mt-3 font-bold">{step.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{step.desc}</p>
                {i < steps.length - 1 && (
                  <Icons.ChevronRight className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-muted-foreground md:block" />
                )}
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* Referral history */}
      <SectionCard
        title="Referral History"
        description={`${referrals.length} friends invited — ${referrals.filter(r => r.status === 'upgraded').length} upgraded`}
        icon={Icons.Users}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Friend</TableHead>
              <TableHead className="hidden sm:table-cell">Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Your Reward</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((r) => (
              <TableRow key={r.id} className="group transition-colors hover:bg-shopee/5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-muted text-xs font-semibold">
                        {r.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium group-hover:text-shopee">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{r.joinedDate}</TableCell>
                <TableCell>
                  {r.status === 'upgraded' && (
                    <Badge className="gap-1 bg-success text-white">
                      <Icons.Check className="size-3" /> Upgraded
                    </Badge>
                  )}
                  {r.status === 'joined' && (
                    <Badge variant="secondary" className="gap-1">
                      <Icons.User className="size-3" /> Joined
                    </Badge>
                  )}
                  {r.status === 'pending' && (
                    <Badge className="gap-1 bg-warning text-white">
                      <Icons.Clock className="size-3" /> Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {r.reward > 0 ? (
                    <span className="font-bold text-success">{formatRM(r.reward)}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>

      {/* Top referrers leaderboard */}
      <SectionCard
        title="Top Referrers This Month"
        description="Malaysian affiliates crushing the referral game"
        icon={Icons.Trophy}
      >
        <div className="space-y-3">
          {topReferrers.map((ref, idx) => {
            const podium = idx < 3
            const medalColors = ['bg-warning text-white', 'bg-muted text-foreground', 'bg-orange-400 text-white']
            return (
              <div
                key={ref.name}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-3 transition-all',
                  podium ? 'border-warning/30 bg-warning/5' : 'border-border/60'
                )}
              >
                <div className={cn(
                  'flex size-9 items-center justify-center rounded-full text-sm font-bold',
                  podium ? medalColors[idx] : 'bg-muted text-muted-foreground'
                )}>
                  {idx + 1}
                </div>
                <Avatar className="size-9">
                  <AvatarFallback className="bg-shopee/10 text-xs font-bold text-shopee">
                    {ref.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{ref.name}</p>
                  <p className="text-xs text-muted-foreground">{ref.count} friends referred</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-shopee">{formatRM(ref.earned)}</p>
                  <p className="text-[10px] text-muted-foreground">earned</p>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* CTA */}
      <Card className="overflow-hidden border-shopee/30 bg-gradient-to-br from-shopee/5 to-transparent">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-shopee/15 text-shopee">
              <Icons.Rocket className="size-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">Hit RM 500 in referrals this month!</h3>
              <p className="text-sm text-muted-foreground">
                You&apos;re just 5 upgrades away from the &quot;Top Referrer&quot; badge — keep sharing!
              </p>
            </div>
          </div>
          <Button
            className="bg-shopee-gradient hover:opacity-90"
            onClick={() => copy(REFERRAL_URL, 'link')}
          >
            <Icons.Share2 className="mr-1 size-4" /> Share Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
