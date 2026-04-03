/**
 * When one tab completes a remote sync, notify other tabs to re-read localStorage into nanostores.
 */
import { refreshAllStoresFromStorage } from '@/src/sync/storeHydration'

const CHANNEL_NAME = 'menhausen-sync-v1'

let channel: BroadcastChannel | null = null

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME)
  }
  return channel
}

export function initCrossTabSyncListener(): void {
  const ch = getChannel()
  if (!ch) return
  ch.onmessage = (ev: MessageEvent) => {
    if (ev.data?.type === 'sync-complete') {
      try {
        refreshAllStoresFromStorage()
      } catch (e) {
        console.warn('[crossTabSync] refresh failed:', e)
      }
    }
  }
}

export function notifyCrossTabSyncComplete(): void {
  try {
    getChannel()?.postMessage({ type: 'sync-complete', ts: Date.now() })
  } catch {
    // ignore
  }
}
