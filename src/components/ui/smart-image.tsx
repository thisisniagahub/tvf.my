'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SmartImageProps {
  src?: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

/**
 * SmartImage — a thin wrapper around `next/image` that gracefully falls back
 * to a muted gradient placeholder when:
 *   - `src` is missing/empty, or
 *   - the underlying image fails to load (network error, broken URL, etc.)
 *
 * Use this anywhere a product/affiliate image *might* eventually appear but
 * currently has no concrete source — it keeps layout stable and avoids
 * broken-image icons.
 *
 * Notes:
 *  - `width`/`height` are passed through to next/image for intrinsic sizing.
 *    The fallback uses the same aspect ratio so the box doesn't shift.
 *  - `priority` is forwarded for above-the-fold LCP images.
 *  - `className` is applied to BOTH the fallback div and the next/image element
 *    so callers can control sizing/rounding consistently.
 *  - Data URLs (e.g. `data:image/png;base64,...` from the AI thumbnails API)
 *    work out of the box — no `remotePatterns` entry required.
 */
export function SmartImage({ src, alt, width = 200, height = 200, className, priority }: SmartImageProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div
        className={cn('flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted', className)}
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <span className="text-xs text-muted-foreground/40">No image</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  )
}
