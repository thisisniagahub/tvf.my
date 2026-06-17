'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useTheme } from 'next-themes'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader, SectionCard } from './_shared'
import { useAppStore } from '@/store/app-store'
import { formatRM } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const niches = [
  { id: 'electronics', label: 'Electronics', emoji: '📱' },
  { id: 'beauty', label: 'Beauty', emoji: '💄' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'home', label: 'Home & Living', emoji: '🏠' },
  { id: 'food', label: 'Food & Beverage', emoji: '🍜' },
  { id: 'baby', label: 'Baby & Kids', emoji: '👶' },
  { id: 'sports', label: 'Sports & Fitness', emoji: '🏋️' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
]

const integrations = [
  { name: 'Shopee API', desc: 'Sync products, orders & commissions', icon: Icons.ShoppingBag, status: 'connected', color: 'text-shopee' },
  { name: 'TikTok Shop', desc: 'Cross-post & track TikTok sales', icon: Icons.Music, status: 'disconnected', color: 'text-foreground' },
  { name: 'Lazada', desc: 'Multi-platform affiliate tracking', icon: Icons.ShoppingCart, status: 'disconnected', color: 'text-success' },
  { name: 'Telegram Bot', desc: 'Get instant alerts on Telegram', icon: Icons.Send, status: 'disconnected', color: 'text-hermes' },
  { name: 'WhatsApp Business', desc: 'Send reports & alerts via WA', icon: Icons.MessageCircle, status: 'disconnected', color: 'text-success' },
  { name: 'Google Analytics', desc: 'Track click attribution', icon: Icons.BarChart3, status: 'connected', color: 'text-warning' },
]

const billingHistory = [
  { date: '01 Dec 2025', invoice: 'INV-2025-1201', amount: 99, status: 'paid' },
  { date: '01 Nov 2025', invoice: 'INV-2025-1101', amount: 99, status: 'paid' },
  { date: '01 Oct 2025', invoice: 'INV-2025-1001', amount: 99, status: 'paid' },
  { date: '01 Sep 2025', invoice: 'INV-2025-0901', amount: 99, status: 'paid' },
  { date: '01 Aug 2025', invoice: 'INV-2025-0801', amount: 29, status: 'paid' },
]

const sessions = [
  { device: 'MacBook Pro · Chrome', location: 'Kuala Lumpur, MY', ip: '175.143.xx.xx', current: true, lastActive: 'Active now' },
  { device: 'iPhone 14 · Safari', location: 'Kuala Lumpur, MY', ip: '175.143.xx.xx', current: false, lastActive: '2 hours ago' },
  { device: 'Windows PC · Edge', location: 'Petaling Jaya, MY', ip: '203.106.xx.xx', current: false, lastActive: '3 days ago' },
]

export function SettingsPage() {
  const { user, liveNotificationsEnabled, setLiveNotificationsEnabled, setChangelogOpen } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [selectedNiches, setSelectedNiches] = useState<string[]>(user?.niches ?? ['Electronics', 'Beauty', 'Fashion'])
  const [bio, setBio] = useState('Malaysian affiliate marketer focused on trending Shopee products. Beauty, fashion, and tech enthusiast.')

  const toggleNiche = (label: string) => {
    setSelectedNiches((prev) =>
      prev.includes(label) ? prev.filter((n) => n !== label) : [...prev, label]
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account, integrations, and preferences"
        icon={Icons.Settings}
        accent="shopee"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <TabsList className="flex h-auto w-full shrink-0 flex-col items-stretch gap-1 bg-transparent p-0 lg:w-56">
          {[
            { id: 'profile', label: 'Profile', icon: Icons.User },
            { id: 'notifications', label: 'Notifications', icon: Icons.Bell },
            { id: 'billing', label: 'Billing', icon: Icons.CreditCard },
            { id: 'integrations', label: 'Integrations', icon: Icons.Plug },
            { id: 'security', label: 'Security', icon: Icons.Shield },
            { id: 'appearance', label: 'Appearance', icon: Icons.Palette },
            { id: 'about', label: 'About', icon: Icons.Info },
          ].map((tab) => {
            const TabIcon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="justify-start gap-2 border border-transparent bg-muted/40 px-3 py-2 text-sm data-[state=active]:bg-shopee/10 data-[state=active]:text-shopee data-[state=active]:shadow-none"
              >
                <TabIcon className="size-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Profile */}
          <TabsContent value="profile" className="mt-0 space-y-6">
            <SectionCard title="Profile Information" description="Update your personal details" icon={Icons.UserCircle}>
              <div className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="size-20 ring-2 ring-shopee/30 ring-offset-2">
                    <AvatarFallback className="bg-shopee-gradient text-2xl font-bold text-white">
                      TVM
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Icons.Upload className="mr-1 size-3.5" /> Upload Photo
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Icons.Trash2 className="mr-1 size-3.5" /> Remove
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <Separator />

                {/* Form fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name ?? 'TheViralFindsMY'} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user?.email ?? 'demo@theviralfindsmy.com'} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input id="phone" type="tel" defaultValue="+60 12-345 6789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" defaultValue="Kuala Lumpur, Malaysia" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other affiliates about yourself..."
                  />
                  <p className="text-xs text-muted-foreground">{bio.length}/280 characters</p>
                </div>

                <Separator />

                {/* Niches */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Affiliate Niches</Label>
                    <p className="text-xs text-muted-foreground">Select the categories you focus on</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {niches.map((niche) => {
                      const selected = selectedNiches.includes(niche.label)
                      return (
                        <button
                          key={niche.id}
                          type="button"
                          onClick={() => toggleNiche(niche.label)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-all',
                            selected
                              ? 'border-shopee bg-shopee/10 text-shopee'
                              : 'border-border/60 hover:border-shopee/40'
                          )}
                        >
                          <span>{niche.emoji}</span>
                          {niche.label}
                          {selected && <Icons.Check className="size-3" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Plan badge */}
                <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-warning/15 text-warning">
                      <Icons.Crown className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Pro Plan</span>
                        <Badge className="bg-warning text-white">Current Plan</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">RM 99/month · Renews on 1 Jan 2026</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage Plan</Button>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    className="bg-shopee-gradient hover:opacity-90"
                    onClick={() => toast.success('Profile saved!', { description: 'Your changes are now live' })}
                  >
                    <Icons.Check className="mr-1 size-4" /> Save Changes
                  </Button>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-0 space-y-6">
            <SectionCard title="Live Notifications" description="Real-time activity feed & celebration animations" icon={Icons.Radio}>
              <div className="flex items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="relative flex size-9 items-center justify-center rounded-lg bg-success/15 text-success">
                    <span className="relative flex size-2">
                      <span className="pulse-ring absolute inline-flex size-2 rounded-full text-success/60" />
                      <span className="relative inline-flex size-2 rounded-full bg-success" />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Enable live notifications</p>
                    <p className="text-xs text-muted-foreground">Show real-time sales, trends & XTRA alerts with confetti celebrations</p>
                  </div>
                </div>
                <Switch
                  checked={liveNotificationsEnabled}
                  onCheckedChange={(checked) => {
                    setLiveNotificationsEnabled(checked)
                    toast.success(checked ? 'Live notifications enabled' : 'Live notifications disabled', {
                      description: checked ? 'You will see real-time activity and confetti!' : 'Real-time feed paused.',
                    })
                  }}
                  aria-label="Toggle live notifications"
                />
              </div>
              {liveNotificationsEnabled && (
                <div className="mt-2 rounded-lg bg-success/5 px-3 py-2 text-xs text-success">
                  <Icons.CheckCircle2 className="mr-1 inline size-3.5" />
                  Active — live events appear in the header bell & dashboard activity feed
                </div>
              )}
            </SectionCard>

            <SectionCard title="Notification Channels" description="Choose how you want to be notified" icon={Icons.Bell}>
              <div className="space-y-1">
                {[
                  { label: 'Sales Alerts', desc: 'Real-time notifications for every sale', icon: Icons.ShoppingCart, defaults: [true, true, true] },
                  { label: 'Trend Alerts', desc: 'Spike in product or category velocity', icon: Icons.TrendingUp, defaults: [true, true, true] },
                  { label: 'XTRA Alerts', desc: 'Commission XTRA boosts and offers', icon: Icons.Star, defaults: [true, false, true] },
                  { label: 'Achievements', desc: 'Badges, XP, and level-ups', icon: Icons.Trophy, defaults: [true, true, true] },
                  { label: 'Weekly Digest', desc: 'Monday summary of your week', icon: Icons.Mail, defaults: [true, false, true] },
                ].map((row, idx) => {
                  const RowIcon = row.icon
                  return (
                    <div key={row.label} className={cn('grid gap-3 py-3 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4', idx !== 4 && 'border-b')}>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                          <RowIcon className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{row.label}</p>
                          <p className="text-xs text-muted-foreground">{row.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-4 sm:contents">
                        <div className="flex items-center justify-center sm:w-16">
                          <Switch defaultChecked={row.defaults[0]} aria-label={`${row.label} email`} />
                        </div>
                        <div className="flex items-center justify-center sm:w-16">
                          <Switch defaultChecked={row.defaults[1]} aria-label={`${row.label} push`} />
                        </div>
                        <div className="flex items-center justify-center sm:w-16">
                          <Switch defaultChecked={row.defaults[2]} aria-label={`${row.label} in-app`} />
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto] gap-4 border-b pb-2 pt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <span />
                  <span className="w-16 text-center">Email</span>
                  <span className="w-16 text-center">Push</span>
                  <span className="w-16 text-center">In-App</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  className="bg-shopee-gradient hover:opacity-90"
                  onClick={() => toast.success('Notification preferences saved')}
                >
                  <Icons.Check className="mr-1 size-4" /> Save Preferences
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Quiet Hours" description="Pause non-critical notifications" icon={Icons.Moon}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Switch defaultChecked id="settings-quiet" />
                  <Label htmlFor="settings-quiet" className="text-sm font-medium">Enable Quiet Hours</Label>
                </div>
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Start</Label>
                    <Input type="time" defaultValue="22:00" className="mt-1" />
                  </div>
                  <Icons.ArrowRight className="mt-5 size-4 text-muted-foreground" />
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">End</Label>
                    <Input type="time" defaultValue="07:00" className="mt-1" />
                  </div>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="mt-0 space-y-6">
            <SectionCard title="Current Plan" description="Your subscription details" icon={Icons.CreditCard}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-warning/15 text-warning">
                    <Icons.Crown className="size-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">Pro Plan</h3>
                      <Badge className="bg-warning text-white">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatRM(99)}/month · Next billing 1 Jan 2026</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Change Plan</Button>
                  <Button variant="ghost" size="sm" className="text-destructive">Cancel</Button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Payment Method" description="How you pay for your subscription" icon={Icons.Wallet}>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
                    <Icons.CreditCard className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Visa ending in 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 08/27 · Ahmad Faizal</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </SectionCard>

            <SectionCard title="Billing History" description="Your past invoices" icon={Icons.Receipt}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map((inv) => (
                    <TableRow key={inv.invoice}>
                      <TableCell className="text-sm">{inv.date}</TableCell>
                      <TableCell className="font-mono text-xs">{inv.invoice}</TableCell>
                      <TableCell className="text-right font-medium">{formatRM(inv.amount)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="gap-1 border-success/30 bg-success/5 text-success">
                          <Icons.Check className="size-3" /> Paid
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7">
                          <Icons.Download className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="mt-0 space-y-6">
            <SectionCard title="Connected Platforms" description="Link your affiliate accounts and tools" icon={Icons.Plug}>
              <div className="grid gap-3 sm:grid-cols-2">
                {integrations.map((int) => {
                  const IntIcon = int.icon
                  const isConnected = int.status === 'connected'
                  return (
                    <Card key={int.name} className="border-border/60 transition-all hover:shadow-md">
                      <CardContent className="flex items-start gap-3 p-4">
                        <div className={cn('flex size-10 items-center justify-center rounded-lg bg-muted', int.color)}>
                          <IntIcon className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold">{int.name}</p>
                            {isConnected ? (
                              <Badge className="gap-1 bg-success text-white">
                                <Icons.Check className="size-3" /> Connected
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Not Connected</Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{int.desc}</p>
                          <Button
                            variant={isConnected ? 'outline' : 'default'}
                            size="sm"
                            className={cn('mt-3 h-7 text-xs', !isConnected && 'bg-shopee-gradient hover:opacity-90')}
                            onClick={() => toast.success(isConnected ? `${int.name} disconnected` : `${int.name} connected`, {
                              description: isConnected ? 'You can reconnect anytime' : 'Syncing your data now...',
                            })}
                          >
                            {isConnected ? (
                              <>
                                <Icons.Unlink className="mr-1 size-3" /> Disconnect
                              </>
                            ) : (
                              <>
                                <Icons.Plus className="mr-1 size-3" /> Connect
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </SectionCard>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="mt-0 space-y-6">
            <SectionCard title="Change Password" description="Update your password regularly" icon={Icons.KeyRound}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" placeholder="••••••••" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => toast.success('Password updated', { description: 'You\'ll need to log in again' })}
                  >
                    <Icons.Check className="mr-1 size-4" /> Update Password
                  </Button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Two-Factor Authentication" description="Add an extra layer of security" icon={Icons.Smartphone}>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('flex size-10 items-center justify-center rounded-lg', 'bg-success/10 text-success')}>
                    <Icons.ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">2FA via Authenticator App</p>
                    <p className="text-xs text-muted-foreground">Use Google Authenticator or similar</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </SectionCard>

            <SectionCard title="Active Sessions" description="Devices currently logged into your account" icon={Icons.Monitor}>
              <div className="space-y-3">
                {sessions.map((session, idx) => (
                  <div key={idx} className={cn('flex items-center gap-3 rounded-lg border p-3', session.current ? 'border-success/40 bg-success/5' : 'border-border/60')}>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <Icons.Monitor className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{session.device}</p>
                        {session.current && (
                          <Badge className="bg-success text-white text-[10px]">Current</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.location} · {session.ip} · {session.lastActive}
                      </p>
                    </div>
                    {!session.current && (
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Icons.LogOut className="size-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="API Access" description="Manage your API keys for integrations" icon={Icons.KeyRound}>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-hermes/10 text-hermes">
                    <Icons.Code className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Personal API Key</p>
                    <p className="font-mono text-xs text-muted-foreground">tvfm_sk_••••••••••••3f7a</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Icons.Eye className="mr-1 size-3.5" /> Reveal
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icons.RefreshCw className="mr-1 size-3.5" /> Rotate
                  </Button>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="mt-0 space-y-6">
            {/* Animated theme preview */}
            <Card className={cn(
              'relative overflow-hidden border-2 transition-colors',
              theme === 'dark' ? 'border-foreground/20' : 'border-shopee/20'
            )}>
              <div className={cn(
                'relative p-5 transition-colors duration-500',
                theme === 'dark' ? 'bg-[oklch(0.16_0.008_250)]' : 'bg-[oklch(0.99_0.002_240)]'
              )}>
                {/* Mini dashboard mockup */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-shopee-gradient text-white">
                      <Icons.ShoppingBag className="size-4" />
                    </div>
                    <span className={cn('text-sm font-bold', theme === 'dark' ? 'text-white' : 'text-foreground')}>
                      TheViral<span className="text-shopee">FindsMY</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5">
                    <span className="relative flex size-1.5">
                      <span className="pulse-ring absolute inline-flex size-1.5 rounded-full text-success/60" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-success" />
                    </span>
                    <span className="text-[9px] font-medium text-success">Live</span>
                  </div>
                </div>
                {/* Mini stat cards */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Earnings', value: 'RM 5,487', color: 'text-shopee' },
                    { label: 'Clicks', value: '2,847', color: 'text-hermes' },
                    { label: 'CVR', value: '26.4%', color: 'text-success' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className={cn(
                        'rounded-lg p-2',
                        theme === 'dark' ? 'bg-[oklch(0.21_0.01_250)]' : 'bg-white'
                      )}
                    >
                      <p className={cn('text-[8px] uppercase tracking-wider', theme === 'dark' ? 'text-white/60' : 'text-muted-foreground')}>
                        {stat.label}
                      </p>
                      <p className={cn('text-xs font-bold', stat.color)}>{stat.value}</p>
                    </motion.div>
                  ))}
                </div>
                {/* Mini chart bar */}
                <div className="mt-2 flex items-end gap-1">
                  {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                      className={cn(
                        'flex-1 rounded-t',
                        i % 2 === 0 ? 'bg-shopee/60' : 'bg-hermes/60'
                      )}
                      style={{ minHeight: 8 }}
                    />
                  ))}
                </div>
                {/* Theme toggle hint */}
                <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                  <Icons.Sun className={cn('size-3 transition-opacity', theme === 'light' ? 'opacity-100' : 'opacity-30')} />
                  <span>Click a theme below to preview live</span>
                  <Icons.Moon className={cn('size-3 transition-opacity', theme === 'dark' ? 'opacity-100' : 'opacity-30')} />
                </div>
              </div>
            </Card>

            <SectionCard title="Theme" description="Choose how TheViralFindsMY looks" icon={Icons.Palette}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {([
                  { id: 'light' as const, label: 'Light', icon: Icons.Sun },
                  { id: 'dark' as const, label: 'Dark', icon: Icons.Moon },
                ]).map((opt) => {
                  const OptIcon = opt.icon
                  const isActive = theme === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTheme(opt.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                        isActive ? 'border-shopee bg-shopee/5' : 'border-border/60 hover:border-shopee/40'
                      )}
                    >
                      <OptIcon className={cn('size-6', isActive ? 'text-shopee' : 'text-muted-foreground')} />
                      <span className={cn('text-sm font-medium', isActive && 'text-shopee')}>{opt.label}</span>
                      {isActive && <Icons.Check className="size-4 text-shopee" />}
                    </button>
                  )
                })}
              </div>
            </SectionCard>

            <SectionCard title="Language & Region" description="Customize your localization" icon={Icons.Languages}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bm">Bahasa Malaysia</SelectItem>
                      <SelectItem value="manglish">Manglish 🇲🇾</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="kul">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kul">Asia/Kuala_Lumpur (UTC+8)</SelectItem>
                      <SelectItem value="kch">Asia/Kuching (UTC+8)</SelectItem>
                      <SelectItem value="sin">Asia/Singapore (UTC+8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue="rm">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rm">RM — Malaysian Ringgit</SelectItem>
                      <SelectItem value="sgd">S$ — Singapore Dollar</SelectItem>
                      <SelectItem value="usd">$ — US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select defaultValue="dmy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Display Density" description="Adjust spacing to your preference" icon={Icons.Rows3}>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: 'comfortable', label: 'Comfortable', desc: 'More spacing, easier on eyes', icon: Icons.AlignJustify },
                  { id: 'compact', label: 'Compact', desc: 'Tighter spacing, more content', icon: Icons.Rows3 },
                ]).map((opt) => {
                  const OptIcon = opt.icon
                  const isActive = opt.id === 'comfortable'
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={cn(
                        'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
                        isActive ? 'border-shopee bg-shopee/5' : 'border-border/60 hover:border-shopee/40'
                      )}
                    >
                      <OptIcon className={cn('size-5', isActive ? 'text-shopee' : 'text-muted-foreground')} />
                      <div>
                        <p className={cn('text-sm font-medium', isActive && 'text-shopee')}>{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </SectionCard>

            <div className="flex justify-end">
              <Button
                className="bg-shopee-gradient hover:opacity-90"
                onClick={() => toast.success('Appearance saved', { description: 'Your preferences are updated' })}
              >
                <Icons.Check className="mr-1 size-4" /> Save Appearance
              </Button>
            </div>
          </TabsContent>

          {/* About */}
          <TabsContent value="about" className="mt-0 space-y-6">
            <SectionCard title="Application" description="About TheViralFindsMY" icon={Icons.Info}>
              <div className="flex items-center gap-4 py-2">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-shopee-gradient text-white shadow-md">
                  <Icons.ShoppingBag className="size-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">
                    TheViral<span className="text-shopee">FindsMY</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Shopee Affiliate Manager Pro</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="bg-shopee/5 text-shopee border-shopee/20 text-[10px]">
                      v2.4.0
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">Released Jun 2025</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  The only AI-powered platform built exclusively for Malaysian Shopee affiliates.
                  Discover trending products, generate Manglish-perfect captions, and track every
                  commission in real-time. 🇲🇾
                </p>
              </div>
            </SectionCard>

            <SectionCard title="What's New" description="Latest updates and features" icon={Icons.Gift}>
              <div className="space-y-3 py-1">
                {[
                  { v: 'v2.4', title: 'Global Search & Skeletons', date: 'Jun 2025', items: ['Global content search', 'Skeleton loading states', 'Breadcrumb trail'] },
                  { v: 'v2.3', title: 'Command Palette UX', date: 'Jun 2025', items: ['Keyboard arrow navigation', 'Celebration toasts', 'Mobile FAB'] },
                  { v: 'v2.2', title: 'Celebrations & Micro-interactions', date: 'Jun 2025', items: ['Confetti on sales', 'Stagger animations', 'Live notifications toggle'] },
                ].map((entry) => (
                  <div key={entry.v} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-shopee/10 text-shopee">
                      <Icons.Sparkles className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{entry.title}</p>
                        <Badge variant="secondary" className="text-[9px]">{entry.v}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{entry.date}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {entry.items.map((item) => (
                          <span key={item} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setChangelogOpen(true)}
                >
                  <Icons.Gift className="mr-1.5 size-4 text-shopee" />
                  View Full Changelog
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Quick Stats" description="Your app usage" icon={Icons.BarChart3}>
              <div className="grid grid-cols-2 gap-3 py-1">
                {[
                  { label: 'Pages Available', value: '36', icon: Icons.LayoutGrid },
                  { label: 'API Routes', value: '8', icon: Icons.Server },
                  { label: 'AI Features', value: '4', icon: Icons.Sparkles },
                  { label: 'Keyboard Shortcuts', value: '14', icon: Icons.Keyboard },
                ].map((stat) => {
                  const StatIcon = stat.icon
                  return (
                    <div key={stat.label} className="flex items-center gap-2 rounded-lg border border-border/60 p-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <StatIcon className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </SectionCard>

            <SectionCard title="Links" description="Resources and support" icon={Icons.Link}>
              <div className="space-y-1 py-1">
                {[
                  { label: 'Help Center', icon: Icons.HelpCircle, desc: 'Guides and tutorials' },
                  { label: 'API Documentation', icon: Icons.Code, desc: 'Developer reference' },
                  { label: 'Terms of Service', icon: Icons.FileText, desc: 'Legal agreement' },
                  { label: 'Privacy Policy', icon: Icons.Shield, desc: 'How we handle data' },
                ].map((link) => {
                  const LinkIcon = link.icon
                  return (
                    <button
                      key={link.label}
                      className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-accent/50"
                      onClick={() => toast.info(`${link.label} — coming soon!`)}
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <LinkIcon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{link.label}</p>
                        <p className="text-[10px] text-muted-foreground">{link.desc}</p>
                      </div>
                      <Icons.ChevronRight className="size-4 text-muted-foreground" />
                    </button>
                  )
                })}
              </div>
            </SectionCard>

            <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
              <Icons.Heart className="size-3 text-shopee" />
              <span>Built with love for Malaysian affiliates</span>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
