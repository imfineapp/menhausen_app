// ========================================================================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С КОНТЕНТОМ И МИГРАЦИИ ДАННЫХ
// ========================================================================================

import { appContent } from '../data/content';
import { CardData, ThemeData, LocalizedContent } from '../types/content';

/**
 * Утилиты для работы с темами приложения
 */
export const themeUtils = {
  /**
   * Получить все доступные темы
   */
  getAllThemes(): ThemeData[] {
    return Object.values(appContent.themes);
  },

  /**
   * Получить бесплатные темы
   */
  getFreeThemes(): ThemeData[] {
    return Object.values(appContent.themes).filter(theme => !theme.isPremium);
  },

  /**
   * Получить премиум темы
   */
  getPremiumThemes(): ThemeData[] {
    return Object.values(appContent.themes).filter(theme => theme.isPremium);
  },

  /**
   * Найти тему по локализованному названию
   */
  findThemeByLocalizedTitle(title: string, language: 'en' = 'en'): ThemeData | undefined {
    return Object.values(appContent.themes).find(theme => 
      theme.title[language] === title
    );
  }
};

/**
 * Утилиты для работы с карточками
 */
export const cardUtils = {
  /**
   * Получить все карточки
   */
  getAllCards(): CardData[] {
    return Object.values(appContent.cards);
  },

  /**
   * Получить карточки по сложности
   */
  getCardsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): CardData[] {
    return Object.values(appContent.cards).filter(card => card.difficulty === difficulty);
  },

  /**
   * Получить бесплатные карточки
   */
  getFreeCards(): CardData[] {
    return Object.values(appContent.cards).filter(card => !card.isPremium);
  },

  /**
   * Получить карточки темы в правильном порядке
   */
  getThemeCardsInOrder(themeId: string): CardData[] {
    const theme = appContent.themes[themeId];
    if (!theme) return [];

    return theme.cardIds
      .map(cardId => appContent.cards[cardId])
      .filter((card): card is CardData => card !== undefined);
  },

  /**
   * Получить следующую доступную карточку в теме
   */
  getNextAvailableCard(themeId: string, completedCardIds: string[]): CardData | null {
    const themeCards = this.getThemeCardsInOrder(themeId);
    return themeCards.find(card => !completedCardIds.includes(card.id)) || null;
  }
};

/**
 * Утилиты для локализации
 */
export const localizationUtils = {
  /**
   * Получить текст для указанного языка с fallback
   */
  getText(content: LocalizedContent, language: 'en' = 'en'): string {
    return content[language] || content.en;
  },

  /**
   * Проверить, есть ли перевод для языка
   */
  hasTranslation(content: LocalizedContent, language: string): boolean {
    return language in content;
  },

  /**
   * Получить все доступные языки для контента
   */
  getAvailableLanguages(content: LocalizedContent): string[] {
    return Object.keys(content);
  }
};

/**
 * Утилиты для миграции существующих данных в новую систему
 */
export const migrationUtils = {
  /**
   * Преобразовать старый cardMapping в новый формат (для справки)
   */
  convertLegacyCardMapping() {
    const legacyMapping = {
      'card-1': { title: 'Card #1', description: 'Understanding yourself and your reactions to social situations.' },
      'card-2': { title: 'Card #1', description: 'Building confidence in social interactions through self-awareness.' },
      'card-3': { title: 'Card #2', description: 'Managing anxiety in social settings and finding your comfort zone.' },
      'card-4': { title: 'Card #3', description: 'Effective communication strategies for better relationships.' },
      'card-5': { title: 'Card #4', description: 'Overcoming social barriers and building meaningful connections.' },
      'card-6': { title: 'Card #5', description: 'Advanced social skills and conflict resolution techniques.' },
      'card-7': { title: 'Card #6', description: 'Leadership and influence in social and professional settings.' },
      'card-8': { title: 'Card #7', description: 'Emotional intelligence and empathy in relationships.' },
      'card-9': { title: 'Card #8', description: 'Maintaining healthy boundaries in personal and professional life.' },
      'card-10': { title: 'Card #9', description: 'Advanced interpersonal skills and social mastery.' },
      'card-11': { title: 'Card #10', description: 'Integration and application of all learned social skills.' }
    };

    console.log('Legacy card mapping converted to new content system');
    return legacyMapping;
  },

  /**
   * Получить данные карточки в старом формате для совместимости
   */
  getCardDataLegacyFormat(cardId: string): {id: string; title: string; description: string} {
    const card = appContent.cards[cardId];
    
    if (!card) {
      return {
        id: cardId,
        title: 'Card',
        description: 'Card description will be available soon.'
      };
    }
    
    return {
      id: cardId,
      title: card.title.en,
      description: card.description.en
    };
  }
};

/**
 * Утилиты для валидации контента
 */
export const validationUtils = {
  /**
   * Проверить, что все карточки в темах существуют
   */
  validateThemeCardReferences(): boolean {
    const allCardIds = Object.keys(appContent.cards);
    let isValid = true;

    Object.values(appContent.themes).forEach(theme => {
      theme.cardIds.forEach(cardId => {
        if (!allCardIds.includes(cardId)) {
          console.error(`Theme "${theme.id}" references non-existent card: ${cardId}`);
          isValid = false;
        }
      });
    });

    return isValid;
  },

  /**
   * Проверить, что все карточки имеют корректную структуру
   */
  validateCardStructure(): boolean {
    let isValid = true;

    Object.values(appContent.cards).forEach(card => {
      // Проверить обязательные поля
      if (!card.id || !card.title.en || !card.description.en) {
        console.error(`Card "${card.id}" missing required fields`);
        isValid = false;
      }

      // Проверить, что есть хотя бы 1 вопрос
      if (!card.questions || card.questions.length === 0) {
        console.error(`Card "${card.id}" has no questions`);
        isValid = false;
      }

      // Проверить, что themeId корректный
      if (!appContent.themes[card.themeId]) {
        console.error(`Card "${card.id}" references non-existent theme: ${card.themeId}`);
        isValid = false;
      }
    });

    return isValid;
  },

  /**
   * Запустить все проверки валидации
   */
  validateAll(): boolean {
    console.log('Running content validation...');
    
    const themeValidation = this.validateThemeCardReferences();
    const cardValidation = this.validateCardStructure();
    
    const allValid = themeValidation && cardValidation;
    
    if (allValid) {
      console.log('✅ All content validation passed');
    } else {
      console.error('❌ Content validation failed');
    }
    
    return allValid;
  }
};

/**
 * Статистика и аналитика контента
 */
export const contentStats = {
  /**
   * Получить статистику по контенту
   */
  getStats() {
    const themes = Object.values(appContent.themes);
    const cards = Object.values(appContent.cards);
    const emergencyCards = Object.values(appContent.emergencyCards);

    return {
      totalThemes: themes.length,
      freeThemes: themes.filter(t => !t.isPremium).length,
      premiumThemes: themes.filter(t => t.isPremium).length,
      totalCards: cards.length,
      freeCards: cards.filter(c => !c.isPremium).length,
      premiumCards: cards.filter(c => c.isPremium).length,
      emergencyCards: emergencyCards.length,
      cardsByDifficulty: {
        beginner: cards.filter(c => c.difficulty === 'beginner').length,
        intermediate: cards.filter(c => c.difficulty === 'intermediate').length,
        advanced: cards.filter(c => c.difficulty === 'advanced').length
      },
      totalQuestions: cards.reduce((sum, card) => sum + card.questions.length, 0)
    };
  },

  /**
   * Вывести статистику в консоль
   */
  logStats() {
    const stats = this.getStats();
    console.table(stats);
  }
};