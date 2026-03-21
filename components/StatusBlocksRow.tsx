import React from 'react';
import { StatusBlock } from './StatusBlock';
import { LevelIcon, MentalStatusIcon, ExerciseIcon } from './UserProfileIcons';
import { useContent } from './ContentContext';
import { useTranslation } from './LanguageContext';
import { useAchievements } from '../contexts/AchievementsContext';
import { useStore } from '@nanostores/react';
import { $currentLevel, $pointsBalance } from '@/src/stores/points.store';
import { $totalCompletedAttempts } from '@/src/stores/theme-progress.store';

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
  
  const totalEarned = useStore($pointsBalance);
  const level = useStore($currentLevel);
  const totalCompletedAttempts = useStore($totalCompletedAttempts);

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
