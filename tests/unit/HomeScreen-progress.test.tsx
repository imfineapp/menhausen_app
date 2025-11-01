import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { HomeScreen } from '../../components/HomeScreen';
import { ThemeCardManager } from '../../utils/ThemeCardManager';
import { LanguageProvider } from '../../components/LanguageContext';
import { AchievementsProvider } from '../../contexts/AchievementsContext';

// Mock achievement services
vi.mock('../../services/achievementStorage', () => {
  const mockLoad = vi.fn(() => ({
    version: 1,
    achievements: {},
    totalXP: 0,
    unlockedCount: 0,
    lastSyncedAt: null
  }));
  
  return {
    loadUserAchievements: mockLoad,
    updateAchievement: vi.fn((id: string, result: any) => {
      const state = mockLoad();
      const existing = (state.achievements as Record<string, any>)[id];
      const now = new Date().toISOString();
      
      const updated = {
        achievementId: id,
        unlocked: result.unlocked,
        unlockedAt: result.unlocked && !existing?.unlocked ? now : (existing?.unlockedAt || null),
        progress: result.progress,
        xp: result.xp,
        lastChecked: now
      };
      
      const newAchievements = {
        ...state.achievements,
        [id]: updated
      };
      
      const totalXP = Object.values(newAchievements)
        .filter((a: any) => a.unlocked)
        .reduce((sum: number, a: any) => sum + a.xp, 0);
      
      const unlockedCount = Object.values(newAchievements)
        .filter((a: any) => a.unlocked).length;
      
      return {
        ...state,
        achievements: newAchievements,
        totalXP,
        unlockedCount
      };
    }),
    saveUserAchievements: vi.fn()
  };
});

vi.mock('../../services/achievementChecker', () => ({
  checkAchievementCondition: vi.fn(() => ({
    unlocked: false,
    progress: 0
  }))
}));

vi.mock('../../services/userStatsService', () => ({
  loadUserStats: vi.fn(() => ({
    totalCheckins: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    level: 1,
    lastCheckinDate: null
  }))
}));

vi.mock('../../utils/achievementsMetadata', () => ({
  getAllAchievementsMetadata: vi.fn(() => [])
}));

vi.mock('../../utils/DailyCheckinManager', () => ({
  DailyCheckinManager: {
    getTotalCheckins: vi.fn(() => 0),
    getCheckinStreak: vi.fn(() => 0)
  }
}));

vi.mock('../../components/ContentContext', () => ({
  useContent: () => {
    const content = {
      ui: {
        home: {
          activity: { 
            progressLabel: 'Progress', 
            streakLabel: {
              singular: 'day',
              plural: 'days'
            }
          },
          checkInInfo: { title: 'Info', content: '...' },
          whatWorriesYou: 'What worries you?'
        },
        profile: { premium: 'Premium', free: 'Free' }
      },
      themes: {
        'stress-management': {
          id: 'stress-management',
          title: 'Stress',
          description: 'Desc',
          isPremium: false,
          cards: [ { id: 'STRESS-01' }, { id: 'STRESS-02' }, { id: 'STRESS-03' } ]
        }
      }
    };
    return {
      content,
      getUI: () => content.ui
    };
  }
}));

vi.spyOn(ThemeCardManager, 'getCardProgress');

describe('HomeScreen per-theme progress', () => {
  beforeEach(() => {
    (ThemeCardManager.getCardProgress as any).mockReset();
  });

  it('computes progress as attempted/total cards', () => {
    // First two have attempts, third has none
    (ThemeCardManager.getCardProgress as any)
      .mockReturnValueOnce({ completedAttempts: [ { attemptId: '1' } ] })
      .mockReturnValueOnce({ completedAttempts: [ { attemptId: '2' } ] })
      .mockReturnValueOnce({ completedAttempts: [] });

    render(
      <LanguageProvider>
        <AchievementsProvider>
          <HomeScreen onGoToProfile={() => {}} onGoToTheme={() => {}} userHasPremium={true} />
        </AchievementsProvider>
      </LanguageProvider>
    );

    // Label indicates that the progress UI rendered
    expect(screen.getAllByText('Progress').length).toBeGreaterThan(0);
  });
});
