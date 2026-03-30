import { settingsMessages } from '@/src/i18n/messages/settings';
import { useStore } from '@nanostores/react';
// Импортируем необходимые хуки и SVG пути
// import { useState } from 'react';
import { BottomFixedButton } from "./BottomFixedButton";
import { cardsMessages } from '@/src/i18n/messages/cards';
import { FormScreenLayout } from './FormScreenLayout';

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
  const cards = useStore(cardsMessages);
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start w-full mt-[70px]"
      data-name="Container"
    >
      {/* Заголовок с итоговым сообщением */}
      <div className="typography-h2 text-[#e1ff00] w-full text-left break-words">
        <h2 className="block">
          {finalMessage}
        </h2>
      </div>
      
      {/* Блок с задачами и объяснением */}
      <div className="typography-body text-[#ffffff] w-full text-left break-words whitespace-pre-wrap">
        {/* Практическое задание */}
        <p className="block mb-0 typography-body">
          {practiceTask}
        </p>
        <p className="block mb-0 typography-body">&nbsp;</p>
        
        {/* Объяснение "Почему" */}
        <p className="typography-body">
          <span className="text-[#e1ff00]">{cards.final.why}</span>
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
  const msgs = useStore(settingsMessages);
  
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
    <FormScreenLayout
      dataName="Final card message"
      bottomActions={
        <BottomFixedButton onClick={handleNext}>
          {msgs.next}
        </BottomFixedButton>
      }
    >
      <Container 
        finalMessage={finalMessage || defaultFinalMessage}
        practiceTask={practiceTask || defaultPracticeTask}
        whyExplanation={whyExplanation || defaultWhyExplanation}
      />
    </FormScreenLayout>
  );
}