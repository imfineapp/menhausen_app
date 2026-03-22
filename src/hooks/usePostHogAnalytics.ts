/**
 * Use the same PostHog client instance as {@link PostHogProvider} in React components.
 * Prefer this over ad-hoc `posthog-js` imports so hooks and stores stay aligned.
 */
export { usePostHog } from '@posthog/react'
