import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { fontLoader } from './utils/fontLoader'
import { PostHogProvider, PostHogErrorBoundary } from '@posthog/react'
import { isAnalyticsEnabled } from './utils/analytics/posthog'
import { ErrorFallback } from './components/ErrorFallback'
import { captureException } from './utils/analytics/posthog'

// Ensure DOM is ready
const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
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
          capture_exceptions: true,
        }}
      >
        <PostHogErrorBoundary
          fallback={({ error, componentStack }) => {
            const errorObj = error instanceof Error ? error : new Error(String(error))
            return (
              <ErrorFallback 
                error={errorObj} 
                componentStack={componentStack}
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

// Global error handlers for unhandled errors
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason))
    
    console.error('Unhandled promise rejection:', error)
    
    if (isAnalyticsEnabled()) {
      captureException(error, { 
        context: 'unhandled_promise_rejection',
        promise_rejection: true 
      })
    }
  })

  // Handle unhandled errors (fallback for errors not caught by React Error Boundary)
  window.addEventListener('error', (event) => {
    const error = event.error instanceof Error 
      ? event.error 
      : new Error(event.message || 'Unknown error')
    
    console.error('Unhandled error:', error)
    
    if (isAnalyticsEnabled()) {
      captureException(error, { 
        context: 'unhandled_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    }
  })
}

// Remove loading indicator after React mounts
setTimeout(() => {
  const loadingContainer = document.querySelector('.loading-container')
  if (loadingContainer) {
    loadingContainer.remove()
  }
}, 100)
