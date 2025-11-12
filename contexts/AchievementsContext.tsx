/**
 * React Context для управления состоянием достижений
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { UserAchievementsState, UserAchievement } from '../types/achievements';
import { loadUserAchievements, updateAchievement, saveUserAchievements } from '../services/achievementStorage';
import { checkAchievementCondition } from '../services/achievementChecker';
import { loadUserStats } from '../services/userStatsService';
import { getAllAchievementsMetadata } from '../utils/achievementsMetadata';
import { PointsManager } from '../utils/PointsManager';

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
      
      console.log('[AchievementsContext] Checking achievements, userStats:', {
        cardsOpened: userStats.cardsOpened,
        stress: userStats.cardsOpened['stress'] || 0
      });
      
      // Используем функциональное обновление для получения текущего состояния
      // и обновления всех достижений за один раз
      setState(currentState => {
        // ВАЖНО: Загружаем актуальные данные из localStorage, чтобы получить
        // актуальные флаги показа, которые могли быть установлены через markAchievementsAsShown
        const storageState = loadUserAchievements();
        
        const updatedAchievements = { ...currentState.achievements };
        
        // Проверяем все достижения и собираем изменения
        for (const achievement of achievementsDef) {
          const result = checkAchievementCondition(achievement, userStats);
          const existing = updatedAchievements[achievement.id];
          // Получаем актуальные данные из storage для уже разблокированных достижений
          const storageAchievement = storageState.achievements[achievement.id];
          
          const wasUnlocked = existing?.unlocked || false;
          const isNowUnlocked = result.unlocked;
          
          // Логируем проверку для достижения "beginner"
          if (achievement.id === 'beginner') {
            console.log('[AchievementsContext] Checking "beginner" achievement:', {
              conditionType: achievement.conditionType,
              conditionValue: achievement.conditionValue,
              category: achievement.category,
              result: result,
              wasUnlocked: wasUnlocked,
              isNowUnlocked: isNowUnlocked,
              userStatsCardsOpened: userStats.cardsOpened['stress'] || 0
            });
          }
          
          if (isNowUnlocked && !wasUnlocked) {
            console.log('[AchievementsContext] New achievement unlocked:', achievement.id);
            newlyUnlockedRef.current.push(achievement.id);
            
            // Начисляем баллы за разблокировку достижения
            // Используем correlationId для предотвращения повторного начисления
            if (achievement.xp > 0) {
              try {
                const correlationId = `achievement_${achievement.id}`;
                PointsManager.earn(achievement.xp, {
                  correlationId,
                  note: `Achievement unlocked: ${achievement.id}`
                });
              } catch (earnError) {
                console.warn(`Failed to award points for achievement ${achievement.id}:`, earnError);
              }
            }
          }
          
          // Обновляем достижение в локальной копии
          const now = new Date().toISOString();
          
          // Определяем, связано ли достижение с карточками
          const conditionType = achievement.conditionType;
          const conditionTypes = Array.isArray(conditionType) ? conditionType : [conditionType];
          const isCardRelated = conditionTypes.some(type => 
            type === 'cards_opened' || 
            type === 'topic_completed' || 
            type === 'cards_repeated' || 
            type === 'topic_repeated'
          );
          
          // Определяем, связано ли достижение со статьями
          const isArticleRelated = conditionTypes.some(type => 
            type === 'articles_read'
          );
          
          // Определяем, связано ли достижение со streak
          // Для комбинированных: если есть условия карточек, используем логику карточек
          // Иначе если есть streak, используем логику streak
          const isStreakRelated = !isCardRelated && conditionTypes.some(type => 
            type === 'streak' || type === 'streak_repeat'
          );
          
          // Определяем, связано ли достижение с referral
          const isReferralRelated = conditionTypes.some(type => 
            type === 'referral_invite' || type === 'referral_premium'
          );
          
          // Если достижение связано с карточками и только что разблокировано,
          // устанавливаем shownOnThemeHome = false, чтобы показать его на theme-home
          // Если достижение уже было разблокировано, используем актуальное значение флага из storage
          const shouldShowOnThemeHome = isCardRelated && isNowUnlocked && !wasUnlocked;
          
          // Если достижение связано со статьями и только что разблокировано,
          // устанавливаем shownOnArticleBack = false, чтобы показать его при возврате из статьи
          // Если достижение уже было разблокировано, используем актуальное значение флага из storage
          const shouldShowOnArticleBack = isArticleRelated && isNowUnlocked && !wasUnlocked;
          
          // Если достижение связано со streak (без карточек) и только что разблокировано,
          // устанавливаем shownOnHomeAfterCheckin = false, чтобы показать его на home после чекина
          const shouldShowOnHomeAfterCheckin = isStreakRelated && isNowUnlocked && !wasUnlocked;
          
          // Если достижение связано с referral и только что разблокировано,
          // устанавливаем shownOnProfile = false, чтобы показать его на profile
          const shouldShowOnProfile = isReferralRelated && isNowUnlocked && !wasUnlocked;
          
          // Для уже разблокированных достижений используем флаги из storage (актуальные),
          // для новых - устанавливаем false, чтобы показать их
          const currentShownOnThemeHome = storageAchievement?.shownOnThemeHome ?? existing?.shownOnThemeHome ?? false;
          const currentShownOnArticleBack = storageAchievement?.shownOnArticleBack ?? existing?.shownOnArticleBack ?? false;
          const currentShownOnHomeAfterCheckin = storageAchievement?.shownOnHomeAfterCheckin ?? existing?.shownOnHomeAfterCheckin ?? false;
          const currentShownOnProfile = storageAchievement?.shownOnProfile ?? existing?.shownOnProfile ?? false;
          
          updatedAchievements[achievement.id] = {
            achievementId: achievement.id,
            unlocked: result.unlocked,
            unlockedAt: isNowUnlocked && !wasUnlocked ? now : (existing?.unlockedAt || null),
            progress: result.progress,
            xp: achievement.xp,
            lastChecked: now,
            // Если достижение связано с карточками и только что разблокировано, помечаем как не показанное
            // Если уже было разблокировано, используем актуальное значение флага из storage
            shownOnThemeHome: shouldShowOnThemeHome ? false : currentShownOnThemeHome,
            // Если достижение связано со статьями и только что разблокировано, помечаем как не показанное
            // Если уже было разблокировано, используем актуальное значение флага из storage
            shownOnArticleBack: shouldShowOnArticleBack ? false : currentShownOnArticleBack,
            // Если достижение связано со streak (без карточек) и только что разблокировано, помечаем как не показанное
            // Если уже было разблокировано, используем актуальное значение флага из storage
            shownOnHomeAfterCheckin: shouldShowOnHomeAfterCheckin ? false : currentShownOnHomeAfterCheckin,
            // Если достижение связано с referral и только что разблокировано, помечаем как не показанное
            // Если уже было разблокировано, используем актуальное значение флага из storage
            shownOnProfile: shouldShowOnProfile ? false : currentShownOnProfile
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

