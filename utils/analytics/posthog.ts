import posthog from 'posthog-js'
import type { PostHogConfig } from 'posthog-js'

import { $experimentVariant } from '@/src/stores/experiment.store'
import { EXPERIMENT } from '@/utils/experiment/experimentKeys'
import { getTelegramUserId } from '@/utils/telegramUserUtils'
import type { AttributionData } from '@/utils/attribution'

/** Singleton used by PostHogProvider (`client={posthog}`) and non-React code (stores, services). */
export { posthog }

/** Module-level storage for UTM attribution data */
let storedAttribution: AttributionData | null = null

/**
 * Сохранить UTM атрибуцию для использования в capture() и identify()
 * @param {AttributionData | null} data - Данные атрибуции или null для очистки
 */
export function setAttributionData(data: AttributionData | null): void {
  storedAttribution = data
}

/**
 * Получить сохранённые UTM данные
 * @returns {AttributionData | null} Сохранённые данные атрибуции
 */
export function getAttributionData(): AttributionData | null {
  return storedAttribution
}

/**
 * Сформировать UTM свойства для PostHog events
 * @returns {Record<string, string>} Объект с utm_* полями
 */
function getUtmProps(): Record<string, string> {
  if (!storedAttribution) {
    return {}
  }
  return {
    utm_source: storedAttribution.utm_source || '',
    utm_medium: storedAttribution.utm_medium || '',
    utm_campaign: storedAttribution.utm_campaign || '',
    utm_referrer: storedAttribution.utm_referrer || '',
  }
}

function getEnv(key: string): string | undefined {
  try {
    return (import.meta as any).env?.[key]
  } catch {
    return undefined
  }
}

const PUBLIC_KEY = getEnv('VITE_PUBLIC_POSTHOG_KEY')
const PUBLIC_HOST = getEnv('VITE_PUBLIC_POSTHOG_HOST') || 'https://us.i.posthog.com'
const POSTHOG_ENABLED = (getEnv('VITE_POSTHOG_ENABLE') || 'false').toLowerCase() === 'true'

function isTestMode(): boolean {
  try {
    return (import.meta as any).env?.MODE === 'test'
  } catch {
    return false
  }
}

export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (!POSTHOG_ENABLED) return false
  if (!PUBLIC_KEY) return false
  if (isTestMode()) return false

  return true
}

function getInitConfig(): Partial<PostHogConfig> {
  return {
    api_host: PUBLIC_HOST,
    defaults: '2026-01-30',
    capture_pageview: false,
    autocapture: true,
    debug: false,
    capture_exceptions: true,
    advanced_disable_flags: true,
    disable_session_recording: false,
  }
}

/**
 * Call once from main.tsx before render when isAnalyticsEnabled().
 * PostHogProvider must receive the same `posthog` instance via `client={posthog}`.
 */
export function initPosthog(): void {
  if (!isAnalyticsEnabled()) return

  const w = typeof window !== 'undefined' ? (window as any) : undefined
  if (w?.__POSTHOG_INIT) return

  posthog.init(PUBLIC_KEY as string, getInitConfig() as PostHogConfig)
  if (w) w.__POSTHOG_INIT = true
}

export function capture(eventName: string, properties?: Record<string, any>): void {
  if (!isAnalyticsEnabled()) return
  try {
    const defaultEventProps = { source: 'web' }
    const uid = getTelegramUserId()
    const variant = $experimentVariant.get()
    const experimentProps =
      variant
        ? {
            variant,
            experiment_variant: variant,
            experiment_key: EXPERIMENT.KEY_ONBOARDING_FLOW_V1,
            // Same payload as identify(); avoids person.experiment_variant lag vs events (PostHog breakdowns).
            $set: {
              experiment_variant: variant,
              experiment_key: EXPERIMENT.KEY_ONBOARDING_FLOW_V1,
            },
          }
        : {}
    const utmProps = getUtmProps()
    posthog.capture(eventName, {
      ...defaultEventProps,
      ...(uid ? { user_id: uid } : {}),
      ...experimentProps,
      ...utmProps,
      ...(properties || {}),
    })
  } catch {
    // Swallow analytics errors to avoid breaking UX
  }
}

