/**
 * User-scoped localStorage keys (multi-account / shared WebView safety).
 *
 * Migration: on first authenticated session, legacy unscoped keys can be copied
 * into `mh_${telegramUserId}_${key}` and reads prefer scoped keys.
 * Full rollout requires updating all readers/writers to use getScopedKey / readScoped.
 */

import { getTelegramUserId } from '@/utils/telegramUserUtils'

const SCOPE_FLAG = 'menhausen_storage_scope_migrated_uid'

/** Prefix for user data: `mh_<telegramUserId>_` — returns null when unscoped (dev user 111). */
export function getUserStorageKeyPrefix(): string | null {
  const id = getTelegramUserId()
  if (!id || id === '111') return null
  return `mh_${id}_`
}

/** Scoped key for a legacy global key, or legacy key when prefix unavailable. */
export function getScopedUserKey(legacyKey: string): string {
  const p = getUserStorageKeyPrefix()
  return p ? `${p}${legacyKey}` : legacyKey
}

/** Mark that migration ran for this Telegram user (optional future use). */
export function markStorageScopeMigrated(telegramUserId: string): void {
  try {
    localStorage.setItem(SCOPE_FLAG, telegramUserId)
  } catch {
    // ignore
  }
}

export function wasStorageScopeMigratedFor(telegramUserId: string): boolean {
  try {
    return localStorage.getItem(SCOPE_FLAG) === telegramUserId
  } catch {
    return false
  }
}
