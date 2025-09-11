import React from 'react';
import { ProgressRow } from './ProgressRow';
import { BadgeIcon, LevelIcon } from './UserProfileIcons';

/**
 * Блок прогресса для страницы пользователя
 * Содержит две строки: достижения и уровень
 */
export function ProgressBlock() {
  return (
    <div className="w-full">
      <div className="relative rounded-xl p-4 sm:p-5 md:p-6 w-full">
        {/* Фон блока */}
        <div className="absolute inset-0" data-name="progress_block_background">
          <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
            <div
              aria-hidden="true"
              className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
            />
          </div>
        </div>
        
        {/* Контент блока */}
        <div className="relative z-10 flex flex-col gap-4 w-full">
          {/* Первая строка - Достижения */}
          <div className="bg-black/50 rounded-lg p-3">
            <ProgressRow
              icon={<div className="text-[#e1ff00]"><BadgeIcon /></div>}
              value="+1"
              progress={33} // 1/3 заполнения
            />
          </div>
          
          {/* Вторая строка - Уровень */}
          <div className="bg-black/50 rounded-lg p-3">
            <ProgressRow
              icon={<div className="text-[#e1ff00]"><LevelIcon /></div>}
              value="+1"
              progress={80} // 80% заполнения
            />
          </div>
        </div>
      </div>
    </div>
  );
}
