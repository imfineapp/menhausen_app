// ThemeCard Component
// Reusable theme card with progress and premium status

import React, { useMemo } from 'react';
import { StripedProgressBar } from './ui/StripedProgressBar';
import { UserAccountStatus } from './UserProfileComponents';
import { useContent } from './ContentContext';
import { getThemeMatchPercentage } from '../utils/themeTestMapping';

interface ThemeCardProps {
  title: string;
  description: string;
  progress?: number;
  isPremium?: boolean;
  onClick?: () => void;
  themeId?: string;
}

/**
 * Адаптивная карточка темы с прогрессом и обработкой кликов
 */
export function ThemeCard({
  title,
  description,
  progress = 0,
  isPremium = false,
  onClick,
  themeId
}: ThemeCardProps) {
  const { content } = useContent();
  
  // Получаем процент соответствия из результатов теста
  const matchPercentage = useMemo(() => {
    if (!themeId) return null;
    return getThemeMatchPercentage(themeId);
  }, [themeId]);
  
  // Формируем текст с процентом, если он доступен
  const matchText = useMemo(() => {
    if (matchPercentage === null) return null;
    const template = content.ui.home.themeMatchPercentage || 'Подходит тебе на {percentage}%';
    return template.replace('{percentage}', String(Math.round(matchPercentage)));
  }, [matchPercentage, content.ui.home.themeMatchPercentage]);
  
  return (
    <button
      onClick={onClick}
      className="box-border content-stretch flex flex-col gap-2 sm:gap-2.5 h-[140px] sm:h-[147px] md:h-[154px] items-start justify-start p-[16px] sm:p-[18px] md:p-[20px] relative shrink-0 w-full cursor-pointer min-h-[44px] min-w-[44px] hover:bg-[rgba(217,217,217,0.06)]"
      data-name="Theme card narrow"
    >
      <div className="absolute inset-0" data-name="theme_block_background">
        <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
          <div
            aria-hidden="true"
            className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
          />
        </div>
      </div>
      
      {/* Контент карточки */}
      <div className="relative z-10 box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-start justify-start p-0 shrink-0 w-full">
        <div className="typography-h2 text-[#e1ff00] text-left w-full">
          <h2 className="block">{title}</h2>
        </div>
        <div className="typography-body text-[#ffffff] text-left w-full">
          <p className="block">{description}</p>
        </div>
      </div>
      
      {/* Индикатор прогресса */}
      <div className="absolute bottom-0 left-0 right-0 h-5 sm:h-6 z-10" data-name="Progress_theme">
        <StripedProgressBar 
          progress={progress} 
          size="lg" 
          className="w-full"
          showBackground={true}
        />
        <div className="absolute typography-caption top-1/2 left-0 right-0 -translate-y-1/2 text-[#696969] text-right pr-2">
          <p className="block">{content.ui.home.activity.progressLabel}</p>
        </div>
      </div>
      
      {/* Информация о соответствии темы и статус премиум - размещаем над прогресс-баром */}
      <div className="absolute bottom-[30px] sm:bottom-[32px] md:bottom-[34px] left-[16px] sm:left-[18px] md:left-[20px] right-[16px] sm:right-[18px] md:right-[20px] box-border content-stretch flex flex-row items-center justify-between p-0 z-10">
        {matchText && (
          <div className="typography-button text-[#696969] text-left">
            <p className="block">{matchText}</p>
          </div>
        )}
        <UserAccountStatus isPremium={isPremium} />
      </div>
    </button>
  );
}






