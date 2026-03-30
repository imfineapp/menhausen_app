import { settingsMessages } from '@/src/i18n/messages/settings';
import React from 'react';
import { StatusBlock } from './StatusBlock';
import { LevelIcon, MentalStatusIcon, ExerciseIcon } from './UserProfileIcons';
import { useAchievements } from '../contexts/AchievementsContext';
import { useStore } from '@nanostores/react';
import { $currentLevel, $pointsBalance } from '@/src/stores/points.store';
import { $totalCompletedAttempts } from '@/src/stores/theme-progress.store';
import { levelsMessages } from '@/src/i18n/messages/levels';
import { profileMessages } from '@/src/i18n/messages/profile';

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
  const msgs = useStore(settingsMessages);
  const levels = useStore(levelsMessages);
  const profile = useStore(profileMessages);
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
          title={levels.yourLevel}
          value={level.toString()}
          subtitle=""
          onClick={undefined}
        />
      </div>
      
      {/* Блок "Упражнений пройдено" */}
      <div className="flex-1 flex">
        <StatusBlock
          icon={<div className="text-[#e1ff00]"><ExerciseIcon /></div>}
          title={msgs.exercisesCompleted}
          value={totalCompletedAttempts.toString()}
          subtitle=""
          onClick={undefined}
        />
      </div>
      
      {/* Блок "Баллов" */}
      <div className="flex-1 flex">
        <StatusBlock
          icon={<div className="text-[#e1ff00]"><MentalStatusIcon /></div>}
          title={profile.points || msgs.status}
          value={totalEarned.toString()}
          subtitle=""
          onClick={undefined}
        />
      </div>
    </div>
  );
}
