/**
 * ThemeCardManager - Utility class for managing theme card progress and completed attempts
 * 
 * Features:
 * - Card progress storage with completed attempts array
 * - Completion tracking (only fully completed attempts with answers + rating)
 * - Attempts counter system (only completed attempts)
 * - Progressive unlocking logic
 * - Data validation and error handling
 */

export interface CompletedAttempt {
  attemptId: string; // card-1_2024-01-15_1 format
  date: string; // YYYY-MM-DD format
  answers: Record<string, string>; // Answers to all questions
  rating: number; // User rating for the card
  completedAt: string; // ISO timestamp when completed
}

export interface CardProgress {
  cardId: string;
  completedAttempts: CompletedAttempt[]; // Array of completed attempts
  isCompleted: boolean; // true if at least one completed attempt exists
  totalCompletedAttempts: number; // Count of completed attempts
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
   * Add a completed attempt to a card
   * @param cardId - Unique card identifier
   * @param answers - Answers to all questions
   * @param rating - User rating for the card
   * @returns Updated CardProgress object
   */
  static addCompletedAttempt(
    cardId: string, 
    answers: Record<string, string>, 
    rating: number
  ): CardProgress {
    try {
      const currentProgress = this.getCardProgress(cardId) || {
        cardId,
        completedAttempts: [],
        isCompleted: false,
        totalCompletedAttempts: 0
      };

      // Generate attempt ID: card-1_2024-01-15_1 format
      const currentDate = this.getCurrentDateKey();
      const attemptNumber = currentProgress.completedAttempts.length + 1;
      const attemptId = `${cardId}_${currentDate}_${attemptNumber}`;

      // Create completed attempt
      const completedAttempt: CompletedAttempt = {
        attemptId,
        date: currentDate,
        answers,
        rating,
        completedAt: new Date().toISOString()
      };

      // Add to completed attempts array
      const updatedAttempts = [...currentProgress.completedAttempts, completedAttempt];

      // Create updated progress
      const updatedProgress: CardProgress = {
        cardId,
        completedAttempts: updatedAttempts,
        isCompleted: true, // At least one completed attempt exists
        totalCompletedAttempts: updatedAttempts.length
      };

      this.saveCardProgress(cardId, updatedProgress);
      return updatedProgress;
    } catch (error) {
      console.error(`Error adding completed attempt for card ${cardId}:`, error);
      throw error;
    }
  }

  /**
   * Get all completed attempts for a card
   * @param cardId - Unique card identifier
   * @returns Array of CompletedAttempt objects
   */
  static getCompletedAttempts(cardId: string): CompletedAttempt[] {
    const progress = this.getCardProgress(cardId);
    return progress?.completedAttempts || [];
  }

  /**
   * Get a specific completed attempt by attempt ID
   * @param cardId - Unique card identifier
   * @param attemptId - Attempt identifier
   * @returns CompletedAttempt object or null if not found
   */
  static getCompletedAttempt(cardId: string, attemptId: string): CompletedAttempt | null {
    const attempts = this.getCompletedAttempts(cardId);
    return attempts.find(attempt => attempt.attemptId === attemptId) || null;
  }

  /**
   * Get card completion status
   * @param cardId - Unique card identifier
   * @returns CardCompletionStatus
   */
  static getCardCompletionStatus(cardId: string): CardCompletionStatus {
    const progress = this.getCardProgress(cardId);
    
    if (!progress || progress.completedAttempts.length === 0) {
      return CardCompletionStatus.NOT_STARTED;
    }
    
    return progress.isCompleted ? CardCompletionStatus.COMPLETED : CardCompletionStatus.NOT_STARTED;
  }

  /**
   * Check if a card is available for unlocking (previous card is completed)
   * @param cardId - Unique card identifier
   * @param allCardIds - Array of all card IDs in order
   * @returns boolean indicating if card is available
   */
  static isCardAvailable(cardId: string, allCardIds: string[]): boolean {
    const cardIndex = allCardIds.indexOf(cardId);
    
    // First card is always available
    if (cardIndex === 0) {
      return true;
    }
    
    // Card not found in the list
    if (cardIndex === -1) {
      return false;
    }
    
    // Check if previous card is completed
    const previousCardId = allCardIds[cardIndex - 1];
    const previousCardStatus = this.getCardCompletionStatus(previousCardId);
    
    return previousCardStatus === CardCompletionStatus.COMPLETED;
  }

