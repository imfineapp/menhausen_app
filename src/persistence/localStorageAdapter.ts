/**
 * Typed localStorage helpers (cache layer; domain stores remain source of truth in app).
 */

export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeKey(key: string): void {
  localStorage.removeItem(key)
}
