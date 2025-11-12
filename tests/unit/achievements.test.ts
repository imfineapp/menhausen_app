import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkAchievementCondition } from '../../services/achievementChecker';
import { 
  incrementCheckin,
  incrementCardsOpened
} from '../../services/userStatsService';
import { 
  loadUserAchievements,
  saveUserAchievements,
  getUserAchievement 
} from '../../services/achievementStorage';
import { AchievementsProvider, useAchievements } from '../../contexts/AchievementsContext';
import { renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { UserStats, AchievementDefinition } from '../../types/achievements';
import { getAllAchievementsMetadata } from '../../utils/achievementsMetadata';

const _STATS_KEY = 'menhausen_user_stats';
const _ACHIEVEMENTS_KEY = 'menhausen_user_achievements';

describe('Achievement System Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Achievement Condition Checking', () => {
    it('should check registration_checkin condition (newcomer)', () => {
      const achievement: AchievementDefinition = {
        id: 'newcomer',
        xp: 50,
        iconName: 'user-plus',
        conditionType: 'registration_checkin',
        category: 'Onboarding',
        conditionValue: 1
      };

      // Проверяем, что достижение не разблокировано без чекинов
      const stats: UserStats = {
        version: 1,
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

      let result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(false);
      expect(result.progress).toBe(0);

      // Проверяем, что достижение разблокировано после 1 чекина
      stats.checkins = 1;
      result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(true);
      expect(result.progress).toBe(100);
    });

    it('should check cards_opened condition for free topic (beginner)', () => {
      const achievement: AchievementDefinition = {
        id: 'beginner',
        xp: 120,
        iconName: 'sprout',
        conditionType: 'cards_opened',
        category: 'Free Topic',
        conditionValue: 3
      };

      const stats: UserStats = {
        version: 1,
        checkins: 0,
        checkinStreak: 0,
        lastCheckinDate: null,
        cardsOpened: { stress: 0 },
        topicsCompleted: [],
        cardsRepeated: {},
        topicsRepeated: [],
        articlesRead: 0,
        referralsInvited: 0,
        referralsPremium: 0,
        lastUpdated: new Date().toISOString()
      };

      // 0 карточек - не разблокировано
      let result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(false);
      expect(result.progress).toBe(0);

      // 2 карточки - не разблокировано, прогресс 66.67%
      stats.cardsOpened.stress = 2;
      result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(false);
      expect(result.progress).toBeCloseTo(66.67, 1);

      // 3 карточки - разблокировано
      stats.cardsOpened.stress = 3;
      result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(true);
      expect(result.progress).toBe(100);
    });

    it('should check topic_completed condition (topic_closer)', () => {
      const achievement: AchievementDefinition = {
        id: 'topic_closer',
        xp: 400,
        iconName: 'check-circle',
        conditionType: 'topic_completed',
        category: 'Free Topic',
        conditionValue: 10
      };

      const stats: UserStats = {
        version: 1,
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

      // Нет завершенных тем
      let result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(false);
      expect(result.progress).toBe(0);

      // 5 завершенных тем в бесплатной теме (но нужно 10)
      stats.topicsCompleted = Array(5).fill('stress');
      result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(false);
      expect(result.progress).toBe(50);

      // 10 завершенных тем - разблокировано
      stats.topicsCompleted = Array(10).fill('stress');
      result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(true);
      expect(result.progress).toBe(100);
    });

    it('should check articles_read condition (basic_reader)', () => {
      const achievement: AchievementDefinition = {
        id: 'basic_reader',
        xp: 450,
        iconName: 'book-open',
        conditionType: 'articles_read',
        category: 'Articles',
        conditionValue: 3
      };

      const stats: UserStats = {
        version: 1,
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

      // 0 статей
      let result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(false);
      expect(result.progress).toBe(0);

      // 2 статьи
      stats.articlesRead = 2;
      result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(false);
      expect(result.progress).toBeCloseTo(66.67, 1);

      // 3 статьи - разблокировано
      stats.articlesRead = 3;
      result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(true);
      expect(result.progress).toBe(100);
    });

    it('should check streak condition (first_chapter_hero)', () => {
      const achievement: AchievementDefinition = {
        id: 'first_chapter_hero',
        xp: 800,
        iconName: 'award',
        conditionType: 'streak',
        category: 'Streak',
        conditionValue: 10
      };

      const stats: UserStats = {
        version: 1,
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

      // Streak 0
      let result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(false);
      expect(result.progress).toBe(0);

      // Streak 5
      stats.checkinStreak = 5;
      result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(false);
      expect(result.progress).toBe(50);

      // Streak 10 - разблокировано
      stats.checkinStreak = 10;
      result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(true);
      expect(result.progress).toBe(100);
    });
  });

  describe('Achievement Unlocking Flow', () => {
    it('should unlock newcomer achievement after first checkin', async () => {
      // Очищаем состояние
      localStorage.clear();

      // Проверяем, что достижение еще не разблокировано
      expect(getUserAchievement('newcomer')).toBeUndefined();

      // Проверяем достижения через контекст
      const wrapper = ({ children }: { children: ReactNode }) => 
        React.createElement(AchievementsProvider, null, children);

      const { result } = renderHook(() => useAchievements(), { wrapper });

      // Ждем, пока контекст загрузится
      await waitFor(() => {
        expect(result.current.achievements).toBeDefined();
      });

      // Проверяем начальное состояние - достижение не разблокировано
      expect(result.current.achievements['newcomer']?.unlocked).toBeFalsy();

      // Делаем первый чекин
      incrementCheckin();

      // Проверяем достижения
      const _newlyUnlocked = await result.current.checkAndUnlockAchievements();
      
      // Ждем, пока состояние обновится
      await waitFor(() => {
        const achievement = result.current.achievements['newcomer'];
        expect(achievement).toBeDefined();
        expect(achievement?.unlocked).toBe(true);
        expect(achievement?.unlockedAt).not.toBeNull();
        expect(achievement?.xp).toBe(50);
        expect(achievement?.progress).toBe(100);
      });

      // Также проверяем через getUserAchievement
      const achievement = getUserAchievement('newcomer');
      expect(achievement).toBeDefined();
      expect(achievement?.unlocked).toBe(true);
      expect(achievement?.xp).toBe(50);
    });

    it('should unlock beginner achievement after opening 3 stress cards', async () => {
      localStorage.clear();

      const wrapper = ({ children }: { children: ReactNode }) => 
        React.createElement(AchievementsProvider, null, children);

      const { result } = renderHook(() => useAchievements(), { wrapper });

      // Ждем, пока контекст загрузится
      await waitFor(() => {
        expect(result.current.achievements).toBeDefined();
      });

      // Проверяем начальное состояние
      const initialAchievement = getUserAchievement('beginner');
      const wasUnlockedBefore = initialAchievement?.unlocked || false;

      // Открываем 3 карточки в теме стресс
      incrementCardsOpened('stress');
      incrementCardsOpened('stress');
      incrementCardsOpened('stress');

      // Проверяем достижения
      const newlyUnlocked = await result.current.checkAndUnlockAchievements();
      
      // Проверяем, что достижение разблокировано
      await waitFor(() => {
        const achievement = getUserAchievement('beginner');
        expect(achievement).toBeDefined();
        expect(achievement?.unlocked).toBe(true);
        expect(achievement?.xp).toBe(120);
        
        // Если достижение не было разблокировано ранее, оно должно быть в списке новых
        if (!wasUnlockedBefore) {
          expect(newlyUnlocked).toContain('beginner');
        }
      });
    });

    it('should unlock seeker achievement after opening 5 stress cards', async () => {
      localStorage.clear();

      const wrapper = ({ children }: { children: ReactNode }) => 
        React.createElement(AchievementsProvider, null, children);

      const { result } = renderHook(() => useAchievements(), { wrapper });

      // Ждем, пока контекст загрузится
      await waitFor(() => {
        expect(result.current.achievements).toBeDefined();
      });

      // Проверяем начальное состояние
      const initialAchievement = getUserAchievement('seeker');
      const wasUnlockedBefore = initialAchievement?.unlocked || false;

      // Открываем 5 карточек
      for (let i = 0; i < 5; i++) {
        incrementCardsOpened('stress');
      }

      // Проверяем достижения
      const newlyUnlocked = await result.current.checkAndUnlockAchievements();

      await waitFor(() => {
        const achievement = getUserAchievement('seeker');
        expect(achievement).toBeDefined();
        expect(achievement?.unlocked).toBe(true);
        expect(achievement?.xp).toBe(200);
        
        // Если достижение не было разблокировано ранее, оно должно быть в списке новых
        if (!wasUnlockedBefore) {
          expect(newlyUnlocked).toContain('seeker');
        }
      });
    });

    it('should track progress for achievements not yet unlocked', async () => {
      localStorage.clear();

      // Открываем только 2 карточки (нужно 3 для beginner)
      incrementCardsOpened('stress');
      incrementCardsOpened('stress');

      const wrapper = ({ children }: { children: ReactNode }) => 
        React.createElement(AchievementsProvider, null, children);

      const { result } = renderHook(() => useAchievements(), { wrapper });

      // Ждем, пока контекст загрузится
      await waitFor(() => {
        expect(result.current.achievements).toBeDefined();
      });

      await waitFor(async () => {
        await result.current.checkAndUnlockAchievements();
      }, { timeout: 5000 });

      // Проверяем через состояние контекста, так как getUserAchievement может не возвращать незаблокированные
      await waitFor(() => {
        const achievement = result.current.achievements['beginner'];
        expect(achievement).toBeDefined();
        expect(achievement?.unlocked).toBe(false);
        expect(achievement?.progress).toBeCloseTo(66.67, 1); // 2/3 * 100
      });
    });

    it('should not unlock achievement twice', async () => {
      localStorage.clear();

      const wrapper = ({ children }: { children: ReactNode }) => 
        React.createElement(AchievementsProvider, null, children);

      const { result } = renderHook(() => useAchievements(), { wrapper });

      // Ждем, пока контекст загрузится
      await waitFor(() => {
        expect(result.current.achievements).toBeDefined();
      });

      // Разблокируем достижение первый раз
      incrementCheckin();
      const _newlyUnlocked1 = await result.current.checkAndUnlockAchievements();
      
      // Ждем, пока состояние обновится
      await waitFor(() => {
        const achievement = result.current.achievements['newcomer'];
        expect(achievement).toBeDefined();
        expect(achievement?.unlocked).toBe(true);
      });
      
      // Проверяем, что достижение разблокировано
      const achievement1 = result.current.achievements['newcomer'];
      expect(achievement1).toBeDefined();
      expect(achievement1?.unlocked).toBe(true);
      
      const firstUnlockTime = achievement1?.unlockedAt;
      expect(firstUnlockTime).not.toBeNull();

      // Пытаемся разблокировать снова
      const newlyUnlocked2 = await result.current.checkAndUnlockAchievements();
      expect(newlyUnlocked2).not.toContain('newcomer');

      // Проверяем, что время разблокировки не изменилось
      const achievement2 = result.current.achievements['newcomer'];
      const secondUnlockTime = achievement2?.unlockedAt;
      expect(secondUnlockTime).toBe(firstUnlockTime);
    });

    it('should calculate totalXP and unlockedCount correctly', async () => {
      localStorage.clear();

      // Разблокируем несколько достижений
      incrementCheckin(); // newcomer (50 XP)
      for (let i = 0; i < 3; i++) {
        incrementCardsOpened('stress'); // beginner (120 XP)
      }

      const wrapper = ({ children }: { children: ReactNode }) => 
        React.createElement(AchievementsProvider, null, children);

      const { result } = renderHook(() => useAchievements(), { wrapper });

      await waitFor(async () => {
        await result.current.checkAndUnlockAchievements();
      });

      await waitFor(() => {
        expect(result.current.unlockedCount).toBeGreaterThanOrEqual(2);
        expect(result.current.totalXP).toBeGreaterThanOrEqual(170); // 50 + 120
      });
    });
  });

  describe('Achievement Storage', () => {
    it('should save and load achievements from localStorage', () => {
      localStorage.clear();

      const initialState = loadUserAchievements();
      expect(initialState.achievements).toEqual({});
      expect(initialState.totalXP).toBe(0);
      expect(initialState.unlockedCount).toBe(0);

      // Создаем тестовое достижение
      const testAchievement = {
        achievementId: 'test_achievement',
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        progress: 100,
        xp: 100,
        lastChecked: new Date().toISOString()
      };

      const state = {
        version: 1,
        achievements: {
          test_achievement: testAchievement
        },
        totalXP: 100,
        unlockedCount: 1,
        lastSyncedAt: null
      };

      saveUserAchievements(state);

      // Загружаем обратно
      const loaded = loadUserAchievements();
      expect(loaded.achievements.test_achievement).toBeDefined();
      expect(loaded.achievements.test_achievement.unlocked).toBe(true);
      expect(loaded.totalXP).toBe(100);
      expect(loaded.unlockedCount).toBe(1);
    });

    it('should get specific achievement by ID', () => {
      localStorage.clear();

      const testAchievement = {
        achievementId: 'test_achievement',
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        progress: 100,
        xp: 100,
        lastChecked: new Date().toISOString()
      };

      const state = {
        version: 1,
        achievements: {
          test_achievement: testAchievement
        },
        totalXP: 100,
        unlockedCount: 1,
        lastSyncedAt: null
      };

      saveUserAchievements(state);

      const achievement = getUserAchievement('test_achievement');
      expect(achievement).toEqual(testAchievement);

      const missing = getUserAchievement('missing_achievement');
      expect(missing).toBeUndefined();
    });
  });

  describe('Combined Conditions', () => {
    it('should handle achievements with multiple conditions', () => {
      // Например, hero_secrets требует: cards_repeated + streak
      const achievement: AchievementDefinition = {
        id: 'hero_secrets',
        xp: 500,
        iconName: 'key',
        conditionType: ['cards_repeated', 'streak'],
        category: 'Repetition & Streak',
        conditionValue: 5,
        conditionRepeatValue: 5
      };

      const stats: UserStats = {
        version: 1,
        checkins: 0,
        checkinStreak: 0,
        lastCheckinDate: null,
        cardsOpened: {},
        topicsCompleted: [],
        cardsRepeated: { 'STRESS-01': 5 },
        topicsRepeated: [],
        articlesRead: 0,
        referralsInvited: 0,
        referralsPremium: 0,
        lastUpdated: new Date().toISOString()
      };

      // Есть повторения, но нет streak
      let result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(false);

      // Добавляем streak
      stats.checkinStreak = 3;
      result = checkAchievementCondition(achievement, stats);
      // Оба условия должны быть выполнены для разблокировки
      expect(result.unlocked).toBe(false); // Нужен streak >= 5

      stats.checkinStreak = 5;
      result = checkAchievementCondition(achievement, stats);
      expect(result.unlocked).toBe(true);
    });
  });

  describe('Real Achievement Definitions', () => {
    it('should validate all achievement definitions are loadable', () => {
      const achievements = getAllAchievementsMetadata();
      expect(achievements.length).toBeGreaterThan(0);

      // Проверяем наличие основных достижений
      const ids = achievements.map(a => a.id);
      expect(ids).toContain('newcomer');
      expect(ids).toContain('beginner');
      expect(ids).toContain('seeker');
      expect(ids).toContain('apprentice');
    });

    it('should check conditions for all loaded achievements with default stats', () => {
      const achievements = getAllAchievementsMetadata();
      const defaultStats: UserStats = {
        version: 1,
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

      // Проверяем, что все достижения могут быть проверены без ошибок
      achievements.forEach(achievement => {
        expect(() => {
          const result = checkAchievementCondition(achievement, defaultStats);
          expect(result).toHaveProperty('unlocked');
          expect(result).toHaveProperty('progress');
          expect(typeof result.unlocked).toBe('boolean');
          expect(typeof result.progress).toBe('number');
          expect(result.progress).toBeGreaterThanOrEqual(0);
          expect(result.progress).toBeLessThanOrEqual(100);
        }).not.toThrow();
      });
    });
  });
});

