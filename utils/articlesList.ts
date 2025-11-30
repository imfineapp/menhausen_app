// Централизованный список ID статей, используемый для загрузки и подсчёта общего числа
export const ARTICLES_IDS: string[] = [
  'stress-management',
  'anxiety-coping',
  'emotional-regulation',
  'sleep-hygiene',
  'mindfulness-basics',
  'relationships-health',
  'depression-support',
  'grief-healing',
  'anger-management',
  'burnout-prevention'
];

export function getTotalArticlesCount(): number {
  return ARTICLES_IDS.length;
}


