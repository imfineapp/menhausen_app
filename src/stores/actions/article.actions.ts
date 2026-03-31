import { openPage } from '@nanostores/router'

import { $router } from '@/src/stores/router.store'
import { $screenParams, patchScreenParams } from '@/src/stores/screen-params.store'
import { AnalyticsEvent, capture } from '@/src/effects/analytics.effects'

export function handleOpenArticle(articleId: string): void {
  console.log(`Opening article: ${articleId}`)
  const originScreen = $router.get()?.route === 'allArticles' ? 'all-articles' : 'home'
  patchScreenParams({ articleReturnScreen: originScreen, currentArticle: articleId })
  void capture(AnalyticsEvent.ARTICLE_OPENED, {
    article_id: articleId,
    origin_screen: originScreen,
  })
  openPage($router, 'article', { articleId })
}

export function handleGoToAllArticles(): void {
  console.log('Navigating to all articles screen')
  openPage($router, 'allArticles')
}

export function handleBackFromArticle(): void {
  const { articleReturnScreen } = $screenParams.get()
  patchScreenParams({ currentArticle: '' })
  if (articleReturnScreen === 'all-articles') {
    openPage($router, 'allArticles')
  } else {
    openPage($router, 'home')
  }
}

export function handleBackToHomeFromArticles(): void {
  patchScreenParams({ currentArticle: '' })
  openPage($router, 'home')
}
