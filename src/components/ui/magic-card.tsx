'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MagicCardProps extends React.ComponentProps<typeof Card> {
  /**
   * Brand-coloured halo around the card. `none` keeps the default look.
   */
  glow?: 'shopee' | 'hermes' | 'success' | 'warning' | 'none'
  /**
   * Hover behaviour:
   *  - `lift`  : gentle translateY + shadow (default, professional)
   *  - `tilt`  : subtle 3D perspective tilt for hero / pricing cards
   *  - `glow`  : shopee-orange glow on hover (without movement)
   *  - `none`  : no hover effect
   */
  hover?: 'lift' | 'tilt' | 'glow' | 'none'
  /**
   * When true, fades the card's background into a subtle gradient
   * (from solid card to 50% transparent card).
   */
  gradient?: boolean
}

const glowMap: Record<NonNullable<MagicCardProps['glow']>, string> = {
  shopee: 'shadow-[0_0_20px_rgba(238,77,45,0.15)]',
  hermes: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
  success: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
  warning: 'shadow-[0_0_20px_rgba(250,204,21,0.15)]',
  none: '',
}

const hoverMap: Record<NonNullable<MagicCardProps['hover']>, string> = {
  lift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-300',
  tilt: 'hover:[transform:perspective(1000px)_rotateX(2deg)_rotateY(-2deg)_scale(1.02)] transition-transform duration-300',
  glow: 'hover:shadow-[0_0_30px_rgba(238,77,45,0.2)] transition-shadow duration-300',
  none: '',
}

/**
 * MagicCard — drop-in wrapper around shadcn/ui `<Card>` that adds a
 * Framer Motion entrance, optional brand-coloured glow halo, and one
 * of three hover behaviours (lift / tilt / glow).
 *
 * Designed to be additive: it never overrides Card's own props, only
 * composes extra className strings.
 */
export function MagicCard({
  glow = 'none',
  hover = 'lift',
  gradient = false,
  className,
  children,
  ...props
}: MagicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card
        className={cn(
          glowMap[glow],
          hoverMap[hover],
          gradient && 'bg-gradient-to-br from-card to-card/50',
          className,
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  )
}
