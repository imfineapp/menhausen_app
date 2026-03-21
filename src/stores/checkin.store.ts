import { atom, computed, onMount } from 'nanostores'

import { initializeLocalStorageInterceptor } from '@/utils/supabaseSync/localStorageInterceptor'
import { DailyCheckinManager, type CheckinData, DailyCheckinStatus } from '../../utils/DailyCheckinManager'

const CHECKIN_KEY_PREFIX = 'daily_checkin_'

export const $todayCheckin = atom<CheckinData | null>(null)

// Used to force derived stores to recompute even if `$todayCheckin` stays `null`
// (important for tests that mock only part of `DailyCheckinManager`).
const $checkinRefreshNonce = atom<number>(0)
let refreshNonceCounter = 0

export const $checkinStatus = computed([$todayCheckin, $checkinRefreshNonce], (checkin) => {
  if (!checkin) return DailyCheckinStatus.NOT_COMPLETED
  return checkin.completed ? DailyCheckinStatus.COMPLETED : DailyCheckinStatus.NOT_COMPLETED
})

export const $checkinStreak = computed([$todayCheckin, $checkinRefreshNonce], () => {
  if (typeof DailyCheckinManager.getCheckinStreak !== 'function') return 0
  const val = DailyCheckinManager.getCheckinStreak()
  return typeof val === 'number' && Number.isFinite(val) ? val : 0
})

export const $totalCheckins = computed([$todayCheckin, $checkinRefreshNonce], () => {
  if (typeof DailyCheckinManager.getTotalCheckins !== 'function') return 0
  const val = DailyCheckinManager.getTotalCheckins()
  return typeof val === 'number' && Number.isFinite(val) ? val : 0
})

function loadTodayCheckin() {
  if (typeof DailyCheckinManager.getCurrentDayKey !== 'function') return null
  if (typeof DailyCheckinManager.getCheckin !== 'function') return null

  const todayKey = DailyCheckinManager.getCurrentDayKey()
  return DailyCheckinManager.getCheckin(todayKey)
}

export function refreshCheckin() {
  $todayCheckin.set(loadTodayCheckin())
  $checkinRefreshNonce.set(++refreshNonceCounter)
}

export function saveCheckin(checkinData: Omit<CheckinData, 'id' | 'date' | 'timestamp' | 'completed'>) {
  const ok = DailyCheckinManager.saveCheckin(checkinData)
  if (ok) {
    refreshCheckin()
  }
  return ok
}

onMount($todayCheckin, () => {
  refreshCheckin()

  const interceptor = initializeLocalStorageInterceptor()
  const unsubscribe = interceptor.onKeyChange((key: string) => {
    // If any "today" check-in key changes, recompute streak/status from storage.
    if (key && key.startsWith(CHECKIN_KEY_PREFIX)) {
      refreshCheckin()
    }
  })

  return () => unsubscribe()
})

export { DailyCheckinStatus }

