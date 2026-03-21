import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  sortArticlesForDisplay: vi.fn(),
}))

vi.mock('@/utils/articleOrdering', () => ({
  sortArticlesForDisplay: mocks.sortArticlesForDisplay,
}))

import { getOrderedArticlesForDisplay } from '@/src/domain/articles.domain'

describe('articles.domain', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array for empty input', () => {
    mocks.sortArticlesForDisplay.mockReturnValue([])
    expect(getOrderedArticlesForDisplay([], [], [])).toEqual([])
  })

  it('delegates ordering to sortArticlesForDisplay with correct args', () => {
    const articles = [{ id: 'a1' }, { id: 'a2' }] as any
    const readArticleIds = ['a1']
    const pinnedArticleIds = ['a2']
    mocks.sortArticlesForDisplay.mockReturnValue([articles[1], articles[0]])

    const result = getOrderedArticlesForDisplay(articles, readArticleIds, pinnedArticleIds)

    expect(mocks.sortArticlesForDisplay).toHaveBeenCalledWith({
      articles,
      readArticleIds,
      pinnedArticleIds,
    })
    expect(result[0]).toEqual(articles[1])
  })
})

