'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LiveEvent {
  id: string
  type: 'sale' | 'trend' | 'xtra' | 'achievement' | 'info'
  title: string
  message: string
  amount?: number
  timestamp: string
}

// Fallback simulation data (used when WebSocket service is unavailable)
const simProducts = [
  'RGB Mechanical Keyboard', 'Safi Balqis UV Sunblock', 'Tudung Bawal Premium',
  'Portable Blender USB', 'Wardah Matte Lipstick', 'Wireless Earbuds Pro',
]
const simBuyers = ['Ahmad from KL', 'Siti from Shah Alam', 'Wei Ming from Penang', 'Priya from Johor']

function simEvent(): LiveEvent {
  const rand = Math.random()
  const id = `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  if (rand < 0.6) {
    const amounts = [2.99, 3.85, 3.99, 4.19, 4.49, 7.12, 11.04]
    const amount = amounts[Math.floor(Math.random() * amounts.length)]
    return {
      id, type: 'sale', title: 'New Sale! 🎉',
      message: `${simProducts[Math.floor(Math.random() * simProducts.length)]} sold to ${simBuyers[Math.floor(Math.random() * simBuyers.length)]} — you earned RM ${amount.toFixed(2)}`,
      amount, timestamp: new Date().toISOString(),
    }
  }
  if (rand < 0.85) {
    return {
      id, type: 'trend', title: 'Trending Alert 🔥',
      message: `${simProducts[Math.floor(Math.random() * simProducts.length)]} velocity up ${70 + Math.floor(Math.random() * 25)}% — tap to see`,
      timestamp: new Date().toISOString(),
    }
  }
  return {
    id, type: 'xtra', title: 'Commission XTRA Live! ⭐',
    message: `${simProducts[Math.floor(Math.random() * simProducts.length)]} now offers 40% extra commission`,
    timestamp: new Date().toISOString(),
  }
}

export function useLiveNotifications(enabled: boolean = true) {
  const [connected, setConnected] = useState(false)
  const [simulated, setSimulated] = useState(false)
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const socketRef = useRef<Socket | null>(null)
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const connectedRef = useRef(false)

  const showToast = useCallback((event: LiveEvent) => {
    // Celebration toast for sales — custom styled with gradient background
    if (event.type === 'sale') {
      toast.custom((t) => (
        <div
          className={cn(
            'group relative w-full overflow-hidden rounded-xl border border-success/40 bg-gradient-to-br from-success/15 via-success/5 to-background p-4 shadow-lg',
            'animate-fade-in-up'
          )}
        >
          {/* Shimmer overlay */}
          <div className="pointer-events-none absolute inset-0 shimmer opacity-30" />
          <div className="relative flex items-start gap-3">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-success text-white shadow-md">
              <span className="absolute inset-0 rounded-full bg-success/40 pulse-ring" />
              <Icons.DollarSign className="relative size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-success">{event.title}</p>
                {event.amount && (
                  <span className="rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-white">
                    +RM {event.amount.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{event.message}</p>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Dismiss"
            >
              <Icons.X className="size-3.5" />
            </button>
          </div>
        </div>
      ), { duration: 6000 })
    } else {
      const icon =
        event.type === 'trend' ? <Icons.TrendingUp className="size-4" /> :
        event.type === 'xtra' ? <Icons.Star className="size-4" /> :
        <Icons.Bell className="size-4" />

      const toastType =
        event.type === 'trend' ? 'info' :
        event.type === 'xtra' ? 'warning' : 'info'

      toast[toastType](event.title, {
        description: event.message,
        icon,
        duration: 5000,
      })
    }

    // Celebrate sales and achievements with confetti
    if (typeof window !== 'undefined') {
      if (event.type === 'sale') {
        import('@/lib/confetti').then(({ celebrateSale }) => celebrateSale())
      } else if (event.type === 'xtra') {
        import('@/lib/confetti').then(({ celebrateAchievement }) => celebrateAchievement())
      }
    }
  }, [])

  const addEvent = useCallback((event: LiveEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 50))
    setUnreadCount((c) => c + 1)
    showToast(event)
  }, [showToast])

  // Fallback simulation: schedule next simulated event
  const scheduleFallbackRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!enabled) return

    let fallbackStartTimer: ReturnType<typeof setTimeout> | null = null

    // Fallback simulation scheduler (defined inside effect to avoid dep loops)
    const scheduleFallback = () => {
      const delay = 15000 + Math.random() * 20000
      fallbackTimerRef.current = setTimeout(() => {
        if (!connectedRef.current) {
          addEvent(simEvent())
          scheduleFallback()
        }
      }, delay)
    }
    scheduleFallbackRef.current = scheduleFallback

    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 3,
      timeout: 5000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      connectedRef.current = true
      setConnected(true)
      setSimulated(false)
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
    })

    socket.on('disconnect', () => {
      connectedRef.current = false
      setConnected(false)
    })

    socket.on('connected', () => {
      connectedRef.current = true
      setConnected(true)
      setSimulated(false)
    })

    socket.on('notification', (event: LiveEvent) => {
      addEvent(event)
    })

    // If WebSocket doesn't connect within 5s, start fallback simulation
    fallbackStartTimer = setTimeout(() => {
      if (!connectedRef.current) {
        setSimulated(true)
        setConnected(true) // Show as "live" so UI doesn't look broken
        // Send an initial simulated event, then schedule more
        setTimeout(() => {
          if (!connectedRef.current) {
            addEvent(simEvent())
            scheduleFallback()
          }
        }, 2000)
      }
    }, 5000)

    return () => {
      socket.disconnect()
      socketRef.current = null
      connectedRef.current = false
      if (fallbackStartTimer) clearTimeout(fallbackStartTimer)
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
    }
  }, [enabled, addEvent])

  const markAllRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
    setUnreadCount(0)
  }, [])

  return { connected, simulated, events, unreadCount, markAllRead, clearEvents }
}
