/**
 * Хук для автоматического отслеживания и проверки достижений
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAchievements } from '../contexts/AchievementsContext';

/**
 * Утилита debounce
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };
  
  return debounced;
}

/**
 * Хук для автоматической проверки достижений при изменении статистики
 */
export function useAchievementTracker() {
  const { checkAndUnlockAchievements } = useAchievements();
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  
  // Debounce для предотвращения частых проверок
  const debouncedCheck = useRef(
    debounce(async () => {
      const unlocked = await checkAndUnlockAchievements();
      if (unlocked.length > 0) {
        setNewlyUnlocked(prev => [...prev, ...unlocked]);
      }
    }, 500)
  ).current;
  
  // Проверка при монтировании
  useEffect(() => {
    debouncedCheck();
    
    // Слушаем изменения в localStorage (если обновляется из другого места)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'menhausen_user_stats') {
        debouncedCheck();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      debouncedCheck.cancel();
    };
  }, [debouncedCheck]);
  
  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);
  
  return {
    newlyUnlocked,
    clearNewlyUnlocked,
    checkAchievements: debouncedCheck
  };
}

