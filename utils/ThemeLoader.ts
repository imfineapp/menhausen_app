/**
 * ThemeLoader - утилита для динамической загрузки тем и карточек из JSON файлов
 * Поддерживает кэширование и загрузку по требованию
 */

import { themesByLanguage, themeImports } from './themeImports';

export interface ThemeData {
  id: string;
  title: string;
  description: string;
  isPremium: boolean;
  welcomeMessage: string;
  cards: CardData[];
  order?: number; // Порядок сортировки из имени файла (01, 02, и т.д.)
}

export interface CardData {
  id: string;
  level: number;
  introduction: string;
  questions: string[];
  recommendation: string;
  mechanism: string;
  technique: string;
}

export class ThemeLoader {
  private static cache = new Map<string, ThemeData>();
  private static loadingPromises = new Map<string, Promise<ThemeData>>();

  /**
   * Загружает все темы для указанного языка
   * @param language - язык (en, ru)
   * @returns Promise<ThemeData[]> - массив всех тем
   */
  static async loadThemes(language: string): Promise<ThemeData[]> {
    try {
      console.log(`[ThemeLoader] Loading themes for language: ${language}`);
      // Всегда используем статические импорты для надежности
      const themes = await this._loadAllThemesFromImport(language);
      console.log(`[ThemeLoader] Successfully loaded ${themes.length} themes for language: ${language}`);
      return themes;
    } catch (error) {
      console.error('Error loading themes:', error);
      return [];
    }
  }

  /**
   * Загружает все темы через статические импорты (для development)
   */
  private static async _loadAllThemesFromImport(language: string): Promise<ThemeData[]> {
    try {
      console.log(`[ThemeLoader] Loading themes for language: ${language}`);
      
      // Используем статические импорты
      const themes = themesByLanguage[language as keyof typeof themesByLanguage] || [];
      
      console.log(`[ThemeLoader] Loaded ${themes.length} themes for language ${language}`);
      
      // Добавляем поле order на основе позиции в массиве (порядок файлов 01-*, 02-*, и т.д.)
      return themes.map((theme, index) => ({
        ...theme,
        order: index + 1
      }));
    } catch (error) {
      console.error('Error loading themes via static imports:', error);
      return [];
    }
  }

  /**
   * Загружает конкретную тему по ID
   * @param themeId - ID темы
   * @param language - язык
   * @returns Promise<ThemeData | null>
   */
  static async loadTheme(themeId: string, language: string): Promise<ThemeData | null> {
    const cacheKey = `${language}_${themeId}`;
    
    // Проверяем кэш
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Проверяем, не загружается ли уже
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Создаем промис загрузки - всегда используем статические импорты
    const loadingPromise = this._loadThemeFromImport(themeId, language);
    this.loadingPromises.set(cacheKey, loadingPromise as Promise<ThemeData>);

    try {
      const theme = await loadingPromise;
      if (theme) {
        this.cache.set(cacheKey, theme);
      }
      return theme;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Загружает конкретную карточку из темы
   * @param themeId - ID темы
   * @param cardId - ID карточки
   * @param language - язык
   * @returns Promise<CardData | null>
   */
  static async loadCard(themeId: string, cardId: string, language: string): Promise<CardData | null> {
    try {
      const theme = await this.loadTheme(themeId, language);
      if (!theme) return null;

      const card = theme.cards.find(c => c.id === cardId);
      return card || null;
    } catch (error) {
      console.error(`Error loading card ${cardId} from theme ${themeId}:`, error);
      return null;
    }
  }

  /**
   * Очищает кэш
   */
  static clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Получает размер кэша
   */
  static getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Приватный метод для загрузки темы из файла
   */
  private static async _loadThemeFromFile(themeId: string, language: string): Promise<ThemeData | null> {
    try {
      // В development режиме используем динамический импорт
      if ((import.meta as any).env?.DEV) {
        return await this._loadThemeFromImport(themeId, language);
      }
      
      // В production режиме используем fetch
      const filePath = `/data/content/${language}/themes/${themeId}.json`;
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load theme file: ${response.status}`);
      }

      const data = await response.json();
      
      // Валидируем структуру
      if (!this._validateThemeData(data)) {
        throw new Error('Invalid theme data structure');
      }

      return data as ThemeData;
    } catch (error) {
      console.error(`Error loading theme file for ${themeId}:`, error);
      return null;
    }
  }

  /**
   * Загружает тему через статические импорты (для development)
   */
  private static async _loadThemeFromImport(themeId: string, language: string): Promise<ThemeData | null> {
    try {
      console.log(`[ThemeLoader] Attempting to load theme ${themeId} for language ${language}`);
      
      // Используем статические импорты
      const theme = themeImports[language as keyof typeof themeImports]?.[themeId as keyof typeof themeImports.en];
      
      if (theme && this._validateThemeData(theme)) {
        console.log(`[ThemeLoader] Successfully loaded theme ${themeId} from static imports`);
        return theme as ThemeData;
      }
      
      console.warn(`[ThemeLoader] Theme ${themeId} not found in static imports for language ${language}`);
      return null;
    } catch (error) {
      console.error(`Error loading theme via static imports for ${themeId}:`, error);
      return null;
    }
  }

  /**
   * Валидирует структуру данных темы
   */
  private static _validateThemeData(data: any): boolean {
    return (
      data &&
      typeof data.id === 'string' &&
      typeof data.title === 'string' &&
      typeof data.description === 'string' &&
      typeof data.isPremium === 'boolean' &&
      typeof data.welcomeMessage === 'string' &&
      Array.isArray(data.cards) &&
      data.cards.every((card: any) => 
        typeof card.id === 'string' &&
        typeof card.level === 'number' &&
        typeof card.introduction === 'string' &&
        Array.isArray(card.questions) &&
        typeof card.recommendation === 'string' &&
        typeof card.mechanism === 'string' &&
        typeof card.technique === 'string'
      )
    );
  }
}
