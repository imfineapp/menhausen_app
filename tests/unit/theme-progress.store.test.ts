import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getTotalCompletedAttempts: vi.fn(),
}))

vi.mock('@/utils/ThemeCardManager', () => ({
  ThemeCardManager: {
    getTotalCompletedAttempts: mocks.getTotalCompletedAttempts,
  },
}))

vi.mock('@/utils/supabaseSync/localStorageInterceptor', () => ({
  initializeLocalStorageInterceptor: () => ({
    onKeyChange: () => () => {},
  }),
}))

import {
  $themeProgressVersion,
  $totalCompletedAttempts,
  refreshThemeProgress,
} from '@/src/stores/theme-progress.store'

describe('theme-progress.store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    $themeProgressVersion.set(0)
  })

  it('refreshThemeProgress bumps version', () => {
    const prev = $themeProgressVersion.get()
    refreshThemeProgress()
    expect($themeProgressVersion.get()).toBe(prev + 1)
  })

  it('computed total uses ThemeCardManager', () => {
    mocks.getTotalCompletedAttempts.mockReturnValue(12)

    refreshThemeProgress()

    expect($totalCompletedAttempts.get()).toBe(12)
  })
})

