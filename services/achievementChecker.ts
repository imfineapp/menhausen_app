/**
 * Сервис для проверки условий разблокировки достижений
 */

import { UserStats, AchievementDefinition, ConditionResult } from '../types/achievements';
import { getTotalArticlesCount } from '../utils/articlesList';

/**
 * Тип функции-проверщика условия
 */
type ConditionChecker = (
  userStats: UserStats,
  achievement: AchievementDefinition
) => ConditionResult;

/**
 * Регистр проверщиков условий
 */
const conditionCheckers: Record<string, ConditionChecker> = {
  registration_checkin: (stats, _achievement) => ({
    unlocked: stats.checkins >= 1,
    progress: stats.checkins >= 1 ? 100 : Math.min(100, (stats.checkins / 1) * 100)
  }),
  
  cards_opened: (stats, achievement) => {
    const required = achievement.conditionValue || 0;
    
    // Если условие указывает конкретную тему, проверяем её
    let current: number;
    
    if (achievement.conditionTopicId) {
      current = stats.cardsOpened[achievement.conditionTopicId] || 0;
    } else {
      // Для категории "Free Topic" считаем только бесплатные темы (stress)
      if (achievement.category === 'Free Topic') {
        current = stats.cardsOpened['stress'] || 0;
      } 
      // Для категории "Premium Topics" проверяем условия с несколькими темами
      else if (achievement.category === 'Premium Topics') {
        // Извлекаем количество требуемых тем из conditionValue или описания
        // Например, "5 cards in 2 premium topics" -> requiredTopics = 2
        // Для простоты проверяем только общее количество карточек в premium темах
        // TODO: Доработать для условий типа "5 cards in 2 topics"
        const premiumTopicsData = Object.entries(stats.cardsOpened)
          .filter(([topicId]) => topicId !== 'stress');
        
        current = premiumTopicsData.reduce((sum, [, count]) => sum + count, 0);
        
        // Если указано количество тем, проверяем, что карточки открыты в достаточном количестве тем
        if (achievement.conditionTopicsCount) {
          const topicsWithCards = premiumTopicsData.filter(([, count]) => count > 0).length;
          if (topicsWithCards < achievement.conditionTopicsCount) {
            // Недостаточно тем с открытыми карточками
            return {
              unlocked: false,
              progress: Math.min(100, (topicsWithCards / achievement.conditionTopicsCount) * 50 + (current / required) * 50)
            };
          }
        }
      }
      // Иначе считаем все открытые карточки
      else {
        current = Object.values(stats.cardsOpened).reduce((sum, count) => sum + count, 0);
      }
    }
    
    return {
      unlocked: current >= required,
      progress: required > 0 ? Math.min(100, (current / required) * 100) : 0
    };
  },
  
  topic_completed: (stats, achievement) => {
    const required = achievement.conditionValue || 1;
    
    // Для категории "Free Topic" считаем только бесплатные темы
    let current: number;
    if (achievement.category === 'Free Topic') {
      current = stats.topicsCompleted.filter(id => id === 'stress').length;
    }
    // Для категории "Premium Topics" считаем только premium темы
    else if (achievement.category === 'Premium Topics') {
      current = stats.topicsCompleted.filter(id => id !== 'stress').length;
    }
    // Иначе считаем все завершенные темы
    else {
      current = stats.topicsCompleted.length;
    }
    
    return {
      unlocked: current >= required,
      progress: Math.min(100, (current / required) * 100)
    };
  },
  
  articles_read: (stats, achievement) => {
    // Специальный случай: "Read all articles" (reading_master)
    if (achievement.conditionAllArticles || achievement.id === 'reading_master') {
      const totalArticles = getTotalArticlesCount();
      const current = stats.articlesRead;
      return {
        unlocked: current >= totalArticles,
        progress: totalArticles > 0 ? Math.min(100, (current / totalArticles) * 100) : 0
      };
    }
    
    const required = achievement.conditionValue || 0;
    const current = stats.articlesRead;
    return {
      unlocked: current >= required,
      progress: required > 0 ? Math.min(100, (current / required) * 100) : 0
    };
  },
  
  cards_repeated: (stats, achievement) => {
    const required = achievement.conditionValue || 0;
    
    // Для категории "Premium Topics" считаем только premium карточки
    let current: number;
    if (achievement.category === 'Premium Topics') {
      // Подсчитываем повторения карточек из premium тем
      // Здесь нужна дополнительная логика для определения premium карточек
      // Пока считаем все повторения, но можно доработать
      current = Object.values(stats.cardsRepeated).reduce((sum, count) => sum + count, 0);
    } else {
      // Считаем общее количество повторений
      current = Object.values(stats.cardsRepeated).reduce((sum, count) => sum + count, 0);
    }
    
    return {
      unlocked: current >= required,
      progress: required > 0 ? Math.min(100, (current / required) * 100) : 0
    };
  },
  
  streak: (stats, achievement) => {
    const required = achievement.conditionValue || 0;
    return {
      unlocked: stats.checkinStreak >= required,
      progress: required > 0 ? Math.min(100, (stats.checkinStreak / required) * 100) : 0
    };
  },
  
  topic_repeated: (stats, achievement) => {
    const required = achievement.conditionValue || 1;
    
    // Для категории "Premium Topics" считаем только premium темы
    let current: number;
    if (achievement.category === 'Premium Topics') {
      current = stats.topicsRepeated.filter(id => id !== 'stress').length;
    } else {
      current = stats.topicsRepeated.length;
    }
    
    return {
      unlocked: current >= required,
      progress: Math.min(100, (current / required) * 100)
    };
  },
  
  referral_invite: (stats, achievement) => {
    const required = achievement.conditionValue || 0;
    const current = stats.referralsInvited;
    return {
      unlocked: current >= required,
      progress: required > 0 ? Math.min(100, (current / required) * 100) : 0
    };
  },
  
  referral_premium: (stats, achievement) => {
    const required = achievement.conditionValue || 1;
    const current = stats.referralsPremium;
    return {
      unlocked: current >= required,
      progress: required > 0 ? Math.min(100, (current / required) * 100) : 0
    };
  },
  
  streak_repeat: (stats, achievement) => {
    // Комбинация streak и повторений - берем минимум из обоих
    // Для комбинированных условий (например, cards_opened + streak_repeat):
    // conditionValue может быть занят другим условием, поэтому используем conditionRepeatValue для обоих
    let streakRequired = achievement.conditionValue || 0;
    const repeatRequired = achievement.conditionRepeatValue || 0;
    
    // Если conditionRepeatValue задан, но conditionValue слишком мал или равен 0,
    // это может быть комбинированное условие, где conditionValue занят другим условием
    // В этом случае используем conditionRepeatValue для streak тоже
    if (repeatRequired > 0 && streakRequired === 0) {
      streakRequired = repeatRequired;
    }
    
    const streakProgress = streakRequired > 0 
      ? Math.min(100, (stats.checkinStreak / streakRequired) * 100)
      : 0;
    
    const repeatedCount = Object.values(stats.cardsRepeated).reduce((sum, count) => sum + count, 0);
    const repeatProgress = repeatRequired > 0
      ? Math.min(100, (repeatedCount / repeatRequired) * 100)
      : 0;
    
    // Прогресс = минимум из двух
    const progress = Math.min(streakProgress, repeatProgress);
    const unlocked = streakProgress >= 100 && repeatProgress >= 100;
    
    return { unlocked, progress };
  }
};

