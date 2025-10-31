import React, { useEffect, useState } from 'react';
import { ProgressRow } from './ProgressRow';
import { LevelIcon } from './UserProfileIcons';
import { useContent } from './ContentContext';
import { PointsManager } from '../utils/PointsManager';

interface ProgressBlockProps {
  onBadgesClick?: () => void;
}

/**
 * Блок прогресса для страницы пользователя
 * Содержит две строки: достижения и уровень
 */
export function ProgressBlock({ onBadgesClick: _onBadgesClick }: ProgressBlockProps) {
  const { getUI } = useContent();
  const ui = getUI();
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [nextTarget, setNextTarget] = useState<number>(1000);
  const computedLevel = totalEarned === 0 ? 0 : Math.floor(totalEarned / 1000) + 1;
  const level = Math.max(1, computedLevel);

  useEffect(() => {
    const read = () => {
      const t = PointsManager.getBalance();
      setTotalEarned(t);
      setNextTarget(PointsManager.getNextLevelTarget(1000));
    };
    read();
    const onUpdate = () => read();
    window.addEventListener('storage', onUpdate);
    window.addEventListener('points:updated', onUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener('points:updated', onUpdate as EventListener);
    };
  }, []);

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
                  <span className="text-[#e1ff00] text-3xl font-bold">{level.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm">{ui.levels.yourLevel}</span>
                </div>
              </div>
            </div>
            
            {/* Блок "До следующего уровня" */}
            <div className="flex-1">
              <div className="bg-black/50 rounded-lg p-3 w-full min-h-[44px] min-w-[44px]">
                <div className="flex flex-col items-center text-center">
                  <span className="text-white text-2xl font-semibold">{totalEarned.toLocaleString()}/{nextTarget.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm">{ui.levels.toNextLevel}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Вторая строка - Уровень */}
          <div className="bg-black/50 rounded-lg p-3">
            <ProgressRow
              icon={<div className="text-[#e1ff00]"><LevelIcon /></div>}
              value={"+" + (level + 1)}
              progress={Math.min(100, Math.floor(((totalEarned % 1000) / 1000) * 100))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
