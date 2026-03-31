import { atom } from 'nanostores'
import { openPage, redirectPage } from '@nanostores/router'

import type { AppScreen } from '@/types/userState'
import { isDirectLinkMode } from '@/utils/telegramUserUtils'
import { browserBack, closeTelegramApp } from '@/src/effects/telegram.effects'
import { $screenParams, patchScreenParams } from '@/src/stores/screen-params.store'
import { $router } from '@/src/stores/router.store'
import { resolveScreenFromRoute } from '@/src/utils/route-screen-map'

/**
 * Legacy navigation facade.
 *
 * All action files now call @nanostores/router directly (openPage / redirectPage).
 * This module still exists because:
 *  1. AppContent.tsx reads $currentScreen / $navigationHistory for animation + achievement logic.
 *  2. goBack() centralizes the Telegram direct-link / closeTelegramApp fallback.
 *  3. ScreenRouter reads $isNavigatingForward for slide direction.
 *
 * TODO: migrate remaining consumers off $currentScreen -> $router, then delete this file.
 */

type LegacyRoute = {
  route: string
  params?: Record<string, string>
}

function resolveRouteFromScreen(screen: AppScreen): LegacyRoute {
  const { currentTheme, currentCard, currentCheckin, currentArticle } = $screenParams.get()
  const themeId = currentTheme || currentCard.themeId || 'stress'
  const cardId = currentCard.id || '1'
  const checkinId = currentCheckin.id || '1'
  const articleId = currentArticle || '1'

  if (screen === 'onboarding1') return { route: 'onboarding', params: { step: '1' } }
  if (screen === 'onboarding2') return { route: 'onboarding', params: { step: '2' } }

  if (/^survey\d{2}$/.test(screen)) return { route: 'survey', params: { step: screen.slice(-2) } }

  if (screen.startsWith('psychological-test-question-')) {
    return { route: 'psychTestQuestion', params: { num: screen.split('-').pop() ?? '01' } }
  }

  const staticRoutes: Partial<Record<AppScreen, LegacyRoute>> = {
    loading: { route: 'loading' },
    'psychological-test-preambula': { route: 'psychTestPreambula' },
    'psychological-test-instruction': { route: 'psychTestInstruction' },
    'psychological-test-results': { route: 'psychTestResults' },
    'topic-test-intro': { route: 'topicTestIntro' },
    'topic-test-question': { route: 'topicTestQuestion' },
    'topic-test-results': { route: 'topicTestResults' },
    home: { route: 'home' },
    checkin: { route: 'checkin' },
    profile: { route: 'profile' },
    about: { route: 'about' },
    privacy: { route: 'privacy' },
    terms: { route: 'terms' },
    'pin-settings': { route: 'pinSettings' },
    'app-settings': { route: 'appSettings' },
    pin: { route: 'pin' },
    delete: { route: 'deleteAccount' },
    payments: { route: 'payments' },
    donations: { route: 'donations' },
    'under-construction': { route: 'underConstruction' },
    'breathing-4-7-8': { route: 'breathing478' },
    'breathing-square': { route: 'breathingSquare' },
    'grounding-5-4-3-2-1': { route: 'grounding54321' },
    'grounding-anchor': { route: 'groundingAnchor' },
    badges: { route: 'badges' },
    reward: { route: 'reward' },
    'all-articles': { route: 'allArticles' },
    article: { route: 'article', params: { articleId } },
    'theme-welcome': { route: 'themeWelcome', params: { themeId } },
    'theme-home': { route: 'themeHome', params: { themeId } },
    'card-details': { route: 'cardDetails', params: { themeId, cardId } },
    'checkin-details': { route: 'checkinDetails', params: { themeId, cardId, checkinId } },
    'card-welcome': { route: 'cardWelcome', params: { themeId, cardId } },
    'question-01': { route: 'question01', params: { themeId, cardId } },
    'question-02': { route: 'question02', params: { themeId, cardId } },
    'final-message': { route: 'finalMessage', params: { themeId, cardId } },
    'rate-card': { route: 'rateCard', params: { themeId, cardId } },
  }

  return staticRoutes[screen] ?? { route: 'home' }
}

function resolveCurrentScreenFromRouter(): AppScreen {
  const page = $router.get()
  return resolveScreenFromRoute(page?.route, page?.params as Record<string, string> | undefined)
}

function syncScreenParamsFromRoute(): void {
  const page = $router.get()
  if (!page) return
  const params = page.params as Record<string, string | undefined>
  if (params.themeId) patchScreenParams({ currentTheme: params.themeId })
  if (params.cardId) patchScreenParams({ currentCard: { ...$screenParams.get().currentCard, id: params.cardId, themeId: params.themeId } })
  if (params.articleId) patchScreenParams({ currentArticle: params.articleId })
  if (params.checkinId) patchScreenParams({ currentCheckin: { ...$screenParams.get().currentCheckin, id: params.checkinId } })
}

const initialScreen = resolveCurrentScreenFromRouter()
export const $currentScreen = atom<AppScreen>(initialScreen)
export const $navigationHistory = atom<AppScreen[]>([initialScreen])
export const $isNavigatingForward = atom<boolean>(true)

let isProgrammaticBack = false

$router.listen(() => {
  const next = resolveCurrentScreenFromRouter()
  syncScreenParamsFromRoute()

  const history = $navigationHistory.get()
  if (isProgrammaticBack) {
    isProgrammaticBack = false
    $currentScreen.set(next)
    return
  }

  $currentScreen.set(next)
  const prev = history[history.length - 1]
  if (prev !== next) {
    $navigationHistory.set([...history, next])
  }
})

export function resetNavigation() {
  $isNavigatingForward.set(true)
  $navigationHistory.set(['loading'])
  $currentScreen.set('loading')
  redirectPage($router, 'loading')
}

export function setNavigationState(screen: AppScreen, history: AppScreen[]) {
  // Legacy API used by app bootstrap/tests to atomically set facade state.
  $isNavigatingForward.set(true)
  $navigationHistory.set(history.length > 0 ? history : [screen])
  $currentScreen.set(screen)
  const route = resolveRouteFromScreen(screen)
  redirectPage($router, route.route as any, route.params as any)
}

export function setCurrentScreenOnly(screen: AppScreen) {
  // Legacy helper for tests/init paths that mutate only current screen.
  $isNavigatingForward.set(true)
  $currentScreen.set(screen)
  const route = resolveRouteFromScreen(screen)
  redirectPage($router, route.route as any, route.params as any)
}

export function navigateTo(screen: AppScreen) {
  // Legacy forward navigation wrapper kept for compatibility consumers.
  $isNavigatingForward.set(true)
  const route = resolveRouteFromScreen(screen)
  $navigationHistory.set([...$navigationHistory.get(), screen])
  $currentScreen.set(screen)
  openPage($router, route.route as any, route.params as any)
}

export function goBack() {
  $isNavigatingForward.set(false)
  if ($navigationHistory.get().length > 1) {
    const newHistory = $navigationHistory.get().slice(0, -1)
    $navigationHistory.set(newHistory)
    $currentScreen.set(newHistory[newHistory.length - 1] ?? 'home')
    isProgrammaticBack = true
    window.history.back()
    return
  }
  if (typeof window !== 'undefined' && isDirectLinkMode()) {
    // Direct-link mode detection only applies to explicit goBack() calls.
    // @nanostores/router popstate handling is transparent -- if the user
    // entered via deep link and presses browser back, the WebView closes
    // via Telegram back-button integration in useTelegramBackButton.ts.
    closeTelegramApp()
    return
  }
  browserBack()
}