/**
 * Проверка условия достижения
 */
export function checkAchievementCondition(
  achievement: AchievementDefinition,
  userStats: UserStats
): ConditionResult {
  const conditionType = achievement.conditionType;
  
  // Простое условие
  if (typeof conditionType === 'string' && !conditionType.includes('+')) {
    const checker = conditionCheckers[conditionType];
    if (!checker) {
      console.warn(`Unknown condition type: ${conditionType}`);
      return { unlocked: false, progress: 0 };
    }
    return checker(userStats, achievement);
  }
  
  // Комбинированное условие
  const conditions = typeof conditionType === 'string' 
    ? conditionType.split('+').map(s => s.trim())
    : conditionType;
  
  const results = conditions.map((condition, index) => {
    const checker = conditionCheckers[condition];
    if (!checker) {
      console.warn(`Unknown condition type: ${condition}`);
      return { unlocked: false, progress: 0 };
    }
    
    // Для комбинированных условий: первое условие использует conditionValue,
    // второе и последующие используют conditionRepeatValue (если доступно)
    // Для streak_repeat в комбинированных условиях: используем conditionRepeatValue для streak,
    // если conditionValue занят другим условием (например, cards_opened)
    let modifiedAchievement = achievement;
    if (index > 0 && achievement.conditionRepeatValue !== undefined) {
      if (condition === 'streak_repeat') {
        // Для streak_repeat в комбинированных условиях используем conditionRepeatValue для обоих
        // (streak и repeat), так как conditionValue занят другим условием
        modifiedAchievement = {
          ...achievement,
          conditionValue: achievement.conditionRepeatValue
        };
      } else {
        // Для других условий просто заменяем conditionValue на conditionRepeatValue
        modifiedAchievement = {
          ...achievement,
          conditionValue: achievement.conditionRepeatValue
        };
      }
    }
    
    return checker(userStats, modifiedAchievement);
  });
  
  // Для комбинированных условий: все должны быть выполнены
  return {
    unlocked: results.every(r => r.unlocked),
    progress: Math.min(...results.map(r => r.progress))
  };
}

/**
 * Проверка всех достижений и возврат ID разблокированных
 */
export function checkAllAchievements(
  achievements: AchievementDefinition[],
  userStats: UserStats
): string[] {
  const unlockedIds: string[] = [];
  
  achievements.forEach(achievement => {
    const result = checkAchievementCondition(achievement, userStats);
    if (result.unlocked) {
      unlockedIds.push(achievement.id);
    }
  });
  
  return unlockedIds;
}

