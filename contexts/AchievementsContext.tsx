/**
 * React Context для управления состоянием достижений
 */

import React, { createContext, useContext, ReactNode } from 'react';
import type { UserAchievement } from '../types/achievements';
import { useStore } from '@nanostores/react';

import {
  $achievements,
  $totalXP,
  $unlockedCount,
  $isAchievementsLoading,
  $achievementsError,
  checkAndUnlockAchievements,
  updateAchievementProgress,
  refreshAchievements
} from '@/src/stores/achievements.store';

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
  const achievements = useStore($achievements)
  const totalXP = useStore($totalXP)
  const unlockedCount = useStore($unlockedCount)
  const isLoading = useStore($isAchievementsLoading)
  const error = useStore($achievementsError)

  const contextValue: AchievementsContextType = {
    achievements,
    totalXP,
    unlockedCount,
    isLoading,
    error,
    checkAndUnlockAchievements,
    updateAchievementProgress,
    refreshAchievements
  }

  return <AchievementsContext.Provider value={contextValue}>{children}</AchievementsContext.Provider>
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

