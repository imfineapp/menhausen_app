import React from 'react';
import { useTranslation } from './LanguageContext';
import { UnlockIcon } from './UserProfileIcons';

interface PremiumUnlockBlockProps {
  onClick: () => void;
}

/**
 * Блок для разблокировки премиума
 * Кликабельный блок с желтым фоном и иконкой замка
 */
export function PremiumUnlockBlock({ onClick }: PremiumUnlockBlockProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="relative rounded-xl p-4 sm:p-5 md:p-6 w-full h-full min-h-[200px] cursor-pointer hover:opacity-90 transition-opacity"
      data-name="Premium unlock block"
    >
      {/* Фон блока - желтый */}
      <div className="absolute inset-0" data-name="premium_unlock_block_background">
        <div className="absolute bg-[#e1ff00] inset-0 rounded-xl" data-name="Block">
          <div
            aria-hidden="true"
            className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
          />
        </div>
      </div>
      
      {/* Контент блока */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-4 sm:py-5 md:py-6">
        {/* Иконка по центру горизонтально - в 3 раза больше */}
        <div className="flex items-center justify-center flex-1">
          <div className="text-[#111111]" style={{ color: '#111111' }}>
            <div style={{ filter: 'brightness(0) saturate(100%)', transform: 'scale(3)' }}>
              <UnlockIcon />
            </div>
          </div>
        </div>
        
        {/* Текст по центру горизонтально */}
        <div className="flex items-center justify-center text-center flex-1">
          <h3 className="text-[#111111] text-xl font-semibold leading-tight m-0 p-0">
            {t('unlock_all_themes')}
          </h3>
        </div>
      </div>
    </button>
  );
}

