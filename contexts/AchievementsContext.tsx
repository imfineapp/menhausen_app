/**
 * React Context для управления состоянием достижений
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { UserAchievementsState, UserAchievement } from '../types/achievements';
import { loadUserAchievements, updateAchievement, saveUserAchievements } from '../services/achievementStorage';
import { checkAchievementCondition } from '../services/achievementChecker';
import { loadUserStats } from '../services/userStatsService';
import { getAllAchievementsMetadata } from '../utils/achievementsMetadata';

interface AchievementsContextType {
  achievements: Record<string, UserAchievement>;
  totalXP: number;
  unlockedCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  checkAndUnlockAchievements: () => Promise<string[]>;
  updateAchievementProgress: (achievementId: string) => void;
  refreshAchievements: () => Promise<void>;
}

const AchievementsContext = createContext<AchievementsContextType | null>(null);

interface AchievementsProviderProps {
  children: ReactNode;
}

export function AchievementsProvider({ children }: AchievementsProviderProps) {
  const [state, setState] = useState<UserAchievementsState>(() => loadUserAchievements());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const newlyUnlockedRef = useRef<string[]>([]);
  
  /**
   * Проверка и разблокировка достижений
   */
  const checkAndUnlockAchievements = useCallback(async (): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    newlyUnlockedRef.current = [];
    
    try {
      const userStats = loadUserStats();
      const achievementsDef = getAllAchievementsMetadata();
      
      // Используем функциональное обновление для получения текущего состояния
      // и обновления всех достижений за один раз
      setState(currentState => {
        const updatedAchievements = { ...currentState.achievements };
        
        // Проверяем все достижения и собираем изменения
        for (const achievement of achievementsDef) {
          const result = checkAchievementCondition(achievement, userStats);
          const existing = updatedAchievements[achievement.id];
          
          const wasUnlocked = existing?.unlocked || false;
          const isNowUnlocked = result.unlocked;
          
          if (isNowUnlocked && !wasUnlocked) {
            newlyUnlockedRef.current.push(achievement.id);
          }
          
          // Обновляем достижение в локальной копии
          const now = new Date().toISOString();
          updatedAchievements[achievement.id] = {
            achievementId: achievement.id,
            unlocked: result.unlocked,
            unlockedAt: isNowUnlocked && !wasUnlocked ? now : (existing?.unlockedAt || null),
            progress: result.progress,
            xp: achievement.xp,
            lastChecked: now
          };
        }
        
        // Пересчитываем totalXP и unlockedCount
        const totalXP = Object.values(updatedAchievements)
          .filter(a => a.unlocked)
          .reduce((sum, a) => sum + a.xp, 0);
        
        const unlockedCount = Object.values(updatedAchievements)
          .filter(a => a.unlocked).length;
        
        const finalState: UserAchievementsState = {
          ...currentState,
          achievements: updatedAchievements,
          totalXP,
          unlockedCount
        };
        
        // Сохраняем в localStorage
        saveUserAchievements(finalState);
        
        return finalState;
      });
      
      // Возвращаем собранный список разблокированных достижений
      return newlyUnlockedRef.current;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error checking achievements:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []); // Убрали зависимость от state.achievements
  
  /**
   * Обновление прогресса конкретного достижения
   */
  const updateAchievementProgress = useCallback((achievementId: string) => {
    try {
      const userStats = loadUserStats();
      const achievementsDef = getAllAchievementsMetadata();
      const achievement = achievementsDef.find(a => a.id === achievementId);
      
      if (!achievement) {
        console.warn(`Achievement not found: ${achievementId}`);
        return;
      }
      
      const result = checkAchievementCondition(achievement, userStats);
      const updatedState = updateAchievement(achievementId, {
        unlocked: result.unlocked,
        progress: result.progress,
        xp: achievement.xp
      });
      
      setState(updatedState);
    } catch (err) {
      console.error('Error updating achievement progress:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);
  
  /**
   * Обновление всех достижений
   */
  const refreshAchievements = useCallback(async () => {
    await checkAndUnlockAchievements();
  }, [checkAndUnlockAchievements]);
  
  // Автоматическая загрузка при монтировании
  useEffect(() => {
    const loaded = loadUserAchievements();
    setState(loaded);
  }, []);
  
  const contextValue: AchievementsContextType = {
    achievements: state.achievements,
    totalXP: state.totalXP,
    unlockedCount: state.unlockedCount,
    isLoading,
    error,
    checkAndUnlockAchievements,
    updateAchievementProgress,
    refreshAchievements
  };
  
  return (
    <AchievementsContext.Provider value={contextValue}>
      {children}
    </AchievementsContext.Provider>
  );
}

/**
 * Хук для использования контекста достижений
 */
export function useAchievements() {
  const context = useContext(AchievementsContext);
  
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  
  return context;
}

