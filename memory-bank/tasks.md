# Memory Bank: Tasks

## Current Task
🎯 **Fix Memory Leak Risk from Uncleaned Timeouts** (branch: `user-achievements-system`)                                                                            

Mode: **PLAN**  
Complexity Level: **Level 2 (Simple Enhancement)**  
Status: **IN PROGRESS**  

### Goal
Fix memory leak risks and race conditions from setTimeout calls in App.tsx that lack proper cleanup guards. Prevent calls to functions on unmounted components and ensure all timeouts are properly cleaned up, including nested timeouts.

### Scope
- Fix timeout cleanup in `handleCheckInSubmit` (line ~892)
- Fix timeout cleanup in `handleCardExerciseComplete` (line ~1282)
- Fix timeout cleanup in `handleThemeCardClick` (line ~1348)
- Fix nested timeout cleanup in Telegram WebApp initialization (lines ~293, ~302)
- Add mounted guards to timeout callbacks to prevent state updates on unmounted components
- Ensure Promise-based setTimeout (line ~540) is handled appropriately

### Problem Analysis

**Current State:**
- Timeout refs are defined: `checkInTimeoutRef`, `cardExerciseTimeoutRef`, `themeCardClickTimeoutRef`, `telegramTimeoutRefs`
- Cleanup useEffect exists (lines 598-625) that clears timeouts on unmount
- However, timeout callbacks can still execute after component unmounts, causing:
  - Calls to `setEarnedAchievementIds` on unmounted component
  - Calls to `navigateTo` on unmounted component
  - Calls to `checkAndShowAchievements` on unmounted component
  - Race conditions when multiple timeouts fire simultaneously

**Specific Issues:**
1. **handleCheckInSubmit** (line ~892): Timeout callback calls `setEarnedAchievementIds` and `navigateTo` without mounted check
2. **handleCardExerciseComplete** (line ~1282): Timeout callback calls `checkAndShowAchievements` without mounted check
3. **handleThemeCardClick** (line ~1348): Timeout callback calls `checkAndShowAchievements` without mounted check
4. **Telegram WebApp nested timeout** (line ~302): Nested setTimeout for fullscreen might not be cleaned if parent is cleared
5. **Promise-based setTimeout** (line ~540): No cleanup mechanism for Promise delay

### Checklist
- [ ] Add `isMountedRef` to track component mount state
- [ ] Update `handleCheckInSubmit` timeout callback with mounted guard
- [ ] Update `handleCardExerciseComplete` timeout callback with mounted guard
- [ ] Update `handleThemeCardClick` timeout callback with mounted guard
- [ ] Fix nested Telegram WebApp timeout cleanup
- [ ] Review Promise-based setTimeout usage (line ~540) for cleanup needs
- [ ] Ensure all timeout callbacks check mounted state before state updates
- [ ] Test timeout cleanup on component unmount
- [ ] Verify no race conditions with multiple simultaneous timeouts
- [ ] Run lint and type check (`npm run lint:all`)

### Acceptance Criteria
- All setTimeout callbacks check component mount state before executing
- All timeouts are properly cleaned up on component unmount
- Nested timeouts are properly handled and cleaned
- No state updates occur on unmounted components
- No race conditions from redundant achievement checks
- No memory leaks from uncleaned timeouts
- CI passes; no new eslint/type errors

### Implementation Plan (Level 2)

#### Overview
Add mounted state tracking and guards to all timeout callbacks to prevent memory leaks and race conditions. Ensure proper cleanup of all timeouts, including nested ones.

#### Files to Modify
- `App.tsx` (primary file with all timeout issues)

#### Implementation Steps

1. **Add Mounted State Tracking**
   - Add `isMountedRef` using `useRef<boolean>(true)`
   - Set to `true` in useEffect on mount
   - Set to `false` in cleanup function on unmount

2. **Fix handleCheckInSubmit Timeout (line ~892)**
   - Add mounted check before `setEarnedAchievementIds` and `navigateTo`
   - Ensure timeout is cleared before setting new one (already done, verify)
   - Add mounted guard in timeout callback

3. **Fix handleCardExerciseComplete Timeout (line ~1282)**
   - Add mounted check before `checkAndShowAchievements`
   - Ensure timeout is cleared before setting new one (already done, verify)
   - Add mounted guard in timeout callback

4. **Fix handleThemeCardClick Timeout (line ~1348)**
   - Add mounted check before `checkAndShowAchievements`
   - Ensure timeout is cleared before setting new one (already done, verify)
   - Add mounted guard in timeout callback

5. **Fix Nested Telegram WebApp Timeout (lines ~293, ~302)**
   - Ensure nested `fullscreen` timeout is stored in ref before parent timeout completes
   - Add cleanup for nested timeout in the cleanup useEffect
   - Consider using AbortController pattern for nested timeouts if needed

6. **Review Promise-based setTimeout (line ~540)**
   - Check if this needs cleanup (it's in `checkAndShowAchievements` function)
   - If function can be called after unmount, add mounted check or cancellation

7. **Update Cleanup useEffect (lines 598-625)**
   - Verify all timeout refs are cleared
   - Add `isMountedRef.current = false` in cleanup
   - Ensure nested timeout cleanup is comprehensive

#### Potential Challenges
- **Nested timeout cleanup**: The nested setTimeout for Telegram fullscreen might need special handling to ensure it's cleaned even if parent is cleared
- **Promise cancellation**: The Promise-based setTimeout might need AbortController pattern for proper cancellation
- **Race conditions**: Multiple timeouts firing simultaneously might need debouncing or queue management
- **Testing**: Verifying cleanup on unmount requires careful test setup

#### Testing Strategy
- Manual testing: Navigate quickly between screens to trigger unmounts during timeout execution
- Verify no console errors from state updates on unmounted components
- Check that achievement checks don't fire redundantly
- Verify Telegram WebApp timeouts are cleaned properly
- Run lint check (`npm run lint:all`) and type check
- Consider adding unit tests for timeout cleanup if test infrastructure supports it

---

## Previous Task (Completed)
**Task**: Global i18n migration for user-visible strings  
**Date Completed**: 2025-10-31  
**Status**: ✅ **COMPLETED** (Archived)
**Archive**: `memory-bank/archive/archive-i18n-migration-user-point-manager.md`
**Reflection**: `memory-bank/reflection/reflection-i18n-migration-user-point-manager.md`

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

*This file tracks the current active task. Previous tasks are archived in `memory-bank/archive/` and reflected in `memory-bank/reflection/`.*
