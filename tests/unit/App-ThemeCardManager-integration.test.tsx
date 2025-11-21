import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeCardManager } from '../../utils/ThemeCardManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('App-ThemeCardManager Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should save user answers and rating correctly', () => {
    const cardId = 'STRESS-01';
    const userAnswers = {
      question1: 'I feel stressed when I have too many deadlines',
      question2: 'I expect myself to handle everything perfectly'
    };
    const rating = 4;

    // Simulate the handleCompleteRating function logic
    const completedAttempt = ThemeCardManager.addCompletedAttempt(
      cardId,
      userAnswers,
      rating
    );

    // Verify the attempt was saved
    expect(completedAttempt).toBeDefined();
    expect(completedAttempt.cardId).toBe(cardId);
    expect(completedAttempt.isCompleted).toBe(true);
    expect(completedAttempt.totalCompletedAttempts).toBe(1);
    expect(completedAttempt.completedAttempts).toHaveLength(1);

    const savedAttempt = completedAttempt.completedAttempts[0];
    expect(savedAttempt.answers).toEqual(userAnswers);
    expect(savedAttempt.rating).toBe(rating);
    expect(savedAttempt.attemptId).toMatch(/^STRESS-01_\d{4}-\d{2}-\d{2}_1$/);
    expect(savedAttempt.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(savedAttempt.completedAt).toBeDefined();
  });

  it('should allow multiple attempts for the same card', () => {
    const cardId = 'STRESS-01';
    const firstAnswers = {
      question1: 'First attempt answer 1',
      question2: 'First attempt answer 2'
    };
    const secondAnswers = {
      question1: 'Second attempt answer 1',
      question2: 'Second attempt answer 2'
    };

    // First attempt
    const _firstAttempt = ThemeCardManager.addCompletedAttempt(
      cardId,
      firstAnswers,
      3
    );

    // Second attempt
    const secondAttempt = ThemeCardManager.addCompletedAttempt(
      cardId,
      secondAnswers,
      5
    );

    // Verify both attempts were saved
    expect(secondAttempt.totalCompletedAttempts).toBe(2);
    expect(secondAttempt.completedAttempts).toHaveLength(2);

    // Verify first attempt
    const savedFirstAttempt = secondAttempt.completedAttempts[0];
    expect(savedFirstAttempt.answers).toEqual(firstAnswers);
    expect(savedFirstAttempt.rating).toBe(3);

    // Verify second attempt
    const savedSecondAttempt = secondAttempt.completedAttempts[1];
    expect(savedSecondAttempt.answers).toEqual(secondAnswers);
    expect(savedSecondAttempt.rating).toBe(5);
    expect(savedSecondAttempt.attemptId).toMatch(/^STRESS-01_\d{4}-\d{2}-\d{2}_2$/);
  });

  it('should persist data across sessions', () => {
    const cardId = 'STRESS-01';
    const userAnswers = {
      question1: 'Persistent answer 1',
      question2: 'Persistent answer 2'
    };
    const rating = 4;

    // Save attempt
    ThemeCardManager.addCompletedAttempt(cardId, userAnswers, rating);

    // Simulate app restart by getting fresh data
    const retrievedProgress = ThemeCardManager.getCardProgress(cardId);

    // Verify data was persisted
    expect(retrievedProgress).toBeDefined();
    expect(retrievedProgress!.cardId).toBe(cardId);
    expect(retrievedProgress!.isCompleted).toBe(true);
    expect(retrievedProgress!.totalCompletedAttempts).toBe(1);
    expect(retrievedProgress!.completedAttempts).toHaveLength(1);

    const savedAttempt = retrievedProgress!.completedAttempts[0];
    expect(savedAttempt.answers).toEqual(userAnswers);
    expect(savedAttempt.rating).toBe(rating);
  });

  it('should handle empty answers gracefully', () => {
    const cardId = 'STRESS-01';
    const emptyAnswers = {};
    const rating = 2;

    const completedAttempt = ThemeCardManager.addCompletedAttempt(
      cardId,
      emptyAnswers,
      rating
    );

    expect(completedAttempt).toBeDefined();
    expect(completedAttempt.completedAttempts[0].answers).toEqual({});
    expect(completedAttempt.completedAttempts[0].rating).toBe(2);
  });

  it('should save completed attempt with rating 0 when rating is skipped', () => {
    const cardId = 'STRESS-03';
    const userAnswers = {
      question1: 'Answer 1',
      question2: 'Answer 2'
    };
    const rating = 0; // Rating skipped

    // Simulate the handleCompleteRating function logic when rating is skipped
    const completedAttempt = ThemeCardManager.addCompletedAttempt(
      cardId,
      userAnswers,
      rating
    );

    // Verify the attempt was saved with rating 0
    expect(completedAttempt).toBeDefined();
    expect(completedAttempt.cardId).toBe(cardId);
    expect(completedAttempt.isCompleted).toBe(true);
    expect(completedAttempt.totalCompletedAttempts).toBe(1);
    expect(completedAttempt.completedAttempts).toHaveLength(1);

    const savedAttempt = completedAttempt.completedAttempts[0];
    expect(savedAttempt.answers).toEqual(userAnswers);
    expect(savedAttempt.rating).toBe(0);
    expect(savedAttempt.ratingComment).toBeUndefined();
  });
});
