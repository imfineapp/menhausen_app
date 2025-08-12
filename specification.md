# Menhausen Telegram Mini App - Technical Specification

## Project Overview

Menhausen is a Telegram mini app focused on mental health support, featuring a comprehensive onboarding process, personalized exercises, and daily check-ins. The application provides evidence-based psychological techniques through an intuitive, mobile-first interface with a complete centralized content management system.

## Architecture Overview

### Core Technologies
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **State Management**: React hooks with Context API
- **Content Management**: Centralized TypeScript-based system
- **Routing**: Component-based navigation system
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel/Netlify

### File Structure
```
src/
├── App.tsx                     # Main application with navigation
├── main.tsx                    # Application entry point
├── components/                 # React components
│   ├── ContentContext.tsx      # Content management context
│   ├── SurveyScreenTemplate.tsx # Universal survey component
│   ├── SurveyScreen01-05.tsx   # Individual survey screens
│   ├── OnboardingScreen01-02.tsx # Onboarding screens
│   ├── HomeScreen.tsx          # Main dashboard
│   ├── PinSetupScreen.tsx      # PIN configuration
│   ├── CheckInScreen.tsx       # Daily mood check-in
│   ├── ThemeWelcomeScreen.tsx  # Theme introduction
│   ├── ThemeHomeScreen.tsx     # Theme exercise list
│   ├── Card*.tsx               # Exercise card screens
│   ├── Question*.tsx           # Exercise question screens
│   ├── UserProfileScreen.tsx   # User settings
│   └── ui/                     # ShadCN UI components
├── types/
│   ├── content.ts              # Content type definitions
│   └── telegram-webapp.d.ts    # Telegram WebApp types
├── data/
│   └── content.ts              # Centralized content store
├── utils/
│   └── contentUtils.ts         # Content utility functions
├── imports/                    # Figma-imported components
├── styles/
│   └── globals.css             # Global styles & design tokens
└── guidelines/
    └── Guidelines.md           # Design & development guidelines
```

## Core Features

### 1. Enhanced Onboarding Flow

#### Onboarding Sequence
1. **Welcome Screen** (`OnboardingScreen01`)
   - App introduction with privacy/terms links
   - Bottom Fixed CTA button pattern
   - Figma BackButton integration

2. **Benefits Overview** (`OnboardingScreen02`)
   - Key features presentation
   - Bullet-point benefits list
   - Smooth transition to survey

3. **5-Step Survey System** (`SurveyScreen01-05`)
   - Comprehensive user profiling
   - Multiple question types support
   - Progress tracking with visual indicators

4. **PIN Setup** (`PinSetupScreen`)
   - Optional security layer
   - Touch-friendly number grid
   - Skip option available

5. **Initial Check-in** (`CheckInScreen`)
   - Mood assessment slider
   - Emotional state capture

### 2. Comprehensive Survey System

#### Survey Architecture
The survey system uses a universal template (`SurveyScreenTemplate`) that supports multiple question types and provides consistent UX across all survey screens.

**Screen 1: Current Challenges** ✅ Required
- **Type**: Multiple choice
- **Purpose**: Identify primary mental health concerns
- **Options**: Anxiety, stress, mood, relationships, motivation, sleep
- **Data**: `string[]` of selected challenge IDs

**Screen 2: Duration Assessment** ✅ Required
- **Type**: Single choice
- **Purpose**: Timeline understanding for intervention planning
- **Options**: Recent, few months, 6 months, 1+ year, always
- **Required**: For comprehensive user profiling

**Screen 3: Optimal Practice Time** ✅ Required
- **Type**: Single choice
- **Purpose**: Personalized scheduling recommendations
- **Options**: Early morning through late night, varies
- **Required**: For personalized experience optimization

**Screen 4: Time Commitment** ✅ Required
- **Type**: Single choice
- **Purpose**: Content duration calibration
- **Options**: 5-20+ minutes daily, few times weekly, as-needed
- **Required**: For proper program setup

**Screen 5: Primary Goal** ✅ Required
- **Type**: Single choice
- **Purpose**: Content prioritization and success metrics
- **Options**: Reduce anxiety, manage stress, improve mood, relationships, find purpose, daily support, crisis help
- **Required**: For personalized experience

#### Survey Components

**SurveyScreenTemplate Features:**
- Universal component supporting all question types
- Responsive design with Guidelines.md compliance
- Figma BackButton integration
- Progress indicator with step tracking
- Error validation and user feedback
- Touch-friendly option selection
- Skip functionality where applicable
- Bottom Fixed CTA button pattern

