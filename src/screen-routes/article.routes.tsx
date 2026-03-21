import type React from 'react'

import { AllArticlesScreen } from '@/components/AllArticlesScreen'
import { ArticleScreen } from '@/components/ArticleScreen'
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

  switch (currentScreen) {
    case 'all-articles':
      return wrapScreen(
        <AllArticlesScreen onBack={handlers.handleBackToHomeFromArticles} onArticleClick={handlers.handleOpenArticle} />,
      )
    case 'article':
      return wrapScreen(
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
      )
    default:
      return null
  }
}
