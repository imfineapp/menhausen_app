import posthog from 'posthog-js'

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
  // Check if PostHog is explicitly enabled via environment variable
  if (!POSTHOG_ENABLED) return false
  if (!PUBLIC_KEY || isTestMode()) return false

  return true
}

export function initPosthog(): void {
  if (!isAnalyticsEnabled()) return

  // Global idempotent guard to survive StrictMode double-invoke and HMR
  const w = typeof window !== 'undefined' ? (window as any) : undefined
  if (w && w.__POSTHOG_INIT === true) return

  if ((posthog as any).__initialized) return

  posthog.init(PUBLIC_KEY as string, {
    api_host: PUBLIC_HOST,
    capture_pageview: false,
    autocapture: true,
    debug: false,
    // Disable exception tracking to avoid loading external script blocked by CSP
    capture_exceptions: false,
    // Disable remote config/decide endpoint to avoid loading site apps like ExceptionAutocapture
    advanced_disable_decide: true,
  })
  ;(posthog as any).__initialized = true
  if (w) w.__POSTHOG_INIT = true
}

export function capture(eventName: string, properties?: Record<string, any>): void {
  if (!isAnalyticsEnabled()) return
  try {
    const defaultEventProps = { source: 'web' }
    posthog.capture(eventName, { ...defaultEventProps, ...(properties || {}) })
  } catch {
    // Swallow analytics errors to avoid breaking UX
  }
}

export function identify(distinctId: string, properties?: Record<string, any>): void {
  if (!isAnalyticsEnabled()) return
  try {
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

    posthog.identify(distinctId, mergedProps)
  } catch {
    // Swallow analytics errors to avoid breaking UX
  }
}

export function shutdown(): void {
  try {
    const ph: any = posthog as any
    if (typeof ph.shutdown === 'function') {
      ph.shutdown()
    }
    ph.__initialized = false
    const w = typeof window !== 'undefined' ? (window as any) : undefined
    if (w) w.__POSTHOG_INIT = false
  } catch {
    // Ignore shutdown errors
  }
}

export const posthogClient = posthog

// Centralized event names to avoid typos across the app
export const AnalyticsEvent = {
  CARD_RATED: 'card_rated',
  ONBOARDING_ANSWERED: 'onboarding_answered',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const

export type AnalyticsEventName = typeof AnalyticsEvent[keyof typeof AnalyticsEvent]