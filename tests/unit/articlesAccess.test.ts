import { describe, it, expect } from 'vitest'
import {
  ARTICLE_UNLOCK_POINTS_STEP,
  getRequiredPointsForArticle,
  isArticleLocked,
} from '../../utils/articlesAccess'

describe('articlesAccess (wallet balance gating)', () => {
  it('exposes a positive step for tuning', () => {
    expect(ARTICLE_UNLOCK_POINTS_STEP).toBeGreaterThan(0)
  })

  it('first three articles require 0 points', () => {
    expect(getRequiredPointsForArticle(1)).toBe(0)
    expect(getRequiredPointsForArticle(2)).toBe(0)
    expect(getRequiredPointsForArticle(3)).toBe(0)
  })

  it('increases required points by step for each article after the third', () => {
    const step = ARTICLE_UNLOCK_POINTS_STEP
    expect(getRequiredPointsForArticle(4)).toBe(step)
    expect(getRequiredPointsForArticle(5)).toBe(step * 2)
    expect(getRequiredPointsForArticle(6)).toBe(step * 3)
  })

  it('isArticleLocked uses wallet balance vs required', () => {
    const step = ARTICLE_UNLOCK_POINTS_STEP
    expect(isArticleLocked(4, 0)).toBe(true)
    expect(isArticleLocked(4, step - 1)).toBe(true)
    expect(isArticleLocked(4, step)).toBe(false)
    expect(isArticleLocked(4, step + 100)).toBe(false)
  })

  it('treats missing balance as 0', () => {
    expect(isArticleLocked(4, NaN)).toBe(true)
    expect(isArticleLocked(1, NaN)).toBe(false)
  })
})
