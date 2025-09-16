# Reward Screen Testing Guide

## Current Configuration

### Forced Display
The reward screen is now **forced to show after every check-in** for testing purposes.

### Test Achievements
The system shows 3 achievements in sequence:
1. **"Первый шаг"** (First Step)
2. **"Неделя силы"** (Week of Strength) 
3. **"Трекер эмоций"** (Mood Tracker)

## How to Test

### Step 1: Navigate to Check-in
1. Open the app
2. Go through onboarding if needed
3. Navigate to "Как дела?" (How are you?) screen

### Step 2: Complete Check-in
1. Select any mood on the slider
2. Click "Отправить" (Send) button
3. **The reward screen should appear immediately**

### Step 3: Test Reward Screen
1. You should see "Поздравляем!" (Congratulations!)
2. You should see "Вы получили достижение!" (You earned an achievement!)
3. You should see the "Первый шаг" achievement card
4. Click "Следующее достижение" (Next Achievement) to see the next one
5. Continue until all 3 achievements are shown
6. Click "Продолжить" (Continue) to go to home

### Step 4: Test Back Navigation
1. From any achievement screen, click the back button
2. You should go directly to the home page
3. The achievement state should be cleared

## Debug Information

### Console Logs
Open browser DevTools (F12) and check the Console tab for these logs:

```
Check-in submitted: {mood: "Neutral", timestamp: "2024-01-15T10:30:00.000Z"}
Earned achievements: ['first_checkin', 'week_streak', 'mood_tracker']
Setting earnedAchievementIds and navigating to reward...
App: Navigating to screen: reward
App: Rendering reward screen with earnedAchievementIds: ['first_checkin', 'week_streak', 'mood_tracker']
RewardManager: earnedAchievementIds received: ['first_checkin', 'week_streak', 'mood_tracker']
RewardManager: filtered achievements: [achievement objects]
RewardScreen: received achievements: [achievement objects]
RewardScreen: currentIndex: 0
RewardScreen: currentAchievement: {id: "first_checkin", title: "Первый шаг", ...}
```

### Expected Behavior
- ✅ Reward screen appears after every check-in
- ✅ Shows 3 achievements in sequence
- ✅ "Next Achievement" button works for multiple achievements
- ✅ "Continue" button works for final achievement
- ✅ Back button goes to home page
- ✅ Console logs show the flow working

## Troubleshooting

### If Reward Screen Doesn't Appear
1. Check console logs for errors
2. Verify `handleCheckInSubmit` is being called
3. Check if `earnedAchievementIds` is being set
4. Verify navigation to 'reward' screen

### If Achievements Don't Show
1. Check `RewardManager` logs
2. Verify `earnedAchievementIds` contains valid IDs
3. Check if `createAchievementData` returns data
4. Verify achievement filtering logic

### If Navigation Doesn't Work
1. Check `navigateTo` function logs
2. Verify `currentScreen` state changes
3. Check if reward case is being rendered
4. Verify `onComplete` and `onBack` callbacks

## Code Locations

### Main Files
- `App.tsx` - Main navigation and check-in handling
- `components/RewardScreen.tsx` - Individual achievement display
- `components/RewardManager.tsx` - Sequential achievement management

### Key Functions
- `handleCheckInSubmit()` - Triggers reward screen
- `navigateTo()` - Handles screen transitions
- `RewardManager` - Manages achievement sequence
- `RewardScreen` - Displays individual achievements

## Backend Integration Ready

The current implementation is ready for backend integration:

1. **Replace forced achievements** with API call
2. **Add real achievement detection** logic
3. **Remove debug logging** for production
4. **Add error handling** for API failures

### Example Backend Integration
```typescript
const handleCheckInSubmit = async (mood: string) => {
  // Save check-in to backend
  await saveCheckIn(mood);
  
  // Get earned achievements from backend
  const earnedAchievements = await getEarnedAchievements();
  
  if (earnedAchievements.length > 0) {
    setEarnedAchievementIds(earnedAchievements);
    navigateTo('reward');
  } else {
    navigateTo('home');
  }
};
```

## Testing Checklist

- [ ] Reward screen appears after check-in
- [ ] Shows correct achievement titles and descriptions
- [ ] Sequential display works (Next Achievement button)
- [ ] Final achievement shows Continue button
- [ ] Back button goes to home
- [ ] Console logs show proper flow
- [ ] No JavaScript errors
- [ ] UI displays correctly on mobile
- [ ] Localization works (Russian/English)
- [ ] State cleanup works properly

