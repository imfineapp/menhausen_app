import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { fontLoader } from './utils/fontLoader'
import { PostHogProvider } from 'posthog-js/react'

// Ensure DOM is ready
const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
}

// Initialize React app
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={options}>
      <App />
    </PostHogProvider>
  </React.StrictMode>,
)

// Initialize font loading for iOS Safari
fontLoader.initialize().catch(console.warn)

// Remove loading indicator after React mounts
setTimeout(() => {
  const loadingContainer = document.querySelector('.loading-container')
  if (loadingContainer) {
    loadingContainer.remove()
  }
}, 100)
