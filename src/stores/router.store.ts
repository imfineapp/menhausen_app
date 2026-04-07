import { createRouter, redirectPage } from '@nanostores/router'

const ROUTES = {
  loading: '/loading',
  onboarding: '/onboarding/:step',
  survey: '/survey/:step',
  psychTestPreambula: '/psych-test/preambula',
  psychTestInstruction: '/psych-test/instruction',
  psychTestQuestion: '/psych-test/q/:num',
  psychTestResults: '/psych-test/results',
  topicTestIntro: '/topic-test/intro',
  topicTestQuestion: '/topic-test/question',
  topicTestResults: '/topic-test/results',
  home: '/',
  checkin: '/checkin',
  themeWelcome: '/theme/:themeId/welcome',
  themeHome: '/theme/:themeId',
  cardDetails: '/theme/:themeId/card/:cardId',
  checkinDetails: '/theme/:themeId/card/:cardId/checkin/:checkinId',
  cardWelcome: '/theme/:themeId/card/:cardId/start',
  question01: '/theme/:themeId/card/:cardId/q1',
  question02: '/theme/:themeId/card/:cardId/q2',
  finalMessage: '/theme/:themeId/card/:cardId/final',
  rateCard: '/theme/:themeId/card/:cardId/rate',
  profile: '/profile',
  about: '/profile/about',
  appSettings: '/profile/settings',
  pinSettings: '/profile/pin-settings',
  pin: '/pin',
  deleteAccount: '/profile/delete',
  payments: '/payments',
  donations: '/donations',
  underConstruction: '/under-construction',
  privacy: '/privacy',
  terms: '/terms',
  breathing478: '/techniques/breathing-478',
  breathingSquare: '/techniques/breathing-square',
  grounding54321: '/techniques/grounding-54321',
  groundingAnchor: '/techniques/grounding-anchor',
  rapidTechniquesFlow: '/techniques/rapid-flow/:step',
  allArticles: '/articles',
  article: '/articles/:articleId',
  badges: '/badges',
  reward: '/reward',
} as const

export type RouteName = keyof typeof ROUTES

export const $router = createRouter(ROUTES)

function redirectUnknownRouteToHome(): void {
  // Handle reloads/deep-links to unknown paths in Telegram WebView.
  if (!$router.get()) {
    redirectPage($router, 'home')
  }
}

redirectUnknownRouteToHome()
$router.listen(() => {
  redirectUnknownRouteToHome()
})
