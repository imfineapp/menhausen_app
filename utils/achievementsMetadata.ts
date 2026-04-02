/**
 * Утилита для загрузки метаданных достижений
 */

import { AchievementDefinition } from '../types/achievements';
import metadata from '../data/achievements-metadata.json';

/**
 * Загрузка всех метаданных достижений
 */
export function getAllAchievementsMetadata(): AchievementDefinition[] {
  return metadata as AchievementDefinition[];
}

/**
 * Получение метаданных достижения по ID
 */
export function getAchievementMetadata(achievementId: string): AchievementDefinition | undefined {
  const allMetadata = getAllAchievementsMetadata();
  return allMetadata.find(achievement => achievement.id === achievementId);
}

/**
 * Получение всех ID достижений
 */
export function getAllAchievementIds(): string[] {
  return getAllAchievementsMetadata().map(achievement => achievement.id);
}

