// ========================================================================================
// ЭКРАН ОПРОСА #2 - ПРОДОЛЖИТЕЛЬНОСТЬ ПРОБЛЕМ
// ========================================================================================

import { SurveyScreenTemplate } from './SurveyScreenTemplate';

interface SurveyScreen02Props {
  onNext: (selectedAnswers: string[]) => void;
  onBack: () => void;
  initialSelections?: string[];
}

/**
 * Второй экран опроса - определение временных рамок проблем
 * Одиночный выбор с возможностью пропуска
 */
export function SurveyScreen02({ onNext, onBack, initialSelections }: SurveyScreen02Props) {
  return (
    <SurveyScreenTemplate
      screenId="screen02"
      onNext={onNext}
      onBack={onBack}
      initialSelections={initialSelections}
    />
  );
}