// Dynamic import to avoid loading PostHog when disabled
let posthog: any = null

function getEnv(key: string): string | undefined {
  try {
    // Vite exposes env via import.meta.env
    // Keys must be prefixed with VITE_ to be exposed to client
    return (import.meta as any).env?.[key]
  } catch {
    return undefined
  }
}

const PUBLIC_KEY = getEnv('VITE_PUBLIC_POSTHOG_KEY')
const POSTHOG_ENABLED = (getEnv('VITE_POSTHOG_ENABLE') || 'false').toLowerCase() === 'true'

// Dynamically load PostHog only when needed
async function loadPostHog() {
  if (posthog) return posthog
  if (!POSTHOG_ENABLED || !PUBLIC_KEY) return null
  
  try {
    const posthogModule = await import('posthog-js')
    posthog = posthogModule.default
    return posthog
  } catch {
    return null
  }
}

function isTestMode(): boolean {
  try {
    return (import.meta as any).env?.MODE === 'test'
  } catch {
    return false
  }
}

export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  // Check if PostHog is explicitly enabled via environment variable
  if (!POSTHOG_ENABLED) return false
  // Then check if we have a valid key
  if (!PUBLIC_KEY) return false
  // Disable in test mode
  if (isTestMode()) return false

  return true
}

export async function capture(eventName: string, properties?: Record<string, any>): Promise<void> {
  if (!isAnalyticsEnabled()) return
  try {
    const ph = await loadPostHog()
    if (!ph) return
    
    const defaultEventProps = { source: 'web' }
    ph.capture(eventName, { ...defaultEventProps, ...(properties || {}) })
  } catch {
    // Swallow analytics errors to avoid breaking UX
  }
}

export async function identify(distinctId: string, properties?: Record<string, any>): Promise<void> {
  if (!isAnalyticsEnabled()) return
  try {
    const ph = await loadPostHog()
    if (!ph) return
    
    const defaultProps: Record<string, any> = {}

    // Platform details for segmentation
    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : undefined
      const uaData = nav?.userAgentData
      const ua: string | undefined = nav?.userAgent
      const platform: string | undefined = nav?.platform

      // High-level device type
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

    // Telegram Mini App context (if present)
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

    // Merge caller-provided properties last so caller can override defaults
    const mergedProps = { ...defaultProps, ...(properties || {}) }

    ph.identify(distinctId, mergedProps)
  } catch {
    // Swallow analytics errors to avoid breaking UX
  }
}

export async function shutdown(): Promise<void> {
  try {
    const ph = await loadPostHog()
    if (!ph) return
    
    if (typeof ph.shutdown === 'function') {
      ph.shutdown()
    }
  } catch {
    // Ignore shutdown errors
  }
}

export async function getPostHogClient() {
  return await loadPostHog()
}

/**
 * Manually capture an exception/error
 * @param error - The error object or error message
 * @param additionalProperties - Additional properties to include with the error event
 */
export async function captureException(
  error: Error | string,
  additionalProperties?: Record<string, any>
): Promise<void> {
  if (!isAnalyticsEnabled()) return
  
  try {
    const ph = await loadPostHog()
    if (!ph) return
    
    // PostHog's captureException method
    if (typeof ph.captureException === 'function') {
      ph.captureException(error, additionalProperties)
    } else {
      // Fallback: capture as $exception event if captureException is not available
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      
      ph.capture('$exception', {
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
} as const

export type AnalyticsEventName = typeof AnalyticsEvent[keyof typeof AnalyticsEvent]