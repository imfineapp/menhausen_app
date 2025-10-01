/**
 * Статические импорты для тем в development режиме
 */

// Импортируем все JSON файлы тем
import stressEn from '../data/content/en/themes/01-stress.json';
import relationshipsEn from '../data/content/en/themes/02-relationships.json';
import selfIdentityEn from '../data/content/en/themes/03-self-identity.json';
import angerEn from '../data/content/en/themes/04-anger.json';
import depressionCopingEn from '../data/content/en/themes/05-depression-coping.json';
import griefLossEn from '../data/content/en/themes/06-grief-loss.json';
import burnoutRecoveryEn from '../data/content/en/themes/07-burnout-recovery.json';
import anxietyEn from '../data/content/en/themes/08-anxiety.json';

import stressRu from '../data/content/ru/themes/01-stress.json';
import relationshipsRu from '../data/content/ru/themes/02-relationships.json';
import selfIdentityRu from '../data/content/ru/themes/03-self-identity.json';
import angerRu from '../data/content/ru/themes/04-anger.json';
import depressionCopingRu from '../data/content/ru/themes/05-depression-coping.json';
import griefLossRu from '../data/content/ru/themes/06-grief-loss.json';
import burnoutRecoveryRu from '../data/content/ru/themes/07-burnout-recovery.json';
import anxietyRu from '../data/content/ru/themes/08-anxiety.json';

// Экспортируем все темы по языкам
export const themesByLanguage = {
  en: [
    stressEn,
    relationshipsEn,
    selfIdentityEn,
    angerEn,
    depressionCopingEn,
    griefLossEn,
    burnoutRecoveryEn,
    anxietyEn
  ],
  ru: [
    stressRu,
    relationshipsRu,
    selfIdentityRu,
    angerRu,
    depressionCopingRu,
    griefLossRu,
    burnoutRecoveryRu,
    anxietyRu
  ]
};

// Экспортируем отдельные темы для быстрого доступа
export const themeImports = {
  en: {
    'stress': stressEn,
    'relationships': relationshipsEn,
    'self-identity': selfIdentityEn,
    'anger': angerEn,
    'depression-coping': depressionCopingEn,
    'grief-loss': griefLossEn,
    'burnout-recovery': burnoutRecoveryEn,
    'anxiety': anxietyEn
  },
  ru: {
    'stress': stressRu,
    'relationships': relationshipsRu,
    'self-identity': selfIdentityRu,
    'anger': angerRu,
    'depression-coping': depressionCopingRu,
    'grief-loss': griefLossRu,
    'burnout-recovery': burnoutRecoveryRu,
    'anxiety': anxietyRu
  }
};
