import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeCardManager } from '../../utils/ThemeCardManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ThemeCardManager - ratingComment', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should persist ratingComment together with completed attempt', () => {
    const cardId = 'STRESS-01';
    const answers = { question1: 'A1', question2: 'A2' };
    const rating = 5;
    const ratingComment = 'Great exercise!';

    ThemeCardManager.addCompletedAttempt(cardId, answers, rating, ratingComment);

    const progress = ThemeCardManager.getCardProgress(cardId);
    expect(progress).not.toBeNull();
    expect(progress!.completedAttempts.length).toBe(1);
    expect(progress!.completedAttempts[0].rating).toBe(rating);
    expect(progress!.completedAttempts[0].ratingComment).toBe(ratingComment);
  });
});
