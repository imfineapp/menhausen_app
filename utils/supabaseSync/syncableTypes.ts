import type { SyncDataType } from './types'

/** Types included in merge dirty-detection and full local snapshot collection. */
export const ALL_SYNCABLE_TYPES: readonly SyncDataType[] = [
  'surveyResults',
  'dailyCheckins',
  'userStats',
  'achievements',
  'preferences',
  'flowProgress',
  'psychologicalTest',
  'cardProgress',
  'referralData',
  'experimentAssignment',
  'topicTestResults',
]