**Data Storage:**
```typescript
interface SurveyResults {
  screen01: string[]; // Multiple choice selections
  screen02: string[]; // Single choice or empty if skipped
  screen03: string[]; // Single choice or empty if skipped
  screen04: string[]; // Single choice (required)
  screen05: string[]; // Single choice (required)
  completedAt: string; // ISO timestamp
  userId?: string; // When available
}
```

**Storage Strategy:**
- **Local Storage**: Immediate persistence with `localStorage.setItem('survey-results', JSON.stringify(results))`
- **State Management**: React state with `surveyResults` and `setSurveyResults`
- **Data Recovery**: Automatic loading of saved results on survey restart
- **API Ready**: Prepared structure for backend integration

### 3. Centralized Content Management System

#### Architecture
The content management system provides a single source of truth for all application text, questions, and configuration data.

**Core Components:**
- **Type Definitions** (`/types/content.ts`): Complete TypeScript interfaces
- **Content Store** (`/data/content.ts`): Centralized data repository
- **React Context** (`ContentContext.tsx`): Content distribution system
- **Utility Functions** (`contentUtils.ts`): Content manipulation helpers

**Content Categories:**
```typescript
interface AppContent {
  themes: Record<string, ThemeData>;           // Mental health themes
  cards: Record<string, CardData>;             // Exercise cards
  emergencyCards: Record<string, EmergencyCardData>; // Crisis support
  onboarding: OnboardingContent;               // Onboarding screens
  survey: SurveyContent;                       // Survey system
  ui: UITexts;                                 // Interface text
}
```

**Localization Support:**
```typescript
interface LocalizedContent {
  en: string;
  // Ready for: ru, es, fr, de, etc.
}
```

**Content Hooks:**
- `useContent()`: General content access
- `useUIText()`: Interface text with automatic localization
- `useSurveyScreen(screenId)`: Survey-specific content
- `useTheme(themeId)`: Theme data and cards
- `useCard(cardId)`: Individual card content

### 4. Mental Health Exercise System

#### Theme Organization
- **Social Anxiety**: 4 progressive cards (beginner to intermediate)
- **Stress Management**: 3 cards with coping strategies
- **Anger Management**: 2 cards for healthy expression
- **Sadness & Apathy**: 2 premium cards for emotional reconnection

#### Exercise Flow
1. **Theme Selection** → `ThemeWelcomeScreen`
2. **Theme Overview** → `ThemeHomeScreen`
3. **Card Selection** → `CardDetailsScreen`
4. **Exercise Start** → `CardWelcomeScreen`
5. **Questions** → `QuestionScreen01`, `QuestionScreen02`
6. **Results** → `FinalCardMessageScreen`
7. **Rating** → `RateCardScreen`

#### Card Data Structure
```typescript
interface CardData {
  id: string;
  title: LocalizedContent;
  description: LocalizedContent;
  welcomeMessage: LocalizedContent;
  duration: LocalizedContent;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: QuestionData[];
  finalMessage: FinalMessageData;
  isPremium: boolean;
  themeId: string;
}
```

### 5. User Interface Components

#### Design System Compliance
All components follow Guidelines.md specifications:

**Button Patterns:**
- **Bottom Fixed CTA**: 350px width, 23px left margin, #E1FF00 background
- **Back Button**: Figma BackButton component integration
- **Touch Targets**: Minimum 44px×44px for accessibility

**Color Scheme:**
- **Primary**: #E1FF00 (neon yellow)
- **Background**: #111111 (dark)
- **Text**: White with proper contrast ratios
- **Survey Options**: Gray variants without blue tints

**Typography:**
- **Responsive**: `text-responsive-*` classes for adaptive sizing
- **Hierarchy**: Proper heading levels with clamp() functions
- **Touch-Friendly**: Minimum 16px font size to prevent iOS zoom

### 6. State Management

#### Application State
```typescript
// Navigation State
const [currentScreen, setCurrentScreen] = useState<AppScreen>('onboarding1');
const [previousScreen, setPreviousScreen] = useState<AppScreen>('onboarding1');

// Survey State
const [surveyResults, setSurveyResults] = useState<Partial<SurveyResults>>({
  screen01: [], screen02: [], screen03: [], screen04: [], screen05: []
});

// Exercise State
const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
const [cardCompletionCounts, setCardCompletionCounts] = useState<Record<string, number>>({});
const [userAnswers, setUserAnswers] = useState<{question1?: string; question2?: string}>({});

// User State
const [userHasPremium, setUserHasPremium] = useState<boolean>(false);
```

#### Navigation System
Screen routing based on `AppScreen` type with 24 defined screens:
```typescript
type AppScreen = 'onboarding1' | 'onboarding2' | 'survey01' | 'survey02' | 
  'survey03' | 'survey04' | 'survey05' | 'pin' | 'checkin' | 'home' | 
  'profile' | 'about' | 'privacy' | 'terms' | 'pin-settings' | 'delete' | 
  'payments' | 'under-construction' | 'theme-welcome' | 'theme-home' | 
  'card-details' | 'checkin-details' | 'card-welcome' | 'question-01' | 
  'question-02' | 'final-message' | 'rate-card';
```

