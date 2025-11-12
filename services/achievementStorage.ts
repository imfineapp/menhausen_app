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

/**
 * Загрузка достижений пользователя из localStorage
 */
export function loadUserAchievements(): UserAchievementsState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultState();
    
    const state = JSON.parse(stored) as UserAchievementsState;
    if (state.version < STORAGE_VERSION) {
      return migrateAchievements(state);
    }
    
    return state;
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
  result: { unlocked: boolean; progress: number; xp: number }
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
    xp: result.xp,
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
    .reduce((sum, a) => sum + a.xp, 0);
  
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
  return {
    ...defaultState,
    ...oldState,
    version: STORAGE_VERSION
  };
}

/**
 * Сброс достижений (для тестирования)
 */
export function resetAchievements(): void {
  localStorage.removeItem(STORAGE_KEY);
}

