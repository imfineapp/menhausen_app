import { $currentScreen, navigateTo } from '@/src/stores/navigation.store'
import { $screenParams, patchScreenParams } from '@/src/stores/screen-params.store'

export function handleOpenArticle(articleId: string): void {
  console.log(`Opening article: ${articleId}`)
  const currentScreen = $currentScreen.get()
  const originScreen = currentScreen === 'all-articles' ? 'all-articles' : 'home'
  patchScreenParams({ articleReturnScreen: originScreen, currentArticle: articleId })
  navigateTo('article')
}

export function handleGoToAllArticles(): void {
  console.log('Navigating to all articles screen')
  navigateTo('all-articles')
}

export function handleBackFromArticle(): void {
  const { articleReturnScreen } = $screenParams.get()
  patchScreenParams({ currentArticle: '' })
  if (articleReturnScreen === 'all-articles') {
    navigateTo('all-articles')
  } else {
    navigateTo('home')
  }
}

export function handleBackToHomeFromArticles(): void {
  patchScreenParams({ currentArticle: '' })
  navigateTo('home')
}
