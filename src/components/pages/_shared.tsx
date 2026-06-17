'use client'

import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedNumber } from '@/components/ui/animated-number'
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
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <motion.div
            whileHover={{ scale: 1.08, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={cn('flex size-11 items-center justify-center rounded-xl', colorMap[accent])}
          >
            <Icon className="size-6" />
          </motion.div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </motion.div>
  )
}

/**
 * Parse a display value into an animated numeric counter if possible.
 * Returns null if the value isn't a pure number.
 */
function tryParseNumeric(value: string | number): { num: number; prefix: string; suffix: string; decimals: number } | null {
  if (typeof value === 'number') {
    return { num: value, prefix: '', suffix: '', decimals: 0 }
  }
  // Match patterns like "RM 5,487.32", "2,847", "26.4%", "+12.5%"
  const match = value.match(/^([^\d-]*?)(-?\d[\d,]*\.?\d*)(.*)$/)
  if (!match) return null
  const [, prefix, numStr, suffix] = match
  const num = parseFloat(numStr.replace(/,/g, ''))
  if (isNaN(num)) return null
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0
  return { num, prefix: prefix.trim(), suffix, decimals }
}

export function StatCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  icon: Icon,
  accent = 'shopee',
  subtitle,
  index = 0,
}: {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'up' | 'down' | 'neutral'
  icon?: Icons.LucideIcon
  accent?: 'shopee' | 'hermes' | 'success' | 'warning'
  subtitle?: string
  index?: number
}) {
  const colorMap = {
    shopee: 'text-shopee bg-shopee/10',
    hermes: 'text-hermes bg-hermes/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
  }
  const parsed = tryParseNumeric(value)
  // Keep the delta's + sign in suffix for positive deltas if value already has suffix
  const animPrefix = parsed?.prefix ?? ''
  const animSuffix = parsed?.suffix ?? ''
  // If prefix is "RM" include a trailing space
  const displayPrefix = animPrefix === 'RM' ? 'RM ' : animPrefix

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden border-border/60 transition-shadow hover:shadow-lg">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight">
                {parsed ? (
                  <AnimatedNumber
                    value={parsed.num}
                    prefix={displayPrefix}
                    suffix={animSuffix}
                    decimals={parsed.decimals}
                    duration={1.2}
                  />
                ) : (
                  value
                )}
              </p>
              {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
              {delta && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.08 + 0.4 }}
                  className="mt-2 flex items-center gap-1"
                >
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
                </motion.div>
              )}
            </div>
            {Icon && (
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', colorMap[accent])}
              >
                <Icon className="size-5" />
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
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
    </motion.div>
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
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative"
      >
        <div className="flex size-20 items-center justify-center rounded-2xl bg-shopee/10 text-shopee">
          {Icon ? <Icon className="size-10" /> : <Icons.Sparkles className="size-10" />}
        </div>
        <div className="absolute -right-2 -top-2">
          <Badge className="bg-hermes text-white">Coming Soon</Badge>
        </div>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-2xl font-bold"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-2 max-w-md text-sm text-muted-foreground"
      >
        This module is under active development. We&apos;re crafting something special for the
        Malaysian affiliate market. Check back soon!
      </motion.p>
      <div className="mt-6 flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
        <Icons.Clock className="size-3.5" />
        <span>Expected release: Q1 2026</span>
      </div>
    </div>
  )
}

/** Skeleton card matching the product card layout */
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Skeleton className="absolute inset-0 h-full w-full" />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <Skeleton className="h-4 w-10 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="absolute right-2 top-2 h-4 w-16 rounded-full" />
      </div>
      <CardContent className="p-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-2/3" />
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="mt-2 flex gap-1.5">
          <Skeleton className="h-7 flex-1" />
          <Skeleton className="h-7 flex-1" />
        </div>
      </CardContent>
    </Card>
  )
}

/** Skeleton for a list row (used in Trend Spy, activity feeds, leaderboards) */
export function ListRowSkeleton({ avatar = true }: { avatar?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3">
      {avatar && <Skeleton className="size-10 shrink-0 rounded-lg" />}
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  )
}

/** Skeleton for a stat card */
export function StatCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="size-10 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

/** Skeleton grid for product grids */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <ProductCardSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

export { formatRM, formatNumber }
