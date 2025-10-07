// Импортируем необходимые хуки и SVG пути
// import { useState } from 'react';
import { useTranslation } from './LanguageContext';
import { BottomFixedButton } from "./BottomFixedButton";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './Light';
import { useContent } from './ContentContext';

// Типы для пропсов компонента
interface FinalCardMessageScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onNext: () => void; // Функция для перехода к следующему экрану
  cardId: string; // ID карточки
  cardTitle?: string; // Название карточки (опционально)
  finalMessage?: string; // Итоговое сообщение (опционально)
  practiceTask?: string; // Задание для практики (опционально)
  whyExplanation?: string; // Объяснение "Почему" (опционально)
}

/**
 * Адаптивный компонент световых эффектов для фона
 */
// Light переиспользуется из общего компонента



/**
 * Адаптивный контентный блок с итоговым сообщением
 */
function Container({ finalMessage, practiceTask, whyExplanation }: { 
  finalMessage: string; 
  practiceTask: string; 
  whyExplanation: string; 
}) {
  const { content } = useContent();
  
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-5 items-center justify-center leading-[0] left-1/2 transform -translate-x-1/2 p-0 top-[210px] sm:top-[230px] md:top-[241px] w-full max-w-[351px] px-4 sm:px-6 md:px-0"
      data-name="Container"
    >
      {/* Заголовок с итоговым сообщением */}
      <div className="typography-h2 text-[#e1ff00] w-full text-center">
        <h2 className="block">
          {finalMessage}
        </h2>
      </div>
      
      {/* Блок с задачами и объяснением */}
      <div className="typography-body text-[#ffffff] w-full text-center">
        {/* Практическое задание */}
        <p className="block mb-0 typography-body">
          {practiceTask}
        </p>
        <p className="block mb-0 typography-body">&nbsp;</p>
        
        {/* Объяснение "Почему" */}
        <p className="typography-body">
          <span className="text-[#e1ff00]">{content.ui.cards.final.why}</span>
          <span> {whyExplanation}</span>
        </p>
      </div>
    </div>
  );
}



/**
 * Главный компонент экрана итогового сообщения карточки
 * Адаптивный дизайн с поддержкой mobile-first подхода
 */
export function FinalCardMessageScreen({ 
  onBack, 
  onNext, 
  cardId, 
  cardTitle: _cardTitle, 
  finalMessage, 
  practiceTask, 
  whyExplanation 
}: FinalCardMessageScreenProps) {
  const { t } = useTranslation();
  
  // Сообщения по умолчанию, если не переданы
  const defaultFinalMessage = "Awareness of expectations reduces the automaticity of emotional reactions.";
  const defaultPracticeTask = "Track 3 irritating reactions over the course of a week and write down what you expected to happen at those moments.";
  const defaultWhyExplanation = "You learn to distinguish people's behavior from your own projections.";
  
  /**
   * Функция для обработки кнопки "Next"
   * Переходит к следующему экрану (обычно возврат к деталям карточки)
   */
  const handleNext = () => {
    console.log(`Completing final message for card: ${cardId}`);
    onNext();
  };

  /**
   * Функция для обработки кнопки "Back" 
   * Возвращается к предыдущему экрану (второй вопрос)
   */
  const _handleBack = () => {
    console.log(`Going back from final message for card: ${cardId}`);
    onBack();
  };

  return (
    <div 
      className="bg-[#111111] relative size-full min-h-screen" 
      data-name="Final card message"
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Мини-логотип */}
      <MiniStripeLogo />
      
      {/* Контентный блок с итоговым сообщением */}
      <Container 
        finalMessage={finalMessage || defaultFinalMessage}
        practiceTask={practiceTask || defaultPracticeTask}
        whyExplanation={whyExplanation || defaultWhyExplanation}
      />
      
      {/* Bottom Fixed CTA Button согласно Guidelines.md */}
      <BottomFixedButton onClick={handleNext}>
        {t('next')}
      </BottomFixedButton>
    </div>
  );
}