'use client'

import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SectionCard } from '../_shared'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function NotificationsTab() {
  const {
    liveNotificationsEnabled,
    setLiveNotificationsEnabled,
    notificationSoundEnabled,
    setNotificationSoundEnabled,
  } = useAppStore()

  return (
    <>
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
        {liveNotificationsEnabled && (
          <div className="mt-3 flex items-center justify-between gap-4 border-t pt-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-hermes/10 text-hermes">
                <Icons.Volume2 className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Notification sounds</p>
                <p className="text-xs text-muted-foreground">Play a chime when a live sale notification arrives</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => {
                  import('@/lib/sounds').then(({ playSaleChime }) => playSaleChime())
                  toast.info('Test sound played')
                }}
                title="Test sound"
              >
                <Icons.Play className="mr-1 size-3" /> Test
              </Button>
              <Switch
                checked={notificationSoundEnabled}
                onCheckedChange={(checked) => {
                  setNotificationSoundEnabled(checked)
                  toast.success(checked ? 'Sound enabled' : 'Sound disabled', {
                    description: checked ? 'You will hear a chime on sales!' : 'Silent mode.',
                  })
                  if (checked) {
                    import('@/lib/sounds').then(({ playSaleChime }) => playSaleChime())
                  }
                }}
                aria-label="Toggle notification sounds"
              />
            </div>
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
    </>
  )
}
