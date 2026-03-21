import type { ArticleData } from '@/types/content'
import { sortArticlesForDisplay } from '@/utils/articleOrdering'

/**
 * Articles prepared for list UI (ordering + pinned handling uses shared util).
 */
export function getOrderedArticlesForDisplay(
  articles: ArticleData[],
  readArticleIds: string[],
  pinnedArticleIds: readonly string[]
): ArticleData[] {
  return sortArticlesForDisplay({ articles, readArticleIds, pinnedArticleIds })
}
