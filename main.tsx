import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { fontLoader } from './utils/fontLoader'
import { PostHogProvider } from 'posthog-js/react'
import { isAnalyticsEnabled } from './utils/analytics/posthog'

// Ensure DOM is ready
const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

// Initialize React app
const app = (
  <React.StrictMode>
    {isAnalyticsEnabled() ? (
      <PostHogProvider 
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} 
        options={{
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        }}
      >
        <App />
      </PostHogProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
)

ReactDOM.createRoot(root).render(app)

// Initialize font loading for iOS Safari
fontLoader.initialize().catch(console.warn)

// Remove loading indicator after React mounts
setTimeout(() => {
  const loadingContainer = document.querySelector('.loading-container')
  if (loadingContainer) {
    loadingContainer.remove()
  }
}, 100)
