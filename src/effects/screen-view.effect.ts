import { $router } from '@/src/stores/router.store'
import { AnalyticsEvent, capture, isAnalyticsEnabled } from '@/utils/analytics/posthog'

let previousScreen: string | null = null
let unsubscribe: (() => void) | null = null

/**
 * Subscribe to navigation and emit screen_view for product analytics.
 * Returns cleanup; call once from AppContent on mount.
 */
export function initScreenViewTracking(): () => void {
  if (!isAnalyticsEnabled()) {
    return () => {}
  }

  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }

  previousScreen = null

  unsubscribe = $router.subscribe((page) => {
    const screen = page?.route
    if (!screen || screen === 'loading') return
    void capture(AnalyticsEvent.SCREEN_VIEW, {
      screen_name: screen,
      previous_screen: previousScreen,
    })
    previousScreen = screen
  })

  return () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    previousScreen = null
  }
}
