import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CardDetailsScreen } from '../../components/CardDetailsScreen';

vi.mock('../../components/ContentContext', () => ({
  useContent: () => ({
    content: {
      ui: {
        themes: { welcome: { start: 'Start' } },
        cards: { attempts: 'Attempts', noAttempts: 'No attempts yet' }
      }
    },
    getLocalizedText: (t: string) => t
  })
}));

// Minimal mock for ThemeCardManager to avoid real storage
vi.mock('../../utils/ThemeCardManager', () => ({
  ThemeCardManager: {
    getCompletedAttempts: () => []
  }
}));

describe('CardDetailsScreen start button', () => {
  it('renders "Start" label and calls onOpenCard when clicked', () => {
    const onOpenCard = vi.fn();
    render(
      <CardDetailsScreen 
        onBack={() => {}}
        onOpenCard={onOpenCard}
        onOpenCheckin={() => {}}
        cardId="STRESS-01"
        cardTitle="STRESS-01"
        cardDescription="desc"
      />
    );

    const button = screen.getByRole('button', { name: 'Start' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onOpenCard).toHaveBeenCalledTimes(1);
  });
});
