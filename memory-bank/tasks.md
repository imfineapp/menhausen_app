# Memory Bank: Tasks

## Current Task
🎯 **NEW TASK** - Telegram Direct-Link Full Screen & Back Button Fix

Status: 🔍 **ANALYZING** - Initial complexity assessment

## Task Analysis & Requirements

### Description
Fix Telegram Mini App behavior when opened via direct-link (bot URL + "/app"). Currently, the app does not open in full screen mode and the Telegram SDK back button is not accessible.

**Current Behavior:**
- App opens via direct-link: `t.me/bot_name/app`
- App does NOT expand to full screen
- Back button from Telegram SDK is NOT available

**Expected Behavior:**
- App opens via direct-link in full screen mode
- Back button is visible and functional
- Proper Telegram WebApp initialization

### Complexity Assessment
**Level**: 2 (Simple Enhancement)
**Rationale**: 
- Single initialization point modification (App.tsx or main.tsx)
- Clear solution using Telegram WebApp SDK methods
- Well-documented API calls: `ready()`, `expand()`, `BackButton.show()`
- Minimal testing requirements
- Low risk, established SDK patterns

### Technology Stack
- Framework: React 18 + TypeScript
- Platform: Telegram Mini App
- SDK: Telegram WebApp API (`window.Telegram.WebApp`)
- Integration Points: App initialization (App.tsx/main.tsx)
- Testing: Manual testing in Telegram client, E2E tests

## Implementation Requirements

### Required Changes
1. **WebApp Initialization Enhancement**
   - Ensure `Telegram.WebApp.ready()` is called on app start
   - Add `Telegram.WebApp.expand()` to enable full screen mode
   - Must execute early in app lifecycle (useEffect in App.tsx or main.tsx)

2. **Back Button Implementation**
   - Show back button: `Telegram.WebApp.BackButton.show()`
   - Handle back button clicks: `Telegram.WebApp.onEvent('backButtonClicked', callback)`
   - Integrate with existing navigation system
   - Conditionally show based on navigation state

3. **Direct-Link Detection**
   - Detect when app is opened via direct-link vs inline mode
   - Apply full screen expansion specifically for direct-link opens
   - Maintain existing behavior for inline mode

### Key Technical Considerations
- Timing: Must call after Telegram WebApp is loaded but before first render
- Platform compatibility: Test on iOS, Android, Desktop
- Navigation integration: Back button should work with existing navigation
- Environment detection: Only apply in Telegram environment

## Success Criteria
- ✅ App opens in full screen mode when accessed via direct-link
- ✅ Back button appears in Telegram UI
- ✅ Back button correctly navigates within the app
- ✅ No regression in inline mode behavior
- ✅ Works across all Telegram platforms (iOS, Android, Desktop)

## Files Likely to Modify
- `App.tsx` or `main.tsx` - Add initialization calls
- Existing navigation logic - Integrate back button handling
- `utils/telegramUserUtils.ts` - Potentially enhance with expand/back button utilities

## Testing Strategy
- Manual testing in Telegram client (direct-link access)
- Verify full screen mode on different devices
- Test back button navigation flow
- Ensure no regression in inline mode
- Cross-platform validation (iOS, Android, Desktop)

---

## 🚨 COMPLEXITY LEVEL 2 DETECTED - REQUIRES PLAN MODE

**This task requires comprehensive planning before implementation.**

According to Memory Bank workflow rules, Level 2-4 tasks MUST go through PLAN mode for proper documentation and planning.