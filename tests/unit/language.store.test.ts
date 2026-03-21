import { describe, it, expect, beforeEach } from 'vitest'

import { $language, setLanguage, type Language } from '@/src/stores/language.store'

describe('language.store', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('setLanguage updates atom', () => {
    setLanguage('ru')
    expect($language.get()).toBe('ru')
  })

  it('setLanguage is no-op when same value', () => {
    const before = $language.get()
    setLanguage(before as Language)
    expect($language.get()).toBe(before)
  })
})
