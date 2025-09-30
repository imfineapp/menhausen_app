import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeWelcomeScreen } from '../../components/ThemeWelcomeScreen';
import { ThemeCardManager } from '../../utils/ThemeCardManager';

vi.mock('../../components/ContentContext', () => ({
  useContent: () => ({
    content: { ui: { themes: { welcome: { start: 'Start', subtitle: 'Welcome' } } } },
    getLocalizedText: (t: string) => t,
    getTheme: (id: string) => ({ id, title: 'Theme', description: 'Desc', isPremium: false, cards: [ { id: 'STRESS-01' }, { id: 'STRESS-02' } ] })
  })
}));

vi.spyOn(ThemeCardManager, 'getCardProgress');

describe('ThemeWelcomeScreen gating', () => {
  beforeEach(() => {
    (ThemeCardManager.getCardProgress as any).mockReset();
  });

  it('renders welcome when first card has no attempts', () => {
    (ThemeCardManager.getCardProgress as any).mockReturnValueOnce({ completedAttempts: [] });
    render(
      <ThemeWelcomeScreen 
        onBack={() => {}}
        onStart={vi.fn()}
        onUnlock={() => {}}
        themeTitle="stress-management"
        isPremiumTheme={false}
        userHasPremium={true}
      />
    );
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  it('skips welcome when first card has attempts', () => {
    const onStart = vi.fn();
    (ThemeCardManager.getCardProgress as any).mockReturnValueOnce({ completedAttempts: [ { attemptId: 'x' } ], isCompleted: true });
    render(
      <ThemeWelcomeScreen 
        onBack={() => {}}
        onStart={onStart}
        onUnlock={() => {}}
        themeTitle="stress-management"
        isPremiumTheme={false}
        userHasPremium={true}
      />
    );
    // Component should render nothing; welcome content absent
    expect(screen.queryByText('Welcome')).toBeNull();
  });
});
