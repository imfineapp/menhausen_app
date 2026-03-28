import { EXPERIMENT } from '@/utils/experiment/experimentKeys'
import type { ExperimentVariantType } from '@/src/stores/experiment.store'
import { $experimentVariant } from '@/src/stores/experiment.store'

/** Deterministic bucket from user id (even distribution). */
export function fnv1aHash(str: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function computeVariantFromUserId(telegramUserId: string): ExperimentVariantType {
  const bucket = fnv1aHash(telegramUserId) % 3
  return (['A', 'B', 'C'] as const)[bucket]
}

export function readVariantFromStorage(): ExperimentVariantType | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const v = localStorage.getItem(EXPERIMENT.STORAGE_VARIANT)
    if (v === 'A' || v === 'B' || v === 'C') return v
  } catch (err) {
    if (import.meta.env?.DEV) console.warn('[experiment] readVariantFromStorage localStorage error:', err)
  }
  return null
}

const SYNC_PAYLOAD_KEY = 'experiment-assignment-sync'

export function writeVariantToStorage(variant: ExperimentVariantType): void {
  try {
    localStorage.setItem(EXPERIMENT.STORAGE_VARIANT, variant)
    const payload = {
      experimentKey: EXPERIMENT.KEY_ONBOARDING_FLOW_V1,
      variant,
      assignedAt: new Date().toISOString(),
    }
    localStorage.setItem(SYNC_PAYLOAD_KEY, JSON.stringify(payload))
  } catch (err) {
    if (import.meta.env?.DEV) console.warn('[experiment] writeVariantToStorage localStorage error:', err)
  }
}

export function loadExperimentAssignmentSyncPayload(): {
  experimentKey: string
  variant: ExperimentVariantType
  assignedAt: string
} | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(SYNC_PAYLOAD_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as { experimentKey?: string; variant?: string; assignedAt?: string }
    if (p.variant !== 'A' && p.variant !== 'B' && p.variant !== 'C') return null
    return {
      experimentKey: p.experimentKey ?? EXPERIMENT.KEY_ONBOARDING_FLOW_V1,
      variant: p.variant,
      assignedAt: p.assignedAt ?? new Date().toISOString(),
    }
  } catch {
    return null
  }
}

/**
 * Local cache first; if missing, compute from telegram user id and persist.
 */
export function assignVariant(telegramUserId: string): ExperimentVariantType {
  const cached = readVariantFromStorage()
  if (cached) return cached
  const variant = computeVariantFromUserId(telegramUserId)
  writeVariantToStorage(variant)
  return variant
}

/** Server wins (call after sync merge). */
export function applyRemoteVariantIfStronger(remote: { variant: string; experimentKey?: string } | null | undefined): void {
  if (!remote || typeof remote.variant !== 'string') return
  const v = remote.variant
  if (v !== 'A' && v !== 'B' && v !== 'C') return
  if (remote.experimentKey && remote.experimentKey !== EXPERIMENT.KEY_ONBOARDING_FLOW_V1) return
  writeVariantToStorage(v as ExperimentVariantType)
  $experimentVariant.set(v as ExperimentVariantType)
}
