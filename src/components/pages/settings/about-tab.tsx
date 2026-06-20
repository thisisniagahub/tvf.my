'use client'

import * as Icons from 'lucide-react'
import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { SectionCard } from '../_shared'
import { useAppStore } from '@/store/app-store'
import { Logo } from '@/components/ui/logo'
import { toast } from 'sonner'

export function AboutTab() {
  const { setChangelogOpen, resetAllSettings, importSettings } = useAppStore()
  const { theme, setTheme } = useTheme()

  return (
    <>
      <SectionCard title="Application" description="About TheViralFindsMY" icon={Icons.Info}>
        <div className="flex items-center gap-4 py-2">
          <Logo size="lg" showText={false} />
          <div className="flex-1">
            <h3 className="text-lg font-bold">
              <span className="text-foreground">The</span>
              <span className="text-shopee">Viral</span>
              <span className="text-foreground">Finds</span>
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

      <SectionCard title="Data Management" description="Export, import, or reset your settings" icon={Icons.Database}>
        <div className="space-y-3 py-1">
          {/* Export */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <Icons.Download className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Export Settings</p>
                <p className="text-[10px] text-muted-foreground">Download all your preferences as a JSON file</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const state = useAppStore.getState()
                const exportData = {
                  version: '2.4.0',
                  exportedAt: new Date().toISOString(),
                  settings: {
                    sidebarCollapsed: state.sidebarCollapsed,
                    pinnedPages: state.pinnedPages,
                    recentPages: state.recentPages,
                    pageVisitCounts: state.pageVisitCounts,
                    liveNotificationsEnabled: state.liveNotificationsEnabled,
                    notificationSoundEnabled: state.notificationSoundEnabled,
                    focusMode: state.focusMode,
                    theme,
                  },
                }
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `theviralfindsmy-settings-${new Date().toISOString().slice(0, 10)}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Settings exported successfully!')
              }}
            >
              <Icons.Download className="mr-1 size-3.5" /> Export
            </Button>
          </div>

          {/* Import */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-hermes/10 text-hermes">
                <Icons.Upload className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Import Settings</p>
                <p className="text-[10px] text-muted-foreground">Restore preferences from a JSON file</p>
              </div>
            </div>
            <label className="cursor-pointer">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <span>
                  <Icons.Upload className="mr-1 size-3.5" /> Import
                </span>
              </Button>
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string)
                      if (data.settings) {
                        importSettings(data.settings)
                        toast.success('Settings imported successfully!')
                      } else {
                        toast.error('Invalid settings file format')
                      }
                    } catch {
                      toast.error('Failed to parse settings file')
                    }
                  }
                  reader.readAsText(file)
                  e.target.value = ''
                }}
              />
            </label>
          </div>

          {/* Reset */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/[0.03] p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Icons.RotateCcw className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-destructive">Reset All Settings</p>
                <p className="text-[10px] text-muted-foreground">Restore everything to defaults (pinned pages, recent, visit counts, theme, notifications)</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Icons.RotateCcw className="mr-1 size-3.5" /> Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will restore all preferences to their default values. This includes:
                    <br />• Pinned pages (reset to Dashboard, AI Content, Earnings)
                    <br />• Recent pages &amp; visit counts (cleared)
                    <br />• Live notifications (re-enabled)
                    <br />• Sidebar (expanded)
                    <br />• Theme (light)
                    <br /><br />
                    Your account and onboarding status will be preserved. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      resetAllSettings()
                      setTheme('light')
                      toast.success('All settings reset to defaults')
                    }}
                  >
                    Yes, reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
        <Icons.Heart className="size-3 text-shopee" />
        <span>Built with love for Malaysian affiliates</span>
      </div>
    </>
  )
}
