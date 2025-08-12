// ========================================================================================
// ЭКРАН ОПРОСА #3 - ОПТИМАЛЬНОЕ ВРЕМЯ ДЛЯ ПРАКТИКИ
// ========================================================================================

import { SurveyScreenTemplate } from './SurveyScreenTemplate';

interface SurveyScreen03Props {
  onNext: (selectedAnswers: string[]) => void;
  onBack: () => void;
  initialSelections?: string[];
}

/**
 * Третий экран опроса - определение лучшего времени для упражнений
 * Одиночный выбор с возможностью пропуска для персонализации рекомендаций
 */
export function SurveyScreen03({ onNext, onBack, initialSelections }: SurveyScreen03Props) {
  return (
    <SurveyScreenTemplate
      screenId="screen03"
      onNext={onNext}
      onBack={onBack}
      initialSelections={initialSelections}
    />
  );
}