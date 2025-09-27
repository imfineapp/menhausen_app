// Импортируем необходимые хуки и SVG пути
import React from 'react';
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';
import { ThemeCardManager, CardProgress } from '../utils/ThemeCardManager';

// Типы для пропсов компонента
interface CardDetailsScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onOpenCard: () => void; // Функция для открытия карточки (упражнения)
  onOpenCheckin?: (checkinId: string, cardTitle: string, date: string) => void; // Функция для открытия чекина
  cardId: string; // ID карточки
  cardTitle?: string; // Название карточки (опционально)
  cardDescription?: string; // Описание карточки (опционально)
}

// Типы для попыток (attempts)
interface Attempt {
  id: string;
  date: string;
  formattedDate: string;
  rating?: number;
  questionsAnswered: string[];
}

/**
 * Адаптивный компонент световых эффектов для фона
 */
function Light() {
  return (
    <div
      className="absolute h-[100px] sm:h-[120px] md:h-[130px] top-[-50px] sm:top-[-60px] md:top-[-65px] translate-x-[-50%] w-[140px] sm:w-[165px] md:w-[185px] overflow-hidden"
      data-name="Light"
      style={{ left: "calc(50% + 1px)" }}
    >
      <div className="absolute inset-[-196.15%_-137.84%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 695 640">
          <g id="Light">
            <g filter="url(#filter0_f_13_381)" id="Ellipse 2">
              <ellipse cx="347.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_13_381"
              width="695"
              x="0"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_13_381" stdDeviation="127.5" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}



/**
 * Адаптивный заголовок карточки с описанием
 */
function CardHeader({ cardTitle = "Card #1", cardDescription }: { cardTitle?: string; cardDescription?: string }) {
  const { content, getLocalizedText } = useContent();
  const defaultDescription = getLocalizedText(content.ui.cards.welcome.subtitle);
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 text-left w-full"
      data-name="Card Header"
    >
      <div className="typography-h2 text-[#e1ff00] w-full">
        <h2 className="block">{cardTitle}</h2>
      </div>
      <div className="typography-body text-[#ffffff] w-full">
        <p className="block">{cardDescription || defaultDescription}</p>
      </div>
    </div>
  );
}

/**
 * Адаптивный элемент попытки
 */
function AttemptItem({ attempt, onClick }: { attempt: Attempt; onClick?: (attemptId: string) => void }) {
  const isCompleted = attempt.questionsAnswered.length > 0 && attempt.rating !== undefined;
  
  return (
    <button
      onClick={() => onClick?.(attempt.id)}
      className={`h-[60px] relative shrink-0 w-full cursor-pointer hover:bg-[rgba(217,217,217,0.06)] active:scale-98 transition-all duration-200 min-h-[44px] min-w-[44px] ${
        isCompleted ? 'opacity-100' : 'opacity-75'
      }`}
      data-name="Attempt"
    >
      <div className={`absolute inset-0 rounded-xl ${
        isCompleted 
          ? 'bg-[rgba(34,197,94,0.1)]' 
          : 'bg-[rgba(217,217,217,0.04)]'
      }`} data-name="Background">
        <div
          aria-hidden="true"
          className={`absolute border border-solid inset-0 pointer-events-none rounded-xl ${
            isCompleted 
              ? 'border-[#22c55e]/30' 
              : 'border-[#505050]'
          }`}
        />
      </div>
      <div className="absolute inset-[33.33%_4.84%_33.33%_3.7%] text-left">
        <p className={`typography-body block ${
          isCompleted ? 'text-[#22c55e]' : 'text-[#ffffff]'
        }`}>
          {attempt.formattedDate}
        </p>
        {isCompleted && (
          <p className="typography-caption text-[#22c55e] mt-1">
            {attempt.rating ? `Rating: ${attempt.rating}/5` : 'Completed'}
          </p>
        )}
      </div>
      {isCompleted && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
}

/**
 * Адаптивный контейнер списка попыток
 */
function AttemptsContainer({ attempts, onAttemptClick }: { attempts: Attempt[]; onAttemptClick?: (attemptId: string) => void }) {
  const { content, getLocalizedText } = useContent();
  
  return (
    <div
      className="relative shrink-0 w-full"
      data-name="Attempts Container"
    >
      <div className="typography-h2 mb-[39px] text-[#e1ff00] text-left w-full">
        <h2 className="block">{getLocalizedText(content.ui.cards.attempts)}</h2>
      </div>
      <div
        className="flex flex-col gap-2.5 items-start justify-start relative w-full"
        data-name="Attempts List"
      >
        {attempts.length > 0 ? (
          attempts.map((attempt) => (
            <AttemptItem
              key={attempt.id}
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
 * Адаптивная кнопка "Open card"
 * Теперь использует стандартный компонент BottomFixedButton
 */
function OpenCardButton({ onClick }: { onClick: () => void }) {
  const { content, getLocalizedText } = useContent();
  
  return (
    <BottomFixedButton onClick={onClick}>
      {getLocalizedText(content.ui.navigation.start)}
    </BottomFixedButton>
  );
}

/**
 * Главный компонент страницы деталей карточки
 * Адаптивный дизайн с поддержкой mobile-first подхода и корректным скроллингом
 */
export function CardDetailsScreen({ onBack: _onBack, onOpenCard, onOpenCheckin, cardId, cardTitle, cardDescription }: CardDetailsScreenProps) {
  // Получаем реальные данные попыток из ThemeCardManager
  const progress = ThemeCardManager.getCardProgress(cardId);
  
  // Создаем массив попыток на основе реальных данных
  const attempts: Attempt[] = React.useMemo(() => {
    if (!progress || progress.totalAttempts === 0) {
      return [];
    }
    
    // Создаем попытки на основе данных прогресса
    const attemptsList: Attempt[] = [];
    
    // Если есть завершенная попытка, добавляем её
    if (progress.isCompleted && progress.completedDate) {
      attemptsList.push({
        id: `${cardId}-completed`,
        date: progress.completedDate,
        formattedDate: formatDate(progress.completedDate),
        rating: progress.rating,
        questionsAnswered: progress.questionsAnswered
      });
    }
    
    // Добавляем незавершенные попытки (если есть)
    const incompleteAttempts = progress.totalAttempts - (progress.isCompleted ? 1 : 0);
    for (let i = 0; i < incompleteAttempts; i++) {
      attemptsList.push({
        id: `${cardId}-attempt-${i + 1}`,
        date: progress.lastAttemptDate,
        formattedDate: formatDate(progress.lastAttemptDate),
        questionsAnswered: [],
        rating: undefined
      });
    }
    
    return attemptsList.reverse(); // Показываем последние попытки первыми
  }, [progress, cardId]);

  /**
   * Функция для форматирования даты
   */
  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  /**
   * Функция для обработки клика по попытке
   * Переходит к странице деталей попытки с заполненными ответами
   */
  const handleAttemptClick = (attemptId: string) => {
    console.log(`Attempt clicked: ${attemptId}`);
    
    // Получаем данные попытки
    const attempt = attempts.find(a => a.id === attemptId);
    if (attempt && onOpenCheckin) {
      onOpenCheckin(attemptId, cardTitle || 'Card', attempt.date);
    } else {
      // Fallback alert если функция не передана
      alert(`Opening attempt: ${attemptId}. Attempt details will be available soon!`);
    }
  };

  /**
   * Функция для обработки кнопки "Open card"
   * Переходит к упражнению карточки
   */
  const handleOpenCard = () => {
    console.log(`Opening card exercise: ${cardId}`);
    onOpenCard();
  };

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden overflow-x-hidden bg-[#111111] flex flex-col">
      {/* Световые эффекты */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Заголовок карточки */}
            <div className="mb-8">
              <CardHeader 
                cardTitle={cardTitle} 
                cardDescription={cardDescription}
              />
            </div>
            
            {/* Контейнер попыток */}
            <AttemptsContainer 
              attempts={attempts}
              onAttemptClick={handleAttemptClick}
            />

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <OpenCardButton onClick={handleOpenCard} />

    </div>
  );
}