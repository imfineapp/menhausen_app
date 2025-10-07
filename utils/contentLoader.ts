// ========================================================================================
// ЗАГРУЗЧИК КОНТЕНТА ДЛЯ МУЛЬТИЯЗЫЧНОСТИ
// ========================================================================================

import { AppContent, SupportedLanguage } from '../types/content';
import { ThemeLoader } from './ThemeLoader';

/**
 * Загружает контент для указанного языка
 * @param language - язык для загрузки
 * @returns Promise с загруженным контентом
 */
export async function loadContent(language: SupportedLanguage): Promise<AppContent> {
  try {
    console.log(`loadContent: Loading content for language: ${language}`);
    
    // Загружаем все секции контента параллельно (кроме themes и cards - они загружаются через ThemeLoader)
    console.log(`loadContent: Starting parallel imports for language: ${language}`);
    const [ui, mentalTechniques, mentalTechniquesMenu, survey, onboarding, emergencyCards, payments] = await Promise.all([
      import(`../data/content/${language}/ui.json`).then(m => { console.log(`loadContent: ui.json loaded`); return m; }),
      import(`../data/content/${language}/mental-techniques.json`).then(m => { console.log(`loadContent: mental-techniques.json loaded`); return m; }),
      import(`../data/content/${language}/mental-techniques-menu.json`).then(m => { console.log(`loadContent: mental-techniques-menu.json loaded`); return m; }),
      import(`../data/content/${language}/survey.json`).then(m => { console.log(`loadContent: survey.json loaded`); return m; }),
      import(`../data/content/${language}/onboarding.json`).then(m => { console.log(`loadContent: onboarding.json loaded`); return m; }),
      import(`../data/content/${language}/emergency-cards.json`).then(m => { console.log(`loadContent: emergency-cards.json loaded`); return m; }),
      import(`../data/content/${language}/payments.json`).then(m => { console.log(`loadContent: payments.json loaded`); return m; })
    ]);
    
    // Загружаем темы через ThemeLoader
    console.log(`loadContent: Loading themes through ThemeLoader for language: ${language}`);
    const themesData = await ThemeLoader.loadThemes(language);
    console.log(`loadContent: Loaded ${themesData.length} themes through ThemeLoader`);
    
    // Преобразуем массив тем в Record<string, ThemeData> для совместимости с AppContent
    const themesRecord: Record<string, any> = {};
    themesData.forEach(theme => {
      themesRecord[theme.id] = theme;
    });
    
    const content: AppContent = {
      themes: themesRecord,
      cards: {}, // Пустой объект, так как карточки теперь загружаются через ThemeLoader
      ui: ui.default,
      mentalTechniques: mentalTechniques.default,
      mentalTechniquesMenu: mentalTechniquesMenu.default,
      survey: survey.default,
      onboarding: onboarding.default,
      emergencyCards: emergencyCards.default,
      badges: ui.default.badges,
      about: ui.default.about,
      payments: payments.default
    };
    
    console.log(`loadContent: Content loaded successfully for language: ${language}`);
    console.log(`loadContent: UI content:`, ui.default);
    console.log(`loadContent: About content:`, content.about);
    return content;
  } catch (error) {
    console.error(`loadContent: Error loading content for language ${language}:`, error);
    
    // Fallback на английский язык
    if (language !== 'en') {
      console.log('loadContent: Falling back to English content');
      return loadContent('en');
    }
    
    // Если даже английский не загружается, возвращаем пустой контент
    throw new Error(`Failed to load content for language: ${language}`);
  }
}

/**
 * Кэш для загруженного контента
 */
const contentCache = new Map<SupportedLanguage, AppContent>();

/**
 * Загружает контент с кэшированием
 * @param language - язык для загрузки
 * @returns Promise с загруженным контентом
 */
export async function loadContentWithCache(language: SupportedLanguage): Promise<AppContent> {
  // Проверяем кэш
  if (contentCache.has(language)) {
    console.log(`loadContentWithCache: Using cached content for language: ${language}`);
    return contentCache.get(language)!;
  }
  
  // Загружаем и кэшируем
  console.log(`loadContentWithCache: Loading new content for language: ${language}`);
  const content = await loadContent(language);
  contentCache.set(language, content);
  console.log(`loadContentWithCache: Content cached for language: ${language}`);
  
  return content;
}

/**
 * Очищает кэш контента
 */
export function clearContentCache(): void {
  contentCache.clear();
  console.log('Content cache cleared');
}

/**
 * Предзагружает контент для указанного языка
 * @param language - язык для предзагрузки
 */
export function preloadContent(language: SupportedLanguage): void {
  if (!contentCache.has(language)) {
    loadContentWithCache(language).catch(error => {
      console.warn(`Failed to preload content for language ${language}:`, error);
    });
  }
}
