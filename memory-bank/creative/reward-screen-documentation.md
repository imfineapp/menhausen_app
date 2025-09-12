# Reward Screen Documentation

## Overview
The Reward Screen is a dedicated celebration page that appears when users earn achievements. It provides a focused, distraction-free experience for celebrating individual achievements.

## Key Features

### Single Achievement Focus
- Shows only one achievement card at a time
- Centers the achievement card on screen
- Removes all statistics and pagination elements
- Creates a focused celebration moment

### Sequential Display
- Supports showing multiple achievements one by one
- Uses RewardManager to handle sequential display
- "Next Achievement" button for multiple achievements
- "Continue" button for single achievement

### Clean Interface
- No statistics blocks (unlocked/in progress/points)
- No pagination controls
- Minimal, celebratory design
- Consistent with app's visual style

## Components

### RewardScreen
Main component that displays a single achievement reward.

**Props:**
- `achievements: Badge[]` - Array of earned achievements
- `currentIndex: number` - Current achievement index
- `onContinue: () => void` - Callback when user continues
- `onBack?: () => void` - Optional back callback

### RewardManager
Manages sequential display of multiple achievements.

**Props:**
- `earnedAchievementIds: string[]` - IDs of earned achievements
- `onComplete: () => void` - Callback when all achievements shown
- `onBack?: () => void` - Optional back callback

## Usage

### Single Achievement
```tsx
<RewardScreen
  achievements={[singleAchievement]}
  currentIndex={0}
  onContinue={() => setCurrentScreen('home')}
/>
```

### Multiple Achievements
```tsx
<RewardManager
  earnedAchievementIds={['first_checkin', 'week_streak']}
  onComplete={() => setCurrentScreen('home')}
  onBack={() => goBack()}
/>
```

## Content Localization

### Russian
- Title: "Поздравляем!"
- Subtitle: "Вы получили достижение!"
- Continue: "Продолжить"
- Next: "Следующее достижение"

### English
- Title: "Congratulations!"
- Subtitle: "You earned an achievement!"
- Continue: "Continue"
- Next: "Next Achievement"

## Integration

The Reward Screen is integrated into the main app navigation:
- Added 'reward' to AppScreen type
- Added RewardManager case in App.tsx
- Uses existing BadgeCard component
- Leverages existing achievement data system

## Technical Details

### Files Created
- `components/RewardScreen.tsx` - Main reward screen component
- `components/RewardManager.tsx` - Sequential display manager

### Files Updated
- `data/content/ru/ui.json` - Russian translations
- `data/content/en/ui.json` - English translations
- `types/content.ts` - TypeScript interfaces
- `data/content.ts` - Fallback content
- `components/ContentContext.tsx` - Content context
- `App.tsx` - Navigation integration
- Mock and test files - Testing support

### Dependencies
- Uses existing BadgeCard component
- Integrates with ContentContext for localization
- Uses existing achievement data structure
- Leverages app's navigation system

## Future Enhancements

1. **Animation Effects**: Add celebration animations
2. **Sound Effects**: Audio feedback for achievements
3. **Confetti**: Visual celebration effects
4. **Achievement History**: Track achievement earning history
5. **Custom Messages**: Personalized celebration messages
6. **Social Sharing**: Enhanced sharing capabilities

## Testing

The Reward Screen is fully tested with:
- Unit tests for component functionality
- Mock data for development
- TypeScript type safety
- Localization testing
- Integration testing with main app

## Performance

- Lightweight component with minimal re-renders
- Efficient state management
- Optimized for mobile performance
- Fast navigation between achievements

