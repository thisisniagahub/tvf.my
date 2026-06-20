'use client'

import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useTheme } from 'next-themes'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SectionCard } from '../_shared'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { toast } from 'sonner'

export function AppearanceTab() {
  const { theme, setTheme } = useTheme()

  return (
    <>
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
              <Logo size="sm" showText={false} />
              <span className={cn('text-sm font-bold', theme === 'dark' ? 'text-white' : 'text-foreground')}>
                <span className={theme === 'dark' ? 'text-white' : 'text-foreground'}>The</span>
                <span className="text-shopee">Viral</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-foreground'}>Finds</span>
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
    </>
  )
}
