import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/telegramUserUtils', () => ({
  isDirectLinkMode: vi.fn(() => false),
}))

vi.mock('@/src/effects/telegram.effects', () => ({
  browserBack: vi.fn(),
  closeTelegramApp: vi.fn(),
}))

import {
  $currentScreen,
  $navigationHistory,
  resetNavigation,
  setNavigationState,
  navigateTo,
  goBack,
} from '@/src/stores/navigation.store'

describe('navigation.store', () => {
  beforeEach(() => {
    resetNavigation()
  })

  it('navigateTo appends screen and updates current', () => {
    setNavigationState('home', ['home'])
    navigateTo('profile')
    expect($currentScreen.get()).toBe('profile')
    expect($navigationHistory.get()).toEqual(['home', 'profile'])
  })

  it('goBack pops history and sets previous screen', () => {
    setNavigationState('profile', ['home', 'profile'])
    goBack()
    expect($currentScreen.get()).toBe('home')
    expect($navigationHistory.get()).toEqual(['home'])
  })

  it('resetNavigation clears to loading', () => {
    setNavigationState('home', ['home'])
    resetNavigation()
    expect($currentScreen.get()).toBe('loading')
    expect($navigationHistory.get()).toEqual(['loading'])
  })
})
