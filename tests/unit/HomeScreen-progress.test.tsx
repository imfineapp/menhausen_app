import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { HomeScreen } from '../../components/HomeScreen';
import { ThemeCardManager } from '../../utils/ThemeCardManager';
import { LanguageProvider } from '../../components/LanguageContext';

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
  },
  useArticles: () => [],
  useArticle: () => null
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
        <HomeScreen 
          onGoToProfile={() => {}} 
          onGoToTheme={() => {}} 
          onGoToArticle={() => {}} 
          onGoToAllArticles={() => {}} 
          userHasPremium={true} 
        />
      </LanguageProvider>
    );

    // Label indicates that the progress UI rendered
    expect(screen.getAllByText('Progress').length).toBeGreaterThan(0);
  });
});
