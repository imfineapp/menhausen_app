# Memory Bank: System Patterns

## Architecture Patterns

### Component Structure
```typescript
// Standard component template used throughout app
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // =====================================================================================
  // HOOKS AND STATE
  // =====================================================================================
  const [state, setState] = useState();
  const { contentMethod } = useContent();

  // =====================================================================================
  // EVENT HANDLERS
  // =====================================================================================
  const handleAction = () => {
    // Implementation
  };

  // =====================================================================================
  // RENDER
  // =====================================================================================
  return (
    <div className="w-full h-screen bg-[#111111]">
      {/* Component content */}
    </div>
  );
}
```

### Navigation Pattern
- **Screen-based routing**: Using AppScreen type with 24 defined screens
- **State-driven navigation**: currentScreen and previousScreen state management
- **Back button integration**: Figma BackButton component throughout
- **Smart Navigation**: Dynamic screen routing based on user progress and localStorage data (NEW)

### State Management Patterns
- **Survey State**: Centralized survey results with localStorage persistence
- **Exercise State**: Completion tracking with counts and ratings
- **User State**: Premium status and preferences
- **Content State**: Centralized content management via React Context
- **Smart Navigation State**: User progress analysis and dynamic routing (NEW)

### Smart Navigation Pattern (NEW)
```typescript
// User state analysis for dynamic routing
interface UserState {
  hasCompletedOnboarding: boolean;
  hasCompletedSurvey: boolean;
  hasCompletedFirstCheckin: boolean;
  hasCompletedFirstExercise: boolean;
  lastActivityDate: string;
  nextRecommendedAction: 'onboarding' | 'survey' | 'checkin' | 'home' | 'exercise';
  completionPercentage: number;
  streakDays: number;
  totalCheckins: number;
}

// Dynamic screen initialization
const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
  if (isE2ETestEnvironment) return 'home';
  
  const userState = determineUserState();
  return getInitialScreen(userState);
});
```

### Content Management Pattern
```typescript
// Centralized content system
interface AppContent {
  themes: Record<string, ThemeData>;
  cards: Record<string, CardData>;
  emergencyCards: Record<string, EmergencyCardData>;
  onboarding: OnboardingContent;
  survey: SurveyContent;
  ui: UITexts;
}
```

### Data Persistence Patterns
- **Local Storage**: Survey results, user preferences, exercise progress (primary source of truth locally)
- **Cloud Sync**: Supabase backend for multi-device synchronization (NEW)
- **State Sync**: React state synchronized with localStorage
- **Sync Strategy**: Incremental sync with debouncing, real-time on localStorage changes (NEW)

### Cloud Sync Patterns (NEW)
```typescript
// Sync service pattern
interface SyncService {
  syncData(dataType: string, data: any): Promise<void>;
  syncAll(): Promise<void>;
  getSyncStatus(): SyncStatus;
}

// Data transformation at boundaries
const transformed = transformForSync(localStorageKey, localStorageValue);
await syncToSupabase(transformed);

// Conflict resolution pattern
const merged = resolveConflict(dataType, localData, remoteData);
updateLocalStorage(merged);

// Encryption pattern for sensitive data
const encrypted = shouldEncrypt(dataType) 
  ? encryptSensitiveData(data) 
  : data;
```

### Sync Architecture Pattern
- **Interceptor Pattern**: Intercept localStorage.setItem to trigger sync
- **Debouncing**: Batch rapid changes (100-200ms delay)
- **Offline Queue**: Queue failed syncs, retry when online
- **Conflict Resolution**: Remote wins for preferences, smart merge for collections

## Design Patterns

### UI Component Patterns
- **Bottom Fixed CTA**: 350px width, 23px left margin, #E1FF00 background
- **Back Button**: Figma BackButton component integration
- **Touch Targets**: Minimum 44px×44px for accessibility
- **Survey Options**: Gray variants without blue tints

### Color System
- **Primary**: #E1FF00 (neon yellow)
- **Background**: #111111 (dark)
- **Text**: White with proper contrast ratios

### Responsive Design Patterns
- **Mobile-First**: Primary target 393px (iPhone 13/14/15)
- **Breakpoints**: 320px, 375px, 640px, 768px, 1024px+
- **Safe Areas**: iOS notch and home indicator support
