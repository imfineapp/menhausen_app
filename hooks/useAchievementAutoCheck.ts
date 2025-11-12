/**
 * Хук для автоматической проверки достижений после обновления статистики
 */

import { useEffect, useRef } from 'react';
import { useAchievements } from '../contexts/AchievementsContext';

/**
 * Хук для автоматической проверки достижений
 * Вызывает проверку при изменении localStorage (через storage event)
 */
export function useAchievementAutoCheck() {
  const { checkAndUnlockAchievements } = useAchievements();
  const checkingRef = useRef(false);

  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      // Отслеживаем изменения статистики пользователя
      if (e.key === 'menhausen_user_stats' && !checkingRef.current) {
        checkingRef.current = true;
        
        try {
          // Небольшая задержка для завершения записи в localStorage
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Проверяем достижения
          const newlyUnlocked = await checkAndUnlockAchievements();
          
          if (newlyUnlocked.length > 0) {
            console.log('New achievements unlocked:', newlyUnlocked);
            // Здесь можно добавить уведомление пользователя
          }
        } catch (error) {
          console.error('Error checking achievements:', error);
        } finally {
          checkingRef.current = false;
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Также проверяем при монтировании компонента
    checkAndUnlockAchievements();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAndUnlockAchievements]);

  return { checkAchievements: checkAndUnlockAchievements };
}



