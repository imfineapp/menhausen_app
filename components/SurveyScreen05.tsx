// ========================================================================================
// ЭКРАН ОПРОСА #5 - ОСНОВНАЯ ЦЕЛЬ ПОДДЕРЖКИ
// ========================================================================================

import { SurveyScreenTemplate } from './SurveyScreenTemplate';

interface SurveyScreen05Props {
  onNext: (selectedAnswers: string[]) => void;
  onBack: () => void;
  initialSelections?: string[];
}

/**
 * Пятый экран опроса - определение главной цели пользователя
 * Одиночный выбор без возможности пропуска для завершения персонализации
 */
export function SurveyScreen05({ onNext, onBack, initialSelections }: SurveyScreen05Props) {
  return (
    <SurveyScreenTemplate
      screenId="screen05"
      onNext={onNext}
      onBack={onBack}
      initialSelections={initialSelections}
    />
  );
}