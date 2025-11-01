import React, { useState, useEffect } from 'react';
import { BadgesSlider } from './BadgesSlider';
import { useContent } from './ContentContext';
import { useAchievements } from '../contexts/AchievementsContext';
import { Light, MiniStripeLogo } from './ProfileLayoutComponents';
import { BottomFixedButton } from './BottomFixedButton';
import { getAllAchievementsMetadata } from '../utils/achievementsMetadata';
import { getAchievementIcon } from '../utils/achievementIcons';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  xp: number;
}

interface BadgesScreenProps {
  onBack?: () => void;
}

/**
 * Порядок отображения достижений (от первого к последнему)
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

/**
 * Экран со всеми достижениями пользователя
 */
export function BadgesScreen({ onBack: _onBack }: BadgesScreenProps) {
  const { getLocalizedBadges } = useContent();
  const { achievements: userAchievements, totalXP, refreshAchievements } = useAchievements();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Загрузка всех достижений из контента и метаданных
  useEffect(() => {
    const badgesTexts = getLocalizedBadges();
    const achievementsMetadata = getAllAchievementsMetadata();

    const allBadges = achievementsMetadata
      .map(metadata => {
        const achievementContent = badgesTexts.achievements[metadata.id];
        const userAchievement = userAchievements[metadata.id];
        const icon = getAchievementIcon(metadata.iconName, { className: 'w-20 h-20' });

        // Если контент недоступен, используем fallback на основе ID
        if (!achievementContent) {
          console.warn(`Achievement content not found for: ${metadata.id}, using fallback`);
          // Преобразуем ID в читаемый формат (например: "topic_closer" -> "Topic Closer")
          const fallbackTitle = metadata.id
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          return {
            id: metadata.id,
            title: fallbackTitle,
            description: `Achievement: ${metadata.id}`,
            icon,
            unlocked: userAchievement?.unlocked || false,
            unlockedAt: userAchievement?.unlockedAt ?? null,
            progress: userAchievement?.progress || 0,
            xp: metadata.xp
          };
        }

        return {
          id: metadata.id,
          title: achievementContent.title,
          description: achievementContent.description,
          icon,
          unlocked: userAchievement?.unlocked || false,
          unlockedAt: userAchievement?.unlockedAt ?? null,
          progress: userAchievement?.progress || 0,
          xp: metadata.xp
        };
      })
      .filter((badge): badge is Badge => badge !== null && badge.id !== undefined);
    
    // Сортируем по заданному порядку отображения
    allBadges.sort((a, b) => {
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
    
    setBadges(allBadges);
  }, [getLocalizedBadges, userAchievements]);

  // Автоматическая проверка достижений при монтировании
  useEffect(() => {
    refreshAchievements();
  }, [refreshAchievements]);

  const unlockedCount = badges.filter(badge => badge.unlocked).length;
  const inProgressCount = badges.filter(badge => !badge.unlocked && badge.progress > 0).length;

  // Поделиться достижением в Telegram
  const handleShare = () => {
    const activeBadge = badges[currentIndex];
    if (!activeBadge || !activeBadge.unlocked) return;

    const badgesTexts = getLocalizedBadges();
    const shareMessage = `${badgesTexts.shareMessage}\n\n${activeBadge.title}: ${activeBadge.description}\n\n${badgesTexts.shareDescription}\n\n${badgesTexts.appLink}`;
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(badgesTexts.appLink)}&text=${encodeURIComponent(shareMessage)}`);
    } else {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(badgesTexts.appLink)}&text=${encodeURIComponent(shareMessage)}`;
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div 
      className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom" 
      data-name="Badges Page"
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      {/* Декоративный фон */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент и навигация */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px]">
          {/* Заголовок */}
          <div className="pb-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#e1ff00]">{getLocalizedBadges().title}</h1>
              <p className="text-gray-400 text-sm mt-1">{getLocalizedBadges().subtitle}</p>
            </div>

            {/* Статистика достижений */}
            <div className="flex flex-row gap-3 sm:gap-4 w-full">
              {/* Блок "Разблокировано" */}
              <div className="flex-1">
                <div className="relative rounded-xl p-3 sm:p-4 w-full min-h-[44px] min-w-[44px]">
                  <div className="absolute inset-0">
                    <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl">
                      <div
                        aria-hidden="true"
                        className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2 sm:gap-3 w-full">
                    <div className="text-lg sm:text-xl font-bold text-white text-center leading-tight">
                      {unlockedCount}
                    </div>
                    
                    <div className="text-sm text-[#696969] text-center leading-tight">
                      {getLocalizedBadges().unlockedCount}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Блок "В процессе" */}
              <div className="flex-1">
                <div className="relative rounded-xl p-3 sm:p-4 w-full min-h-[44px] min-w-[44px]">
                  <div className="absolute inset-0">
                    <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl">
                      <div
                        aria-hidden="true"
                        className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2 sm:gap-3 w-full">
                    <div className="text-lg sm:text-xl font-bold text-white text-center leading-tight">
                      {inProgressCount}
                    </div>
                    
                    <div className="text-sm text-[#696969] text-center leading-tight">
                      {getLocalizedBadges().inProgress}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Блок "Очки" */}
              <div className="flex-1">
                <div className="relative rounded-xl p-3 sm:p-4 w-full min-h-[44px] min-w-[44px]">
                  <div className="absolute inset-0">
                    <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl">
                      <div
                        aria-hidden="true"
                        className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2 sm:gap-3 w-full">
                    <div className="text-lg sm:text-xl font-bold text-white text-center leading-tight">
                      {totalXP}
                    </div>
                    
                    <div className="text-sm text-[#696969] text-center leading-tight">
                      {getLocalizedBadges().points}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Слайдер достижений */}
          <div className="pb-8">
            <BadgesSlider badges={badges} onCurrentIndexChange={setCurrentIndex} />
          </div>

          {/* Мотивирующий текст */}
          <div className="pb-8">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2 text-[#e1ff00]">
                {getLocalizedBadges().congratulations}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {unlockedCount > 0 
                  ? getLocalizedBadges().motivatingText
                  : getLocalizedBadges().motivatingTextNoBadges
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка поделиться */}
      {unlockedCount > 0 && (
        <BottomFixedButton onClick={handleShare}>
          {getLocalizedBadges().shareButton}
        </BottomFixedButton>
      )}
    </div>
  );
}

