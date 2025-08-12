// ========================================================================================
// ЭКРАН ОПРОСА #4 - ДОСТУПНОЕ ВРЕМЯ ДЛЯ УПРАЖНЕНИЙ
// ========================================================================================

import { SurveyScreenTemplate } from './SurveyScreenTemplate';

interface SurveyScreen04Props {
  onNext: (selectedAnswers: string[]) => void;
  onBack: () => void;
  initialSelections?: string[];
}

/**
 * Четвертый экран опроса - определение времени, которое пользователь может выделить
 * Одиночный выбор без возможности пропуска для корректной настройки программы
 */
export function SurveyScreen04({ onNext, onBack, initialSelections }: SurveyScreen04Props) {
  return (
    <SurveyScreenTemplate
      screenId="screen04"
      onNext={onNext}
      onBack={onBack}
      initialSelections={initialSelections}
    />
  );
}