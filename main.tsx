import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { fontLoader } from './utils/fontLoader'
import { initPosthog } from './utils/analytics/posthog'

// Ensure DOM is ready
const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

// Initialize analytics before React mounts
try {
  initPosthog()
} catch {}

// Initialize React app
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
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
