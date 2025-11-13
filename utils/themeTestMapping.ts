// Утилиты для маппинга тем к темам психологического теста

import { PsychologicalTestTopic, PsychologicalTestPercentages } from '../types/psychologicalTest';
import { loadTestResults } from './psychologicalTestStorage';

/**
 * Маппинг ID темы к теме психологического теста
 */
const THEME_TO_TEST_TOPIC_MAP: Record<string, PsychologicalTestTopic> = {
  'stress': 'stress',
  'anxiety': 'anxiety',
  'relationships': 'relationships',
  'self-identity': 'self-esteem',
  'anger': 'anger',
  'depression-coping': 'depression',
  'burnout-recovery': 'stress', // Используем данные по стрессу
  // grief-loss не включен - для него возвращаем null
};

/**
 * Маппинг темы теста к ключу в объекте percentages (camelCase)
 * Необходим, так как PsychologicalTestTopic использует kebab-case ('self-esteem'),
 * а PsychologicalTestPercentages использует camelCase (selfEsteem)
 */
const TEST_TOPIC_TO_PERCENTAGE_KEY: Record<PsychologicalTestTopic, keyof PsychologicalTestPercentages> = {
  'stress': 'stress',
  'anxiety': 'anxiety',
  'relationships': 'relationships',
  'self-esteem': 'selfEsteem', // kebab-case -> camelCase
  'anger': 'anger',
  'depression': 'depression'
};

/**
 * Получает тему психологического теста для заданной темы
 * @param themeId - ID темы
 * @returns тему теста или null, если тема не связана с тестом
 */
export function getTestTopicForTheme(themeId: string): PsychologicalTestTopic | null {
  return THEME_TO_TEST_TOPIC_MAP[themeId] || null;
}

/**
 * Получает процент соответствия темы из результатов психологического теста
 * @param themeId - ID темы
 * @returns процент (0-100) или null, если тест не пройден или тема не связана с тестом
 */
export function getThemeMatchPercentage(themeId: string): number | null {
  // Получаем тему теста для данной темы
  const testTopic = getTestTopicForTheme(themeId);
  
  // Если тема не связана с тестом (например, grief-loss), возвращаем null
  if (!testTopic) {
    return null;
  }
  
  // Загружаем результаты теста
  const testResults = loadTestResults();
  
  // Если тест не пройден, возвращаем null
  if (!testResults || !testResults.percentages) {
    return null;
  }
  
  // Получаем ключ для доступа к процентам (camelCase)
  const percentageKey = TEST_TOPIC_TO_PERCENTAGE_KEY[testTopic];
  
  // Получаем процент для соответствующей темы
  const percentage = testResults.percentages[percentageKey];
  
  // Возвращаем процент, если он определен
  return percentage !== undefined ? percentage : null;
}

