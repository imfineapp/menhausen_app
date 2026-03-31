import { describe, it, expect, beforeEach, vi } from 'vitest'
import { openPage, redirectPage } from '@nanostores/router'

import { $router } from '@/src/stores/router.store'

function waitForRouterTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('router.store', () => {
  beforeEach(async () => {
    redirectPage($router, 'loading')
    await waitForRouterTick()
  })

  it('navigates to parameterized route', async () => {
    openPage($router, 'themeHome', { themeId: 'stress' })
    await waitForRouterTick()

    const page = $router.get()
    expect(page?.route).toBe('themeHome')
    expect((page?.params as Record<string, string> | undefined)?.themeId).toBe('stress')
  })

  it('returns to home after back from reward', async () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {
      window.history.pushState({}, '', '/')
    })

    window.history.pushState({}, '', '/')
    $router.open(window.location.pathname)
    window.history.pushState({}, '', '/reward')
    $router.open(window.location.pathname)
    await waitForRouterTick()

    window.history.back()
    await waitForRouterTick()
    $router.open(window.location.pathname)
    await waitForRouterTick()

    expect(backSpy).toHaveBeenCalledTimes(1)
    expect($router.get()?.route).toBe('home')
    backSpy.mockRestore()
  })

  it('resolves direct url to psych test question route', async () => {
    $router.open('/psych-test/q/15')
    await waitForRouterTick()

    const page = $router.get()
    expect(page?.route).toBe('psychTestQuestion')
    expect((page?.params as Record<string, string> | undefined)?.num).toBe('15')
  })

  it('does not trap user on reward after back', async () => {
    openPage($router, 'home')
    openPage($router, 'reward')
    await waitForRouterTick()

    window.history.back()
    await waitForRouterTick()
    $router.open(window.location.pathname)
    await waitForRouterTick()

    openPage($router, 'reward')
    await waitForRouterTick()
    window.history.back()
    await waitForRouterTick()
    $router.open(window.location.pathname)
    await waitForRouterTick()

    expect($router.get()?.route).toBe('home')
  })

  it('redirects unknown route to home', async () => {
    $router.open('/xampp/stress')
    await waitForRouterTick()

    expect($router.get()?.route).toBe('home')
  })
})
