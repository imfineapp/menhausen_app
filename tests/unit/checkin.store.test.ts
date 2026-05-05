import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  saveCheckin: vi.fn(),
  getCurrentDayKey: vi.fn(),
  getCheckin: vi.fn(),
  getCheckinStreak: vi.fn(),
  getTotalCheckins: vi.fn(),
  shouldPromptCheckin: vi.fn(),
}))

vi.mock('@/utils/DailyCheckinManager', () => ({
  DailyCheckinManager: {
    saveCheckin: mocks.saveCheckin,
    getCurrentDayKey: mocks.getCurrentDayKey,
    getCheckin: mocks.getCheckin,
    getCheckinStreak: mocks.getCheckinStreak,
    getTotalCheckins: mocks.getTotalCheckins,
    shouldPromptCheckin: mocks.shouldPromptCheckin,
  },
  DailyCheckinStatus: {
    NOT_COMPLETED: 'not_completed',
    COMPLETED: 'completed',
  },
}))

vi.mock('@/utils/supabaseSync/localStorageInterceptor', () => ({
  initializeLocalStorageInterceptor: () => ({
    onKeyChange: () => () => {},
  }),
}))

import {
  $checkinStatus,
  $checkinStreak,
  $todayCheckin,
  refreshCheckin,
  saveCheckin,
} from '@/src/stores/checkin.store'

describe('checkin.store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getCurrentDayKey.mockReturnValue('2026-03-21')
    mocks.getCheckin.mockReturnValue(null)
    mocks.getCheckinStreak.mockReturnValue(0)
    mocks.getTotalCheckins.mockReturnValue(0)
    mocks.shouldPromptCheckin.mockReturnValue(true)
    $todayCheckin.set(null)
  })

  it('saveCheckin updates today state on success', () => {
    mocks.saveCheckin.mockReturnValue({ success: true, data: { id: 'c1', completed: true, mood: 'happy' } })
    mocks.getCheckin.mockReturnValue({
      id: 'c1',
      completed: true,
      mood: 'happy',
    })

    const ok = saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' } as any)

    expect(ok).toBe(true)
    expect($todayCheckin.get()).toEqual(expect.objectContaining({ id: 'c1', completed: true }))
    expect($checkinStatus.get()).toBe('completed')
  })

  it('saveCheckin returns false on cooldown', () => {
    mocks.saveCheckin.mockReturnValue({ success: false, reason: 'cooldown' })

    const ok = saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' } as any)

    expect(ok).toBe(false)
  })

  it('refreshCheckin recalculates streak from manager', () => {
    mocks.getCheckinStreak.mockReturnValue(7)

    refreshCheckin()

    expect($checkinStreak.get()).toBe(7)
  })
})
