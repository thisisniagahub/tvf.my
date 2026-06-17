'use client'

import confetti from 'canvas-confetti'

/**
 * Fire a celebratory confetti burst — used when a live sale notification arrives.
 * Uses shopee orange + hermes purple + success green to match the brand palette.
 */
export function celebrateSale() {
  const colors = ['#ee4d2d', '#8b5cf6', '#22c55e', '#facc15', '#ffffff']
  const end = Date.now() + 800 // 0.8 seconds

  // First burst from bottom-left
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.2, y: 0.9 },
    colors,
    startVelocity: 45,
    gravity: 0.9,
    ticks: 200,
    scalar: 0.9,
  })

  // Second burst from bottom-right (slight delay)
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.8, y: 0.9 },
      colors,
      startVelocity: 45,
      gravity: 0.9,
      ticks: 200,
      scalar: 0.9,
    })
  }, 150)

  // Star-shaped confetti from center
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { x: 0.5, y: 0.6 },
      colors,
      shapes: ['star'],
      startVelocity: 35,
      gravity: 0.8,
      ticks: 250,
      scalar: 1.2,
    })
  }, 300)

  // Side cannons for a finale
  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors,
      scalar: 0.8,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors,
      scalar: 0.8,
    })
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}

/**
 * Smaller confetti for achievements / milestones.
 */
export function celebrateAchievement() {
  const colors = ['#facc15', '#ee4d2d', '#8b5cf6', '#22c55e']
  confetti({
    particleCount: 50,
    spread: 80,
    origin: { y: 0.5 },
    colors,
    startVelocity: 30,
    gravity: 1,
    ticks: 180,
  })
}
