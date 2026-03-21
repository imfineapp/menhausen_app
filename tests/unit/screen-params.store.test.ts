import { describe, it, expect, beforeEach } from 'vitest'

import {
  $screenParams,
  patchScreenParams,
  setEarnedAchievementIds,
  addCompletedCardId,
} from '@/src/stores/screen-params.store'

describe('screen-params.store', () => {
  beforeEach(() => {
    patchScreenParams({
      currentTheme: '',
      earnedAchievementIds: [],
      completedCards: new Set(),
    })
  })

  it('patchScreenParams merges into map', () => {
    patchScreenParams({ currentTheme: 'stress' })
    expect($screenParams.get().currentTheme).toBe('stress')
  })

  it('setEarnedAchievementIds updates list', () => {
    setEarnedAchievementIds(['a', 'b'])
    expect($screenParams.get().earnedAchievementIds).toEqual(['a', 'b'])
  })

  it('addCompletedCardId adds to set', () => {
    addCompletedCardId('card-1')
    expect($screenParams.get().completedCards.has('card-1')).toBe(true)
  })
})
