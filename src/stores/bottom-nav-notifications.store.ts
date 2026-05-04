import { atom, computed, onMount } from 'nanostores'

import { $todayCheckin } from '@/src/stores/checkin.store'
import { $currentLevel } from '@/src/stores/points.store'
import type { CheckinData } from '@/utils/DailyCheckinManager'

type PersistedState = {
  version: 1
  breathingDismissedForDate: string | null
  lastProcessedCheckinTimestamp: number | null
  badgesHasUnseen: boolean
  lastSeenLevel: number | null
}

const STORAGE_KEY = 'menhausen_bottom_nav_notifications_v1'

function loadPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        version: 1,
        breathingDismissedForDate: null,
        lastProcessedCheckinTimestamp: null,
        badgesHasUnseen: false,
        lastSeenLevel: null,
      }
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      version: 1,
      breathingDismissedForDate: typeof parsed.breathingDismissedForDate === 'string' ? parsed.breathingDismissedForDate : null,
      lastProcessedCheckinTimestamp:
        typeof parsed.lastProcessedCheckinTimestamp === 'number' && Number.isFinite(parsed.lastProcessedCheckinTimestamp)
          ? parsed.lastProcessedCheckinTimestamp
          : null,
      badgesHasUnseen: parsed.badgesHasUnseen === true,
      lastSeenLevel: typeof parsed.lastSeenLevel === 'number' && Number.isFinite(parsed.lastSeenLevel) ? parsed.lastSeenLevel : null,
    }
  } catch {
    return {
      version: 1,
      breathingDismissedForDate: null,
      lastProcessedCheckinTimestamp: null,
      badgesHasUnseen: false,
      lastSeenLevel: null,
    }
  }
}

function savePersistedState(next: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore storage failures (private mode / quota / etc.)
  }
}

const $persisted = atom<PersistedState>(loadPersistedState())

function patchPersisted(patch: Partial<PersistedState>) {
  const next: PersistedState = { ...$persisted.get(), ...patch, version: 1 }
  $persisted.set(next)
  savePersistedState(next)
}

function todayKey(): string {
  // Use local timezone date, align with existing app logic (checkin reset is local time based).
  return new Date().toISOString().slice(0, 10)
}

export const $hasBreathingDot = computed([$persisted, $todayCheckin], (persisted, checkin) => {
  if (!checkin?.completed) return false
  if (typeof checkin.value !== 'number') return false
  if (checkin.value >= 3) return false
  const dismissedForToday = persisted.breathingDismissedForDate === todayKey()
  return !dismissedForToday
})

export const $hasBadgesDot = computed($persisted, (persisted) => persisted.badgesHasUnseen === true)

export const $hasProfileDot = computed([$persisted, $currentLevel], (persisted, currentLevel) => {
  const lastSeen = persisted.lastSeenLevel
  if (typeof currentLevel !== 'number') return false
  if (lastSeen == null) return false
  return currentLevel > lastSeen
})

function maybeHandleNewCheckin(checkin: CheckinData | null) {
  if (!checkin?.completed) return
  const ts = typeof checkin.timestamp === 'number' ? checkin.timestamp : null
  if (ts == null) return

  const prev = $persisted.get().lastProcessedCheckinTimestamp
  if (prev === ts) return

  // New check-in arrived: reset “dismissed” so dot can show again if value < 3.
  patchPersisted({
    lastProcessedCheckinTimestamp: ts,
    breathingDismissedForDate: null,
  })
}

export function markBreathingSeenForToday() {
  patchPersisted({ breathingDismissedForDate: todayKey() })
}

export function markBadgesSeen() {
  patchPersisted({ badgesHasUnseen: false })
}

export function markProfileSeen() {
  patchPersisted({ lastSeenLevel: $currentLevel.get() })
}

export function onNewAchievementsUnlocked(_ids: string[]) {
  patchPersisted({ badgesHasUnseen: true })
}

export function syncFromStoresOnMount() {
  // Ensure we have an initial lastSeenLevel baseline.
  const persisted = $persisted.get()
  if (persisted.lastSeenLevel == null) {
    patchPersisted({ lastSeenLevel: $currentLevel.get() })
  }

  // Ensure breathing state is synced if checkin already exists.
  maybeHandleNewCheckin($todayCheckin.get())
}

onMount($persisted, () => {
  syncFromStoresOnMount()

  const unSubCheckin = $todayCheckin.listen((val) => {
    maybeHandleNewCheckin(val)
  })

  const unSubLevel = $currentLevel.listen((lvl) => {
    const persisted = $persisted.get()
    if (persisted.lastSeenLevel == null) {
      patchPersisted({ lastSeenLevel: lvl })
    }
  })

  return () => {
    unSubCheckin()
    unSubLevel()
  }
})

