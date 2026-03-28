/**
 * Single source of truth for onboarding A/B/C experiment identifiers.
 * Align with PostHog person properties and Supabase rows.
 */
export const EXPERIMENT = {
  KEY_ONBOARDING_FLOW_V1: 'onboarding_flow_v1',
  STORAGE_VARIANT: 'experiment_variant',
} as const

export type ExperimentKey = (typeof EXPERIMENT)[keyof typeof EXPERIMENT]
