# Memory Bank: Tasks

## Current Task
🎯 **Global i18n migration for user-visible strings** (branch: `user-point-manager`)

Mode: **VAN**  
Complexity Level: **Level 2 (Simple Enhancement)**  
- Status: ✅ **COMPLETED** (Archived)
- Archive: `memory-bank/archive/archive-i18n-migration-user-point-manager.md`
- Reflection: `memory-bank/reflection/reflection-i18n-migration-user-point-manager.md`

### Goal
Migrate all user-visible text to the centralized i18n/content system to ensure consistency and easy localization. Prioritize changes introduced or touched in this branch.

### Scope
- Extract hardcoded user-facing strings from components, screens, and utils into `ContentContext`/i18n structures.
- Prioritize files changed in this branch (e.g., `App.tsx`, `components/ActivityBlockNew.tsx`, `components/HomeScreen.tsx`).
- Preserve analytics/event names and internal identifiers (do not localize event keys).
- Maintain existing design and spacing; no UI regressions.

### Checklist
- [x] Audit this branch for hardcoded user-visible strings
- [x] For each string, create/extend keys in `content.ui.*` (respect existing naming conventions)
- [x] Replace usages with i18n lookups via `useContent()`
- [x] Add safe fallbacks where necessary to avoid runtime errors
- [x] Verify Russian and English display for affected screens
- [x] Lint and type-check pass (`npm run lint:all`)
- [x] BugBot: Add `storage` and `points:updated` listeners in `ActivityBlockNew` for points refresh (earnedPoints/nextTarget)
- [x] BugBot: Align level calculation across UI (min level should be 1 everywhere: `HomeScreen`, `ProgressBlock`)
- [x] Points source: Use `menhausen_points_balance` as the source of truth for total points display (avoid recomputing from transactions)

### Acceptance Criteria
- All user-facing strings in changed files are sourced from i18n/content.
- RU/EN switch renders correctly without missing keys.
- No changes to analytics event/property names.
- CI passes; no new eslint/type errors.
- ActivityBlockNew updates points (earned/target) live on `storage` and `points:updated`.
- Level value is consistent across `HomeScreen` and `ProgressBlock` (never shows 0; min 1).
- Total points displayed come from `menhausen_points_balance` balance key, not from aggregated transactions.

### Implementation Plan (Level 2)

- Overview: Centralize visible strings into `ContentContext` and replace hardcoded literals in this branch’s touched files.
- Files to Modify:
  - `components/HomeScreen.tsx` (user level label, any visible labels/messages)
  - `components/ActivityBlockNew.tsx` (weekday labels, headings, streak text if visible)
  - `App.tsx` (any toasts/messages if present)
  - `components/LevelsScreen.tsx` (verify strings are from `content.ui.levels`)
  - `components/ContentContext.tsx` (add/organize keys under `content.ui.*`)
  - `components/ProgressBlock.tsx` (i18n for labels, consistent level logic, points source)
  - `components/StatusBlocksRow.tsx` (i18n for titles)
- Steps:
  1) Audit the listed files for visible literals and list missing keys.
  2) Add keys to `ContentContext` under appropriate namespaces (`ui.home`, `ui.activity`, `ui.levels`, etc.).
  3) Replace literals with `useContent()` lookups; provide fallbacks where necessary.
  4) Ensure weekday labels are generated via i18n content or locale logic consistently.
  5) Verify both RU and EN outputs visually and via quick checks.
  6) Run `npm run lint:all` and fix any issues.
- Bug Fixes (from BugBot remarks):
  - ActivityBlockNew: add live refresh for points using `storage` and `points:updated` listeners; ensure `earnedPoints` and `nextTarget` update.
  - Level display: standardize min-level logic (use `Math.max(1, computedLevel)`); apply to `ProgressBlock` and `HomeScreen`.
  - Points balance source: read total points from `menhausen_points_balance` (persisted balance) instead of recomputing from transactions; update `PointsManager` accessors or call-sites accordingly.
- Potential Challenges:
  - Avoid localizing analytics/event identifiers.
  - Keep spacing and layout unchanged when replacing strings.
  - Ensure no missing keys for either language.
- Testing Strategy:
  - Manual smoke test for the three affected screens.
  - Toggle language to RU/EN and verify labels render.
  - Lint check (`npm run lint:all`) and quick type check build.
  - Unit tests around points display and level consistency.

---

## Previous Task (Completed)
**Task**: User Points and Rewards System  
**Date Completed**: January 13, 2025  
**Status**: ✅ **COMPLETED**  
**Summary**: Implemented comprehensive points system with transactions, levels, and rewards

---

## 📋 **Task History**

### Recent Completions
1. **Global i18n migration for user-visible strings** (2025-10-31) - Level 2
2. **User Points and Rewards System** (2025-01-13) - Level 3
3. **Telegram Direct-Link Full Screen & Back Button Fix** (2025-10-08) - Level 2
4. **PostHog Analytics Integration** (2025-09-30) - Level 2
5. **Theme Cards Logic Implementation** (2025-09-29) - Level 3
6. **Premium Theme Paywall Navigation** (2025-09-29) - Level 2
7. **Telegram User ID Display** (2025-09-29) - Level 2

---

## 🎯 **Next Steps**

**Ready for new task assignment!**

To start a new task:
1. Type `VAN` to enter VAN MODE
2. Provide task description
3. System will analyze complexity and create implementation plan

---

*This file tracks the current active task. Previous tasks are archived in `memory-bank/archive/` and reflected in `memory-bank/reflection/`.*