export function identify(distinctId: string, properties?: Record<string, any>): void {
  if (!isAnalyticsEnabled()) return
  try {
    const defaultProps: Record<string, any> = {}

    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : undefined
      const uaData = nav?.userAgentData
      const ua: string | undefined = nav?.userAgent
      const platform: string | undefined = nav?.platform

      let deviceType = 'unknown'
      if (uaData?.mobile === true) deviceType = 'mobile'
      else if (ua && /(Mobi|Android|iPhone)/i.test(ua)) deviceType = 'mobile'
      else if (ua && /(iPad|Tablet)/i.test(ua)) deviceType = 'tablet'
      else deviceType = 'desktop'

      defaultProps.platform_device_type = deviceType
      if (platform) defaultProps.platform_name = platform
      if (ua) defaultProps.platform_user_agent = ua
      if (uaData?.brands && Array.isArray(uaData.brands)) {
        defaultProps.platform_brands = uaData.brands.map((b: any) => `${b.brand}:${b.version}`).join(', ')
      }
    } catch {
      void 0
    }

    try {
      const w = typeof window !== 'undefined' ? (window as any) : undefined
      const tgUser = w?.Telegram?.WebApp?.initDataUnsafe?.user
      if (tgUser?.id) {
        defaultProps.telegram_user = true
        defaultProps.telegram_user_id = String(tgUser.id)
        if (tgUser.username) defaultProps.telegram_username = tgUser.username
        if (tgUser.language_code) defaultProps.telegram_language_code = tgUser.language_code
      }
    } catch {
      void 0
    }

    const ev = $experimentVariant.get()
    if (ev) {
      defaultProps.experiment_variant = ev
      defaultProps.experiment_key = EXPERIMENT.KEY_ONBOARDING_FLOW_V1
    }

    const utmProps = getUtmProps()
    const mergedProps = { ...defaultProps, ...utmProps, ...(properties || {}) }

    posthog.identify(distinctId, mergedProps)
  } catch {
    // Swallow analytics errors to avoid breaking UX
  }
}

export function shutdown(): void {
  try {
    const ph = posthog as { shutdown?: () => void }
    if (typeof ph.shutdown === 'function') {
      ph.shutdown()
    }
    const w = typeof window !== 'undefined' ? (window as any) : undefined
    if (w) w.__POSTHOG_INIT = false
  } catch {
    // Ignore shutdown errors
  }
}

export function getPostHogClient(): typeof posthog {
  return posthog
}

/**
 * Manually capture an exception/error
 * @param error - The error object or error message
 * @param additionalProperties - Additional properties to include with the error event
 */
export function captureException(error: Error | string, additionalProperties?: Record<string, any>): void {
  if (!isAnalyticsEnabled()) return

  try {
    if (typeof posthog.captureException === 'function') {
      posthog.captureException(error, additionalProperties)
    } else {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined

      posthog.capture('$exception', {
        $exception_message: errorMessage,
        $exception_type: error instanceof Error ? error.name : 'Error',
        $exception_stack: errorStack,
        ...additionalProperties,
      })
    }
  } catch {
    // Swallow analytics errors to avoid breaking UX
  }
}

// Centralized event names to avoid typos across the app
export const AnalyticsEvent = {
  CARD_RATED: 'card_rated',
  ONBOARDING_ANSWERED: 'onboarding_answered',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FIRST_SCREEN_LOADED: 'first_screen_loaded',
  REFERRAL_REGISTERED: 'referral_registered',
  ARTICLE_OPENED: 'article_opened',
  CARD_OPENED: 'card_opened',
  CARD_QUESTION_1_ANSWERED: 'card_question_1_answered',
  CARD_QUESTION_2_ANSWERED: 'card_question_2_answered',
  SCREEN_VIEW: 'screen_view',
  SYNC_SUCCESS: 'sync_success',
  SYNC_ERROR: 'sync_error',
  PAYWALL_SHOWN: 'paywall_shown',
  PAYWALL_CTA_CLICKED: 'paywall_cta_clicked',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_CANCELLED: 'payment_cancelled',
  SYNC_COMPLETE_TTI: 'sync_complete_tti',
  INCREMENTAL_SYNC_ERROR_SHOWN: 'incremental_sync_error_shown',
  DAILY_CHECKIN_COMPLETED: 'daily_checkin_completed',
  EXPERIMENT_ASSIGNED: 'experiment_assigned',
  TEST_STARTED: 'test_started',
  TEST_QUESTION_ANSWERED: 'test_question_answered',
  TEST_COMPLETED: 'test_completed',
  TEST_DROPPED: 'test_dropped',
  TOPIC_OPENED: 'topic_opened',
  TOPIC_TEST_STARTED: 'topic_test_started',
  TOPIC_TEST_QUESTION_ANSWERED: 'topic_test_question_answered',
  TOPIC_TEST_COMPLETED: 'topic_test_completed',
  FIRST_CARD_STARTED: 'first_card_started',
  FIRST_CARD_COMPLETED: 'first_card_completed',
  PURCHASE_ATTEMPT: 'purchase_attempt',
  PURCHASE_COMPLETED: 'purchase_completed',
  BREATHING_46_STARTED: 'breathing_46_started',
  BREATHING_46_COMPLETED: 'breathing_46_completed',
  BREATHING_46_DROPPED: 'breathing_46_dropped',
  BREATHING_46_EARNED_POINTS: 'breathing_46_earned_points',
} as const

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent]