  /**
   * Get next available card in sequence
   * @param allCardIds - Array of all card IDs in order
   * @returns Next available card ID or null if none available
   */
  static getNextAvailableCard(allCardIds: string[]): string | null {
    for (const cardId of allCardIds) {
      const status = this.getCardCompletionStatus(cardId);
      if (status === CardCompletionStatus.NOT_STARTED && this.isCardAvailable(cardId, allCardIds)) {
        return cardId;
      }
    }
    return null;
  }

  /**
   * Check if welcome screen should be shown for a theme
   * @param themeTitle - Theme title
   * @param allCardIds - Array of all card IDs in the theme
   * @returns boolean indicating if welcome screen should be shown
   */
  static shouldShowWelcomeScreen(themeTitle: string, allCardIds: string[]): boolean {
    if (allCardIds.length === 0) {
      return true;
    }
    
    const firstCardId = allCardIds[0];
    const firstCardStatus = this.getCardCompletionStatus(firstCardId);
    
    return firstCardStatus === CardCompletionStatus.NOT_STARTED;
  }

  /**
   * Calculate theme progress percentage based on cards with at least one attempt
   * @param allCardIds - Array of all card IDs in the theme
   * @returns Progress percentage (0-100)
   */
  static getThemeProgressPercentage(allCardIds: string[]): number {
    if (allCardIds.length === 0) {
      return 0;
    }
    
    // Считаем карточки, на которые пользователь ответил хотя бы один раз
    const attemptedCards = allCardIds.filter(cardId => {
      const progress = this.getCardProgress(cardId);
      return progress && progress.completedAttempts.length > 0;
    });
    
    return Math.round((attemptedCards.length / allCardIds.length) * 100);
  }

  /**
   * Clear all progress data for a card
   * @param cardId - Unique card identifier
   */
  static clearCardProgress(cardId: string): void {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${cardId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing card progress for ${cardId}:`, error);
      throw error;
    }
  }

  /**
   * Clear all theme progress data
   * @param allCardIds - Array of all card IDs in the theme
   */
  static clearAllThemeProgress(allCardIds: string[]): void {
    try {
      allCardIds.forEach(cardId => {
        this.clearCardProgress(cardId);
      });
    } catch (error) {
      console.error('Error clearing theme progress:', error);
      throw error;
    }
  }

  /**
   * Get current date in YYYY-MM-DD format
   * @returns Date string in YYYY-MM-DD format
   */
  private static getCurrentDateKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Validate CardProgress data structure
   * @param progress - CardProgress object to validate
   * @returns boolean indicating if data is valid
   */
  private static isValidCardProgress(progress: any): progress is CardProgress {
    if (!progress || typeof progress !== 'object') {
      return false;
    }
    
    // Check required fields
    if (typeof progress.cardId !== 'string' || !progress.cardId) {
      return false;
    }
    
    if (!Array.isArray(progress.completedAttempts)) {
      return false;
    }
    
    if (typeof progress.isCompleted !== 'boolean') {
      return false;
    }
    
    if (typeof progress.totalCompletedAttempts !== 'number') {
      return false;
    }
    
    // Validate completed attempts array
    for (const attempt of progress.completedAttempts) {
      if (!this.isValidCompletedAttempt(attempt)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Validate CompletedAttempt data structure
   * @param attempt - CompletedAttempt object to validate
   * @returns boolean indicating if data is valid
   */
  private static isValidCompletedAttempt(attempt: any): attempt is CompletedAttempt {
    if (!attempt || typeof attempt !== 'object') {
      return false;
    }
    
    return (
      typeof attempt.attemptId === 'string' &&
      typeof attempt.date === 'string' &&
      typeof attempt.answers === 'object' &&
      attempt.answers !== null &&
      typeof attempt.rating === 'number' &&
      typeof attempt.completedAt === 'string'
    );
  }
}