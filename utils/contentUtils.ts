// ========================================================================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С КОНТЕНТОМ И МИГРАЦИИ ДАННЫХ
// ========================================================================================

import { CardData, ThemeData, LocalizedContent, AppContent } from '../types/content';

/**
 * Утилиты для работы с темами приложения
 * Теперь используют ContentContext вместо прямого импорта
 */
export const themeUtils = {
  /**
   * Получить все доступные темы
   * @param content - контент из ContentContext
   */
  getAllThemes(content: AppContent): ThemeData[] {
    return Object.values(content.themes);
  },

  /**
   * Получить бесплатные темы
   * @param content - контент из ContentContext
   */
  getFreeThemes(content: AppContent): ThemeData[] {
    return Object.values(content.themes).filter(theme => !theme.isPremium);
  },

  /**
   * Получить премиум темы
   * @param content - контент из ContentContext
   */
  getPremiumThemes(content: AppContent): ThemeData[] {
    return Object.values(content.themes).filter(theme => theme.isPremium);
  },

  /**
   * Найти тему по локализованному названию
   * @param content - контент из ContentContext
   * @param title - название темы для поиска
   * @param _language - язык (для совместимости, не используется)
   */
  findThemeByLocalizedTitle(content: AppContent, title: string, _language: 'en' = 'en'): ThemeData | undefined {
    return Object.values(content.themes).find(theme => 
      theme.title === title
    );
  }
};

/**
 * Утилиты для работы с карточками
 * Теперь используют ContentContext вместо прямого импорта
 */
export const cardUtils = {
  /**
   * Получить все карточки
   * @param content - контент из ContentContext
   */
  getAllCards(content: AppContent): CardData[] {
    return Object.values(content.cards);
  },

  /**
   * Получить карточки по сложности
   * @param content - контент из ContentContext
   * @param difficulty - уровень сложности
   */
  getCardsByDifficulty(content: AppContent, difficulty: 'beginner' | 'intermediate' | 'advanced'): CardData[] {
    return Object.values(content.cards).filter(card => card.difficulty === difficulty);
  },

  /**
   * Получить бесплатные карточки
   * @param content - контент из ContentContext
   */
  getFreeCards(content: AppContent): CardData[] {
    return Object.values(content.cards).filter(card => !card.isPremium);
  },

  /**
   * Получить карточки темы в правильном порядке
   * @param content - контент из ContentContext
   * @param themeId - ID темы
   */
  getThemeCardsInOrder(content: AppContent, themeId: string): CardData[] {
    const theme = content.themes[themeId];
    if (!theme) return [];

    return theme.cardIds
      .map(cardId => content.cards[cardId])
      .filter((card): card is CardData => card !== undefined);
  },

  /**
   * Получить следующую доступную карточку в теме
   * @param content - контент из ContentContext
   * @param themeId - ID темы
   * @param completedCardIds - массив ID завершенных карточек
   */
  getNextAvailableCard(content: AppContent, themeId: string, completedCardIds: string[]): CardData | null {
    const themeCards = this.getThemeCardsInOrder(content, themeId);
    return themeCards.find(card => !completedCardIds.includes(card.id)) || null;
  }
};

/**
 * Утилиты для локализации
 * Теперь используют ContentContext вместо прямого импорта
 */
export const localizationUtils = {
  /**
   * Получить текст для указанного языка с fallback
   * @param content - локализованный контент
   * @param _language - язык (для совместимости, не используется)
   */
  getText(content: LocalizedContent, _language: 'en' = 'en'): string {
    return content || '';
  },

  /**
   * Проверить, есть ли перевод для языка
   * @param content - локализованный контент
   * @param _language - язык (для совместимости, не используется)
   */
  hasTranslation(content: LocalizedContent, _language: string): boolean {
    return !!content;
  },

  /**
   * Получить все доступные языки для контента
   * @param content - локализованный контент
   */
  getAvailableLanguages(content: LocalizedContent): string[] {
    return content ? ['current'] : [];
  }
};

/**
 * Утилиты для миграции существующих данных в новую систему
 * @deprecated Эти утилиты больше не нужны после миграции
 */
export const migrationUtils = {
  /**
   * Преобразовать старый cardMapping в новый формат (для справки)
   * @deprecated Больше не используется
   */
  convertLegacyCardMapping() {
    console.warn('migrationUtils.convertLegacyCardMapping is deprecated and no longer needed');
    return {};
  },

  /**
   * Получить данные карточки в старом формате для совместимости
   * @deprecated Используйте cardUtils.getAllCards(content) вместо этого
   * @param content - контент из ContentContext
   * @param cardId - ID карточки
   */
  getCardDataLegacyFormat(content: AppContent, cardId: string): {id: string; title: string; description: string} {
    console.warn('migrationUtils.getCardDataLegacyFormat is deprecated. Use cardUtils.getAllCards(content) instead');
    
    const card = content.cards[cardId];
    
    if (!card) {
      return {
        id: cardId,
        title: 'Card',
        description: 'Card description will be available soon.'
      };
    }
    
    return {
      id: cardId,
      title: card.title,
      description: card.description
    };
  }
};

/**
 * Утилиты для валидации контента
 * Теперь используют ContentContext вместо прямого импорта
 */
export const validationUtils = {
  /**
   * Проверить, что все карточки в темах существуют
   * @param content - контент из ContentContext
   */
  validateThemeCardReferences(content: AppContent): boolean {
    const allCardIds = Object.keys(content.cards);
    let isValid = true;

    Object.values(content.themes).forEach(theme => {
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
   * @param content - контент из ContentContext
   */
  validateCardStructure(content: AppContent): boolean {
    let isValid = true;

    Object.values(content.cards).forEach(card => {
      // Проверить обязательные поля
      if (!card.id || !card.title || !card.description) {
        console.error(`Card "${card.id}" missing required fields`);
        isValid = false;
      }

      // Проверить, что есть хотя бы 1 вопрос
      if (!card.questions || card.questions.length === 0) {
        console.error(`Card "${card.id}" has no questions`);
        isValid = false;
      }

      // Проверить, что themeId корректный
      if (!content.themes[card.themeId]) {
        console.error(`Card "${card.id}" references non-existent theme: ${card.themeId}`);
        isValid = false;
      }
    });

    return isValid;
  },

  /**
   * Запустить все проверки валидации
   * @param content - контент из ContentContext
   */
  validateAll(content: AppContent): boolean {
    console.log('Running content validation...');
    
    const themeValidation = this.validateThemeCardReferences(content);
    const cardValidation = this.validateCardStructure(content);
    
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
 * Теперь используют ContentContext вместо прямого импорта
 */
export const contentStats = {
  /**
   * Получить статистику по контенту
   * @param content - контент из ContentContext
   */
  getStats(content: AppContent) {
    const themes = Object.values(content.themes);
    const cards = Object.values(content.cards);
    const emergencyCards = Object.values(content.emergencyCards);

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
   * @param content - контент из ContentContext
   */
  logStats(content: AppContent) {
    const stats = this.getStats(content);
    console.table(stats);
  }
};

/**
 * Удобные хуки для использования утилит с ContentContext
 * Эти хуки можно использовать в компонентах React
 */
export const useContentUtils = () => {
  // Этот хук должен использоваться внутри компонентов с ContentContext
  // Пример использования:
  // const { content } = useContent();
  // const themes = themeUtils.getAllThemes(content);
  
  return {
    themeUtils,
    cardUtils,
    localizationUtils,
    validationUtils,
    contentStats
  };
};