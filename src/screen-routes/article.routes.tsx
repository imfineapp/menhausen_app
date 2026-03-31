import React, { Suspense } from 'react'
import { openPage } from '@nanostores/router'
import { LoadingScreen } from '@/components/LoadingScreen'
const AllArticlesScreen = React.lazy(() =>
  import('@/components/AllArticlesScreen').then((m) => ({ default: m.AllArticlesScreen })),
)
const ArticleScreen = React.lazy(() => import('@/components/ArticleScreen').then((m) => ({ default: m.ArticleScreen })))
import { $router } from '@/src/stores/router.store'
import type { AppScreen } from '@/types/userState'

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
  const navigateToByLegacyScreen = (screen: AppScreen) => {
    if (screen === 'reward') openPage($router, 'reward')
  }

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
          navigateTo={navigateToByLegacyScreen}
          earnedAchievementIds={earnedAchievementIds}
          setEarnedAchievementIds={setEarnedAchievementIdsForArticle}
        />,
      ))
    default:
      return null
  }
}
