import { describe, it, expect } from 'vitest';
import type { ArticleData } from '../../types/content';
import { sortArticlesForDisplay } from '../../utils/articleOrdering';
import { PINNED_ARTICLE_IDS } from '../../utils/articlesList';

function a(id: string, order: number): ArticleData {
  return { id, title: id, preview: id, content: id, relatedThemeIds: [], order };
}

describe('sortArticlesForDisplay', () => {
  it('puts unread pinned first, then regular, then read pinned last', () => {
    const articles: ArticleData[] = [
      a('stress-management', 2),
      a('how-to-use', 1),
      a('anxiety-coping', 3),
    ];

    const sortedUnread = sortArticlesForDisplay({
      articles,
      readArticleIds: [],
      pinnedArticleIds: PINNED_ARTICLE_IDS,
    });
    expect(sortedUnread.map(x => x.id)).toEqual([
      'how-to-use',
      'stress-management',
      'anxiety-coping',
    ]);

    const sortedAfterRead = sortArticlesForDisplay({
      articles,
      readArticleIds: ['how-to-use'],
      pinnedArticleIds: PINNED_ARTICLE_IDS,
    });
    expect(sortedAfterRead.map(x => x.id)).toEqual([
      'stress-management',
      'anxiety-coping',
      'how-to-use',
    ]);
  });
});

