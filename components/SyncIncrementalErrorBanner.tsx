import React, { useEffect, useRef } from 'react'
import { useStore } from '@nanostores/react'

import { capture, AnalyticsEvent } from '@/src/effects/analytics.effects'
import { errorsMessages } from '@/src/i18n/messages/errors'
import { $incrementalSyncError, setIncrementalSyncError } from '@/src/stores/incremental-sync.store'

/**
 * Non-blocking banner when batched/incremental sync fails (distinct from initial mount sync).
 */
export function SyncIncrementalErrorBanner() {
  const rawMessage = useStore($incrementalSyncError)
  const errors = useStore(errorsMessages)
  const lastCaptured = useRef<string | null>(null)

  useEffect(() => {
    if (!rawMessage) {
      lastCaptured.current = null
      return
    }
    if (lastCaptured.current === rawMessage) return
    lastCaptured.current = rawMessage
    capture(AnalyticsEvent.INCREMENTAL_SYNC_ERROR_SHOWN, {
      message_length: rawMessage.length,
    })
  }, [rawMessage])

  if (!rawMessage) return null

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[100] px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))] flex flex-col gap-1 bg-[#2a1818] border-b border-red-900/50 shadow-md"
      role="alert"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-red-100">{errors.syncIncrementalErrorTitle}</p>
          <p className="text-xs text-red-200/90 mt-0.5">{errors.syncIncrementalErrorHint}</p>
          {import.meta.env.DEV && (
            <p className="text-[10px] font-mono text-red-300/80 mt-1 break-all">{rawMessage}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIncrementalSyncError(null)}
          className="shrink-0 text-xs text-red-100/90 underline underline-offset-2 hover:text-white"
        >
          {errors.syncIncrementalErrorDismiss}
        </button>
      </div>
    </div>
  )
}
