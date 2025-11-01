/**
 * Типы для системы достижений
 */

export interface AchievementDefinition {
  id: string;
  xp: number;
  iconName: string;
  conditionType: string | string[];
  category: string;
  conditionValue?: number;
  conditionTopicId?: string; // Для условий, зависящих от конкретной темы
  conditionRepeatValue?: number; // Для комбинированных условий (streak_repeat)
  conditionTopicsCount?: number; // Количество требуемых тем (например, "5 cards in 2 topics")
  conditionAllArticles?: boolean; // Для условия "Read all articles" (reading_master)
}

export interface UserStats {
  version: number;
  checkins: number;
  checkinStreak: number;
  lastCheckinDate: string | null;
  cardsOpened: Record<string, number>; // topicId -> count
  topicsCompleted: string[]; // topicIds
  cardsRepeated: Record<string, number>; // cardId -> count
  topicsRepeated: string[]; // topicIds
  articlesRead: number;
  referralsInvited: number;
  referralsPremium: number;
  lastUpdated: string;
}

export interface UserAchievement {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number; // 0-100
  xp: number;
  lastChecked: string;
}

export interface UserAchievementsState {
  version: number;
  achievements: Record<string, UserAchievement>;
  totalXP: number;
  unlockedCount: number;
  lastSyncedAt: string | null;
}

export interface ConditionResult {
  unlocked: boolean;
  progress: number; // 0-100
}

