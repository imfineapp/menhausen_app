// Импортируем необходимые хуки и SVG пути
import React, { useState, useEffect, useCallback } from 'react';
import { BottomFixedButton } from "./BottomFixedButton";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';
import { ThemeCardManager } from '../utils/ThemeCardManager';
import { ThemeLoader } from '../utils/ThemeLoader';

// Типы для пропсов компонента
interface CheckinDetailsScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  checkinId: string; // ID чекина (attemptId)
  cardTitle?: string; // Название карточки (опционально)
  checkinDate?: string; // Дата чекина (опционально)
}

// Типы для данных чекина
interface CheckinData {
  id: string;
  cardTitle: string;
  date: string;
  formattedDate: string;
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;
  instructions: string;
  practiceTask: string;
  whyNote: string;
  rating: number;
}

/**
 * Адаптивный компонент световых эффектов для фона
 */
function Light() {
  return (
    <div
      className="absolute h-[917px] sm:h-[1000px] md:h-[1100px] left-1/2 top-[-65px] translate-x-[-50%] w-[211px] sm:w-[240px] md:w-[280px] overflow-hidden"
      data-name="Light"
    >
      <div className="absolute inset-[-27.81%_-120.85%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 721 1427">
          <g id="Light">
            <g filter="url(#filter0_f_17_905)" id="Ellipse 2">
              <ellipse cx="361.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
            <g filter="url(#filter1_f_17_905)" id="Ellipse 1">
              <ellipse cx="360.5" cy="1113.5" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="105.5" ry="58.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="640" id="filter0_f_17_905" width="695" x="14" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_17_905" stdDeviation="127.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="627" id="filter1_f_17_905" width="721" x="0" y="800">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_17_905" stdDeviation="127.5" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/**
 * Адаптивная линия разделения
 */
function SeparationLine() {
  return (
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
  );
}

/**
 * Адаптивный заголовок карточки с информацией
 */
function CardInfo({ cardTitle, formattedDate }: { cardTitle: string; formattedDate: string }) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Card Info"
    >
      <div className="typography-h2 text-[#e1ff00] text-left w-full">
        <h2 className="typography-h2">
          <span>{cardTitle} / </span>
          <span className="text-[#696969]">{formattedDate}</span>
        </h2>
      </div>
      <SeparationLine />
    </div>
  );
}

/**
 * Адаптивный блок с ответом пользователя
 */
