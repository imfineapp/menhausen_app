import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkAchievementCondition } from '../../services/achievementChecker';
import type { AchievementDefinition, UserStats } from '../../types/achievements';

vi.mock('../../utils/articlesList', () => ({
  getTotalArticlesCount: () => 7
}));

const baseStats: UserStats = {
  version: 1,
  checkins: 0,
  checkinStreak: 0,
  lastCheckinDate: null,
  cardsOpened: {},
  topicsCompleted: [],
  cardsRepeated: {},
  topicsRepeated: [],
  articlesRead: 0,
  readArticleIds: [],
  referralsInvited: 0,
  referralsPremium: 0,
  lastUpdated: new Date().toISOString()
};

describe('achievementChecker additional cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reading_master unlocked only when all articles read (uses mocked total)', () => {
    const ach: AchievementDefinition = {
      id: 'reading_master', xp: 100, iconName: 'library',
      conditionType: 'articles_read', category: 'Articles', conditionAllArticles: true
    };
    const s1 = { ...baseStats, articlesRead: 6 };
    const r1 = checkAchievementCondition(ach, s1);
    expect(r1.unlocked).toBe(false);
    expect(r1.progress).toBeGreaterThan(0);

    const s2 = { ...baseStats, articlesRead: 7 };
    const r2 = checkAchievementCondition(ach, s2);
    expect(r2.unlocked).toBe(true);
    expect(r2.progress).toBe(100);
  });

  it('streak_repeat requires both streak and repeats (min progress)', () => {
    const ach: AchievementDefinition = {
      id: 'combo', xp: 100, iconName: 'repeat', conditionType: 'streak_repeat', category: 'Combo',
      conditionValue: 5, conditionRepeatValue: 3
    };
    const partial = { ...baseStats, checkinStreak: 5, cardsRepeated: { c1: 1 } };
    const r1 = checkAchievementCondition(ach, partial);
    expect(r1.unlocked).toBe(false);
    expect(r1.progress).toBeLessThan(100);

    const ok = { ...baseStats, checkinStreak: 5, cardsRepeated: { c1: 3 } };
    const r2 = checkAchievementCondition(ach, ok);
    expect(r2.unlocked).toBe(true);
    expect(r2.progress).toBe(100);
  });
});