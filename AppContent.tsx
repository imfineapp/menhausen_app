import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useStore } from '@nanostores/react'

import ScreenRouter from './src/ScreenRouter'
import { BackButton } from './components/ui/back-button'
import { ContentLoadingGate } from './components/ContentContext'
import { useLanguage } from './components/LanguageContext'
import { initLanguage } from './src/stores/language.store'

import { isTelegramEnvironment } from './utils/telegramUserUtils'
import { DailyCheckinManager, DailyCheckinStatus } from './utils/DailyCheckinManager'
import { capture, AnalyticsEvent, identify } from './src/effects/analytics.effects'
import { initScreenViewTracking } from './src/effects/screen-view.effect'
import { getTelegramUserId } from './utils/telegramUserUtils'
import { processReferralCode, updateReferrerStatsFromList } from './utils/referralUtils'
import { hasTestBeenCompleted } from './utils/psychologicalTestStorage'
import { AppScreen } from './types/userState'
import { assignVariant } from '@/utils/experiment/experimentAssignment'
import { EXPERIMENT } from '@/utils/experiment/experimentKeys'
import { $experimentVariant } from '@/src/stores/experiment.store'
import type { ExperimentVariantType } from '@/src/stores/experiment.store'

import {
  $currentScreen,
  $navigationHistory,
  resetNavigation,
  setNavigationState,
  goBack,
} from './src/stores/navigation.store'

import { refreshFlowProgress, loadFlowProgressFromLocalStorage } from './src/stores/app-flow.store'
import { getSyncService } from '@/utils/supabaseSync/supabaseSyncService'
import { $lastSyncTime, forceSync } from './src/stores/sync.store'
import { setAuthState } from './src/stores/auth.store'
import { getJWTExpiry } from './utils/supabaseSync/authService'
import { shouldPullSyncOnForeground } from './src/utils/visibilitySync'
import { $screenParams } from './src/stores/screen-params.store'
import { checkAndShowAchievements } from './src/stores/actions/achievement-display.actions'
import { useRewardDisplayOrchestrator } from './hooks/useRewardDisplayOrchestrator'

