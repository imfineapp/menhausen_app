import React from 'react';
import { ProgressRow } from './ProgressRow';
import { LevelIcon } from './UserProfileIcons';
import { useContent } from './ContentContext';

interface ProgressBlockProps {
  onBadgesClick?: () => void;
}

/**
 * Блок прогресса для страницы пользователя
 * Содержит две строки: достижения и уровень
 */
export function ProgressBlock({ onBadgesClick: _onBadgesClick }: ProgressBlockProps) {
  const { getUI } = useContent();
  const _uiContent = getUI();

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
          {/* Строка с блоками статуса */}
          <div className="flex flex-row gap-3 sm:gap-4 w-full">
            {/* Блок "Твой уровень" - увеличенный */}
            <div className="flex-1">
              <div className="bg-black/50 rounded-lg p-3 w-full min-h-[44px] min-w-[44px]">
                <div className="flex flex-col items-center text-center">
                  <span className="text-[#e1ff00] text-3xl font-bold">25</span>
                  <span className="text-gray-400 text-sm">Твой уровень</span>
                </div>
              </div>
            </div>
            
            {/* Блок "До следующего уровня" */}
            <div className="flex-1">
              <div className="bg-black/50 rounded-lg p-3 w-full min-h-[44px] min-w-[44px]">
                <div className="flex flex-col items-center text-center">
                  <span className="text-white text-2xl font-semibold">2500/8000</span>
                  <span className="text-gray-400 text-sm">До следующего уровня</span>
                </div>
              </div>
            </div>
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
