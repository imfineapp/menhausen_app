/**
 * User progress / smart navigation — thin domain API over UserStateManager.
 */
import { UserStateManager } from '@/utils/userStateManager'
import type { UserState } from '@/types/userState'

export function invalidateUserStateCache(): void {
  UserStateManager.invalidateCache()
}

export function analyzeUserState(): UserState {
  return UserStateManager.analyzeUserState()
}
