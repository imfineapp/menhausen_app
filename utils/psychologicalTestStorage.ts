// Утилиты для хранения результатов психологического теста

import { 
  PsychologicalTestResults, 
  PsychologicalTestHistoryEntry,
  PsychologicalTestScores,
  PsychologicalTestPercentages
} from '../types/psychologicalTest';

const STORAGE_KEY = 'psychological-test-results';

/**
 * Сохраняет результаты теста в localStorage
 * @param scores - баллы по каждой теме
 * @param percentages - проценты по каждой теме
 */
export function saveTestResults(
  scores: PsychologicalTestScores,
  percentages: PsychologicalTestPercentages
): boolean {
  try {
    const now = new Date().toISOString();
    
    // Загружаем существующие данные
    const existing = loadTestResults();
    
    // Создаем новую запись истории
    const historyEntry: PsychologicalTestHistoryEntry = {
      date: now,
      scores: { ...scores },
      percentages: { ...percentages }
    };
    
    // Обновляем результаты
    const results: PsychologicalTestResults = {
      lastCompletedAt: now,
      scores: { ...scores },
      percentages: { ...percentages },
      history: existing 
        ? [...existing.history, historyEntry]
        : [historyEntry]
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    console.log('Psychological test results saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save psychological test results:', error);
    return false;
  }
}

/**
 * Загружает последние результаты теста из localStorage
 * @returns результаты теста или null, если их нет
 */
export function loadTestResults(): PsychologicalTestResults | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    
    const results = JSON.parse(stored) as PsychologicalTestResults;
    return results;
  } catch (error) {
    console.error('Failed to load psychological test results:', error);
    return null;
  }
}

/**
 * Проверяет, был ли тест пройден хотя бы раз
 * @returns true, если тест был пройден
 */
export function hasTestBeenCompleted(): boolean {
  const results = loadTestResults();
  return results !== null && results.lastCompletedAt !== undefined;
}

/**
 * Получает дату последнего прохождения теста
 * @returns ISO дата или null
 */
export function getLastCompletedDate(): string | null {
  const results = loadTestResults();
  return results?.lastCompletedAt || null;
}

/**
 * Загружает историю прохождений теста
 * @returns массив записей истории
 */
export function loadTestHistory(): PsychologicalTestHistoryEntry[] {
  const results = loadTestResults();
  return results?.history || [];
}

/**
 * Очищает все результаты теста (для тестирования или сброса)
 */
export function clearTestResults(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Psychological test results cleared');
  } catch (error) {
    console.error('Failed to clear psychological test results:', error);
  }
}

