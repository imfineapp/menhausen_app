import React, { useState, useEffect } from 'react';
import { useContent } from './ContentContext';
import { Light, MiniStripeLogo } from './ProfileLayoutComponents';
import { BottomFixedButton } from './BottomFixedButton';
import { BadgeCard } from './BadgeCard';
import { Target, Flame, Calendar, BookOpen, Trophy, Smile, Sunrise, Moon } from 'lucide-react';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: string | null;
  progress?: number;
}

interface RewardScreenProps {
  achievements: Badge[];
  currentIndex: number;
  onContinue: () => void;
  onBack?: () => void;
}

/**
 * Страница получения награды - показывает одно достижение за раз
 * Основана на BadgesScreen, но без статистики и пагинации
 */
export function RewardScreen({ 
  achievements, 
  currentIndex, 
  onContinue, 
  onBack: _onBack 
}: RewardScreenProps) {
  const { getLocalizedBadges } = useContent();
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedIndex, setDisplayedIndex] = useState(currentIndex);
  const [isPageEntering, setIsPageEntering] = useState(true);
  
  // Получаем текущее достижение
  const currentAchievement = achievements[currentIndex];
  const isLastAchievement = currentIndex === achievements.length - 1;
  
  const rewardTexts = getLocalizedBadges().reward;

  // Анимация входа на страницу
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageEntering(false);
    }, 100); // Небольшая задержка для плавного входа
    return () => clearTimeout(timer);
  }, []);

  // Анимация при смене карточки
  useEffect(() => {
    if (currentIndex !== displayedIndex) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayedIndex(currentIndex);
        // Небольшая задержка перед показом новой карточки
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 300); // Время для скрытия старой карточки
      return () => clearTimeout(timer);
    }
  }, [currentIndex, displayedIndex]);

  if (!currentAchievement) {
    return null;
  }

  return (
    <div 
      className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom flex flex-col" 
      data-name="Reward Page"
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Центрированный контент с анимацией входа */}
      <div 
        className={`flex-1 flex flex-col justify-center items-center px-[16px] sm:px-[20px] md:px-[21px] transition-all duration-800 ease-out ${
          isPageEntering 
            ? 'opacity-0 transform translate-y-8 scale-95' 
            : 'opacity-100 transform translate-y-0 scale-100'
        }`}
      >
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#e1ff00] mb-2">
            {rewardTexts.title}
          </h1>
          <p className="text-gray-400 text-base">
            {rewardTexts.subtitle}
          </p>
        </div>

        {/* Карточка достижения с эффектом Glow и анимацией */}
        <div className="relative mb-8 p-4">
          {/* Glow эффект */}
          <div className="absolute inset-0 bg-[#e1ff00] rounded-3xl blur-xl opacity-30 scale-110 animate-pulse"></div>
          <div 
            className={`relative transition-all duration-600 ease-in-out ${
              isAnimating 
                ? 'opacity-0 transform translate-x-12 scale-95 rotate-1' 
                : 'opacity-100 transform translate-x-0 scale-100 rotate-0'
            }`}
            style={{
              transformOrigin: 'center center'
            }}
          >
            <BadgeCard
              title={achievements[displayedIndex]?.title || currentAchievement.title}
              description={achievements[displayedIndex]?.description || currentAchievement.description}
              icon={achievements[displayedIndex]?.icon || currentAchievement.icon}
              unlocked={achievements[displayedIndex]?.unlocked ?? currentAchievement.unlocked}
              unlockedAt={achievements[displayedIndex]?.unlockedAt || currentAchievement.unlockedAt}
              isActive={true}
              progress={achievements[displayedIndex]?.progress || currentAchievement.progress}
            />
          </div>
        </div>

        {/* Мотивирующий текст */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3 text-[#e1ff00]">
            {rewardTexts.congratulations}
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-md">
            {rewardTexts.earnedAchievement}
          </p>
        </div>
      </div>

      {/* Кнопка продолжить с анимацией входа */}
      <div 
        className={`transition-all duration-800 ease-out delay-300 ${
          isPageEntering 
            ? 'opacity-0 transform translate-y-4' 
            : 'opacity-100 transform translate-y-0'
        }`}
      >
        <BottomFixedButton onClick={onContinue}>
          {isLastAchievement 
            ? rewardTexts.continueButton 
            : rewardTexts.nextAchievement
          }
        </BottomFixedButton>
      </div>
    </div>
  );
}

/**
 * Хук для создания данных достижений
 * В реальном приложении данные будут приходить из API
 */
export function useAchievementData() {
  const { getLocalizedBadges } = useContent();
  
  const createAchievementData = (): Badge[] => {
    const badgesTexts = getLocalizedBadges();
    
    return [
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
        progress: 60
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
        progress: 30
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
        progress: 80
      },
      {
        id: "night_owl",
        title: badgesTexts.achievements.night_owl.title,
        description: badgesTexts.achievements.night_owl.description,
        icon: <Moon className="w-20 h-20" />,
        unlocked: false,
        unlockedAt: null,
        progress: 20
      }
    ];
  };

  return { createAchievementData };
}
