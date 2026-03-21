export type BreathingPhase = 'inhale' | 'hold' | 'exhale'

/**
 * Maps the current breathing phase + progress to a visual scale.
 * progress: 0..100
 */
export function getBreathingScale(phase: BreathingPhase, progress: number): number {
  switch (phase) {
    case 'inhale':
      return 1 + (progress / 100) * 0.5 // 1.0 -> 1.5
    case 'hold':
      return 1.5 // static
    case 'exhale':
      return 1.5 - (progress / 100) * 0.5 // 1.5 -> 1.0
    default:
      return 1
  }
}

export function getBreathingOpacity(phase: BreathingPhase): number {
  return phase === 'hold' ? 0.8 : 1
}

export function nextBreathingPhase(phase: BreathingPhase): BreathingPhase {
  if (phase === 'inhale') return 'hold'
  if (phase === 'hold') return 'exhale'
  return 'inhale'
}

/**
 * Converts current timer state into a progress percentage (0..100).
 */
export function computeBreathingProgressPercent(durationSeconds: number, timeLeftSeconds: number): number {
  const newTime = Math.max(0, timeLeftSeconds)
  const elapsed = durationSeconds - newTime
  if (durationSeconds <= 0) return 0
  return (elapsed / durationSeconds) * 100
}

export function formatTimeMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

