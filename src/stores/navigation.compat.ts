import { atom } from 'nanostores'
import { openPage, redirectPage } from '@nanostores/router'

import type { AppScreen } from '@/types/userState'
import { isDirectLinkMode } from '@/utils/telegramUserUtils'
import { browserBack, closeTelegramApp } from '@/src/effects/telegram.effects'
import { $screenParams, patchScreenParams } from '@/src/stores/screen-params.store'
import { $router } from '@/src/stores/router.store'

type LegacyRoute = {
  route: string
  params?: Record<string, string>
}

function to2(num: string): string {
  return num.padStart(2, '0')
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

function resolveScreenFromRoute(): AppScreen {
  const page = $router.get()
  if (!page) return 'loading'

  switch (page.route) {
    case 'loading':
      return 'loading'
    case 'home':
      return 'home'
    case 'onboarding':
      return page.params.step === '2' ? 'onboarding2' : 'onboarding1'
    case 'survey':
      return `survey${to2(page.params.step || '01')}` as AppScreen
    case 'psychTestPreambula':
      return 'psychological-test-preambula'
    case 'psychTestInstruction':
      return 'psychological-test-instruction'
    case 'psychTestQuestion':
      return `psychological-test-question-${to2(page.params.num || '01')}` as AppScreen
    case 'psychTestResults':
      return 'psychological-test-results'
    case 'topicTestIntro':
      return 'topic-test-intro'
    case 'topicTestQuestion':
      return 'topic-test-question'
    case 'topicTestResults':
      return 'topic-test-results'
    case 'checkin':
      return 'checkin'
    case 'themeWelcome':
      return 'theme-welcome'
    case 'themeHome':
      return 'theme-home'
    case 'cardDetails':
      return 'card-details'
    case 'checkinDetails':
      return 'checkin-details'
    case 'cardWelcome':
      return 'card-welcome'
    case 'question01':
      return 'question-01'
    case 'question02':
      return 'question-02'
    case 'finalMessage':
      return 'final-message'
    case 'rateCard':
      return 'rate-card'
    case 'profile':
      return 'profile'
    case 'about':
      return 'about'
    case 'appSettings':
      return 'app-settings'
    case 'pinSettings':
      return 'pin-settings'
    case 'pin':
      return 'pin'
    case 'deleteAccount':
      return 'delete'
    case 'payments':
      return 'payments'
    case 'donations':
      return 'donations'
    case 'underConstruction':
      return 'under-construction'
    case 'privacy':
      return 'privacy'
    case 'terms':
      return 'terms'
    case 'breathing478':
      return 'breathing-4-7-8'
    case 'breathingSquare':
      return 'breathing-square'
    case 'grounding54321':
      return 'grounding-5-4-3-2-1'
    case 'groundingAnchor':
      return 'grounding-anchor'
    case 'allArticles':
      return 'all-articles'
    case 'article':
      return 'article'
    case 'badges':
      return 'badges'
    case 'reward':
      return 'reward'
    default:
      return 'home'
  }
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

const initialScreen = resolveScreenFromRoute()
export const $currentScreen = atom<AppScreen>(initialScreen)
export const $navigationHistory = atom<AppScreen[]>([initialScreen])
export const $isNavigatingForward = atom<boolean>(true)

let isProgrammaticBack = false

$router.listen(() => {
  const next = resolveScreenFromRoute()
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
  $isNavigatingForward.set(true)
  $navigationHistory.set(history.length > 0 ? history : [screen])
  $currentScreen.set(screen)
  const route = resolveRouteFromScreen(screen)
  redirectPage($router, route.route as any, route.params as any)
}

export function setCurrentScreenOnly(screen: AppScreen) {
  $isNavigatingForward.set(true)
  $currentScreen.set(screen)
  const route = resolveRouteFromScreen(screen)
  redirectPage($router, route.route as any, route.params as any)
}

export function navigateTo(screen: AppScreen) {
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
    closeTelegramApp()
    return
  }
  browserBack()
}
