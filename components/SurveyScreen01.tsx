// ========================================================================================
// ЭКРАН ОПРОСА #1 - ВЫЯВЛЕНИЕ ТЕКУЩИХ ПРОБЛЕМ
// ========================================================================================

import { SurveyScreenTemplate } from './SurveyScreenTemplate';

interface SurveyScreen01Props {
  onNext: (selectedAnswers: string[]) => void;
  onBack: () => void;
  initialSelections?: string[];
}

/**
 * Первый экран опроса - определение основных проблем пользователя
 * Множественный выбор для выявления всех текущих вызовов
 */
export function SurveyScreen01({ onNext, onBack, initialSelections }: SurveyScreen01Props) {
  return (
    <SurveyScreenTemplate
      screenId="screen01"
      onNext={onNext}
      onBack={onBack}
      initialSelections={initialSelections}
    />
  );
}