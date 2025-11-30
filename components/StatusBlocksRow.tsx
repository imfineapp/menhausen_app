import React, { useEffect, useState } from 'react';
import { StatusBlock } from './StatusBlock';
import { LevelIcon, MentalStatusIcon, ExerciseIcon } from './UserProfileIcons';
import { useContent } from './ContentContext';
import { useTranslation } from './LanguageContext';
import { useAchievements } from '../contexts/AchievementsContext';
import { PointsManager } from '../utils/PointsManager';
import { ThemeCardManager } from '../utils/ThemeCardManager';

interface StatusBlocksRowProps {
  onBadgesClick?: () => void;
  onStatusClick?: () => void;
}

/**
 * Горизонтальный ряд статусных блоков для профиля пользователя
 * Дублирует содержание блоков меню "Значки", "Ваш уровень", "Статус как дела"
 */
export function StatusBlocksRow({ 
  onBadgesClick: _onBadgesClick, 
  onStatusClick: _onStatusClick 
}: StatusBlocksRowProps) {
  const { getUI, getLocalizedBadges: _getLocalizedBadges } = useContent();
  const { t } = useTranslation();
  const ui = getUI();
  const _badges = _getLocalizedBadges();
  const { unlockedCount: _unlockedCount } = useAchievements();
  
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [totalCompletedAttempts, setTotalCompletedAttempts] = useState<number>(0);
  const computedLevel = totalEarned === 0 ? 0 : Math.floor(totalEarned / 1000) + 1;
  const level = Math.max(1, computedLevel);

  useEffect(() => {
    const read = () => {
      const t = PointsManager.getBalance();
      setTotalEarned(t);
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

  useEffect(() => {
    const readAttempts = () => {
      const total = ThemeCardManager.getTotalCompletedAttempts();
      setTotalCompletedAttempts(total);
    };
    readAttempts();
    const onUpdate = () => readAttempts();
    window.addEventListener('storage', onUpdate);
    window.addEventListener('card:completed', onUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener('card:completed', onUpdate as EventListener);
    };
  }, []);

  return (
    <div className="flex flex-row gap-3 sm:gap-4 w-full items-stretch" data-name="Status blocks row">
      {/* Блок "Твой уровень" */}
      <div className="flex-1 flex">
        <StatusBlock
          icon={<div className="text-[#e1ff00]"><LevelIcon /></div>}
          title={ui.levels.yourLevel}
          value={level.toString()}
          subtitle=""
          onClick={undefined}
        />
      </div>
      
      {/* Блок "Упражнений пройдено" */}
      <div className="flex-1 flex">
        <StatusBlock
          icon={<div className="text-[#e1ff00]"><ExerciseIcon /></div>}
          title={t('exercises_completed')}
          value={totalCompletedAttempts.toString()}
          subtitle=""
          onClick={undefined}
        />
      </div>
      
      {/* Блок "Баллов" */}
      <div className="flex-1 flex">
        <StatusBlock
          icon={<div className="text-[#e1ff00]"><MentalStatusIcon /></div>}
          title={ui.profile.points || 'Points'}
          value={totalEarned.toString()}
          subtitle=""
          onClick={undefined}
        />
      </div>
    </div>
  );
}
