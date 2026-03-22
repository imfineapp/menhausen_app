/**
 * User preferences in localStorage (`menhausen_user_preferences`).
 * Plain JSON, aligned with Supabase sync and languageDetector.
 * Replaces legacy CriticalDataManager for this key.
 */

const PREFERENCES_KEY = 'menhausen_user_preferences'

export interface UserPreferences {
  language: string
  theme: string
  notifications: boolean
  analytics: boolean
  /** Article body text size step: -1 (small), 0 (medium), 1 (large). Default 0. */
  articleFontSizeStep?: number
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  theme: 'light',
  notifications: true,
  analytics: false,
  articleFontSizeStep: 0,
}

/**
 * Parse stored value — plain JSON or legacy CriticalDataManager base64 payload.
 * Mirrors logic in SupabaseSyncService.parsePreferencesFromStorage.
 */
function parsePreferencesRaw(raw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      if (obj.data && typeof obj.data === 'object') {
        return obj.data as Record<string, unknown>
      }
      return obj
    }
  } catch {
    // continue
  }

  try {
    const decrypted = decodeURIComponent(escape(atob(raw)))
    const parsed = JSON.parse(decrypted) as unknown
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      if (obj.data && typeof obj.data === 'object') {
        return obj.data as Record<string, unknown>
      }
    }
  } catch {
    // invalid
  }

  return null
}

function normalizePreferences(data: Record<string, unknown> | null): UserPreferences {
  if (!data) {
    return { ...DEFAULT_PREFERENCES }
  }
  const articleStep = data.articleFontSizeStep
  return {
    language: typeof data.language === 'string' ? data.language : DEFAULT_PREFERENCES.language,
    theme: typeof data.theme === 'string' ? data.theme : DEFAULT_PREFERENCES.theme,
    notifications: typeof data.notifications === 'boolean' ? data.notifications : DEFAULT_PREFERENCES.notifications,
    analytics: typeof data.analytics === 'boolean' ? data.analytics : DEFAULT_PREFERENCES.analytics,
    articleFontSizeStep:
      typeof articleStep === 'number' && Number.isFinite(articleStep)
        ? articleStep
        : DEFAULT_PREFERENCES.articleFontSizeStep,
  }
}

export async function loadUserPreferences(): Promise<UserPreferences> {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY)
    if (!raw) {
      return { ...DEFAULT_PREFERENCES }
    }
    const parsed = parsePreferencesRaw(raw)
    return normalizePreferences(parsed)
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

export async function saveUserPreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
  try {
    const current = await loadUserPreferences()
    const merged: UserPreferences = { ...current, ...preferences }
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(merged))
    return true
  } catch (error) {
    console.error('[userPreferencesStorage] saveUserPreferences failed:', error)
    return false
  }
}

/** True for app keys like `menhausen_*` (underscore) or `menhausen-*` (e.g. language). */
function isMenhausenScopedKey(key: string): boolean {
  return key.startsWith('menhausen_') || key.startsWith('menhausen-')
}

/** Remove all localStorage keys under the Menhausen prefix (underscore + hyphen variants). */
export function clearMenhausenPrefixedLocalStorage(): void {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) keys.push(key)
  }
  keys.forEach((key) => {
    if (isMenhausenScopedKey(key)) {
      localStorage.removeItem(key)
    }
  })
}
