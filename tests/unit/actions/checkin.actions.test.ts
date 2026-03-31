import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  openPage: vi.fn(),
  markFirstCheckinDone: vi.fn(),
  markFirstRewardShown: vi.fn(),
  setEarnedAchievementIds: vi.fn(),
  setHasShownFirstAchievementFlag: vi.fn(),
  incrementCheckin: vi.fn(),
  invalidateUserStateCache: vi.fn(),
  flowGet: vi.fn(),
  screenParamsGet: vi.fn(() => ({ earnedAchievementIds: [] })),
}))

vi.mock('@/src/domain/user.domain', () => ({
  invalidateUserStateCache: mocks.invalidateUserStateCache,
}))
vi.mock('@nanostores/router', () => ({
  openPage: mocks.openPage,
}))
vi.mock('@/src/stores/router.store', () => ({
  $router: {},
}))
vi.mock('@/src/stores/app-flow.store', () => ({
  $flowProgress: { get: mocks.flowGet },
  markFirstCheckinDone: mocks.markFirstCheckinDone,
  markFirstRewardShown: mocks.markFirstRewardShown,
}))
vi.mock('@/src/stores/screen-params.store', () => ({
  setEarnedAchievementIds: mocks.setEarnedAchievementIds,
  setHasShownFirstAchievementFlag: mocks.setHasShownFirstAchievementFlag,
  $screenParams: { get: mocks.screenParamsGet },
}))
vi.mock('@/services/userStatsService', () => ({
  incrementCheckin: mocks.incrementCheckin,
}))

import { handleCheckInSubmit } from '@/src/stores/actions/checkin.actions'

describe('checkin.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('first checkin triggers newcomer reward flow', () => {
    mocks.flowGet.mockReturnValue({ firstRewardShown: false })

    handleCheckInSubmit('good', {
      isMounted: () => true,
      checkInTimeoutRef: { current: null },
      checkAndShowAchievements: vi.fn(),
    })

    expect(mocks.incrementCheckin).toHaveBeenCalled()
    expect(mocks.invalidateUserStateCache).toHaveBeenCalled()
    expect(mocks.markFirstCheckinDone).toHaveBeenCalled()
    expect(mocks.setEarnedAchievementIds).toHaveBeenCalledWith(['newcomer'])
    expect(mocks.markFirstRewardShown).toHaveBeenCalled()
    expect(mocks.openPage).toHaveBeenCalledWith(expect.anything(), 'reward')
  })

  it('subsequent checkin checks achievements then goes home when none', async () => {
    mocks.flowGet.mockReturnValue({ firstRewardShown: true })
    const checkAndShowAchievements = vi.fn().mockResolvedValue(undefined)
    const ref = { current: null as ReturnType<typeof setTimeout> | null }

    handleCheckInSubmit('good', {
      isMounted: () => true,
      checkInTimeoutRef: ref,
      checkAndShowAchievements,
    })

    await vi.runAllTimersAsync()

    expect(checkAndShowAchievements).toHaveBeenCalledWith(300, true)
    expect(mocks.openPage).toHaveBeenCalledWith(expect.anything(), 'home')
  })
})

