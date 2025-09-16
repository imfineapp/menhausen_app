import React from 'react';
import { StatusBlock } from './StatusBlock';
import { BadgeIcon, LevelIcon, MentalStatusIcon } from './UserProfileIcons';

interface StatusBlocksRowProps {
  onBadgesClick?: () => void;
  onLevelClick?: () => void;
  onStatusClick?: () => void;
}

/**
 * Горизонтальный ряд статусных блоков для профиля пользователя
 * Дублирует содержание блоков меню "Значки", "Ваш уровень", "Статус как дела"
 */
export function StatusBlocksRow({ 
  onBadgesClick, 
  onLevelClick, 
  onStatusClick 
}: StatusBlocksRowProps) {

  return (
    <div className="flex flex-row gap-3 sm:gap-4 w-full" data-name="Status blocks row">
      {/* Блок "Достижения" */}
      <div className="flex-1">
        <StatusBlock
          icon={<div className="text-[#e1ff00]"><BadgeIcon /></div>}
          title="Достижения"
          value="12"
          subtitle=""
          onClick={onBadgesClick}
        />
      </div>
      
      {/* Блок "Твой уровень" */}
      <div className="flex-1">
        <StatusBlock
          icon={<div className="text-[#e1ff00]"><LevelIcon /></div>}
          title="Твой уровень"
          value="25"
          subtitle=""
          onClick={onLevelClick}
        />
      </div>
      
      {/* Блок "Состояние" */}
      <div className="flex-1">
        <StatusBlock
          icon={<div className="text-[#e1ff00]"><MentalStatusIcon /></div>}
          title="Состояние"
          value="3/5"
          subtitle=""
          onClick={onStatusClick}
        />
      </div>
    </div>
  );
}
