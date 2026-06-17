'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

/**
 * Brand logo for TheViralFindsMY.
 *
 * Renders the brand image (`/logo.png`) plus, optionally, the three-tone
 * wordmark: "The" (foreground) · "Viral" (shopee/orange) · "Finds" (foreground).
 * The "MY" suffix is intentionally omitted for a cleaner look — the brand
 * image already carries the visual identity.
 */
export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { img: 'h-7 w-auto', text: 'text-sm' },
    md: { img: 'h-9 w-auto', text: 'text-base' },
    lg: { img: 'h-12 w-auto', text: 'text-xl' },
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/logo.png"
        alt="TheViralFinds Logo"
        width={size === 'lg' ? 120 : size === 'sm' ? 70 : 90}
        height={size === 'lg' ? 40 : size === 'sm' ? 25 : 30}
        className={sizes[size].img}
        priority
      />
      {showText && (
        <span className={cn('font-bold tracking-tight', sizes[size].text)}>
          <span className="text-foreground">The</span>
          <span className="text-shopee">Viral</span>
          <span className="text-foreground">Finds</span>
        </span>
      )}
    </div>
  )
}
