// ========================================================================================
// ЭКРАН ОПРОСА #6 - ИСТОЧНИК УЗНАВАНИЯ О ПРИЛОЖЕНИИ
// ========================================================================================

import { SurveyScreenTemplate } from './SurveyScreenTemplate';

interface SurveyScreen06Props {
  onNext: (selectedAnswers: string[]) => void;
  onBack: () => void;
  initialSelections?: string[];
}

/**
 * Шестой экран опроса - определение источника узнавания о приложении
 * Одиночный выбор для завершения настройки
 */
export function SurveyScreen06({ onNext, onBack, initialSelections }: SurveyScreen06Props) {
  return (
    <SurveyScreenTemplate
      screenId="screen06"
      onNext={onNext}
      onBack={onBack}
      initialSelections={initialSelections}
    />
  );
}
