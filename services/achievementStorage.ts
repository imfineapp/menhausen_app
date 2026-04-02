/**
 * Сервис для хранения состояния достижений пользователя
 */

import { UserAchievement, UserAchievementsState } from '../types/achievements';

const STORAGE_KEY = 'menhausen_achievements';
const STORAGE_VERSION = 1;

function getDefaultState(): UserAchievementsState {
  return {
    version: STORAGE_VERSION,
    achievements: {},
    totalXP: 0,
    unlockedCount: 0,
    lastSyncedAt: null
  };
}

function normalizeAchievementPoints(state: UserAchievementsState): UserAchievementsState {
  const achievements = Object.fromEntries(
    Object.entries(state.achievements ?? {}).map(([achievementId, achievement]) => {
      const typedAchievement = achievement as UserAchievement & { xp?: number }
      if (typeof typedAchievement.pointsReward === 'number') {
        return [achievementId, typedAchievement]
      }
      return [
        achievementId,
        {
          ...typedAchievement,
          pointsReward: typeof typedAchievement.xp === 'number' ? typedAchievement.xp : 0,
        },
      ]
    }),
  )

  return { ...state, achievements }
}

/**
 * Загрузка достижений пользователя из localStorage
 */
export function loadUserAchievements(): UserAchievementsState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultState();
    
    const state = JSON.parse(stored) as UserAchievementsState;
    if (state.version < STORAGE_VERSION) {
      return normalizeAchievementPoints(migrateAchievements(state));
    }

    return normalizeAchievementPoints(state);
  } catch (error) {
    console.error('Error loading achievements:', error);
    return getDefaultState();
  }
}

/**
 * Сохранение достижений пользователя в localStorage
 */
export function saveUserAchievements(state: UserAchievementsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
}

/**
 * Обновление конкретного достижения
 */
export function updateAchievement(
  achievementId: string,
  result: { unlocked: boolean; progress: number; pointsReward: number }
): UserAchievementsState {
  const state = loadUserAchievements();
  const existing = state.achievements[achievementId];
  const now = new Date().toISOString();
  
  const updated: UserAchievement = {
    achievementId,
    unlocked: result.unlocked,
    unlockedAt: result.unlocked && !existing?.unlocked 
      ? now 
      : (existing?.unlockedAt || null),
    progress: result.progress,
    pointsReward: result.pointsReward,
    lastChecked: now,
    // Сохраняем флаг shownOnThemeHome, если он был установлен ранее
    shownOnThemeHome: existing?.shownOnThemeHome ?? false,
    // Сохраняем флаг shownOnArticleBack, если он был установлен ранее
    shownOnArticleBack: existing?.shownOnArticleBack ?? false,
    // Сохраняем флаг shownOnHomeAfterCheckin, если он был установлен ранее
    shownOnHomeAfterCheckin: existing?.shownOnHomeAfterCheckin ?? false,
    // Сохраняем флаг shownOnProfile, если он был установлен ранее
    shownOnProfile: existing?.shownOnProfile ?? false
  };
  
  const newAchievements = {
    ...state.achievements,
    [achievementId]: updated
  };
  
  // Пересчет totalXP и unlockedCount
  const totalXP = Object.values(newAchievements)
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.pointsReward, 0);
  
  const unlockedCount = Object.values(newAchievements)
    .filter(a => a.unlocked).length;
  
  const updatedState: UserAchievementsState = {
    ...state,
    achievements: newAchievements,
    totalXP,
    unlockedCount
  };
  
  saveUserAchievements(updatedState);
  return updatedState;
}

/**
 * Получение конкретного достижения
 */
export function getUserAchievement(achievementId: string): UserAchievement | undefined {
  const state = loadUserAchievements();
  return state.achievements[achievementId];
}

/**
 * Миграция достижений при изменении версии
 */
function migrateAchievements(oldState: any): UserAchievementsState {
  const defaultState = getDefaultState();
  const migratedAchievements = Object.fromEntries(
    Object.entries(oldState?.achievements ?? {}).map(([achievementId, achievement]: [string, any]) => {
      if (typeof achievement?.pointsReward === 'number') {
        return [achievementId, achievement]
      }
      const legacyPointsReward = typeof achievement?.xp === 'number' ? achievement.xp : 0
      return [
        achievementId,
        {
          ...achievement,
          pointsReward: legacyPointsReward,
        },
      ]
    }),
  )

  return {
    ...defaultState,
    ...oldState,
    achievements: migratedAchievements,
    version: STORAGE_VERSION
  };
}

/**
 * Сброс достижений (для тестирования)
 */
export function resetAchievements(): void {
  localStorage.removeItem(STORAGE_KEY);
}

