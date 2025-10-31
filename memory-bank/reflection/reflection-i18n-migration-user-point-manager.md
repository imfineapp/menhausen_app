# Reflection: Global i18n migration for user-visible strings (branch: user-point-manager)

## Overview
Scope: migrate user-visible strings to i18n; fix BugBot remarks; ensure consistent points/levels display; preserve analytics names; keep UI unchanged.

## What worked well
- Centralized strings via `getUI()` and added missing keys in `ContentContext` with safe fallbacks.
- Eliminated hardcoded labels in `HomeScreen`, `ProgressBlock`, `StatusBlocksRow`, and key areas of `App.tsx`.
- Fixed accessibility by providing i18n-driven `aria-label` with fallback.
- Switched points target and UI totals to read from `menhausen_points_balance` (single source of truth).
- Standardized level calculation with `Math.max(1, computedLevel)`.
- Live UI refresh for points using `storage` and `points:updated` listeners.
- CI parity: type-check/lint clean; unit and e2e tests fully green.

## Challenges
- Avoiding hook rule violations while introducing i18n fallbacks in loader components.
- Ensuring tests expecting English labels still pass after converting to i18n.
- Coordinating points source change (balance vs. transaction sum) without breaking history views.

## Lessons learned
- Keep i18n fallbacks close to `ContentContext` to reduce callsite complexity.
- Use a single balance source (`menhausen_points_balance`) for UI to avoid drift; keep transaction APIs for history.
- Build UI-level events (`points:updated`) for decoupled refresh; test listeners explicitly.

## Improvements for next time
- Add i18n lint/check to catch newly hardcoded strings.
- Centralize ARIA label keys under `ui.common` to reduce scattering.
- Provide a thin selector util for level/targets to avoid duplicating `Math.max(1, ...)` logic in components.

## Verification
- Type-check: pass
- Lint: pass
- Unit tests: 27/27 passed (249 passed, 1 skipped)
- E2E tests: 81/81 passed

## Impact
- Consistent multilingual UI for key surfaces.
- Stable points/level presentation across components.
- Better accessibility coverage.
