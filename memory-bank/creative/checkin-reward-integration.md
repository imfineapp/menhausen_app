# CheckIn → Reward Screen Integration

## Overview
The reward screen is now integrated into the check-in flow, appearing automatically after users complete their daily check-in when they earn achievements.

## Flow Description

### Normal Flow
1. User completes check-in on "Как дела?" screen
2. System checks for earned achievements
3. If achievements earned → Show reward screen
4. If no achievements → Go directly to home

### Reward Screen Flow
1. User sees achievement celebration
2. "Continue" button → Home (single achievement)
3. "Next Achievement" button → Next achievement (multiple achievements)
4. Back button → Home (always)

## Achievement Detection

### Implemented Achievements
- **First Check-in** (`first_checkin`): First time user completes check-in
- **Week Streak** (`week_streak`): 7 consecutive days of check-ins
- **Mood Tracker** (`mood_tracker`): 14 total days of check-ins
- **Early Bird** (`early_bird`): 5 check-ins between 5-7 AM
- **Night Owl** (`night_owl`): 5 check-ins between 10 PM - 1 AM

### Detection Logic
```typescript
const checkForEarnedAchievements = (mood: string): string[] => {
  // Saves check-in to localStorage
  // Checks achievement conditions
  // Returns array of earned achievement IDs
};
```

## Data Persistence

### Check-in Data Structure
```typescript
interface CheckinData {
  mood: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
}
```

### Storage
- Check-in history saved to `localStorage` as `checkin-data`
- Achievement state managed in React state
- Data persists across app sessions

## Navigation Integration

### App.tsx Changes
- Added `earnedAchievementIds` state
- Modified `handleCheckInSubmit` to check achievements
- Updated reward case to use earned achievements
- Added proper navigation handlers

### Navigation Flow
```
CheckInScreen → handleCheckInSubmit → checkForEarnedAchievements
    ↓
[If achievements earned]
    ↓
RewardManager → RewardScreen → Home
    ↓
[If no achievements]
    ↓
Home
```

## User Experience

### First Time User
1. Completes first check-in
2. Sees "First Step" achievement reward
3. Clicks "Continue" → Home

### Returning User
1. Completes check-in
2. System checks for new achievements
3. If earned → Reward screen
4. If not → Direct to home

### Multiple Achievements
1. User earns multiple achievements
2. Sees first achievement
3. Clicks "Next Achievement"
4. Sees second achievement
5. Continues until all shown
6. Final "Continue" → Home

## Technical Implementation

### Key Functions
- `checkForEarnedAchievements(mood: string)`: Detects earned achievements
- `getConsecutiveDays(checkinHistory)`: Calculates streak days
- `handleCheckInSubmit(mood: string)`: Main check-in handler

### State Management
- `earnedAchievementIds: string[]`: Current earned achievements
- `setEarnedAchievementIds`: Updates achievement state
- Automatic cleanup after reward screen completion

### Error Handling
- Graceful fallback if localStorage fails
- Console logging for debugging
- Continues flow even if achievement detection fails

## Testing

### Manual Testing
1. Complete first check-in → Should see "First Step" reward
2. Complete multiple check-ins → Should see streak rewards
3. Check-in at different times → Should see time-based rewards
4. Back button from reward → Should go to home

### Data Verification
- Check localStorage for `checkin-data`
- Verify achievement detection logic
- Test consecutive day calculations
- Verify navigation flow

## Future Enhancements

1. **More Achievements**: Add exercise-based achievements
2. **Achievement History**: Track when achievements were earned
3. **Progress Indicators**: Show progress toward next achievement
4. **Custom Messages**: Personalized achievement messages
5. **Social Sharing**: Share achievements with friends
6. **Achievement Categories**: Group achievements by type

## Configuration

### Achievement Thresholds
- First check-in: 1 check-in
- Week streak: 7 consecutive days
- Mood tracker: 14 total days
- Early bird: 5 check-ins 5-7 AM
- Night owl: 5 check-ins 10 PM - 1 AM

### Time Windows
- Early bird: 5:00 AM - 7:00 AM
- Night owl: 10:00 PM - 1:00 AM (next day)
- Consecutive days: Must be exactly 24 hours apart

## Troubleshooting

### Common Issues
1. **Achievements not showing**: Check localStorage for checkin-data
2. **Wrong achievement**: Verify time windows and conditions
3. **Navigation issues**: Check earnedAchievementIds state
4. **Data not persisting**: Verify localStorage is available

### Debug Information
- Console logs show earned achievements
- Check-in data saved to localStorage
- Achievement detection logic is logged
- Navigation flow is traceable

