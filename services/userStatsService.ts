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
    readArticleIds: [],
    openedCardIds: [],
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
 * Обновление статистики пользователя.
 * Поддерживает как частичный объект обновлений, так и функциональный апдейтер,
 * который вычисляет новое состояние на основе актуального снимка хранилища.
 * 
 * Использует единообразный подход для обоих типов обновлений:
 * всегда загружает актуальное состояние непосредственно перед сохранением,
 * чтобы избежать race conditions при параллельных вызовах.
 */
export function updateUserStats(
  updatesOrUpdater: Partial<UserStats> | ((current: UserStats) => UserStats)
): UserStats {
  // Загружаем актуальное состояние непосредственно перед вычислением и сохранением
  // Это минимизирует окно для race conditions
  const current = loadUserStats();

  // Вычисляем новое состояние на основе актуального снимка
  const next = typeof updatesOrUpdater === 'function'
    ? (updatesOrUpdater as (c: UserStats) => UserStats)(current)
    : { ...current, ...updatesOrUpdater };

  // Сохраняем результат
  saveUserStats(next);
  return next;
}

/**
 * Миграция статистики при изменении версии
 */
function migrateStats(oldStats: any): UserStats {
  const defaultStats = getDefaultStats();
  return {
    ...defaultStats,
    ...oldStats,
    // гарантируем наличие массива уникальных прочтений
    readArticleIds: Array.isArray(oldStats?.readArticleIds) ? oldStats.readArticleIds : [],
    // гарантируем наличие массива уникально открытых карточек
    openedCardIds: Array.isArray(oldStats?.openedCardIds) ? oldStats.openedCardIds : [],
    version: STORAGE_VERSION
  };
}

/**
 * Увеличить счетчик check-ins и обновить streak
 */
export function incrementCheckin(): UserStats {
  const today = new Date().toISOString().split('T')[0];
  return updateUserStats((current) => {
    const lastDate = current.lastCheckinDate
      ? new Date(current.lastCheckinDate).toISOString().split('T')[0]
      : null;

    if (lastDate === today) {
      return current;
    }

    let newStreak = current.checkinStreak;
    if (!lastDate) {
      newStreak = 1;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      newStreak = lastDate === yesterdayStr ? current.checkinStreak + 1 : 1;
    }

    return {
      ...current,
      checkins: current.checkins + 1,
      checkinStreak: newStreak,
      lastCheckinDate: today
    };
  });
}

/**
 * Увеличить счетчик открытых карточек в теме
 */
export function incrementCardsOpened(topicId: string): UserStats {
  return updateUserStats((current) => {
    const topicCount = current.cardsOpened[topicId] || 0;
    return {
      ...current,
      cardsOpened: {
        ...current.cardsOpened,
        [topicId]: topicCount + 1
      }
    };
  });
}

/**
 * Добавить завершенную тему
 */
export function addTopicCompleted(topicId: string): UserStats {
  return updateUserStats((current) => {
    if (current.topicsCompleted.includes(topicId)) return current;
    return {
      ...current,
      topicsCompleted: [...current.topicsCompleted, topicId]
    };
  });
}

/**
 * Увеличить счетчик повторений карточки
 */
export function incrementCardsRepeated(cardId: string): UserStats {
  return updateUserStats((current) => {
    const repeats = current.cardsRepeated[cardId] || 0;
    return {
      ...current,
      cardsRepeated: {
        ...current.cardsRepeated,
        [cardId]: repeats + 1
      }
    };
  });
}

/**
 * Добавление темы в повторённые темы
 */
export function addTopicRepeated(topicId: string): UserStats {
  return updateUserStats((current) => {
    if (current.topicsRepeated.includes(topicId)) return current;
    return {
      ...current,
      topicsRepeated: [...current.topicsRepeated, topicId]
    };
  });
}

/**
 * Идемпотентная отметка статьи как прочитанной (с учётом уникальности)
 */
export function markArticleRead(articleId: string): UserStats {
  return updateUserStats((current) => {
    const readIds = Array.isArray(current.readArticleIds) ? current.readArticleIds : [];
    if (readIds.includes(articleId)) {
      return current;
    }
    const nextReadIds = [...new Set([...readIds, articleId])];
    return {
      ...current,
      readArticleIds: nextReadIds,
      // держим счетчик в соответствии с источником истины — массивом id
      articlesRead: nextReadIds.length
    };
  });
}

/**
 * Идемпотентная отметка карточки как открытой (с учётом уникальности)
 * Карточка считается открытой после ответа на второй вопрос (когда показывается финальное сообщение)
 */
export function markCardAsOpened(cardId: string): UserStats {
  return updateUserStats((current) => {
    const openedIds = Array.isArray(current.openedCardIds) ? current.openedCardIds : [];
    if (openedIds.includes(cardId)) {
      return current;
    }
    const nextOpenedIds = [...new Set([...openedIds, cardId])];
    return {
      ...current,
      openedCardIds: nextOpenedIds
    };
  });
}

/**
 * Увеличение количества прочитанных статей (устаревшее — оставлено для совместимости)
 */
export function incrementArticlesRead(): UserStats {
  return updateUserStats((current) => ({
    ...current,
    articlesRead: current.articlesRead + 1
  }));
}

/**
 * Увеличить счетчик приглашенных пользователей
 */
export function incrementReferralsInvited(): UserStats {
  return updateUserStats((current) => ({
    ...current,
    referralsInvited: current.referralsInvited + 1
  }));
}

/**
 * Увеличить счетчик покупок premium через рефералов
 */
export function incrementReferralsPremium(): UserStats {
  return updateUserStats((current) => ({
    ...current,
    referralsPremium: current.referralsPremium + 1
  }));
}

/**
 * Сброс статистики (для тестирования)
 */
export function resetUserStats(): void {
  localStorage.removeItem(STORAGE_KEY);
}

