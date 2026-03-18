// Централизованный список ID статей, используемый для загрузки и подсчёта общего числа
export const ARTICLES_IDS: string[] = [
  // pinned / onboarding-like articles (always available, excluded from achievements)
  'how-to-use',

  // regular articles (counted for achievements)
  'stress-management',
  'anxiety-coping',
  'emotional-regulation',
  'sleep-hygiene',
  'mindfulness-basics',
  'relationships-health',
  'depression-support',
  'grief-healing',
  'anger-management',
  'burnout-prevention',
];

/** Articles that should be pinned in lists until read, then moved to the end. */
export const PINNED_ARTICLE_IDS = ['how-to-use'] as const;

/** Articles excluded from article-reading achievements progress/counts. */
export const NON_ACHIEVEMENT_ARTICLE_IDS = ['how-to-use'] as const;

export function getTotalArticlesCount(): number {
  // Total count for "read all articles" achievement must exclude non-achievement articles.
  return ARTICLES_IDS.filter(
    (id) => !NON_ACHIEVEMENT_ARTICLE_IDS.includes(id as any)
  ).length;
}


