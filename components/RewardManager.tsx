import React, { useState, useEffect, useRef } from 'react';
import { RewardScreen, useAchievementData } from './RewardScreen';

interface RewardManagerProps {
  earnedAchievementIds: string[];
  onComplete: () => void;
  onBack?: () => void;
}

/**
 * Менеджер для последовательного показа достижений
 * Показывает каждое полученное достижение по очереди
 */
export function RewardManager({ 
  earnedAchievementIds, 
  onComplete, 
  onBack 
}: RewardManagerProps) {
  const { createAchievementData } = useAchievementData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const onCompleteRef = useRef(onComplete);

  // Обновляем ref при изменении onComplete
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Фильтруем только полученные достижения
  useEffect(() => {
    const allAchievements = createAchievementData();
    const earnedAchievements = allAchievements
      .filter(achievement => 
        earnedAchievementIds.includes(achievement.id)
      )
      .map(achievement => ({
        ...achievement,
        // Принудительно устанавливаем unlocked: true для достижений из списка earned
        // так как они точно получены, независимо от состояния контекста
        unlocked: true,
        // Устанавливаем unlockedAt если его нет
        unlockedAt: achievement.unlockedAt || new Date().toISOString()
      }));
    
    if (earnedAchievements.length === 0) {
      onCompleteRef.current();
    } else {
      setAchievements(earnedAchievements);
    }
  }, [earnedAchievementIds, createAchievementData]);

  const handleContinue = () => {
    if (currentIndex < achievements.length - 1) {
      // Переходим к следующему достижению
      setCurrentIndex(prev => prev + 1);
    } else {
      // Все достижения показаны, завершаем
      onComplete();
    }
  };

  // Если нет достижений для показа, не рендерим ничего
  if (achievements.length === 0) {
    return null;
  }

  return (
    <RewardScreen
      achievements={achievements}
      currentIndex={currentIndex}
      onContinue={handleContinue}
      onBack={onBack}
    />
  );
}

/**
 * Хук для управления показом наград
 * В реальном приложении будет интегрирован с системой достижений
 */
export function useRewardManager() {
  const [showRewards, setShowRewards] = useState(false);
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>([]);

  const showAchievementRewards = (achievementIds: string[]) => {
    setEarnedAchievements(achievementIds);
    setShowRewards(true);
  };

  const hideRewards = () => {
    setShowRewards(false);
    setEarnedAchievements([]);
  };

  return {
    showRewards,
    earnedAchievements,
    showAchievementRewards,
    hideRewards
  };
}
