import type { ArticleData } from '../types/content';

/**
 * Sort articles for display:
 * - unread pinned first
 * - then regular articles
 * - then read pinned at the end
 * Within each group: by explicit order.
 */
export function sortArticlesForDisplay(params: {
  articles: ArticleData[];
  readArticleIds: string[];
  pinnedArticleIds: readonly string[];
}): ArticleData[] {
  const { articles, readArticleIds, pinnedArticleIds } = params;
  const pinnedSet = new Set<string>(pinnedArticleIds as unknown as string[]);
  const readSet = new Set<string>(readArticleIds);

  return [...articles].sort((a, b) => {
    const aPinned = pinnedSet.has(a.id);
    const bPinned = pinnedSet.has(b.id);
    const aRead = readSet.has(a.id);
    const bRead = readSet.has(b.id);

    const aGroup = aPinned ? (aRead ? 2 : 0) : 1;
    const bGroup = bPinned ? (bRead ? 2 : 0) : 1;
    if (aGroup !== bGroup) return aGroup - bGroup;

    return (a.order || 0) - (b.order || 0);
  });
}

