/**
 * Сервис для управления статистикой пользователя
 */

import { UserStats } from '../types/achievements';

const STORAGE_KEY = 'menhausen_user_stats';
const STORAGE_VERSION = 1;

function getDefaultStats(): UserStats {
  return {
    version: STORAGE_VERSION,
    checkins: 0,
    checkinStreak: 0,
    lastCheckinDate: null,
    cardsOpened: {},
    topicsCompleted: [],
    cardsRepeated: {},
    topicsRepeated: [],
    articlesRead: 0,
    referralsInvited: 0,
    referralsPremium: 0,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Загрузка статистики пользователя из localStorage
 */
export function loadUserStats(): UserStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultStats();
    
    const stats = JSON.parse(stored) as UserStats;
    
    // Миграция данных при обновлении версии
    if (stats.version < STORAGE_VERSION) {
      return migrateStats(stats);
    }
    
    return stats;
  } catch (error) {
    console.error('Error loading user stats:', error);
    return getDefaultStats();
  }
}

/**
 * Сохранение статистики пользователя в localStorage
 */
export function saveUserStats(stats: UserStats): void {
  try {
    const updated = {
      ...stats,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving user stats:', error);
  }
}

/**
 * Обновление статистики пользователя
 */
export function updateUserStats(updates: Partial<UserStats>): UserStats {
  const current = loadUserStats();
  const updated = { ...current, ...updates };
  saveUserStats(updated);
  return updated;
}

/**
 * Миграция статистики при изменении версии
 */
function migrateStats(oldStats: any): UserStats {
  const defaultStats = getDefaultStats();
  return {
    ...defaultStats,
    ...oldStats,
    version: STORAGE_VERSION
  };
}

/**
 * Увеличить счетчик check-ins и обновить streak
 */
export function incrementCheckin(): UserStats {
  const stats = loadUserStats();
  const today = new Date().toISOString().split('T')[0];
  const lastDate = stats.lastCheckinDate 
    ? new Date(stats.lastCheckinDate).toISOString().split('T')[0]
    : null;
  
  // Если уже был чек-ин сегодня, не обновляем
  if (lastDate === today) {
    return stats;
  }
  
  let newStreak = stats.checkinStreak;
  
  if (!lastDate) {
    // Первый чек-ин
    newStreak = 1;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastDate === yesterdayStr) {
      // Продолжение streak
      newStreak = stats.checkinStreak + 1;
    } else {
      // Сброс streak
      newStreak = 1;
    }
  }
  
  return updateUserStats({
    checkins: stats.checkins + 1,
    checkinStreak: newStreak,
    lastCheckinDate: today
  });
}

/**
 * Увеличить счетчик открытых карточек в теме
 */
export function incrementCardsOpened(topicId: string): UserStats {
  const stats = loadUserStats();
  const current = stats.cardsOpened[topicId] || 0;
  return updateUserStats({
    cardsOpened: {
      ...stats.cardsOpened,
      [topicId]: current + 1
    }
  });
}

/**
 * Добавить завершенную тему
 */
export function addTopicCompleted(topicId: string): UserStats {
  const stats = loadUserStats();
  if (stats.topicsCompleted.includes(topicId)) {
    return stats;
  }
  return updateUserStats({
    topicsCompleted: [...stats.topicsCompleted, topicId]
  });
}

/**
 * Увеличить счетчик повторений карточки
 */
export function incrementCardsRepeated(cardId: string): UserStats {
  const stats = loadUserStats();
  const current = stats.cardsRepeated[cardId] || 0;
  return updateUserStats({
    cardsRepeated: {
      ...stats.cardsRepeated,
      [cardId]: current + 1
    }
  });
}

/**
 * Добавить тему с повторенными карточками
 */
export function addTopicRepeated(topicId: string): UserStats {
  const stats = loadUserStats();
  if (stats.topicsRepeated.includes(topicId)) {
    return stats;
  }
  return updateUserStats({
    topicsRepeated: [...stats.topicsRepeated, topicId]
  });
}

/**
 * Увеличить счетчик прочитанных статей
 */
export function incrementArticlesRead(): UserStats {
  const stats = loadUserStats();
  return updateUserStats({
    articlesRead: stats.articlesRead + 1
  });
}

/**
 * Увеличить счетчик приглашенных пользователей
 */
export function incrementReferralsInvited(): UserStats {
  const stats = loadUserStats();
  return updateUserStats({
    referralsInvited: stats.referralsInvited + 1
  });
}

/**
 * Увеличить счетчик покупок premium через рефералов
 */
export function incrementReferralsPremium(): UserStats {
  const stats = loadUserStats();
  return updateUserStats({
    referralsPremium: stats.referralsPremium + 1
  });
}

/**
 * Сброс статистики (для тестирования)
 */
export function resetUserStats(): void {
  localStorage.removeItem(STORAGE_KEY);
}

