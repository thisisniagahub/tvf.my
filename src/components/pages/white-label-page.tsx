'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { PageHeader, StatCard, SectionCard } from './_shared'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const brandFeatures = [
  { label: 'Custom branding', desc: 'Replace TheViralFindsMY logo & name with yours', icon: Icons.Palette },
  { label: 'Custom domain', desc: 'Run on affiliates.yourbrand.com.my', icon: Icons.Globe },
  { label: 'Your logo & colors', desc: 'Full control of theme, fonts, and accents', icon: Icons.Layers },
  { label: 'White-label reports', desc: 'PDF reports branded as your agency', icon: Icons.FileText },
  { label: 'API access', desc: 'Embed affiliate tools in your own apps', icon: Icons.Code2 },
  { label: 'Custom email domain', desc: 'Notifications from no-reply@yourbrand.com', icon: Icons.Mail },
  { label: 'Team & sub-accounts', desc: 'Manage multiple client workspaces', icon: Icons.Users },
  { label: 'Dedicated support', desc: 'WhatsApp priority line + account manager', icon: Icons.HeartHandshake },
]

const presetColors = [
  { name: 'Tropical', hex: '#ee4d2d' },
  { name: 'Mangosteen', hex: '#7c3aed' },
  { name: 'Pandan', hex: '#10b981' },
  { name: 'Sunset', hex: '#f59e0b' },
  { name: 'Hibiscus', hex: '#e11d48' },
  { name: 'Ocean', hex: '#0ea5e9' },
  { name: 'Charcoal', hex: '#1f2937' },
  { name: 'Royal', hex: '#9333ea' },
]

const configSummary = [
  { label: 'Brand name', value: 'Kopi O Digital Sdn Bhd', icon: Icons.Building2 },
  { label: 'Custom domain', value: 'affiliates.kopio.my', icon: Icons.Globe },
  { label: 'Primary color', value: '#ee4d2d (Tropical)', icon: Icons.Palette },
  { label: 'Plan', value: 'Enterprise (White-Label)', icon: Icons.Crown },
  { label: 'Team seats', value: '15 / 25 used', icon: Icons.Users },
  { label: 'API rate limit', value: '100K calls/month', icon: Icons.Code2 },
]

