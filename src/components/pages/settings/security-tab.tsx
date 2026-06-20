'use client'

import * as Icons from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SectionCard } from '../_shared'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const sessions = [
  { device: 'MacBook Pro · Chrome', location: 'Kuala Lumpur, MY', ip: '175.143.xx.xx', current: true, lastActive: 'Active now' },
  { device: 'iPhone 14 · Safari', location: 'Kuala Lumpur, MY', ip: '175.143.xx.xx', current: false, lastActive: '2 hours ago' },
  { device: 'Windows PC · Edge', location: 'Petaling Jaya, MY', ip: '203.106.xx.xx', current: false, lastActive: '3 days ago' },
]

export function SecurityTab() {
  return (
    <>
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
    </>
  )
}
