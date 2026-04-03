import { useEffect, useRef } from 'react'
import { openPage } from '@nanostores/router'

import { $router } from '@/src/stores/router.store'
import { setEarnedAchievementIds } from '@/src/stores/screen-params.store'
import { getAchievementsToShow, markAchievementsAsShown } from '@/services/achievementDisplayService'

type Params = {
  currentScreen: string
  earnedAchievementIds: string[]
  navigationHistory: string[]
}

export function useRewardDisplayOrchestrator({ currentScreen, earnedAchievementIds, navigationHistory }: Params): void {
  const themeHomeProcessingRef = useRef<boolean>(false)

  useEffect(() => {
    if (currentScreen === 'home' && earnedAchievementIds.length > 0) {
      openPage($router, 'reward')
    }
  }, [currentScreen, earnedAchievementIds.length])

  useEffect(() => {
    if (currentScreen !== 'home') return

    const timeoutId = setTimeout(() => {
      const result = getAchievementsToShow({
        screen: 'home',
        earnedAchievementIds: earnedAchievementIds.length > 0 ? earnedAchievementIds : undefined,
        excludeFromStorageCheck: earnedAchievementIds,
      })

      if (result.shouldNavigate && result.achievementsToShow.length > 0) {
        markAchievementsAsShown(result.achievementsToShow, 'home')
        setEarnedAchievementIds(result.achievementsToShow)
        openPage($router, 'reward')
      }
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [currentScreen, earnedAchievementIds])

  useEffect(() => {
    if (currentScreen !== 'profile') return

    const timeoutId = setTimeout(() => {
      const result = getAchievementsToShow({
        screen: 'profile',
        earnedAchievementIds: earnedAchievementIds.length > 0 ? earnedAchievementIds : undefined,
        excludeFromStorageCheck: earnedAchievementIds,
      })

      if (result.shouldNavigate && result.achievementsToShow.length > 0) {
        markAchievementsAsShown(result.achievementsToShow, 'profile')
        setEarnedAchievementIds(result.achievementsToShow)
        openPage($router, 'reward')
      }
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [currentScreen, earnedAchievementIds])

  useEffect(() => {
    if (currentScreen === 'theme-home') {
      const previousScreen =
        navigationHistory.length >= 2 ? navigationHistory[navigationHistory.length - 2] : null

      if (earnedAchievementIds.length === 0 && previousScreen === 'reward') return
      if (earnedAchievementIds.length === 0 && themeHomeProcessingRef.current) return

      if (earnedAchievementIds.length === 0) themeHomeProcessingRef.current = true
      if (earnedAchievementIds.length > 0) themeHomeProcessingRef.current = false

      const delay = earnedAchievementIds.length > 0 ? 200 : 800

      const timeoutId = setTimeout(() => {
        const result = getAchievementsToShow({
          screen: 'theme-home',
          earnedAchievementIds: earnedAchievementIds.length > 0 ? earnedAchievementIds : undefined,
          excludeFromStorageCheck: earnedAchievementIds,
        })

        if (result.shouldNavigate && result.achievementsToShow.length > 0) {
          markAchievementsAsShown(result.achievementsToShow, 'theme-home')
          setEarnedAchievementIds(result.achievementsToShow)
          setTimeout(() => openPage($router, 'reward'), 0)
          return
        }

        themeHomeProcessingRef.current = false
      }, delay)

      return () => clearTimeout(timeoutId)
    }

    themeHomeProcessingRef.current = false
  }, [currentScreen, earnedAchievementIds, navigationHistory])
}