export function WhiteLabelPage() {
  const [brandName, setBrandName] = useState('Kopi O Digital')
  const [domain, setDomain] = useState('affiliates.kopio.my')
  const [primaryColor, setPrimaryColor] = useState('#ee4d2d')

  return (
    <div className="space-y-6">
      <PageHeader
        title="White-Label Solution"
        subtitle="Rebrand TheViralFindsMY as your own"
        icon={Icons.Palette}
        accent="warning"
      >
        <Badge className="bg-warning text-white">
          <Icons.Crown className="size-3" /> ENT
        </Badge>
        <Button
          size="sm"
          className="bg-warning hover:bg-warning/90"
          onClick={() => toast.success('Our sales team will WhatsApp you within 1 business day.')}
        >
          <Icons.Rocket className="mr-1 size-4" /> Activate White-Label
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Brand Accounts" value={3} icon={Icons.Building2} accent="warning" subtitle="Active white-labels" />
        <StatCard label="Custom Domains" value={3} icon={Icons.Globe} accent="success" subtitle="SSL secured" />
        <StatCard label="Team Seats" value="15 / 25" icon={Icons.Users} accent="hermes" subtitle="Across all accounts" />
        <StatCard label="Branded Reports" value={142} icon={Icons.FileText} accent="shopee" subtitle="Generated this month" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Brand config */}
        <div className="space-y-4 lg:col-span-1">
          <SectionCard
            title="Your Brand"
            description="Configure your white-label identity"
            icon={Icons.Palette}
          >
            <div className="space-y-4">
              {/* Logo upload */}
              <div className="space-y-1.5">
                <Label>Logo</Label>
                <button
                  onClick={() => toast.info('Opening file picker...')}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-6 transition-colors hover:border-warning/40 hover:bg-warning/[0.03]"
                >
                  <div
                    className="flex size-12 items-center justify-center rounded-xl text-white"
                    style={{ background: primaryColor }}
                  >
                    <Icons.ImageIcon className="size-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Upload your logo</p>
                    <p className="text-xs text-muted-foreground">PNG or SVG · max 1MB · transparent preferred</p>
                  </div>
                </button>
              </div>

              {/* Brand name */}
              <div className="space-y-1.5">
                <Label htmlFor="brand-name">Brand name</Label>
                <Input
                  id="brand-name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Your brand name"
                />
              </div>

              {/* Custom domain */}
              <div className="space-y-1.5">
                <Label htmlFor="brand-domain">Custom domain</Label>
                <div className="flex items-center gap-2">
                  <Icons.Globe className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    id="brand-domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="affiliates.yourbrand.com.my"
                    className="flex-1"
                  />
                </div>
                <Badge variant="outline" className="bg-success/5 text-success">
                  <Icons.Check className="size-3" /> SSL verified
                </Badge>
              </div>

              {/* Primary color */}
              <div className="space-y-1.5">
                <Label>Primary color</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="size-10 shrink-0 rounded-lg border-2 border-background shadow"
                    style={{ background: primaryColor }}
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
                <div className="mt-2 grid grid-cols-8 gap-1.5">
                  {presetColors.map((c) => (
                    <button
                      key={c.hex}
                      title={c.name}
                      onClick={() => setPrimaryColor(c.hex)}
                      className={cn(
                        'aspect-square rounded-md transition-transform hover:scale-110',
                        primaryColor === c.hex && 'ring-2 ring-offset-2 ring-offset-background'
                      )}
                      style={{ background: c.hex, boxShadow: primaryColor === c.hex ? `0 0 0 2px ${c.hex}` : undefined }}
                      aria-label={`Select ${c.name} color`}
                    />
                  ))}
                </div>
              </div>

              <Button className="w-full" variant="outline" onClick={() => toast.success('Brand settings saved!')}>
                <Icons.Save className="mr-1 size-4" /> Save Brand Settings
              </Button>
            </div>
          </SectionCard>

          {/* Current configuration summary */}
          <SectionCard
            title="Current Configuration"
            description="Live white-label setup"
            icon={Icons.Settings2}
          >
            <div className="space-y-3">
              {configSummary.map((item, i) => (
                <div key={item.label}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <item.icon className="size-4" />
                      {item.label}
                    </span>
                    <span className="text-right text-sm font-medium">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Live preview mockup */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Live Preview"
            description="How your branded dashboard will look"
            icon={Icons.Monitor}
            action={
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm">
                  <Icons.Monitor className="size-3.5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Icons.Tablet className="size-3.5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Icons.Smartphone className="size-3.5" />
                </Button>
              </div>
            }
          >
            {/* Browser mockup */}
            <div className="overflow-hidden rounded-xl border bg-background shadow-inner">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-destructive/60" />
                  <div className="size-2.5 rounded-full bg-warning/60" />
                  <div className="size-2.5 rounded-full bg-success/60" />
                </div>
                <div className="ml-2 flex flex-1 items-center gap-1.5 rounded-md bg-background px-2 py-1 text-[11px] text-muted-foreground">
                  <Icons.Lock className="size-3 text-success" />
                  {domain}
                </div>
              </div>

              {/* Branded dashboard preview */}
              <div className="bg-background p-4">
                {/* Branded header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex size-8 items-center justify-center rounded-lg text-white"
                      style={{ background: primaryColor }}
                    >
                      <Icons.ImageIcon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: primaryColor }}>{brandName}</p>
                      <p className="text-[10px] text-muted-foreground">Affiliate Manager</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-6 rounded-full" style={{ background: `${primaryColor}20` }} />
                    <div className="size-6 rounded-full bg-muted" />
                  </div>
                </div>

                {/* Branded stat cards */}
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Earnings', value: 'RM 12,450' },
                    { label: 'Clicks', value: '8,420' },
                    { label: 'CVR', value: '24.6%' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border p-2.5">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                      <p className="text-sm font-bold" style={{ color: primaryColor }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Branded chart */}
                <div className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold">Performance</p>
                    <Badge className="text-[9px] text-white" style={{ background: primaryColor }}>
                      +24%
                    </Badge>
                  </div>
                  <div className="flex h-20 items-end gap-1.5">
                    {[40, 55, 45, 70, 60, 85, 75, 95, 80, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm transition-all"
                        style={{
                          height: `${h}%`,
                          background: `linear-gradient(to top, ${primaryColor}, ${primaryColor}80)`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Branded footer */}
                <div className="mt-3 flex items-center justify-between border-t pt-2 text-[10px] text-muted-foreground">
                  <span>Powered by {brandName}</span>
                  <span style={{ color: primaryColor }}>© 2025</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Icons.Info className="size-3" />
              Preview updates as you change brand settings
            </div>
          </SectionCard>
        </div>
      </div>

      {/* White-label benefits grid */}
      <SectionCard
        title="White-Label Benefits"
        description="Everything you get with the Enterprise plan"
        icon={Icons.Sparkles}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {brandFeatures.map((f) => (
            <Card
              key={f.label}
              className="group border-border/60 transition-all hover:border-warning/40 hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-warning/10 text-warning transition-transform group-hover:scale-110">
                  <f.icon className="size-4" />
                </div>
                <p className="text-sm font-semibold">{f.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionCard>

      {/* CTA banner */}
      <Card className="overflow-hidden border-warning/30 bg-gradient-to-r from-warning/[0.06] to-shopee/[0.04]">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-warning text-white">
              <Icons.Rocket className="size-6" />
            </div>
            <div>
              <p className="text-base font-bold">Ready to launch your own affiliate platform?</p>
              <p className="text-sm text-muted-foreground">
                White-Label is available on Enterprise only. Activate today and get a free 30-min onboarding call.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => toast.info('Opening white-label brochure...')}>
              <Icons.FileText className="mr-1 size-4" /> View Brochure
            </Button>
            <Button className="bg-warning hover:bg-warning/90" onClick={() => toast.success('Sales team will WhatsApp you within 1 business day.')}>
              <Icons.PhoneCall className="mr-1 size-4" /> Talk to Sales
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
