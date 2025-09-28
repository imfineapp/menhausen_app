import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeCardManager, CardProgress } from '../../utils/ThemeCardManager';

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

describe('ThemeCardManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Card Progress Management', () => {
    it('should save and retrieve card progress', () => {
      const testCardId = 'card-1';
      const testProgress: CardProgress = {
        cardId: testCardId,
        completedAttempts: [],
        isCompleted: false,
        totalCompletedAttempts: 0
      };

      ThemeCardManager.saveCardProgress(testCardId, testProgress);
      const loadedProgress = ThemeCardManager.getCardProgress(testCardId);

      expect(loadedProgress).toEqual(testProgress);
    });

    it('should return null for non-existent card progress', () => {
      const loadedProgress = ThemeCardManager.getCardProgress('non-existent-card');
      expect(loadedProgress).toBeNull();
    });

    it('should clear card progress', () => {
      const testCardId = 'card-1';
      const testProgress: CardProgress = {
        cardId: testCardId,
        completedAttempts: [],
        isCompleted: false,
        totalCompletedAttempts: 0
      };

      ThemeCardManager.saveCardProgress(testCardId, testProgress);
      ThemeCardManager.clearCardProgress(testCardId);
      const loadedProgress = ThemeCardManager.getCardProgress(testCardId);

      expect(loadedProgress).toBeNull();
    });

    it('should clear all theme progress', () => {
      const allCardIds = ['card-1', 'card-2', 'card-3'];
      
      // Save progress for all cards
      allCardIds.forEach(cardId => {
        const progress: CardProgress = {
          cardId,
          completedAttempts: [],
          isCompleted: false,
          totalCompletedAttempts: 0
        };
        ThemeCardManager.saveCardProgress(cardId, progress);
      });

      ThemeCardManager.clearAllThemeProgress(allCardIds);

      // Check that all progress is cleared
      allCardIds.forEach(cardId => {
        expect(ThemeCardManager.getCardProgress(cardId)).toBeNull();
      });
    });
  });

  describe('Completed Attempts Management', () => {
    it('should add completed attempt to card', () => {
      const testCardId = 'card-1';
      const answers = { 'question-1': 'Answer 1', 'question-2': 'Answer 2' };
      const rating = 4;

      const updatedProgress = ThemeCardManager.addCompletedAttempt(testCardId, answers, rating);

      expect(updatedProgress.cardId).toBe(testCardId);
      expect(updatedProgress.completedAttempts).toHaveLength(1);
      expect(updatedProgress.isCompleted).toBe(true);
      expect(updatedProgress.totalCompletedAttempts).toBe(1);

      const attempt = updatedProgress.completedAttempts[0];
      expect(attempt.answers).toEqual(answers);
      expect(attempt.rating).toBe(rating);
      expect(attempt.attemptId).toMatch(/^card-1_\d{4}-\d{2}-\d{2}_1$/);
    });

    it('should add multiple completed attempts', () => {
      const testCardId = 'card-1';
      const answers1 = { 'question-1': 'Answer 1', 'question-2': 'Answer 2' };
      const answers2 = { 'question-1': 'Answer 3', 'question-2': 'Answer 4' };

      ThemeCardManager.addCompletedAttempt(testCardId, answers1, 4);
      const updatedProgress = ThemeCardManager.addCompletedAttempt(testCardId, answers2, 5);

      expect(updatedProgress.completedAttempts).toHaveLength(2);
      expect(updatedProgress.totalCompletedAttempts).toBe(2);
      expect(updatedProgress.completedAttempts[1].attemptId).toMatch(/^card-1_\d{4}-\d{2}-\d{2}_2$/);
    });

    it('should get completed attempts for card', () => {
      const testCardId = 'card-1';
      const answers = { 'question-1': 'Answer 1', 'question-2': 'Answer 2' };

      ThemeCardManager.addCompletedAttempt(testCardId, answers, 4);
      const attempts = ThemeCardManager.getCompletedAttempts(testCardId);

      expect(attempts).toHaveLength(1);
      expect(attempts[0].answers).toEqual(answers);
      expect(attempts[0].rating).toBe(4);
    });

    it('should get specific completed attempt by attempt ID', () => {
      const testCardId = 'card-1';
      const answers = { 'question-1': 'Answer 1', 'question-2': 'Answer 2' };

      const updatedProgress = ThemeCardManager.addCompletedAttempt(testCardId, answers, 4);
      const attemptId = updatedProgress.completedAttempts[0].attemptId;

      const attempt = ThemeCardManager.getCompletedAttempt(testCardId, attemptId);

      expect(attempt).not.toBeNull();
      expect(attempt?.attemptId).toBe(attemptId);
      expect(attempt?.answers).toEqual(answers);
    });

    it('should return null for non-existent completed attempt', () => {
      const attempt = ThemeCardManager.getCompletedAttempt('card-1', 'non-existent-attempt');
      expect(attempt).toBeNull();
    });
  });

  describe('Card Completion Status', () => {
    it('should return NOT_STARTED for card with no completed attempts', () => {
      const status = ThemeCardManager.getCardCompletionStatus('card-1');
      expect(status).toBe('not_started');
    });

    it('should return COMPLETED for card with completed attempts', () => {
      const testCardId = 'card-1';
      const answers = { 'question-1': 'Answer 1', 'question-2': 'Answer 2' };

      ThemeCardManager.addCompletedAttempt(testCardId, answers, 4);
      const status = ThemeCardManager.getCardCompletionStatus(testCardId);

      expect(status).toBe('completed');
    });
  });

  describe('Progressive Unlocking Logic', () => {
    const allCardIds = ['card-1', 'card-2', 'card-3'];

    it('should make first card available by default', () => {
      const isAvailable = ThemeCardManager.isCardAvailable('card-1', allCardIds);
      expect(isAvailable).toBe(true);
    });

    it('should make card available only if previous card is completed', () => {
      // card-2 should not be available initially
      let isAvailable = ThemeCardManager.isCardAvailable('card-2', allCardIds);
      expect(isAvailable).toBe(false);

      // Complete card-1
      const answers = { 'question-1': 'Answer 1', 'question-2': 'Answer 2' };
      ThemeCardManager.addCompletedAttempt('card-1', answers, 4);

      // Now card-2 should be available
      isAvailable = ThemeCardManager.isCardAvailable('card-2', allCardIds);
      expect(isAvailable).toBe(true);
    });

    it('should return next available card', () => {
      const allCardIds = ['card-1', 'card-2', 'card-3'];
      
      // Initially, card-1 should be next available
      let nextCard = ThemeCardManager.getNextAvailableCard(allCardIds);
      expect(nextCard).toBe('card-1');

      // Complete card-1
      const answers = { 'question-1': 'Answer 1', 'question-2': 'Answer 2' };
      ThemeCardManager.addCompletedAttempt('card-1', answers, 4);

      // Now card-2 should be next available
      nextCard = ThemeCardManager.getNextAvailableCard(allCardIds);
      expect(nextCard).toBe('card-2');
    });

    it('should return null if all cards are completed', () => {
      const allCardIds = ['card-1', 'card-2'];
      const answers = { 'question-1': 'Answer 1', 'question-2': 'Answer 2' };

      // Complete all cards
      allCardIds.forEach(cardId => {
        ThemeCardManager.addCompletedAttempt(cardId, answers, 4);
      });

      const nextCard = ThemeCardManager.getNextAvailableCard(allCardIds);
      expect(nextCard).toBeNull();
    });
  });

  describe('Welcome Screen Logic', () => {
    it('should show welcome screen if first card is not completed', () => {
      const allCardIds = ['card-1', 'card-2', 'card-3'];
      const shouldShow = ThemeCardManager.shouldShowWelcomeScreen('Stress', allCardIds);
      expect(shouldShow).toBe(true);
    });

    it('should not show welcome screen if first card is completed', () => {
      const allCardIds = ['card-1', 'card-2', 'card-3'];
      const answers = { 'question-1': 'Answer 1', 'question-2': 'Answer 2' };

      ThemeCardManager.addCompletedAttempt('card-1', answers, 4);
      const shouldShow = ThemeCardManager.shouldShowWelcomeScreen('Stress', allCardIds);
      expect(shouldShow).toBe(false);
    });

    it('should show welcome screen for empty card list', () => {
      const shouldShow = ThemeCardManager.shouldShowWelcomeScreen('Stress', []);
      expect(shouldShow).toBe(true);
    });
  });

  describe('Theme Progress Calculation', () => {
    it('should calculate 0% progress for no completed cards', () => {
      const allCardIds = ['card-1', 'card-2', 'card-3'];
      const progress = ThemeCardManager.getThemeProgressPercentage(allCardIds);
      expect(progress).toBe(0);
    });

    it('should calculate 50% progress for half completed cards', () => {
      const allCardIds = ['card-1', 'card-2', 'card-3', 'card-4'];
      const answers = { 'question-1': 'Answer 1', 'question-2': 'Answer 2' };

      // Complete first two cards
      ThemeCardManager.addCompletedAttempt('card-1', answers, 4);
      ThemeCardManager.addCompletedAttempt('card-2', answers, 4);

      const progress = ThemeCardManager.getThemeProgressPercentage(allCardIds);
      expect(progress).toBe(50);
    });

    it('should calculate 100% progress for all completed cards', () => {
      const allCardIds = ['card-1', 'card-2'];
      const answers = { 'question-1': 'Answer 1', 'question-2': 'Answer 2' };

      // Complete all cards
      allCardIds.forEach(cardId => {
        ThemeCardManager.addCompletedAttempt(cardId, answers, 4);
      });

      const progress = ThemeCardManager.getThemeProgressPercentage(allCardIds);
      expect(progress).toBe(100);
    });

    it('should calculate 0% progress for empty card list', () => {
      const progress = ThemeCardManager.getThemeProgressPercentage([]);
      expect(progress).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid progress data gracefully', () => {
      const testCardId = 'card-1';
      
      // Save invalid data directly to localStorage
      localStorageMock.setItem(`theme_card_progress_${testCardId}`, 'invalid json');
      
      const progress = ThemeCardManager.getCardProgress(testCardId);
      expect(progress).toBeNull();
    });

    it('should validate progress data structure', () => {
      const testCardId = 'card-1';
      
      // Save data with missing required fields
      const invalidProgress = { cardId: testCardId };
      localStorageMock.setItem(`theme_card_progress_${testCardId}`, JSON.stringify(invalidProgress));
      
      const progress = ThemeCardManager.getCardProgress(testCardId);
      expect(progress).toBeNull();
    });

    it('should handle errors gracefully', () => {
      // Mock localStorage.getItem to throw error
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      const progress = ThemeCardManager.getCardProgress('card-1');
      expect(progress).toBeNull();

      // Restore original method
      localStorageMock.getItem = originalGetItem;
    });

    it('should handle malformed JSON in localStorage', () => {
      const testCardId = 'card-1';
      localStorageMock.setItem(`theme_card_progress_${testCardId}`, '{ invalid json }');
      
      const progress = ThemeCardManager.getCardProgress(testCardId);
      expect(progress).toBeNull();
    });

    it('should handle missing required fields in progress data', () => {
      const testCardId = 'card-1';
      const incompleteProgress = {
        cardId: testCardId,
        completedAttempts: [],
        // Missing isCompleted and totalCompletedAttempts
      };
      
      localStorageMock.setItem(`theme_card_progress_${testCardId}`, JSON.stringify(incompleteProgress));
      
      const progress = ThemeCardManager.getCardProgress(testCardId);
      expect(progress).toBeNull();
    });
  });
});