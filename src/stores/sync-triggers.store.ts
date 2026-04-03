/**
 * Bumped when domain data changes that must enqueue incremental sync but are not
 * covered by other nanostores (user stats, psych test persistence, referral keys).
 */
import { atom } from 'nanostores'

export const $userStatsVersion = atom(0)
export function bumpUserStatsSyncVersion(): void {
  $userStatsVersion.set($userStatsVersion.get() + 1)
}

export const $psychologicalTestStorageVersion = atom(0)
export function bumpPsychologicalTestSyncVersion(): void {
  $psychologicalTestStorageVersion.set($psychologicalTestStorageVersion.get() + 1)
}

export const $referralDataVersion = atom(0)
export function bumpReferralDataSyncVersion(): void {
  $referralDataVersion.set($referralDataVersion.get() + 1)
}
