# Task Archive: Fix Memory Leak Risk from Uncleaned Timeouts + Update E2E Tests for Branch Changes

## Metadata
- **Complexity**: Level 3 (Intermediate Feature)
- **Type**: Feature Stabilization & Test Infrastructure Overhaul
- **Date Completed**: 2025-11-07
- **Branch**: `user-achievements-system`
- **Related Documents**:
  - Reflection: `memory-bank/reflection/reflection-fix-memory-leak-and-e2e-tests.md`
  - Task Tracker: `memory-bank/tasks.md`

## Summary
Stabilized asynchronous timeout handling in `App.tsx` to eliminate memory leaks and race conditions, then refactored every failing Playwright suite to align with the updated achievement and referral flows introduced on the branch. Shared helpers now seed deterministic state, eliminating brittle onboarding flows and ensuring all 76 Playwright tests pass.

## Requirements
- Prevent `setTimeout` callbacks from running after component unmounts (mounted guards + cleanup)
- Handle nested Telegram fullscreen timeouts safely
- Update all affected Playwright suites (achievements, referrals, navigation, day boundary) to reflect new app behavior
- Centralize reward screen, check-in, and survey handling to cut test flakiness
- Achieve clean `npm run lint:all` and `npx playwright test` outcomes

## Implementation
### Approach
1. Added `isMountedRef` to `App.tsx` and wrapped every timeout callback with mounted checks.
2. Enhanced `checkAndShowAchievements` and related flows to abort safely when unmounted.
3. Built shared helpers (`seedCheckinHistory`, `primeAppForHome`, reward navigation) to prime deterministic state.
4. Rewrote each failing Playwright suite to rely on the helpers rather than replaying UI walkthroughs.
5. Simplified smart-navigation verification into a pure logic test to reduce flake.

### Key Components
- **`App.tsx`**: Mounted guard logic for all timeout callbacks and achievement handling.
- **`tests/e2e/utils/test-helpers.ts`**: New seeding + check-in helpers replacing ad-hoc flows.
- **`tests/e2e/utils/skip-survey.ts`**: Slimmed survey skipper that seeds completion state.
- **Playwright Suites**: Updated to use deterministic helpers (check-in persistence, daily flow, day boundary, content loading, i18n, referrals, etc.).

### Files Changed
- `App.tsx`
- `tests/e2e/utils/test-helpers.ts`
- `tests/e2e/utils/skip-survey.ts`
- Updated suites under `tests/e2e/*` (check-in, daily flow, day boundary, home progress, content loading, smart navigation, referral system, points & achievements)
- Documentation: `memory-bank/tasks.md`, `progress.md`, `activeContext.md`, and this archive

## Testing
- `npx playwright test`
- `npm run lint:all`

_All 76 Playwright tests and lint checks now pass without overrides._

## Lessons Learned
- Deterministic localStorage seeding is more reliable than replaying multi-step onboarding flows.
- Consolidating reward-screen handling in one helper prevents future suites from re-implementing fragile waits.
- Capturing navigation logic in pure function tests reduces surface area for flake.

## Future Considerations
- Document helper usage in a short README for future contributors.
- Consider extending helpers with typed fixtures to cover future achievement/referral combinations.
- Track test-infrastructure changes in a lightweight changelog alongside code diffs.

## References
- Reflection: `memory-bank/reflection/reflection-fix-memory-leak-and-e2e-tests.md`
- Playwright results: `test-results/results.json`, `playwright-report/index.html`
- Task tracker: `memory-bank/tasks.md`
