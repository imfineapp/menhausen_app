import { atom } from 'nanostores'

export type AuthStatus = 'unknown' | 'unauthenticated' | 'authenticating' | 'authenticated' | 'error'

export type AuthState = {
  status: AuthStatus
  telegramUserId: string | null
  /** JWT exp (ms) if known */
  jwtExpiresAt: number | null
  lastError: string | null
}

export const $authState = atom<AuthState>({
  status: 'unknown',
  telegramUserId: null,
  jwtExpiresAt: null,
  lastError: null,
})

export function setAuthState(patch: Partial<AuthState>): void {
  $authState.set({ ...$authState.get(), ...patch })
}
