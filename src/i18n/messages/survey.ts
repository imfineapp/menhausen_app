import { i18n } from '../setup'

export const surveyMessages = i18n('survey', {
  progress: "Step {current} of {total}",
  selectAtLeastOne: "Please select at least one option",
  optional: "Optional",
  required: "Required"
} as any)
