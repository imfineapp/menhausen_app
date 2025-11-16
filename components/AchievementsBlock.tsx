import React, { useEffect, useState } from 'react';
import { useTranslation } from './LanguageContext';
import { useContent } from './ContentContext';
import { useAchievements } from '../contexts/AchievementsContext';
import { getAllAchievementsMetadata } from '../utils/achievementsMetadata';
import { getAchievementIcon } from '../utils/achievementIcons';
import { ArrowIcon } from './UserProfileIcons';

/**
 * Порядок отображения достижений (от первого к последнему)
 * Должен совпадать с BadgesScreen.tsx
 */
const ACHIEVEMENT_DISPLAY_ORDER = [
  'newcomer',
  'beginner',
  'seeker',
  'apprentice',
  'topic_closer',
  'basic_reader',
  'hero_secrets',
  'keeper_of_wisdom',
  'first_chapter_hero',
  'recruiter',
  'explorer',
  'path_chooser',
  'knowledge_lover',
  'spreader',
  'traveler',
  'fear_conqueror',
  'persistence_master',
  'inspirer',
  'harmony_seeker',
  'enlightened_mind',
  'ambassador',
  'sage',
  'depth_explorer',
  'doubt_slayer',
  'mind_protector',
  'mentor',
  'pathfinder',
  'chaos_conqueror',
  'balance_keeper',
  'legendary_hero',
  'reading_master',
  'menhausen_master'
] as const;

interface AchievementIcon {
  id: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
}

interface AchievementsBlockProps {
  onClick: () => void;
}

/**
 * Определение цвета иконки в зависимости от состояния достижения
 */
const getIconColor = (unlocked: boolean, progress: number): string => {
  if (unlocked) return 'text-[#e1ff00]'; // Желтый - получено
  if (progress > 0) return 'text-[#e1ff00]/60'; // Приглушенный желтый - начато
  return 'text-[#696969]'; // Серый - не взято
};

/**
 * Блок с сеткой всех достижений для страницы профиля пользователя
 */
export function AchievementsBlock({ onClick }: AchievementsBlockProps) {
  const { t } = useTranslation();
  const { getLocalizedBadges } = useContent();
  const { achievements: userAchievements } = useAchievements();
  const [achievementIcons, setAchievementIcons] = useState<AchievementIcon[]>([]);

  // Загрузка и подготовка данных о достижениях
  useEffect(() => {
    const achievementsMetadata = getAllAchievementsMetadata();
    const _badgesTexts = getLocalizedBadges();

    const icons = achievementsMetadata
      .map(metadata => {
        const userAchievement = userAchievements[metadata.id];
        const icon = getAchievementIcon(metadata.iconName, { className: 'w-8 h-8' });

        return {
          id: metadata.id,
          icon,
          unlocked: userAchievement?.unlocked || false,
          progress: userAchievement?.progress || 0
        };
      })
      .filter((item): item is AchievementIcon => item !== null && item.id !== undefined);

    // Сортируем по заданному порядку отображения
    icons.sort((a, b) => {
      const indexA = ACHIEVEMENT_DISPLAY_ORDER.indexOf(a.id as typeof ACHIEVEMENT_DISPLAY_ORDER[number]);
      const indexB = ACHIEVEMENT_DISPLAY_ORDER.indexOf(b.id as typeof ACHIEVEMENT_DISPLAY_ORDER[number]);
      
      // Если оба ID в списке порядка, сортируем по их позициям
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Если только один в списке, он идет первым
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Если ни один не в списке, сохраняем исходный порядок
      return 0;
    });
    
    setAchievementIcons(icons);
  }, [userAchievements, getLocalizedBadges]);

  // Получаем текст заголовка (приоритет: getLocalizedBadges, затем useTranslation)
  const title = getLocalizedBadges().title || t('badges');

  return (
    <button
      onClick={onClick}
      className="relative rounded-xl p-4 sm:p-5 md:p-6 w-full cursor-pointer min-h-[44px] min-w-[44px] hover:bg-[rgba(217,217,217,0.06)] transition-colors duration-200"
      data-name="Achievements block"
    >
      {/* Фон блока */}
      <div className="absolute inset-0" data-name="achievements_block_background">
        <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
          <div
            aria-hidden="true"
            className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
          />
        </div>
      </div>
      
      {/* Контент блока */}
      <div className="relative z-10 flex flex-col gap-4 w-full">
        {/* Заголовок и иконка стрелки */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-[#e1ff00] text-base sm:text-lg font-semibold">
              {title}
            </h3>
          </div>
          <div className="flex items-center justify-center min-h-[44px] min-w-[44px]">
            <ArrowIcon direction="right" />
          </div>
        </div>
        
        {/* Сетка иконок достижений (7 в ряду) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {achievementIcons.map((achievement) => {
            const iconColor = getIconColor(achievement.unlocked, achievement.progress);
            return (
              <div
                key={achievement.id}
                className={`flex items-center justify-center ${iconColor} [&>*]:text-current transition-colors duration-200`}
                data-name={`Achievement icon: ${achievement.id}`}
              >
                {achievement.icon}
              </div>
            );
          })}
        </div>
      </div>
    </button>
  );
}

