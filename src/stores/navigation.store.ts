import { atom } from 'nanostores'
import type { AppScreen } from '@/types/userState'
import { isDirectLinkMode } from '@/utils/telegramUserUtils'

export const $currentScreen = atom<AppScreen>('loading')
export const $navigationHistory = atom<AppScreen[]>(['loading'])
export const $isNavigatingForward = atom<boolean>(true)

function closeTelegramApp() {
  try {
    window.Telegram?.WebApp?.close()
  } catch {
    // ignore (tests / non-telegram environments)
  }
}

export function resetNavigation() {
  $isNavigatingForward.set(true)
  $currentScreen.set('loading')
  $navigationHistory.set(['loading'])
}

export function setNavigationState(screen: AppScreen, history: AppScreen[]) {
  $isNavigatingForward.set(true)
  $currentScreen.set(screen)
  $navigationHistory.set(history)
}

// Used for "replace" style transitions (e.g. donations screen).
// Does not modify navigation history, so Back behavior remains unchanged.
export function setCurrentScreenOnly(screen: AppScreen) {
  $isNavigatingForward.set(true)
  $currentScreen.set(screen)
}

export function navigateTo(screen: AppScreen) {
  $isNavigatingForward.set(true)
  const prev = $navigationHistory.get()
  $navigationHistory.set([...prev, screen])
  $currentScreen.set(screen)
}

export function goBack() {
  $isNavigatingForward.set(false)

  const history = $navigationHistory.get()
  if (history.length > 1) {
    const newHistory = history.slice(0, -1)
    const previousScreen = newHistory[newHistory.length - 1]
    $navigationHistory.set(newHistory)
    $currentScreen.set(previousScreen)
    return
  }

  // No history: in direct-link mode close the mini app; otherwise fall back to browser back.
  if (typeof window !== 'undefined' && isDirectLinkMode()) {
    closeTelegramApp()
    return
  }

  try {
    window.history.back()
  } catch {
    // ignore
  }
}

