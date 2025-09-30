/**
 * Статические импорты для тем в development режиме
 */

// Импортируем все JSON файлы тем
import stressManagementEn from '../data/content/en/themes/01-stress-management.json';
import anxietyManagementEn from '../data/content/en/themes/02-anxiety-management.json';
import sleepImprovementEn from '../data/content/en/themes/03-sleep-improvement.json';

import stressManagementRu from '../data/content/ru/themes/01-stress-management.json';
import anxietyManagementRu from '../data/content/ru/themes/02-anxiety-management.json';
import sleepImprovementRu from '../data/content/ru/themes/03-sleep-improvement.json';

// Экспортируем все темы по языкам
export const themesByLanguage = {
  en: [
    stressManagementEn,
    anxietyManagementEn,
    sleepImprovementEn
  ],
  ru: [
    stressManagementRu,
    anxietyManagementRu,
    sleepImprovementRu
  ]
};

// Экспортируем отдельные темы для быстрого доступа
export const themeImports = {
  en: {
    'stress-management': stressManagementEn,
    'anxiety-management': anxietyManagementEn,
    'sleep-improvement': sleepImprovementEn
  },
  ru: {
    'stress-management': stressManagementRu,
    'anxiety-management': anxietyManagementRu,
    'sleep-improvement': sleepImprovementRu
  }
};
