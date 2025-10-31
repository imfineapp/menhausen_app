# Archive: Global i18n migration for user-visible strings (branch: user-point-manager)

## Summary
Migrated user-visible strings to centralized i18n, fixed BugBot remarks related to points refresh and level consistency, and standardized points balance usage.

## Scope
- i18n migration for `App.tsx`, `HomeScreen.tsx`, `ProgressBlock.tsx`, `StatusBlocksRow.tsx`.
- Added missing i18n keys and types in `ContentContext.tsx` and `types/content.ts`.
- Bug fixes: live points updates in `ActivityBlockNew`, min-level consistency, points source from `menhausen_points_balance`.

## Key Changes
- `App.tsx`: loading/error and fallback texts from `getUI()`; fixed hook usage.
- `HomeScreen.tsx`: level and aria-label from i18n; points from balance.
- `ProgressBlock.tsx`: i18n labels; level min=1; points from balance; next target from balance.
- `StatusBlocksRow.tsx`: i18n titles via `getUI()`/`getLocalizedBadges()`.
- `ContentContext.tsx`: added common/card/profile keys with fallbacks.
- `types/content.ts`: extended `UITexts` to include optional keys.
- `PointsManager.ts`: `getNextLevelTarget()` now uses `menhausen_points_balance`.

## Verification
- Type-check: pass
- Lint: pass
- Unit tests: 27/27 passed (249 passed, 1 skipped)
- E2E tests: 81/81 passed

## Links
- Reflection: `memory-bank/reflection/reflection-i18n-migration-user-point-manager.md`
- Task: `memory-bank/tasks.md`

## Notes
- Analytics identifiers unchanged.
- UI layout preserved.
