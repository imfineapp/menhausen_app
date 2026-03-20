import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/languageDetector', () => ({
  getInitialLanguage: vi.fn(() => 'en'),
  getSavedLanguage: vi.fn(() => 'en'),
  saveLanguage: vi.fn(),
}))

vi.mock('@/utils/contentLoader', () => ({
  loadContentWithCache: vi.fn(async (lang: string) => ({
    ui: { home: { heroTitle: lang === 'ru' ? 'Привет' : 'Hello' } },
    themes: {},
  })),
}))

vi.mock('@/utils/PointsManager', () => ({
  PointsManager: {
    getBalance: vi.fn(() => 250),
    getTransactions: vi.fn(() => []),
    earn: vi.fn(),
    spend: vi.fn(),
  },
}))

vi.mock('@/utils/ThemeCardManager', () => ({
  ThemeCardManager: {
    getTotalCompletedAttempts: vi.fn(() => 3),
  },
}))

vi.mock('@/utils/supabaseSync/localStorageInterceptor', () => ({
  initializeLocalStorageInterceptor: vi.fn(() => ({
    onKeyChange: vi.fn(() => () => {}),
  })),
}))

import {
  $currentScreen,
  $navigationHistory,
  navigateTo,
  goBack,
  resetNavigation,
} from '@/src/stores/navigation.store'
import { $language, setLanguage, openLanguageModal, closeLanguageModal, $isLanguageModalOpen } from '@/src/stores/language.store'
import { $content, loadContentForLanguage } from '@/src/stores/content.store'
import { $pointsBalance, refreshPoints, earnPoints, spendPoints } from '@/src/stores/points.store'
import { $themeProgressVersion, refreshThemeProgress, $totalCompletedAttempts } from '@/src/stores/theme-progress.store'

describe('core stores', () => {
  beforeEach(() => {
    resetNavigation()
    $language.set('en')
    $isLanguageModalOpen.set(false)
    $content.set(null)
    $pointsBalance.set(0)
    $themeProgressVersion.set(0)
    vi.clearAllMocks()
  })

  it('navigation.store navigates and goes back', () => {
    navigateTo('home')
    expect($currentScreen.get()).toBe('home')
    expect($navigationHistory.get()).toContain('home')

    goBack()
    expect($currentScreen.get()).toBe('loading')
  })

  it('language.store updates language and modal state', () => {
    setLanguage('ru')
    expect($language.get()).toBe('ru')

    openLanguageModal()
    expect($isLanguageModalOpen.get()).toBe(true)
    closeLanguageModal()
    expect($isLanguageModalOpen.get()).toBe(false)
  })

  it('content.store load action resolves without throwing', async () => {
    await expect(loadContentForLanguage('en')).resolves.toBeUndefined()
    await expect(loadContentForLanguage('ru')).resolves.toBeUndefined()
  })

  it('points.store refreshes and delegates earn/spend', () => {
    refreshPoints()
    expect($pointsBalance.get()).toBe(250)

    earnPoints(10, { note: 'test' })
    spendPoints(5, { note: 'test' })
    expect($pointsBalance.get()).toBe(250)
  })

  it('theme-progress.store exposes derived attempts', () => {
    refreshThemeProgress()
    expect($themeProgressVersion.get()).toBeGreaterThan(0)
    expect($totalCompletedAttempts.get()).toBe(3)
  })
})

