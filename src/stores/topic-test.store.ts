import { atom } from 'nanostores'

/** Increment when embedded topic test results change so home list match % refreshes. */
export const $topicTestVersion = atom(0)

export function bumpTopicTestVersion(): void {
  $topicTestVersion.set($topicTestVersion.get() + 1)
}
