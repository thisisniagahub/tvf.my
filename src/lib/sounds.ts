/**
 * Play a notification sound using the Web Audio API (no asset files needed).
 * Generates a pleasant chime for sale notifications.
 */

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch {
      return null
    }
  }
  return audioContext
}

function playTone(frequency: number, startTime: number, duration: number, volume: number = 0.15) {
  const ctx = getAudioContext()
  if (!ctx) return

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startTime)

  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

/**
 * Play a cheerful "cha-ching" style chime for sale notifications.
 * Two ascending tones (C5 → E5 → G5).
 */
export function playSaleChime() {
  const ctx = getAudioContext()
  if (!ctx) return

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  const now = ctx.currentTime
  // C5 (523.25), E5 (659.25), G5 (783.99) — a cheerful major chord arpeggio
  playTone(523.25, now, 0.15, 0.12)
  playTone(659.25, now + 0.08, 0.15, 0.12)
  playTone(783.99, now + 0.16, 0.25, 0.15)
}

/**
 * Play a softer notification blip for trend/XTRA alerts.
 */
export function playNotificationBlip() {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  const now = ctx.currentTime
  // A5 (880) single short blip
  playTone(880, now, 0.12, 0.08)
}
