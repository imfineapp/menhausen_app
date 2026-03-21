import React, { Suspense } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'
const AllArticlesScreen = React.lazy(() =>
  import('@/components/AllArticlesScreen').then((m) => ({ default: m.AllArticlesScreen })),
)
const ArticleScreen = React.lazy(() => import('@/components/ArticleScreen').then((m) => ({ default: m.ArticleScreen })))
import { navigateTo } from '@/src/stores/navigation.store'

import type { RouteContext } from './types'

export function renderArticleRoutes(ctx: RouteContext): React.ReactNode | null {
  const {
    currentScreen,
    wrapScreen,
    handlers,
    currentArticle,
    userHasPremium,
    checkAndShowAchievementsBound,
    earnedAchievementIds,
    setEarnedAchievementIdsForArticle,
  } = ctx
  const withSuspense = (screen: React.ReactNode) => <Suspense fallback={<LoadingScreen />}>{screen}</Suspense>

  switch (currentScreen) {
    case 'all-articles':
      return wrapScreen(withSuspense(
        <AllArticlesScreen onBack={handlers.handleBackToHomeFromArticles} onArticleClick={handlers.handleOpenArticle} />,
      ))
    case 'article':
      return wrapScreen(withSuspense(
        <ArticleScreen
          articleId={currentArticle}
          onBack={handlers.handleBackFromArticle}
          onGoToTheme={handlers.handleGoToTheme}
          userHasPremium={userHasPremium}
          checkAndShowAchievements={checkAndShowAchievementsBound}
          navigateTo={navigateTo}
          earnedAchievementIds={earnedAchievementIds}
          setEarnedAchievementIds={setEarnedAchievementIdsForArticle}
        />,
      ))
    default:
      return null
  }
}
