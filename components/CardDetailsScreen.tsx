// Импортируем необходимые хуки и SVG пути
import React from 'react';
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './Light';
import { useContent } from './ContentContext';
import { ThemeCardManager, CompletedAttempt } from '../utils/ThemeCardManager';

// Типы для пропсов компонента
interface CardDetailsScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onOpenCard: () => void; // Функция для открытия карточки (упражнения)
  onOpenCheckin?: (checkinId: string, cardTitle: string, date: string) => void; // Функция для открытия чекина
  cardId: string; // ID карточки
  cardTitle?: string; // Название карточки (опционально)
  cardDescription?: string; // Описание карточки (опционально)
}

/**
 * Адаптивный компонент световых эффектов для фона
 */
// Light переиспользуется из общего компонента

/**
 * Адаптивный заголовок карточки с информацией
 */
function CardInfo({ cardTitle, cardDescription }: { cardTitle: string; cardDescription?: string }) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Card Info"
    >
      <div className="typography-h2 text-[#e1ff00] text-left w-full">
        <h2 className="typography-h2">{cardTitle}</h2>
      </div>
      {cardDescription && (
        <div className="typography-body text-[#cfcfcf] text-left w-full">
          <p className="block">{cardDescription}</p>
        </div>
      )}
      <div className="bg-[#ffffff] relative shrink-0 w-full" data-name="Separation Line">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]" style={{ "--stroke-0": "rgba(45, 43, 43, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" role="presentation" viewBox="0 0 351 1">
            <line
              id="Sepapration line"
              stroke="var(--stroke-0, #2D2B2B)"
              x1="4.37114e-08"
              x2="351"
              y1="0.5"
              y2="0.500031"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * Адаптивный элемент завершенного подхода
 */
function CompletedAttemptItem({ attempt, onClick }: { attempt: CompletedAttempt; onClick?: (attemptId: string) => void }) {
  // Форматируем дату
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <button
      onClick={() => onClick?.(attempt.attemptId)}
      className="relative shrink-0 w-full cursor-pointer hover:bg-[rgba(217,217,217,0.08)] active:scale-98 transition-all duration-200 min-h-[44px] min-w-[44px] opacity-100 p-4"
      data-name="Completed Attempt"
    >
      <div className="absolute inset-0 rounded-xl bg-[rgba(217,217,217,0.04)]" data-name="Background">
        <div
          aria-hidden="true"
          className="absolute border border-solid inset-0 pointer-events-none rounded-xl border-[#505050]"
        />
      </div>
      <div className="relative text-left pr-8">
        <p className="typography-body block text-[#e1ff00]">
          {formatDate(attempt.date)}
        </p>
        <div className="typography-caption text-[#ffffff] mt-1 space-y-1">
          {Object.entries(attempt.answers).map(([questionKey, answer]) => (
            <p key={questionKey} className="break-words">
              {answer || 'No answer provided'}
            </p>
          ))}
        </div>
      </div>
    </button>
  );
}

/**
 * Адаптивный контейнер списка завершенных подходов
 */
function CompletedAttemptsContainer({ attempts, onAttemptClick }: { attempts: CompletedAttempt[]; onAttemptClick?: (attemptId: string) => void }) {
  const { content, getLocalizedText } = useContent();
  
  return (
    <div
      className="relative shrink-0 w-full"
      data-name="Completed Attempts Container"
    >
      <div className="typography-h2 mb-[39px] text-[#e1ff00] text-left w-full">
        <h2 className="block">{getLocalizedText(content.ui.cards.attempts)}</h2>
      </div>
      <div
        className="flex flex-col gap-2.5 items-start justify-start relative w-full"
        data-name="Completed Attempts List"
      >
        {attempts.length > 0 ? (
          attempts.map((attempt) => (
            <CompletedAttemptItem
              key={attempt.attemptId}
              attempt={attempt}
              onClick={onAttemptClick}
            />
          ))
        ) : (
          <div className="w-full p-4 text-center">
            <p className="typography-body text-[#696969]">
              {getLocalizedText(content.ui.cards.noAttempts)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Кнопка для страницы деталей карточки
 */
function CardDetailsBottomButton({ onClick }: { onClick: () => void }) {
  const { content, getLocalizedText } = useContent();
  
  return (
    <BottomFixedButton onClick={onClick}>
      {getLocalizedText(content.ui.themes.welcome.start)}
    </BottomFixedButton>
  );
}

/**
 * Основной компонент экрана деталей карточки
 */
export function CardDetailsScreen({ 
  onBack: _onBack, 
  onOpenCard, 
  onOpenCheckin, 
  cardId, 
  cardTitle = "Stress Card", 
  cardDescription 
}: CardDetailsScreenProps) {
  
  // Получаем все завершенные подходы для карточки
  const completedAttempts = React.useMemo(() => {
    return ThemeCardManager.getCompletedAttempts(cardId);
  }, [cardId]);

  /**
   * Обработчик клика по завершенному подходу
   */
  const handleAttemptClick = (attemptId: string) => {
    if (onOpenCheckin) {
      // Извлекаем дату из attemptId (card-1_2024-01-15_1)
      const datePart = attemptId.split('_')[1];
      onOpenCheckin(attemptId, cardTitle, datePart);
    }
  };

  return (
    <div 
      className="bg-[#111111] relative size-full min-h-screen overflow-x-hidden" 
      data-name="Card Details Page"
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Мини-логотип */}
      <MiniStripeLogo />
      
      {/* Основной контент - скроллируемый */}
      <div className="absolute top-[141px] left-0 right-0 bottom-0 overflow-y-auto">
        <div className="px-4 sm:px-6 md:px-[21px] py-5 pb-[180px]">
          <div className="w-full max-w-[351px] mx-auto flex flex-col gap-10">
            {/* Заголовок карточки */}
            <CardInfo cardTitle={cardTitle} cardDescription={cardDescription} />
            
            {/* Список завершенных подходов */}
            <CompletedAttemptsContainer 
              attempts={completedAttempts} 
              onAttemptClick={handleAttemptClick}
            />
          </div>
        </div>
      </div>
      
      {/* Кнопка начала упражнения */}
      <CardDetailsBottomButton onClick={onOpenCard} />
    </div>
  );
}