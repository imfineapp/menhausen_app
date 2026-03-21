import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { fontLoader } from './utils/fontLoader'
import TelegramAnalytics from '@telegram-apps/analytics'
import { PostHogProvider, PostHogErrorBoundary } from '@posthog/react'
import { isAnalyticsEnabled } from './src/effects/analytics.effects'
import { ErrorFallback } from './components/ErrorFallback'
import { captureException } from './src/effects/analytics.effects'
import { isTelegramWebAppAvailable } from './src/effects/telegram.effects'

// Ensure DOM is ready
const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

// Initialize Telegram Mini Apps Analytics SDK before first render.
// Must be executed before ReactDOM.createRoot(...).render(...) so that
// auto-tracked events (e.g. app open) are captured correctly.
try {
  const tgAnalyticsToken = (import.meta as any).env?.VITE_TG_ANALYTICS_TOKEN as string | undefined
  // Telegram Analytics SDK may touch sensor APIs internally.
  // Initialize only in real Telegram WebApp context to avoid browser policy violations.
  if (
    tgAnalyticsToken &&
    typeof window !== 'undefined' &&
    isTelegramWebAppAvailable() &&
    !(window as any).__TG_ANALYTICS_INIT
  ) {
    ;(window as any).__TG_ANALYTICS_INIT = true
    TelegramAnalytics.init({
      token: tgAnalyticsToken,
      appName: 'menhausen',
    })
  }
} catch (e) {
  // Swallow analytics init errors to avoid breaking UX.
  console.warn('TelegramAnalytics init error:', e)
}

// Simple Error Boundary for when PostHog is not enabled
class SimpleErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (error: Error) => React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: (error: Error) => React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error)
    }

    return this.props.children
  }
}

// Initialize React app
const app = (
  <React.StrictMode>
    {isAnalyticsEnabled() ? (
      <PostHogProvider 
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} 
        options={{
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          defaults: '2025-05-24',
          capture_exceptions: true,
        }}
      >
        <PostHogErrorBoundary
          fallback={({ error, componentStack }) => {
            // error is unknown; boundary already sent it via client.captureException in componentDidCatch
            const errorObj = error instanceof Error ? error : new Error(String(error))
            return (
              <ErrorFallback
                error={errorObj}
                componentStack={componentStack ?? undefined}
                resetError={() => window.location.reload()}
              />
            )
          }}
        >
          <App />
        </PostHogErrorBoundary>
      </PostHogProvider>
    ) : (
      <SimpleErrorBoundary
        fallback={(error) => (
          <ErrorFallback 
            error={error}
            resetError={() => window.location.reload()}
          />
        )}
      >
        <App />
      </SimpleErrorBoundary>
    )}
  </React.StrictMode>
)

ReactDOM.createRoot(root).render(app)

// Initialize font loading for iOS Safari
fontLoader.initialize().catch((error) => {
  console.warn('Font loading error:', error)
  if (isAnalyticsEnabled()) {
    captureException(error, { context: 'font_loader' })
  }
})

// Unhandled errors and promise rejections are captured by PostHog SDK
// when capture_exceptions: true (window.onerror / unhandledrejection).
// No duplicate global listeners here to avoid double $exception events.

// Remove loading indicator after React mounts
setTimeout(() => {
  const loadingContainer = document.querySelector('.loading-container')
  if (loadingContainer) {
    loadingContainer.remove()
  }
}, 100)
