import { describe, it, expect } from 'vitest';
import { ARTICLES_IDS, NON_ACHIEVEMENT_ARTICLE_IDS, getTotalArticlesCount } from '../../utils/articlesList';

describe('articlesList', () => {
  it('getTotalArticlesCount excludes non-achievement article ids', () => {
    const expected = ARTICLES_IDS.filter(
      (id) => !NON_ACHIEVEMENT_ARTICLE_IDS.includes(id as any)
    ).length;
    expect(getTotalArticlesCount()).toBe(expected);
  });
});

