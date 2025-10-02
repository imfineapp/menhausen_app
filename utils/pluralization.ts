/**
 * Утилиты для правильного склонения слов в зависимости от количества
 */

/**
 * Склонение русских слов в зависимости от числа
 * @param count - количество
 * @param forms - массив форм: [1, 2-4, 5+] (например: ['день', 'дня', 'дней'])
 * @returns правильная форма слова
 */
export function pluralizeRussian(count: number, forms: [string, string, string]): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  
  if (n > 10 && n < 20) {
    return forms[2]; // 11-19 всегда множественное число
  }
  
  if (n1 === 1) {
    return forms[0]; // 1, 21, 31, 41, 51, 61, 71, 81, 91
  }
  
  if (n1 >= 2 && n1 <= 4) {
    return forms[1]; // 2-4, 22-24, 32-34, 42-44, 52-54, 62-64, 72-74, 82-84, 92-94
  }
  
  return forms[2]; // 0, 5-20, 25-30, 35-40, 45-50, 55-60, 65-70, 75-80, 85-90, 95-100
}

/**
 * Склонение английских слов в зависимости от числа
 * @param count - количество
 * @param singular - форма единственного числа
 * @param plural - форма множественного числа
 * @returns правильная форма слова
 */
export function pluralizeEnglish(count: number, singular: string, plural: string): string {
  return Math.abs(count) === 1 ? singular : plural;
}

/**
 * Получить правильную форму слова "день" на русском
 * @param count - количество дней
 * @returns правильная форма слова
 */
export function getRussianDayForm(count: number): string {
  return pluralizeRussian(count, ['день', 'дня', 'дней']);
}

/**
 * Получить правильную форму слова "day" на английском
 * @param count - количество дней
 * @returns правильная форма слова
 */
export function getEnglishDayForm(count: number): string {
  return pluralizeEnglish(count, 'day', 'days');
}