function AppContent() {
  const { language: currentLanguageFromContext, setLanguage: updateLanguage } = useLanguage()

  useLayoutEffect(() => {
    initLanguage()
  }, [])

  useEffect(() => {
    const cleanup = initScreenViewTracking()
    return cleanup
  }, [])

  useEffect(() => {
    if (isTelegramEnvironment()) {
      try {
        if (window.Telegram?.WebApp?.ready) {
          window.Telegram.WebApp.ready()
        }

        telegramTimeoutRefs.current.expand = setTimeout(() => {
          try {
            if (window.Telegram?.WebApp?.expand) {
              window.Telegram.WebApp.expand()
            }

            telegramTimeoutRefs.current.fullscreen = setTimeout(() => {
              try {
                if (window.Telegram?.WebApp?.requestFullscreen) {
                  window.Telegram.WebApp.requestFullscreen()
                }
              } catch (fullscreenError) {
                console.warn('Failed to request fullscreen:', fullscreenError)
              }
            }, 300)
          } catch (expandError) {
            console.warn('Failed to expand WebApp:', expandError)
          }
        }, 100)
      } catch (error) {
        console.warn('Error initializing Telegram WebApp:', error)
      }
    }

    return () => {
      if (telegramTimeoutRefs.current.expand) {
        clearTimeout(telegramTimeoutRefs.current.expand)
      }
      if (telegramTimeoutRefs.current.fullscreen) {
        clearTimeout(telegramTimeoutRefs.current.fullscreen)
      }
      telegramTimeoutRefs.current = {}
    }
  }, [])

  useEffect(() => {
    processReferralCode()
    updateReferrerStatsFromList()
  }, [])

  useEffect(() => {
    const prefetchLikelyScreens = () => {
      void import('./components/HomeScreen')
      void import('./src/screen-routes/psych-test.routes')
    }
    const browserWindow = window as Window & {
      requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number
      cancelIdleCallback?: (id: number) => void
    }

    if (typeof browserWindow.requestIdleCallback === 'function') {
      const idleId = browserWindow.requestIdleCallback(() => prefetchLikelyScreens(), { timeout: 2000 })
      return () => {
        if (typeof browserWindow.cancelIdleCallback === 'function') {
          browserWindow.cancelIdleCallback(idleId)
        }
      }
    }

    const timeoutId = window.setTimeout(() => {
      prefetchLikelyScreens()
    }, 600)
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    let cancelled = false
    resetNavigation()

    const determineInitialScreen = (progress: ReturnType<typeof loadFlowProgressFromLocalStorage>): AppScreen => {
      if (!progress.onboardingCompleted) {
        return 'onboarding1'
      }
      if (!progress.surveyCompleted) {
        return 'survey01'
      }
      // If there is no Telegram user id, variant is still null here. Otherwise initializeApp has already called assignVariant().
      const variant = $experimentVariant.get()
      const skipFullPsych = variant === 'B' || variant === 'C'
      if (!skipFullPsych && !hasTestBeenCompleted()) {
        return 'psychological-test-preambula'
      }
      const checkinStatus = DailyCheckinManager.getCurrentDayStatus()
      if (checkinStatus === DailyCheckinStatus.NOT_COMPLETED) {
        return 'checkin'
      }
      if (checkinStatus === DailyCheckinStatus.COMPLETED) {
        return 'home'
      }
      return 'checkin'
    }

    const checkLocalData = (): boolean => {
      const progress = loadFlowProgressFromLocalStorage()
      const hasProgress = progress.onboardingCompleted || progress.surveyCompleted
      const hasTest = hasTestBeenCompleted()
      const hasData = hasProgress || hasTest
      console.log('[App] checkLocalData:', {
        hasProgress,
        hasTest,
        hasData,
        onboardingCompleted: progress.onboardingCompleted,
        surveyCompleted: progress.surveyCompleted,
      })
      return hasData
    }

    const loadAllUserData = async (): Promise<void> => {
      try {
        if (cancelled) return
        console.log('[App] Loading all user data from Supabase...')
        const syncStartTime = Date.now()
        const { initSync } = await import('./src/stores/sync.store')
        const result = await initSync()
        if (cancelled) return
        const syncDuration = Date.now() - syncStartTime
        console.log(`[App] All user data loaded in ${syncDuration}ms:`, result.success)

        if (result.success) {
          setAuthState({
            status: 'authenticated',
            telegramUserId: getTelegramUserId(),
            jwtExpiresAt: getJWTExpiry(),
            lastError: null,
          })
          try {
            const savedLanguage = localStorage.getItem('menhausen-language')
            if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
              if (savedLanguage !== currentLanguageFromContext) {
                console.log(`[App] Language changed after sync: ${currentLanguageFromContext} -> ${savedLanguage}`)
                updateLanguage(savedLanguage as 'en' | 'ru')
              }
            }
          } catch (error) {
            console.warn('[App] Error updating language after sync:', error)
          }
        } else {
          console.warn('[App] Sync completed with errors:', result.errors)
        }
      } catch (error) {
        console.warn('[App] Failed to load user data:', error)
      }
    }

    const initializeApp = async () => {
      if (cancelled) return
      const initStartTime = Date.now()

      const userId = getTelegramUserId()
      if (userId && userId !== '111') {
        const v: ExperimentVariantType = assignVariant(userId)
        $experimentVariant.set(v)
        const w = typeof window !== 'undefined' ? (window as any) : undefined
        if (w && !w.__EXPERIMENT_ASSIGNED_SENT) {
          w.__EXPERIMENT_ASSIGNED_SENT = true
          void capture(AnalyticsEvent.EXPERIMENT_ASSIGNED, {
            experiment_key: EXPERIMENT.KEY_ONBOARDING_FLOW_V1,
            variant: v,
          })
        }
        void identify(userId)
        try {
          getSyncService().queueSync('experimentAssignment')
        } catch {
          void 0
        }
      } else {
        $experimentVariant.set(null)
      }

      const hasLocalData = checkLocalData()
      const optimisticProgress = loadFlowProgressFromLocalStorage()
      const optimisticScreen = determineInitialScreen(optimisticProgress)
      const optimisticDuration = Date.now() - initStartTime

      console.log(
        `[App] Showing optimistic screen after ${optimisticDuration}ms:`,
        optimisticScreen,
        `hasLocalData=${hasLocalData}`
      )
      setNavigationState(optimisticScreen, [optimisticScreen])
      void capture(AnalyticsEvent.FIRST_SCREEN_LOADED, {
        load_time_ms: optimisticDuration,
        screen: optimisticScreen,
        data_source: hasLocalData ? 'local' : 'optimistic',
        has_local_data: hasLocalData,
      })

      const syncStartTime = Date.now()
      await loadAllUserData()
      if (cancelled) return
      const syncDuration = Date.now() - syncStartTime

      const updatedProgress = loadFlowProgressFromLocalStorage()
      const correctedScreen = determineInitialScreen(updatedProgress)

      void capture(AnalyticsEvent.SYNC_COMPLETE_TTI, {
        optimistic_load_ms: optimisticDuration,
        sync_duration_ms: syncDuration,
        total_tti_ms: optimisticDuration + syncDuration,
        screen_corrected: correctedScreen !== optimisticScreen,
      })

      if (correctedScreen !== optimisticScreen) {
        console.log(
          `[App] Correcting screen after sync (${syncDuration}ms): ${optimisticScreen} -> ${correctedScreen}`
        )
        setNavigationState(correctedScreen, [correctedScreen])
      }
    }

    void initializeApp()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isE2ETestEnvironment =
    typeof window !== 'undefined' && (window as unknown as { __PLAYWRIGHT__?: boolean }).__PLAYWRIGHT__ === true

  useEffect(() => {
    return () => {}
  }, [])

  /** Refresh remote data when returning to the app after background (e.g. after payment). */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return
      const last = $lastSyncTime.get()
      const lastMs = last?.getTime() ?? null
      if (shouldPullSyncOnForeground(lastMs)) {
        void forceSync()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  if (isE2ETestEnvironment) {
    console.log('E2E test environment detected, starting with home screen')
  }

  const currentScreen = useStore($currentScreen)
  const navigationHistory = useStore($navigationHistory)
  const earnedAchievementIds = useStore($screenParams).earnedAchievementIds

  const telegramTimeoutRefs = useRef<{
    expand?: ReturnType<typeof setTimeout>
    fullscreen?: ReturnType<typeof setTimeout>
  }>({})
  const isMountedRef = useRef<boolean>(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const runAchievementCheck = useCallback(
    async (delay: number = 200, forceCheck: boolean = false) => {
      await checkAndShowAchievements(delay, forceCheck, { isMounted: () => isMountedRef.current })
    },
    []
  )

  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'menhausen_user_stats') {
        await runAchievementCheck(300)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [runAchievementCheck])

  useRewardDisplayOrchestrator({ currentScreen, earnedAchievementIds, navigationHistory })

  useEffect(() => {
    const telegramTimeouts = telegramTimeoutRefs.current
    return () => {
      if (telegramTimeouts.expand) {
        clearTimeout(telegramTimeouts.expand)
        telegramTimeouts.expand = undefined
      }
      if (telegramTimeouts.fullscreen) {
        clearTimeout(telegramTimeouts.fullscreen)
        telegramTimeouts.fullscreen = undefined
      }
    }
  }, [])

  const isHomePage = currentScreen === 'home'

  return (
    <ContentLoadingGate>
      <div className="w-full h-screen max-h-screen relative overflow-hidden overflow-x-hidden bg-[#111111] flex flex-col">
        <div className="flex-1 relative w-full h-full overflow-hidden overflow-x-hidden">
          <BackButton isHomePage={isHomePage} onBack={goBack} />
          <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence mode="wait">
              <ScreenRouter />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ContentLoadingGate>
  )
}

export default function App() {
  return <AppContent />
}
