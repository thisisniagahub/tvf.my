'use client'

import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatRM, formatNumber } from '@/lib/demo-data'

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  accent = 'shopee',
  children,
}: {
  title: string
  subtitle?: string
  icon?: Icons.LucideIcon
  accent?: 'shopee' | 'hermes' | 'success' | 'warning'
  children?: React.ReactNode
}) {
  const colorMap = {
    shopee: 'bg-shopee/10 text-shopee',
    hermes: 'bg-hermes/10 text-hermes',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  }
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn('flex size-11 items-center justify-center rounded-xl', colorMap[accent])}>
            <Icon className="size-6" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

export function StatCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  icon: Icon,
  accent = 'shopee',
  subtitle,
}: {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'up' | 'down' | 'neutral'
  icon?: Icons.LucideIcon
  accent?: 'shopee' | 'hermes' | 'success' | 'warning'
  subtitle?: string
}) {
  const colorMap = {
    shopee: 'text-shopee bg-shopee/10',
    hermes: 'text-hermes bg-hermes/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
  }
  return (
    <Card className="overflow-hidden border-border/60 transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
            {delta && (
              <div className="mt-2 flex items-center gap-1">
                {deltaType === 'up' && <Icons.TrendingUp className="size-3.5 text-success" />}
                {deltaType === 'down' && <Icons.TrendingDown className="size-3.5 text-destructive" />}
                <span
                  className={cn(
                    'text-xs font-semibold',
                    deltaType === 'up' && 'text-success',
                    deltaType === 'down' && 'text-destructive',
                    deltaType === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  {delta}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', colorMap[accent])}>
              <Icon className="size-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
}: {
  title?: string
  description?: string
  icon?: Icons.LucideIcon
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn('border-border/60', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            <div>
              {title && <h3 className="text-sm font-semibold">{title}</h3>}
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      <CardContent className={cn(!title && 'p-0', title && 'p-4')}>{children}</CardContent>
    </Card>
  )
}

export function TrendBadge({ velocity, status }: { velocity: number; status: 'hot' | 'warm' | 'cool' }) {
  const colorMap = {
    hot: 'bg-shopee/15 text-shopee',
    warm: 'bg-warning/15 text-warning',
    cool: 'bg-muted text-muted-foreground',
  }
  const arrow = status === 'hot' ? '↑' : status === 'warm' ? '→' : '↓'
  return (
    <Badge className={cn('gap-0.5', colorMap[status])}>
      {velocity}% {arrow} {status.toUpperCase()}
    </Badge>
  )
}

export function PlatformBadge({ platform }: { platform: string }) {
  const isShopee = platform.toLowerCase().includes('shopee')
  const isTiktok = platform.toLowerCase().includes('tiktok')
  const isLazada = platform.toLowerCase().includes('lazada')
  return (
    <Badge
      variant="outline"
      className={cn(
        isShopee && 'border-shopee/30 bg-shopee/5 text-shopee',
        isTiktok && 'border-foreground/20 bg-foreground/5',
        isLazada && 'border-success/30 bg-success/5 text-success'
      )}
    >
      {platform}
    </Badge>
  )
}

export function ComingSoonPage({ title, icon: Icon }: { title: string; icon?: Icons.LucideIcon }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="relative">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-shopee/10 text-shopee">
          {Icon ? <Icon className="size-10" /> : <Icons.Sparkles className="size-10" />}
        </div>
        <div className="absolute -right-2 -top-2">
          <Badge className="bg-hermes text-white">Coming Soon</Badge>
        </div>
      </div>
      <h2 className="mt-6 text-2xl font-bold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        This module is under active development. We&apos;re crafting something special for the
        Malaysian affiliate market. Check back soon!
      </p>
      <div className="mt-6 flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
        <Icons.Clock className="size-3.5" />
        <span>Expected release: Q1 2026</span>
      </div>
    </div>
  )
}

export { formatRM, formatNumber }
