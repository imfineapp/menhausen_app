import React, { useState, useEffect } from 'react';
import { BadgesSlider } from './BadgesSlider';
import { useContent } from './ContentContext';
import { Light, MiniStripeLogo } from './ProfileLayoutComponents';
import { BottomFixedButton } from './BottomFixedButton';
import { Target, Flame, Calendar, BookOpen, Trophy, Smile, Sunrise, Moon } from 'lucide-react';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: string | null;
  progress?: number; // прогресс для заблокированных карточек (0-100)
}

interface BadgesScreenProps {
  onBack?: () => void;
}

/**
 * Страница достижений с перелистывающимися карточками
 */
export function BadgesScreen({ onBack: _onBack }: BadgesScreenProps) {
  const { getLocalizedBadges } = useContent();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Загрузка данных о бейджах
  useEffect(() => {
    const badgesTexts = getLocalizedBadges();
    
    // В реальном приложении здесь будет загрузка из API
    const mockBadges: Badge[] = [
      {
        id: "first_checkin",
        title: badgesTexts.achievements.first_checkin.title,
        description: badgesTexts.achievements.first_checkin.description,
        icon: <Target className="w-20 h-20 text-black" />,
        unlocked: true,
        unlockedAt: "2024-01-15"
      },
      {
        id: "week_streak",
        title: badgesTexts.achievements.week_streak.title,
        description: badgesTexts.achievements.week_streak.description,
        icon: <Flame className="w-20 h-20 text-black" />,
        unlocked: true,
        unlockedAt: "2024-01-22"
      },
      {
        id: "month_streak",
        title: badgesTexts.achievements.month_streak.title,
        description: badgesTexts.achievements.month_streak.description,
        icon: <Calendar className="w-20 h-20" />,
        unlocked: false,
        unlockedAt: null,
        progress: 60 // 18 из 30 дней
      },
      {
        id: "first_exercise",
        title: badgesTexts.achievements.first_exercise.title,
        description: badgesTexts.achievements.first_exercise.description,
        icon: <BookOpen className="w-20 h-20 text-black" />,
        unlocked: true,
        unlockedAt: "2024-01-16"
      },
      {
        id: "exercise_master",
        title: badgesTexts.achievements.exercise_master.title,
        description: badgesTexts.achievements.exercise_master.description,
        icon: <Trophy className="w-20 h-20" />,
        unlocked: false,
        unlockedAt: null,
        progress: 30 // 15 из 50 упражнений
      },
      {
        id: "mood_tracker",
        title: badgesTexts.achievements.mood_tracker.title,
        description: badgesTexts.achievements.mood_tracker.description,
        icon: <Smile className="w-20 h-20 text-black" />,
        unlocked: true,
        unlockedAt: "2024-01-20"
      },
      {
        id: "early_bird",
        title: badgesTexts.achievements.early_bird.title,
        description: badgesTexts.achievements.early_bird.description,
        icon: <Sunrise className="w-20 h-20" />,
        unlocked: false,
        unlockedAt: null,
        progress: 80 // 4 из 5 дней
      },
      {
        id: "night_owl",
        title: badgesTexts.achievements.night_owl.title,
        description: badgesTexts.achievements.night_owl.description,
        icon: <Moon className="w-20 h-20" />,
        unlocked: false,
        unlockedAt: null,
        progress: 20 // 1 из 5 дней
      }
    ];
    
    setBadges(mockBadges);
  }, [getLocalizedBadges]);

  const unlockedCount = badges.filter(badge => badge.unlocked).length;
  const totalCount = badges.length;

  // Поделиться достижением в Telegram (центральная карточка)
  const handleShare = () => {
    // Находим активную карточку по currentIndex
    const activeBadge = badges[currentIndex];
    if (!activeBadge || !activeBadge.unlocked) return;

    const badgesTexts = getLocalizedBadges();
    const shareMessage = `${badgesTexts.shareMessage}\n\n${activeBadge.title}: ${activeBadge.description}\n\n${badgesTexts.shareDescription}\n\n${badgesTexts.appLink}`;
    
    // В реальном приложении здесь будет интеграция с Telegram WebApp API
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(badgesTexts.appLink)}&text=${encodeURIComponent(shareMessage)}`);
    } else {
      // Fallback для тестирования
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
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px]">
          {/* Заголовок */}
          <div className="pb-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#e1ff00]">{getLocalizedBadges().title}</h1>
              <p className="text-gray-400 text-sm mt-1">{getLocalizedBadges().subtitle}</p>
            </div>

            {/* Статистика в стиле StatusBlocksRow */}
            <div className="flex flex-row gap-3 sm:gap-4 w-full">
              {/* Блок "Разблокировано" */}
              <div className="flex-1">
                <div className="relative rounded-xl p-3 sm:p-4 w-full min-h-[44px] min-w-[44px]">
                  {/* Подложка блока */}
                  <div className="absolute inset-0">
                    <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl">
                      <div
                        aria-hidden="true"
                        className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
                      />
                    </div>
                  </div>
                  
                  {/* Контент блока */}
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2 sm:gap-3 w-full">
                    {/* Основное значение */}
                    <div className="text-lg sm:text-xl font-bold text-white text-center leading-tight">
                      {unlockedCount}
                    </div>
                    
                    {/* Заголовок */}
                    <div className="text-sm text-[#696969] text-center leading-tight">
                      {getLocalizedBadges().unlockedCount}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Блок "В процессе" */}
              <div className="flex-1">
                <div className="relative rounded-xl p-3 sm:p-4 w-full min-h-[44px] min-w-[44px]">
                  {/* Подложка блока */}
                  <div className="absolute inset-0">
                    <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl">
                      <div
                        aria-hidden="true"
                        className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
                      />
                    </div>
                  </div>
                  
                  {/* Контент блока */}
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2 sm:gap-3 w-full">
                    {/* Основное значение */}
                    <div className="text-lg sm:text-xl font-bold text-white text-center leading-tight">
                      {totalCount}
                    </div>
                    
                    {/* Заголовок */}
                    <div className="text-sm text-[#696969] text-center leading-tight">
                      {getLocalizedBadges().inProgress}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Блок "Баллы" */}
              <div className="flex-1">
                <div className="relative rounded-xl p-3 sm:p-4 w-full min-h-[44px] min-w-[44px]">
                  {/* Подложка блока */}
                  <div className="absolute inset-0">
                    <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl">
                      <div
                        aria-hidden="true"
                        className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
                      />
                    </div>
                  </div>
                  
                  {/* Контент блока */}
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2 sm:gap-3 w-full">
                    {/* Основное значение */}
                    <div className="text-lg sm:text-xl font-bold text-white text-center leading-tight">
                      +1 500
                    </div>
                    
                    {/* Заголовок */}
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
                {unlockedCount > 0 ? getLocalizedBadges().congratulations : getLocalizedBadges().congratulations}
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
