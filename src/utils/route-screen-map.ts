import type { AppScreen } from '@/types/userState'

export const ROUTE_TO_SCREEN: Record<string, AppScreen> = {
  loading: 'loading',
  psychTestPreambula: 'psychological-test-preambula',
  psychTestInstruction: 'psychological-test-instruction',
  psychTestResults: 'psychological-test-results',
  topicTestIntro: 'topic-test-intro',
  topicTestQuestion: 'topic-test-question',
  topicTestResults: 'topic-test-results',
  home: 'home',
  checkin: 'checkin',
  themeWelcome: 'theme-welcome',
  themeHome: 'theme-home',
  cardDetails: 'card-details',
  checkinDetails: 'checkin-details',
  cardWelcome: 'card-welcome',
  question01: 'question-01',
  question02: 'question-02',
  finalMessage: 'final-message',
  rateCard: 'rate-card',
  profile: 'profile',
  about: 'about',
  appSettings: 'app-settings',
  pinSettings: 'pin-settings',
  pin: 'pin',
  deleteAccount: 'delete',
  payments: 'payments',
  donations: 'donations',
  underConstruction: 'under-construction',
  privacy: 'privacy',
  terms: 'terms',
  breathing478: 'breathing-4-7-8',
  breathingSquare: 'breathing-square',
  grounding54321: 'grounding-5-4-3-2-1',
  groundingAnchor: 'grounding-anchor',
  rapidTechniquesFlow: 'rapid-techniques-flow',
  allArticles: 'all-articles',
  article: 'article',
  badges: 'badges',
  reward: 'reward',
}

export function resolveScreenFromRoute(route?: string, params?: Record<string, string>): AppScreen {
  if (!route) return 'loading'
  if (route === 'onboarding') return params?.step === '2' ? 'onboarding2' : 'onboarding1'
  if (route === 'survey') return (`survey${(params?.step || '01').padStart(2, '0')}` as AppScreen)
  if (route === 'psychTestQuestion') {
    return (`psychological-test-question-${(params?.num || '01').padStart(2, '0')}` as AppScreen)
  }
  return ROUTE_TO_SCREEN[route] ?? 'home'
}
