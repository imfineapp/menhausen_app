import React, { useState, useEffect } from 'react';
import { useTranslation } from './LanguageContext';
import { useContent } from './ContentContext';

const STORAGE_KEY = 'regularExerciseNotificationDismissed';

/**
 * Уведомление о важности регулярного выполнения упражнений
 * Отображается над блоком "Твоя активность" на странице профиля
 * Использует цветовую схему блока премиума
 */
export function RegularExerciseNotification() {
  const { t } = useTranslation();
  const { getUI } = useContent();
  const ui = getUI();
  const [isVisible, setIsVisible] = useState(false);

  // Проверяем localStorage при монтировании
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  // Обработчик закрытия уведомления
  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="relative rounded-xl p-4 sm:p-5 md:p-6 w-full"
      data-name="Regular exercise notification"
    >
      {/* Фон блока - желтый, как у премиума */}
      <div className="absolute inset-0" data-name="notification_background">
        <div className="absolute bg-[#e1ff00] inset-0 rounded-xl" data-name="Block">
          <div
            aria-hidden="true"
            className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
          />
        </div>
      </div>
      
      {/* Контент блока */}
      <div className="relative z-10 w-full flex items-center justify-between gap-3 sm:gap-4">
        {/* Иконка упражнений */}
        <div className="shrink-0 flex items-center" style={{ color: '#111111' }}>
          <div className="w-5 h-5 sm:w-6 sm:h-6">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <g id="Exercise icon">
                <path
                  d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M22 4L12 14.01L9 11.01"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </g>
            </svg>
          </div>
        </div>
        
        {/* Текст уведомления */}
        <p className="text-[#111111] text-sm sm:text-base font-medium leading-relaxed flex-1">
          {ui.profile?.regularExerciseNotification || t('regularExerciseNotification') || 'Только регулярно выполняя упражнения, ты добьешься результатов'}
        </p>
        
        {/* Кнопка закрытия с иконкой крестика */}
        <button
          onClick={handleClose}
          className="text-[#111111] hover:opacity-70 transition-opacity duration-200 p-1 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={t('close')}
          data-name="Close notification button"
        >
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

