type JsonValue = unknown

function safeGetStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

export function storageGetItem(key: string): string | null {
  const storage = safeGetStorage()
  if (!storage) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

export function storageSetItem(key: string, value: string): void {
  const storage = safeGetStorage()
  if (!storage) return
  try {
    storage.setItem(key, value)
  } catch {
    // ignore (private mode / disabled storage)
  }
}

export function storageRemoveItem(key: string): void {
  const storage = safeGetStorage()
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    // ignore
  }
}

export function storageReadJson<T>(key: string, fallback: T): T {
  const raw = storageGetItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function storageWriteJson(key: string, value: JsonValue): void {
  storageSetItem(key, JSON.stringify(value))
}