### 7. Data Persistence

#### Local Storage Keys
```typescript
'survey-results': SurveyResults     // Complete survey responses
'app-language': SupportedLanguage   // User language preference
'user-preferences': UserPreferences // App settings
'exercise-progress': ExerciseProgress // Completion tracking
```

#### Database Integration (Prepared)
```sql
-- Survey responses table
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY,
  user_id UUID,
  screen_01 JSONB,
  screen_02 JSONB,
  screen_03 JSONB,
  screen_04 JSONB,
  screen_05 JSONB,
  completed_at TIMESTAMP,
  version INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Exercise completions table
CREATE TABLE exercise_completions (
  id UUID PRIMARY KEY,
  user_id UUID,
  card_id VARCHAR(50),
  answers JSONB,
  rating INTEGER,
  feedback TEXT,
  completed_at TIMESTAMP,
  completion_count INTEGER DEFAULT 1
);
```

## Technical Implementation

### Responsive Design
- **Mobile-First**: Primary target 393px (iPhone 13/14/15)
- **Breakpoints**: 320px, 375px, 640px, 768px, 1024px+
- **Touch-Friendly**: All interactive elements ≥44px
- **Safe Areas**: iOS notch and home indicator support

### Performance Optimization
- **Bundle Size**: Target <250KB gzipped
- **Code Splitting**: Lazy loading for survey components
- **Content Caching**: Efficient content delivery
- **Offline Support**: Core functionality without internet

### Accessibility
- **WCAG 2.1 AA**: Full compliance target
- **Touch Targets**: Minimum 44px×44px
- **Color Contrast**: 4.5:1 minimum for text
- **Screen Readers**: Semantic HTML and ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility

### Browser Support
- **Primary**: Telegram WebView (iOS/Android)
- **Secondary**: Mobile Safari, Chrome Mobile
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Minimum**: iOS 12, Android 8.0

## Development Workflow

### Code Standards
- **TypeScript**: Strict typing throughout
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit validation

### Component Structure
```typescript
// Standard component template
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

### Content Management
```typescript
// Adding new content
export const newContent = {
  id: 'unique-id',
  title: { en: 'English Title' },
  description: { en: 'English Description' },
  // Additional localized content
};

// Using content in components
const { getLocalizedText } = useContent();
const localizedTitle = getLocalizedText(content.title);
```

## Deployment

### Build Process
```bash
npm run build          # Production build
npm run preview        # Preview build locally
npm run lint           # Code quality check
npm run type-check     # TypeScript validation
```

### Environment Configuration
```bash
# .env.local
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://api.menhausen.app
VITE_TELEGRAM_BOT_NAME=@menhausen_bot
```

### Deployment Targets
- **Vercel**: Recommended for automatic deployments
- **Netlify**: Alternative deployment platform
- **Telegram WebApp**: Integration with Telegram Bot

## Future Enhancements

### Planned Features
- **AI Personalization**: ML-based content recommendations
- **Backend Integration**: User accounts and cloud sync
- **Advanced Analytics**: Mood tracking and progress insights
- **Professional Tools**: Therapist collaboration features
- **Community Features**: Peer support and sharing

### Internationalization
- **Prepared Infrastructure**: Complete localization support
- **Target Languages**: Russian, Spanish, French, German
- **Cultural Adaptation**: Region-specific content and approaches
- **RTL Support**: Arabic and Hebrew language preparation

### API Integration
```typescript
// Prepared API structure
interface APIEndpoints {
  'POST /api/survey/submit': (data: SurveyResults) => Promise<{success: boolean}>;
  'GET /api/user/progress': () => Promise<UserProgress>;
  'POST /api/exercise/complete': (data: ExerciseCompletion) => Promise<{success: boolean}>;
  'GET /api/content/updates': () => Promise<ContentUpdates>;
}
```

## Monitoring and Analytics

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Bundle Analysis**: Size and dependency monitoring
- **User Experience**: Navigation flow analysis

### Error Tracking
- **Client-Side**: JavaScript error capture
- **User Feedback**: In-app feedback collection
- **Performance Issues**: Slow loading identification

### Privacy-Compliant Analytics
- **Anonymous Data**: No PII collection
- **Opt-In**: User consent for analytics
- **GDPR Compliance**: Data protection compliance

This specification provides a comprehensive technical foundation for the Menhausen mental health application, ensuring scalable, maintainable, and user-focused development with complete survey system integration and centralized content management.