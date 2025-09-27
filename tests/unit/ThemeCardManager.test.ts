import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeCardManager, CardProgress, CardCompletionStatus } from '../../utils/ThemeCardManager';

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
  const testCardId = 'card-1';
  const testThemeId = 'stress-management';
  const testCardIds = ['card-1', 'card-2', 'card-3'];

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Card Progress Management', () => {
    it('should save and retrieve card progress', () => {
      const progress: CardProgress = {
        cardId: testCardId,
        isCompleted: false,
        questionsAnswered: ['q1', 'q2'],
        answers: {},
        rating: 4,
        lastAttemptDate: '2024-01-25',
        totalAttempts: 2
      };

      ThemeCardManager.saveCardProgress(testCardId, progress);
      const retrieved = ThemeCardManager.getCardProgress(testCardId);

      expect(retrieved).toEqual(progress);
    });

    it('should return null for non-existent card progress', () => {
      const result = ThemeCardManager.getCardProgress('non-existent');
      expect(result).toBeNull();
    });

    it('should handle invalid progress data gracefully', () => {
      localStorageMock.setItem('theme_card_progress_invalid', 'invalid-json');
      
      const result = ThemeCardManager.getCardProgress('invalid');
      
      expect(result).toBeNull();
    });

    it('should validate progress data structure', () => {
      const invalidProgress = {
        cardId: testCardId,
        // Missing required fields
      };

      localStorageMock.setItem(`theme_card_progress_${testCardId}`, JSON.stringify(invalidProgress));
      
      const result = ThemeCardManager.getCardProgress(testCardId);
      
      expect(result).toBeNull();
    });
  });

  describe('Attempts Counter', () => {
    it('should increment attempts counter', () => {
      const attempts = ThemeCardManager.incrementCardAttempts(testCardId);
      expect(attempts).toBe(1);

      const progress = ThemeCardManager.getCardProgress(testCardId);
      expect(progress?.totalAttempts).toBe(1);
    });

    it('should increment attempts counter from existing progress', () => {
      // Create existing progress
      const existingProgress: CardProgress = {
        cardId: testCardId,
        isCompleted: false,
        questionsAnswered: ['q1'],
        answers: {},
        lastAttemptDate: '2024-01-25',
        totalAttempts: 2
      };

      ThemeCardManager.saveCardProgress(testCardId, existingProgress);

      const attempts = ThemeCardManager.incrementCardAttempts(testCardId);
      expect(attempts).toBe(3);

      const progress = ThemeCardManager.getCardProgress(testCardId);
      expect(progress?.totalAttempts).toBe(3);
    });

    it('should get attempts count for card', () => {
      ThemeCardManager.incrementCardAttempts(testCardId);
      ThemeCardManager.incrementCardAttempts(testCardId);

      const count = ThemeCardManager.getCardAttemptsCount(testCardId);
      expect(count).toBe(2);
    });

    it('should return 0 for non-existent card attempts', () => {
      const count = ThemeCardManager.getCardAttemptsCount('non-existent');
      expect(count).toBe(0);
    });
  });

  describe('Card Completion Logic', () => {
    it('should mark card as completed', () => {
      ThemeCardManager.markCardCompleted(testCardId, ['q1', 'q2'], 5);

      const progress = ThemeCardManager.getCardProgress(testCardId);
      expect(progress?.isCompleted).toBe(true);
      expect(progress?.questionsAnswered).toEqual(['q1', 'q2']);
      expect(progress?.rating).toBe(5);
      expect(progress?.completedDate).toBeDefined();
    });

    it('should preserve existing attempts when marking as completed', () => {
      ThemeCardManager.incrementCardAttempts(testCardId);
      ThemeCardManager.incrementCardAttempts(testCardId);

      ThemeCardManager.markCardCompleted(testCardId, ['q1'], 4);

      const progress = ThemeCardManager.getCardProgress(testCardId);
      expect(progress?.totalAttempts).toBe(2);
    });

    it('should check if card is completed', () => {
      expect(ThemeCardManager.isCardCompleted(testCardId)).toBe(false);

      ThemeCardManager.markCardCompleted(testCardId, ['q1', 'q2'], 5);
      expect(ThemeCardManager.isCardCompleted(testCardId)).toBe(true);
    });

    it('should get card completion status', () => {
      expect(ThemeCardManager.getCardCompletionStatus(testCardId)).toBe(CardCompletionStatus.NOT_STARTED);

      ThemeCardManager.saveQuestionAnswer(testCardId, 'q1', 'Answer to question 1');
      expect(ThemeCardManager.getCardCompletionStatus(testCardId)).toBe(CardCompletionStatus.IN_PROGRESS);

      ThemeCardManager.markCardCompleted(testCardId, ['q1'], 4);
      expect(ThemeCardManager.getCardCompletionStatus(testCardId)).toBe(CardCompletionStatus.COMPLETED);
    });
  });

  describe('Question Answers Management', () => {
    it('should save and retrieve question answers', () => {
      ThemeCardManager.saveQuestionAnswer(testCardId, 'q1', 'My answer to question 1');
      ThemeCardManager.saveQuestionAnswer(testCardId, 'q2', 'My answer to question 2');

      const answer1 = ThemeCardManager.getQuestionAnswer(testCardId, 'q1');
      const answer2 = ThemeCardManager.getQuestionAnswer(testCardId, 'q2');

      expect(answer1).toBe('My answer to question 1');
      expect(answer2).toBe('My answer to question 2');
    });

    it('should return null for non-existent question answer', () => {
      const answer = ThemeCardManager.getQuestionAnswer(testCardId, 'non-existent');
      expect(answer).toBeNull();
    });

    it('should get all answers for a card', () => {
      ThemeCardManager.saveQuestionAnswer(testCardId, 'q1', 'Answer 1');
      ThemeCardManager.saveQuestionAnswer(testCardId, 'q2', 'Answer 2');

      const allAnswers = ThemeCardManager.getCardAnswers(testCardId);

      expect(allAnswers).toEqual({
        'q1': 'Answer 1',
        'q2': 'Answer 2'
      });
    });

    it('should update existing answer', () => {
      ThemeCardManager.saveQuestionAnswer(testCardId, 'q1', 'Original answer');
      ThemeCardManager.saveQuestionAnswer(testCardId, 'q1', 'Updated answer');

      const answer = ThemeCardManager.getQuestionAnswer(testCardId, 'q1');
      expect(answer).toBe('Updated answer');
    });
  });

  describe('Progressive Unlocking Logic', () => {
    it('should check if first card is available', () => {
      expect(ThemeCardManager.isCardAvailable('card-1', testCardIds)).toBe(true);
    });

    it('should check if subsequent card is available when previous is completed', () => {
      ThemeCardManager.markCardCompleted('card-1', ['q1', 'q2'], 5);
      expect(ThemeCardManager.isCardAvailable('card-2', testCardIds)).toBe(true);
    });

    it('should check if subsequent card is not available when previous is not completed', () => {
      expect(ThemeCardManager.isCardAvailable('card-2', testCardIds)).toBe(false);
    });

    it('should return false for non-existent card in theme', () => {
      expect(ThemeCardManager.isCardAvailable('non-existent', testCardIds)).toBe(false);
    });

    it('should get next available card', () => {
      expect(ThemeCardManager.getNextAvailableCard(testThemeId, testCardIds)).toBe('card-1');

      ThemeCardManager.markCardCompleted('card-1', ['q1', 'q2'], 5);
      expect(ThemeCardManager.getNextAvailableCard(testThemeId, testCardIds)).toBe('card-2');
    });

    it('should return null when all cards are completed', () => {
      ThemeCardManager.markCardCompleted('card-1', ['q1', 'q2'], 5);
      ThemeCardManager.markCardCompleted('card-2', ['q1', 'q2'], 4);
      ThemeCardManager.markCardCompleted('card-3', ['q1', 'q2'], 5);

      expect(ThemeCardManager.getNextAvailableCard(testThemeId, testCardIds)).toBeNull();
    });

    it('should return null for empty card array', () => {
      expect(ThemeCardManager.getNextAvailableCard(testThemeId, [])).toBeNull();
    });
  });

  describe('Welcome Screen Logic', () => {
    it('should show welcome screen when first card is not completed', () => {
      expect(ThemeCardManager.shouldShowWelcomeScreen(testThemeId, testCardIds)).toBe(true);
    });

    it('should not show welcome screen when first card is completed', () => {
      ThemeCardManager.markCardCompleted('card-1', ['q1', 'q2'], 5);
      expect(ThemeCardManager.shouldShowWelcomeScreen(testThemeId, testCardIds)).toBe(false);
    });

    it('should show welcome screen for empty card array', () => {
      expect(ThemeCardManager.shouldShowWelcomeScreen(testThemeId, [])).toBe(true);
    });
  });

  describe('Data Management', () => {
    it('should clear all progress data', () => {
      ThemeCardManager.saveCardProgress('card-1', {
        cardId: 'card-1',
        isCompleted: false,
        questionsAnswered: [],
        answers: {},
        lastAttemptDate: '2024-01-25',
        totalAttempts: 1
      });

      ThemeCardManager.clearAllProgress();

      expect(localStorageMock.getItem('theme_card_progress_card-1')).toBeNull();
    });

    it('should get all theme progress', () => {
      ThemeCardManager.saveCardProgress('card-1', {
        cardId: 'card-1',
        isCompleted: false,
        questionsAnswered: [],
        answers: {},
        lastAttemptDate: '2024-01-25',
        totalAttempts: 1
      });

      ThemeCardManager.saveCardProgress('card-2', {
        cardId: 'card-2',
        isCompleted: true,
        questionsAnswered: ['q1'],
        answers: {},
        lastAttemptDate: '2024-01-25',
        totalAttempts: 1,
        completedDate: '2024-01-25'
      });

      const progress = ThemeCardManager.getAllThemeProgress(testThemeId, testCardIds);
      expect(progress).toHaveLength(2);
      expect(progress.map(p => p.cardId)).toContain('card-1');
      expect(progress.map(p => p.cardId)).toContain('card-2');
    });

    it('should handle errors gracefully', () => {
      // Mock localStorage to throw error
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = ThemeCardManager.getCardProgress(testCardId);
      
      expect(result).toBeNull();
      
      // Restore
      localStorageMock.getItem = originalGetItem;
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed JSON in localStorage', () => {
      localStorageMock.setItem(`theme_card_progress_${testCardId}`, '{"invalid": json}');
      
      const result = ThemeCardManager.getCardProgress(testCardId);
      
      expect(result).toBeNull();
    });

    it('should handle missing required fields in progress data', () => {
      const incompleteData = {
        cardId: testCardId,
        // Missing other required fields
      };

      localStorageMock.setItem(`theme_card_progress_${testCardId}`, JSON.stringify(incompleteData));
      
      const result = ThemeCardManager.getCardProgress(testCardId);
      
      expect(result).toBeNull();
    });

    it('should handle null values in progress data', () => {
      const progressWithNulls: CardProgress = {
        cardId: testCardId,
        isCompleted: false,
        questionsAnswered: [],
        answers: {},
        lastAttemptDate: '2024-01-25',
        totalAttempts: 1,
        rating: undefined,
        completedDate: undefined
      };

      ThemeCardManager.saveCardProgress(testCardId, progressWithNulls);
      const result = ThemeCardManager.getCardProgress(testCardId);

      expect(result).toEqual(progressWithNulls);
    });
  });
});