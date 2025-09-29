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
const ENABLE_IN_TELEGRAM = (getEnv('VITE_ENABLE_ANALYTICS_IN_TELEGRAM') || 'false').toLowerCase() === 'true'

function isTestMode(): boolean {
  try {
    return (import.meta as any).env?.MODE === 'test'
  } catch {
    return false
  }
}

function isTelegramEnvironment(): boolean {
  try {
    return typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp
  } catch {
    return false
  }
}

export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (!PUBLIC_KEY || isTestMode()) return false
  // Telegram Mini App may enforce CSP that blocks external analytics; disable by default
  if (isTelegramEnvironment() && !ENABLE_IN_TELEGRAM) return false
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
    posthog.capture(eventName, properties)
  } catch {}
}

export function identify(distinctId: string, properties?: Record<string, any>): void {
  if (!isAnalyticsEnabled()) return
  try {
    posthog.identify(distinctId, properties)
  } catch {}
}

export function shutdown(): void {
  try {
    ;(posthog as any).shutdown?.()
    ;(posthog as any).__initialized = false
    const w = typeof window !== 'undefined' ? (window as any) : undefined
    if (w) w.__POSTHOG_INIT = false
  } catch {}
}

export const posthogClient = posthog