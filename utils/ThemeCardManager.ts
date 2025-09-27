/**
 * ThemeCardManager - Utility class for managing theme card progress and attempts
 * 
 * Features:
 * - Card progress storage with structured data
 * - Completion tracking (questions + rating)
 * - Attempts counter system
 * - Progressive unlocking logic
 * - Data validation and error handling
 */

export interface CardProgress {
  cardId: string;
  isCompleted: boolean;
  questionsAnswered: string[];
  answers: Record<string, string>; // Store actual answers by question ID
  rating?: number;
  lastAttemptDate: string; // YYYY-MM-DD format
  totalAttempts: number;
  completedDate?: string; // YYYY-MM-DD format when fully completed
}

export enum CardCompletionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface ThemeCardData {
  cardId: string;
  title: string;
  level: string;
  description: string;
  attempts: number;
  isActive: boolean;
  completionStatus: CardCompletionStatus;
  isLocked: boolean;
}

export class ThemeCardManager {
  private static readonly STORAGE_KEY_PREFIX = 'theme_card_progress_';
  private static readonly ATTEMPTS_KEY_PREFIX = 'theme_card_attempts_';

  /**
   * Get card progress from localStorage
   * @param cardId - Unique card identifier
   * @returns CardProgress object or null if not found
   */
  static getCardProgress(cardId: string): CardProgress | null {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${cardId}`;
      const data = localStorage.getItem(key);
      
      if (!data) {
        return null;
      }
      
      const progress: CardProgress = JSON.parse(data);
      
      // Validate the data structure
      if (!this.isValidCardProgress(progress)) {
        console.warn(`Invalid card progress data for card ${cardId}`);
        return null;
      }
      
      return progress;
    } catch (error) {
      console.error(`Error getting card progress for ${cardId}:`, error);
      return null;
    }
  }

  /**
   * Save card progress to localStorage
   * @param cardId - Unique card identifier
   * @param progress - CardProgress object to save
   */
  static saveCardProgress(cardId: string, progress: CardProgress): void {
    try {
      // Validate the progress data
      if (!this.isValidCardProgress(progress)) {
        throw new Error('Invalid card progress data');
      }
      
      const key = `${this.STORAGE_KEY_PREFIX}${cardId}`;
      localStorage.setItem(key, JSON.stringify(progress));
    } catch (error) {
      console.error(`Error saving card progress for ${cardId}:`, error);
      throw error;
    }
  }

  /**
   * Increment card attempts counter
   * @param cardId - Unique card identifier
   * @returns Updated attempts count
   */
  static incrementCardAttempts(cardId: string): number {
    try {
      const currentProgress = this.getCardProgress(cardId);
      const currentAttempts = currentProgress?.totalAttempts || 0;
      const newAttempts = currentAttempts + 1;
      
      const updatedProgress: CardProgress = {
        cardId,
        isCompleted: currentProgress?.isCompleted || false,
        questionsAnswered: currentProgress?.questionsAnswered || [],
        answers: currentProgress?.answers || {},
        rating: currentProgress?.rating,
        lastAttemptDate: this.getCurrentDateKey(),
        totalAttempts: newAttempts,
        completedDate: currentProgress?.completedDate
      };
      
      this.saveCardProgress(cardId, updatedProgress);
      return newAttempts;
    } catch (error) {
      console.error(`Error incrementing attempts for card ${cardId}:`, error);
      throw error;
    }
  }

  /**
   * Check if card is fully completed (all questions answered + rating provided)
   * @param cardId - Unique card identifier
   * @returns boolean indicating if card is completed
   */
  static isCardCompleted(cardId: string): boolean {
    const progress = this.getCardProgress(cardId);
    return progress?.isCompleted || false;
  }

  /**
   * Save answer for a specific question
   * @param cardId - Unique card identifier
   * @param questionId - Question identifier
   * @param answer - User's answer text
   */
  static saveQuestionAnswer(cardId: string, questionId: string, answer: string): void {
    try {
      const currentProgress = this.getCardProgress(cardId) || {
        cardId,
        isCompleted: false,
        questionsAnswered: [],
        answers: {},
        lastAttemptDate: this.getCurrentDateKey(),
        totalAttempts: 0
      };

      const updatedAnswers = { ...currentProgress.answers, [questionId]: answer };
      const updatedQuestionsAnswered = currentProgress.questionsAnswered.includes(questionId) 
        ? currentProgress.questionsAnswered 
        : [...currentProgress.questionsAnswered, questionId];

      const updatedProgress: CardProgress = {
        ...currentProgress,
        questionsAnswered: updatedQuestionsAnswered,
        answers: updatedAnswers,
        lastAttemptDate: this.getCurrentDateKey()
      };

      this.saveCardProgress(cardId, updatedProgress);
    } catch (error) {
      console.error(`Error saving answer for card ${cardId}, question ${questionId}:`, error);
      throw error;
    }
  }

  /**
   * Mark card as completed with answers and rating
   * @param cardId - Unique card identifier
   * @param answers - Array of answered question IDs
   * @param rating - User rating for the card
   * @param answersText - Record of actual answers by question ID
   */
  static markCardCompleted(cardId: string, answers: string[], rating: number, answersText?: Record<string, string>): void {
    try {
      const currentProgress = this.getCardProgress(cardId);
      
      const completedProgress: CardProgress = {
        cardId,
        isCompleted: true,
        questionsAnswered: answers,
        answers: answersText || currentProgress?.answers || {},
        rating,
        lastAttemptDate: this.getCurrentDateKey(),
        totalAttempts: currentProgress?.totalAttempts || 0,
        completedDate: this.getCurrentDateKey()
      };
      
      this.saveCardProgress(cardId, completedProgress);
    } catch (error) {
      console.error(`Error marking card ${cardId} as completed:`, error);
      throw error;
    }
  }

  /**
   * Get next available card in theme (first unlocked card)
   * @param themeId - Theme identifier
   * @param cardIds - Array of card IDs in theme (in order)
   * @returns Next available card ID or null if all completed
   */
  static getNextAvailableCard(themeId: string, cardIds: string[]): string | null {
    try {
      // First card is always available
      if (cardIds.length === 0) {
        return null;
      }
      
      const firstCardId = cardIds[0];
      
      // Check if first card is completed
      const firstCardCompleted = this.isCardCompleted(firstCardId);
      if (!firstCardCompleted) {
        return firstCardId;
      }
      
      // Find next incomplete card
      for (let i = 1; i < cardIds.length; i++) {
        const prevCardId = cardIds[i - 1];
        const currentCardId = cardIds[i];
        
        const prevCardCompleted = this.isCardCompleted(prevCardId);
        const currentCardCompleted = this.isCardCompleted(currentCardId);
        
        // If previous card is completed and current is not, current is available
        if (prevCardCompleted && !currentCardCompleted) {
          return currentCardId;
        }
      }
      
      // All cards completed
      return null;
    } catch (error) {
      console.error(`Error getting next available card for theme ${themeId}:`, error);
      return null;
    }
  }

  /**
   * Get attempts count for specific card
   * @param cardId - Unique card identifier
   * @returns Number of attempts
   */
  static getCardAttemptsCount(cardId: string): number {
    const progress = this.getCardProgress(cardId);
    return progress?.totalAttempts || 0;
  }

  /**
   * Check if card should be available (unlocked) based on progressive unlocking
   * @param cardId - Unique card identifier
   * @param cardIds - Array of all card IDs in theme (in order)
   * @returns boolean indicating if card is available
   */
  static isCardAvailable(cardId: string, cardIds: string[]): boolean {
    try {
      const cardIndex = cardIds.indexOf(cardId);
      
      // Card not found in theme
      if (cardIndex === -1) {
        return false;
      }
      
      // First card is always available
      if (cardIndex === 0) {
        return true;
      }
      
      // Check if previous card is completed
      const prevCardId = cardIds[cardIndex - 1];
      return this.isCardCompleted(prevCardId);
    } catch (error) {
      console.error(`Error checking card availability for ${cardId}:`, error);
      return false;
    }
  }

  /**
   * Get answer for a specific question
   * @param cardId - Unique card identifier
   * @param questionId - Question identifier
   * @returns Answer text or null if not found
   */
  static getQuestionAnswer(cardId: string, questionId: string): string | null {
    try {
      const progress = this.getCardProgress(cardId);
      return progress?.answers?.[questionId] || null;
    } catch (error) {
      console.error(`Error getting answer for card ${cardId}, question ${questionId}:`, error);
      return null;
    }
  }

  /**
   * Get all answers for a card
   * @param cardId - Unique card identifier
   * @returns Record of answers by question ID
   */
  static getCardAnswers(cardId: string): Record<string, string> {
    try {
      const progress = this.getCardProgress(cardId);
      return progress?.answers || {};
    } catch (error) {
      console.error(`Error getting answers for card ${cardId}:`, error);
      return {};
    }
  }

  /**
   * Get card completion status
   * @param cardId - Unique card identifier
   * @returns CardCompletionStatus
   */
  static getCardCompletionStatus(cardId: string): CardCompletionStatus {
    const progress = this.getCardProgress(cardId);
    
    if (!progress) {
      return CardCompletionStatus.NOT_STARTED;
    }
    
    if (progress.isCompleted) {
      return CardCompletionStatus.COMPLETED;
    }
    
    if (progress.questionsAnswered.length > 0) {
      return CardCompletionStatus.IN_PROGRESS;
    }
    
    return CardCompletionStatus.NOT_STARTED;
  }

  /**
   * Check if welcome screen should be shown (first card not completed)
   * @param themeId - Theme identifier
   * @param cardIds - Array of card IDs in theme
   * @returns boolean indicating if welcome screen should be shown
   */
  static shouldShowWelcomeScreen(themeId: string, cardIds: string[]): boolean {
    try {
      if (cardIds.length === 0) {
        return true;
      }
      
      const firstCardId = cardIds[0];
      return !this.isCardCompleted(firstCardId);
    } catch (error) {
      console.error(`Error checking welcome screen for theme ${themeId}:`, error);
      return true; // Default to showing welcome screen on error
    }
  }

  /**
   * Get current date key in YYYY-MM-DD format
   * @returns string in format YYYY-MM-DD
   */
  private static getCurrentDateKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Validate card progress data structure
   * @param progress - CardProgress object to validate
   * @returns boolean indicating if data is valid
   */
  private static isValidCardProgress(progress: any): progress is CardProgress {
    return (
      progress &&
      typeof progress === 'object' &&
      typeof progress.cardId === 'string' &&
      typeof progress.isCompleted === 'boolean' &&
      Array.isArray(progress.questionsAnswered) &&
      typeof progress.answers === 'object' &&
      progress.answers !== null &&
      typeof progress.lastAttemptDate === 'string' &&
      typeof progress.totalAttempts === 'number' &&
      (progress.rating === undefined || typeof progress.rating === 'number') &&
      (progress.completedDate === undefined || typeof progress.completedDate === 'string')
    );
  }

  /**
   * Clear all card progress data (for testing/reset purposes)
   * @param themeId - Optional theme ID to clear specific theme data
   */
  static clearAllProgress(themeId?: string): void {
    try {
      const keys = Object.keys(localStorage);
      const prefix = themeId ? `${this.STORAGE_KEY_PREFIX}${themeId}_` : this.STORAGE_KEY_PREFIX;
      
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing card progress data:', error);
    }
  }

  /**
   * Get all card progress data for a theme
   * @param themeId - Theme identifier
   * @param cardIds - Array of card IDs in theme
   * @returns Array of CardProgress objects
   */
  static getAllThemeProgress(themeId: string, cardIds: string[]): CardProgress[] {
    try {
      return cardIds
        .map(cardId => this.getCardProgress(cardId))
        .filter((progress): progress is CardProgress => progress !== null);
    } catch (error) {
      console.error(`Error getting theme progress for ${themeId}:`, error);
      return [];
    }
  }
}
