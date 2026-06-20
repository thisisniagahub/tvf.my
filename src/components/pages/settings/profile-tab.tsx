'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { SectionCard } from '../_shared'
import { useAppStore } from '@/store/app-store'
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

export function ProfileTab() {
  const { user } = useAppStore()
  const [selectedNiches, setSelectedNiches] = useState<string[]>(
    user?.niches ?? ['Electronics', 'Beauty', 'Fashion']
  )
  const [bio, setBio] = useState(
    'Malaysian affiliate marketer focused on trending Shopee products. Beauty, fashion, and tech enthusiast.'
  )

  const toggleNiche = (label: string) => {
    setSelectedNiches((prev) =>
      prev.includes(label) ? prev.filter((n) => n !== label) : [...prev, label]
    )
  }

  return (
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
  )
}
