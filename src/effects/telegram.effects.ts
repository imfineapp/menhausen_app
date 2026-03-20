export function closeTelegramApp(): void {
  try {
    window.Telegram?.WebApp?.close()
  } catch {
    // ignore (tests / non-telegram environments)
  }
}

export function browserBack(): void {
  try {
    window.history.back()
  } catch {
    // ignore
  }
}

export function isTelegramWebAppAvailable(): boolean {
  try {
    return Boolean(window?.Telegram?.WebApp)
  } catch {
    return false
  }
}

export function openTelegramLink(url: string): void {
  try {
    window.Telegram?.WebApp?.openTelegramLink(url)
  } catch {
    // ignore
  }
}

export function showTelegramAlert(message: string): void {
  try {
    window.Telegram?.WebApp?.showAlert(message)
  } catch {
    // ignore
  }
}

export function openInvoice(invoice: any): void {
  // Telegram WebApp API signature varies by platform; keep it permissive.
  try {
    window.Telegram?.WebApp?.openInvoice?.(invoice)
  } catch {
    // ignore
  }
}

export function isTelegramOpenInvoiceAvailable(): boolean {
  try {
    return Boolean(window?.Telegram?.WebApp?.openInvoice)
  } catch {
    return false
  }
}

export function isTelegramShowAlertAvailable(): boolean {
  try {
    return Boolean(window?.Telegram?.WebApp?.showAlert)
  } catch {
    return false
  }
}

export function hapticImpactOccurred(style: string): void {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style as any)
  } catch {
    // ignore
  }
}

export function hapticNotificationOccurred(type: string): void {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type as any)
  } catch {
    // ignore
  }
}

