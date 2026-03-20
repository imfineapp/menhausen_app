export function onPremiumActivated(listener: (event: Event) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const wrapped = listener as EventListener
  window.addEventListener('premium:activated', wrapped)
  return () => {
    window.removeEventListener('premium:activated', wrapped)
  }
}

