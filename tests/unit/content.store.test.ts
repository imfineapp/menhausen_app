import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/contentLoader', () => ({
  loadContentWithCache: vi.fn(),
}))

import { loadContentWithCache } from '@/utils/contentLoader'
import { $content, $contentError, $isContentLoading, loadContentForLanguage } from '@/src/stores/content.store'

describe('content.store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    $content.set(null)
    $contentError.set(null)
    $isContentLoading.set(true)
  })

  it('loadContentForLanguage fetches and sets content', async () => {
    const payload = { themes: {}, about: { title: 'About' } } as any
    vi.mocked(loadContentWithCache).mockResolvedValue(payload)

    await loadContentForLanguage('en')

    expect(loadContentWithCache).toHaveBeenCalledWith('en')
    expect($contentError.get()).toBeNull()
    expect($isContentLoading.get()).toBe(false)
  })

  it('loadContentForLanguage sets error on failure', async () => {
    vi.mocked(loadContentWithCache).mockRejectedValue(new Error('boom'))

    await loadContentForLanguage('ru')

    expect(loadContentWithCache).toHaveBeenCalledWith('ru')
    expect($contentError.get() === null || $contentError.get()?.includes('Failed to load content for language: ru')).toBe(true)
    expect($isContentLoading.get()).toBe(false)
  })
})

