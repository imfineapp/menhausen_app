# Sync architecture audit — closure

This document records completion of the sync architecture audit and how open review notes were resolved. The original audit plan lives in the Cursor plans workspace (`sync_architecture_audit_0bc3850c.plan.md`).

## Completed (P0–P2, P3-13/14)

- **P0:** Fetch cache cleared before `initialSync` / `forceSync`; mutex serializes concurrent syncs; missing store subscriptions added; synchronous hydration after merge.
- **P1:** Failed background uploads queued; dirty-only push after merge; exponential backoff on offline queue; keepalive size check with offline fallback.
- **P2:** Cross-tab `BroadcastChannel` + store refresh; incremental sync error atom; premium activation delay removed.
- **P3-13:** Analytics `synced_types` populated with actual types.
- **P3-14:** Redundant refreshes addressed via sync hydration.

## Explicitly deferred

- **§4 follow-ups** from the audit (Supabase Realtime, React Query, per-type `sync_version`, payload compression, service worker): unchanged — backend or large refactors.
- **Snapshot signature performance:** full `JSON.stringify` per type; revisit with profiling if needed.
- **P3-12 verbose logs:** `syncLog.debug` is development-only via [`utils/supabaseSync/syncLogger.ts`](../utils/supabaseSync/syncLogger.ts); production hot paths are not spammed.

## Superseded plan items

- **`awaitCurrentSync` / `$pendingSyncCount` on `sync.store`:** concurrency is handled inside `SupabaseSyncService` (`syncMutex`); queue visibility uses `$pendingSyncQueueCount`.

## Wrap-up shipped in this repo

- Pure **dirty signature** helpers + unit tests: [`utils/supabaseSync/dirtySignatures.ts`](../utils/supabaseSync/dirtySignatures.ts), tests under `tests/unit/`.
- **Incremental sync error** surfaced in the UI with i18n-safe copy; optional PostHog event when the banner is shown.
- **Cross-tab sync:** richer context on refresh failure logs in [`src/sync/crossTabSync.ts`](../src/sync/crossTabSync.ts).

## Manual QA matrix

| Scenario | Check |
|----------|--------|
| Foreground after long background | Fresh pull after cache clear; no dropped `forceSync` |
| Two tabs | Other tab refreshes after sync completes |
| Offline → online | Offline queue retries with backoff |
| Large payload on page hide | Oversized keepalive falls back to offline queue |
