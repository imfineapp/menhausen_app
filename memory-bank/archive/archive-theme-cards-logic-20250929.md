# Archive: Theme Cards Logic Implementation (2025-09-29)

## Scope
- Terminology update in theme cards context (Attempts), daily check-ins unchanged
- Progressive unlocking (sequential availability)
- Real progress tracking stored locally
- Completion = answers + rating
- Welcome screen gating (only if first card not started)
- Attempts counter per card and theme progress
- Dynamic theme loading from JSON with caching
- UI flow: Start button on card details goes directly to first question
- Save rating comment (ratingComment) with completed attempt

## Key Changes
- utils/ThemeCardManager.ts
  - New data model: only completed attempts saved
  - Added `ratingComment?: string` to `CompletedAttempt`
  - `addCompletedAttempt(cardId, answers, rating, ratingComment?)`
  - `getThemeProgressPercentage` counts cards with at least one attempt
- components/ThemeHomeScreen.tsx
  - Progress computed via ThemeCardManager per attempts
  - Uses real card IDs from theme data
- components/HomeScreen.tsx
  - Replaced demo progress with real per-theme attempt-based progress
- components/ThemeWelcomeScreen.tsx
  - Gating based on first card attempt using real `cardIds`
- components/CardDetailsScreen.tsx
  - Bottom button label “Start”; opens exercise immediately
- App.tsx
  - Skip `card-welcome`; go directly to `question-01`
  - Pass `textMessage` to ThemeCardManager as ratingComment
- utils/ThemeLoader.ts
  - Static imports; consistent loading dev/prod

## Testing
- Unit
  - ThemeCardManager-rating-comment: persists ratingComment
  - ThemeWelcomeScreen-gating: welcome only if first card has no attempts
  - HomeScreen-progress: renders progress label with attempt-based progress
  - CardDetailsScreen start button: shows “Start” and triggers onOpenCard
  - CI fix: removed async setTimeout in language switch test
- E2E
  - Full suite passing (Playwright) with dynamic content loading and flows

## Results
- All unit tests pass (188 passed, 1 skipped)
- All e2e tests pass (76/76)
- Dev/Prod consistency for theme loading
- UX: direct start flow, correct progress visuals, welcome gating

## Notes
- Prefer e2e for full App navigation assertions; unit tests focus on component behavior
- Mocks for ContentContext/Telegram BackButton used to keep unit tests deterministic