function InputAnswerBlock({ answer, height = 85 }: { answer: string; height?: number }) {
  return (
    <div
      className={`bg-[rgba(217,217,217,0.04)] relative rounded-xl shrink-0 w-full`}
      style={{ minHeight: `${height}px` }}
      data-name="Input answer block"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
      />
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className={`box-border content-stretch flex flex-row gap-2.5 items-center justify-center p-[20px] relative w-full`} style={{ minHeight: `${height}px` }}>
          <div className="typography-body text-[#cfcfcf] text-left w-full">
            <p className="block">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Адаптивный основной контейнер с вопросами и ответами
 */
function MainContent({ checkinData }: { checkinData: CheckinData }) {
  const { content, getLocalizedText } = useContent();
  
  return (
    <div className="box-border content-stretch flex flex-col gap-[30px] items-start justify-start p-0 relative shrink-0 w-full">
      {/* Первый вопрос */}
      <div className="typography-body text-[#e1ff00] text-left w-full">
        <p className="block">{checkinData.question1}</p>
      </div>
      <InputAnswerBlock answer={checkinData.answer1} height={85} />
      
      {/* Второй вопрос */}
      <div className="typography-body text-[#e1ff00] text-left w-full">
        <p className="block">{checkinData.question2}</p>
      </div>
      <InputAnswerBlock answer={checkinData.answer2} height={83} />
      
      {/* Инструкции и пояснения */}
      <div className="typography-body text-[#ffffff] text-left w-full">
        <p className="block mb-4">
          {checkinData.instructions}
        </p>
        <p className="block mb-4">
          {checkinData.practiceTask}
        </p>
        <p className="block">
          <span className="text-[#e1ff00]">{getLocalizedText(content.ui.cards.final.why)}</span>
          <span> {checkinData.whyNote}</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Кнопка для страницы деталей чекина
 */
function CheckinDetailsBottomButton({ onClick }: { onClick: () => void }) {
  const { content, getLocalizedText } = useContent();
  
  return (
    <BottomFixedButton onClick={onClick}>
      {getLocalizedText(content.ui.navigation.continue)}
    </BottomFixedButton>
  );
}

/**
 * Компонент для отображения приглашения к началу упражнения
 */
function StartExerciseInvitation() {
  const { content, getLocalizedText } = useContent();
  
  return (
    <div className="box-border content-stretch flex flex-col gap-[30px] items-start justify-start p-0 relative shrink-0 w-full">
      <div className="typography-body text-[#e1ff00] text-center w-full">
        <p className="block">{getLocalizedText(content.ui.cards.startExercise)}</p>
      </div>
    </div>
  );
}

/**
 * Основной компонент экрана деталей чекина
 */
export function CheckinDetailsScreen({ onBack, checkinId, cardTitle = "Stress", checkinDate }: CheckinDetailsScreenProps) {
  const { currentLanguage } = useContent();
  const [checkinData, setCheckinData] = useState<CheckinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Парсим attemptId для получения cardId
  const cardId = checkinId.split('_')[0]; // Извлекаем cardId из attemptId (STRESS-01_2024-01-15_1)

  /**
   * Получаем данные завершенного подхода
   */
  const getCheckinData = useCallback(async (attemptId: string): Promise<CheckinData | null> => {
    try {
      // Получаем завершенный подход по attemptId
      const completedAttempt = ThemeCardManager.getCompletedAttempt(cardId, attemptId);
      
      if (!completedAttempt) {
        return null; // Подход не найден
      }

      // Получаем данные карточки через ThemeLoader
      const themeId = cardId.startsWith('STRESS') ? 'stress' : 
                     cardId.startsWith('REL') ? 'relationships' :
                     cardId.startsWith('IDNT') ? 'self-identity' :
                     cardId.startsWith('ANGR') ? 'anger' :
                     cardId.startsWith('DEPR') ? 'depression-coping' :
                     cardId.startsWith('LOSS') ? 'grief-loss' :
                     cardId.startsWith('BURN') ? 'burnout-recovery' :
                     cardId.startsWith('ANX') ? 'anxiety' : 'stress';
      
      const theme = await ThemeLoader.loadTheme(themeId, currentLanguage);
      const cardData = theme?.cards?.find(c => c.id === cardId);
      
      if (!cardData) {
        console.error(`Card ${cardId} not found in theme ${themeId}`);
        return null;
      }
      
      // Получаем переведенные вопросы и рекомендации из карточки
      const question1 = cardData.questions?.[0] || "Question 1";
      const question2 = cardData.questions?.[1] || "Question 2";
      const instructions = cardData.technique || "Technique";
      const practiceTask = cardData.recommendation || "Practice task";
      const whyNote = cardData.mechanism || "Mechanism";

      // Форматируем дату
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      };

      return {
        id: attemptId,
        cardTitle: cardTitle,
        date: completedAttempt.date,
        formattedDate: formatDate(completedAttempt.date),
        question1,
        answer1: completedAttempt.answers['question1'] || "No answer provided yet.",
        question2,
        answer2: completedAttempt.answers['question2'] || "No answer provided yet.",
        instructions,
        practiceTask,
        whyNote,
        rating: completedAttempt.rating
      };
    } catch (error) {
      console.error('Error getting checkin data:', error);
      return null;
    }
  }, [cardId, currentLanguage, cardTitle]);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCheckinData(checkinId);
        setCheckinData(data);
      } catch (err) {
        console.error('Error loading checkin data:', err);
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [checkinId, currentLanguage, getCheckinData]);

  // Показываем загрузку
  if (loading) {
    return (
      <div 
        className="bg-[#111111] relative size-full min-h-screen overflow-x-hidden" 
        data-name="Checkin Details Page"
      >
        <Light />
        <MiniStripeLogo />
        
        <div className="absolute top-[141px] left-0 right-0 bottom-0 overflow-y-auto">
          <div className="px-4 sm:px-6 md:px-[21px] py-5 pb-[180px]">
            <div className="w-full max-w-[351px] mx-auto flex flex-col gap-10">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p>Загрузка...</p>
              </div>
            </div>
          </div>
        </div>
        
        <CheckinDetailsBottomButton onClick={onBack} />
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div 
        className="bg-[#111111] relative size-full min-h-screen overflow-x-hidden" 
        data-name="Checkin Details Page"
      >
        <Light />
        <MiniStripeLogo />
        
        <div className="absolute top-[141px] left-0 right-0 bottom-0 overflow-y-auto">
          <div className="px-4 sm:px-6 md:px-[21px] py-5 pb-[180px]">
            <div className="w-full max-w-[351px] mx-auto flex flex-col gap-10">
              <div className="text-center text-white">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <CheckinDetailsBottomButton onClick={onBack} />
      </div>
    );
  }

  // Если завершенный подход не найден, показываем приглашение
  if (!checkinData) {
    return (
      <div 
        className="bg-[#111111] relative size-full min-h-screen overflow-x-hidden" 
        data-name="Checkin Details Page"
      >
        <Light />
        <MiniStripeLogo />
        
        <div className="absolute top-[141px] left-0 right-0 bottom-0 overflow-y-auto">
          <div className="px-4 sm:px-6 md:px-[21px] py-5 pb-[180px]">
            <div className="w-full max-w-[351px] mx-auto flex flex-col gap-10">
              <CardInfo cardTitle={cardTitle} formattedDate={checkinDate || "01.01.2025"} />
              <StartExerciseInvitation />
            </div>
          </div>
        </div>
        
        <CheckinDetailsBottomButton onClick={onBack} />
      </div>
    );
  }

  return (
    <div 
      className="bg-[#111111] relative size-full min-h-screen overflow-x-hidden" 
      data-name="Checkin Details Page"
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
            <CardInfo cardTitle={checkinData.cardTitle} formattedDate={checkinData.formattedDate} />
            
            {/* Основной контент с вопросами и ответами */}
            <MainContent checkinData={checkinData} />
          </div>
        </div>
      </div>
      
      {/* Кнопка продолжения */}
      <CheckinDetailsBottomButton onClick={onBack} />
    </div>
  );
}