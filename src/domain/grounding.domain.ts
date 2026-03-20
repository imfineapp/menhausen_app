export const GROUNDING_54321_STEPS = [5, 4, 3, 2, 1] as const

/**
 * Returns `true` when the visualization step should be marked as completed.
 */
export function isGroundingStepCompleted(currentStep: number, stepIndex: number): boolean {
  return stepIndex <= currentStep
}

/**
 * Generic helper for step-based exercises.
 */
export function getNextStepOrComplete(currentStep: number, totalSteps: number): {
  nextStep: number
  isCompleted: boolean
} {
  if (totalSteps <= 0) {
    return { nextStep: 0, isCompleted: true }
  }

  const lastIndex = totalSteps - 1
  if (currentStep < lastIndex) {
    return { nextStep: currentStep + 1, isCompleted: false }
  }

  return { nextStep: currentStep, isCompleted: true }
}

