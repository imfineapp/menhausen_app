/**
 * Централизованный сервис для управления показом достижений на разных экранах
 * Предотвращает дублирование логики и race conditions
 */

import { loadUserAchievements, saveUserAchievements } from './achievementStorage';
import { getAchievementMetadata } from '../utils/achievementsMetadata';
import { UserAchievement } from '../types/achievements';

export type AchievementDisplayScreen = 'theme-home' | 'home' | 'profile' | 'article-back';

export interface AchievementDisplayConfig {
  screen: AchievementDisplayScreen;
  earnedAchievementIds?: string[];
  excludeFromStorageCheck?: string[]; // Исключить из проверки storage (чтобы избежать дублирования)
}

export interface AchievementDisplayResult {
  achievementsToShow: string[];
  shouldNavigate: boolean;
}

/**
 * Определяет, связано ли достижение с карточками
 */
function isCardRelated(conditionTypes: string[]): boolean {
  return conditionTypes.some(type => 
    type === 'cards_opened' || 
    type === 'topic_completed' || 
    type === 'cards_repeated' || 
    type === 'topic_repeated'
  );
}

/**
 * Определяет, связано ли достижение со статьями
 */
function isArticleRelated(conditionTypes: string[]): boolean {
  return conditionTypes.some(type => type === 'articles_read');
}

/**
 * Определяет, связано ли достижение со streak (без карточек)
 */
function isStreakRelated(conditionTypes: string[]): boolean {
  // Если есть условия карточек, не считаем это streak достижением
  if (isCardRelated(conditionTypes)) return false;
  return conditionTypes.some(type => type === 'streak' || type === 'streak_repeat');
}

/**
 * Определяет, связано ли достижение с referral
 */
function isReferralRelated(conditionTypes: string[]): boolean {
  return conditionTypes.some(type => 
    type === 'referral_invite' || type === 'referral_premium'
  );
}

/**
 * Получает флаг показа для конкретного экрана
 */
function getShownFlag(achievement: UserAchievement, screen: AchievementDisplayScreen): boolean {
  switch (screen) {
    case 'theme-home':
      return achievement.shownOnThemeHome ?? false;
    case 'home':
      return achievement.shownOnHomeAfterCheckin ?? false;
    case 'profile':
      return achievement.shownOnProfile ?? false;
    case 'article-back':
      return achievement.shownOnArticleBack ?? false;
    default:
      return false;
  }
}

/**
 * Определяет, должно ли достижение показываться на конкретном экране
 */
function shouldShowOnScreen(
  achievement: UserAchievement,
  metadata: any,
  screen: AchievementDisplayScreen
): boolean {
  if (!achievement.unlocked) return false;
  
  const conditionType = metadata.conditionType;
  const conditionTypes = Array.isArray(conditionType) ? conditionType : [conditionType];
  
  // Проверяем, соответствует ли тип достижения экрану
  switch (screen) {
    case 'theme-home':
      return isCardRelated(conditionTypes);
    case 'home':
      return isStreakRelated(conditionTypes);
    case 'profile':
      return isReferralRelated(conditionTypes);
    case 'article-back':
      return isArticleRelated(conditionTypes);
    default:
      return false;
  }
}

/**
 * Получает список достижений для показа на конкретном экране
 * Объединяет достижения из earnedAchievementIds и из storage
 */
export function getAchievementsToShow(config: AchievementDisplayConfig): AchievementDisplayResult {
  const { screen, earnedAchievementIds = [], excludeFromStorageCheck = [] } = config;
  
  const achievementsState = loadUserAchievements();
  const achievementsToShow: string[] = [];
  const processedIds = new Set<string>();
  
  // Сначала обрабатываем достижения из earnedAchievementIds
  if (earnedAchievementIds.length > 0) {
    for (const achievementId of earnedAchievementIds) {
      if (processedIds.has(achievementId)) continue;
      
      const achievement = achievementsState.achievements[achievementId];
      if (!achievement) continue;
      
      const metadata = getAchievementMetadata(achievementId);
      if (!metadata) continue;
      
      // Проверяем, должно ли это достижение показываться на этом экране
      if (shouldShowOnScreen(achievement, metadata, screen)) {
        // Проверяем, не было ли оно уже показано
        if (!getShownFlag(achievement, screen)) {
          achievementsToShow.push(achievementId);
          processedIds.add(achievementId);
        }
      }
    }
  }
  
  // Затем проверяем все остальные достижения из storage
  // Исключаем те, что уже обработаны или в excludeFromStorageCheck
  for (const [achievementId, achievement] of Object.entries(achievementsState.achievements)) {
    if (processedIds.has(achievementId)) continue;
    if (excludeFromStorageCheck.includes(achievementId)) continue;
    
    const metadata = getAchievementMetadata(achievementId);
    if (!metadata) continue;
    
    // Проверяем, должно ли это достижение показываться на этом экране
    if (shouldShowOnScreen(achievement, metadata, screen)) {
      // Проверяем, не было ли оно уже показано
      if (!getShownFlag(achievement, screen)) {
        achievementsToShow.push(achievementId);
        processedIds.add(achievementId);
      }
    }
  }
  
  return {
    achievementsToShow,
    shouldNavigate: achievementsToShow.length > 0
  };
}

/**
 * Синхронно устанавливает флаги показа для достижений
 * ВАЖНО: Вызывать ПЕРЕД навигацией на reward screen
 */
export function markAchievementsAsShown(
  achievementIds: string[],
  screen: AchievementDisplayScreen
): void {
  if (achievementIds.length === 0) return;
  
  const achievementsState = loadUserAchievements();
  let hasChanges = false;
  
  for (const achievementId of achievementIds) {
    const achievement = achievementsState.achievements[achievementId];
    if (!achievement) continue;
    
    // Устанавливаем соответствующий флаг в зависимости от экрана
    switch (screen) {
      case 'theme-home':
        if (!achievement.shownOnThemeHome) {
          achievement.shownOnThemeHome = true;
          hasChanges = true;
        }
        break;
      case 'home':
        if (!achievement.shownOnHomeAfterCheckin) {
          achievement.shownOnHomeAfterCheckin = true;
          hasChanges = true;
        }
        break;
      case 'profile':
        if (!achievement.shownOnProfile) {
          achievement.shownOnProfile = true;
          hasChanges = true;
        }
        break;
      case 'article-back':
        if (!achievement.shownOnArticleBack) {
          achievement.shownOnArticleBack = true;
          hasChanges = true;
        }
        break;
    }
  }
  
  // Сохраняем изменения синхронно
  if (hasChanges) {
    saveUserAchievements(achievementsState);
    console.log(`[AchievementDisplay] Marked ${achievementIds.length} achievements as shown on ${screen}`);
  }
}

