# Menhausen Telegram Mini App

A comprehensive mental health support application built as a Telegram Mini App, featuring personalized exercises, mood tracking, and evidence-based psychological techniques.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser with WebView support

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/menhausen-app.git
cd menhausen-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
```

## 📱 Application Overview

### Core Features
- **🧭 5-Step Onboarding Survey** - Comprehensive user profiling system
- **🧠 Mental Health Exercises** - Evidence-based psychological techniques
- **📊 Daily Mood Check-ins** - Emotional state tracking
- **🎯 Personalized Content** - AI-driven content recommendations
- **🔒 Privacy-First Design** - Local storage with optional cloud sync
- **💎 Premium Features** - Advanced exercises and specialized content

### User Journey
```
Welcome → Benefits → Survey (5 screens) → PIN Setup → Check-in → Home Dashboard
    ↓
Theme Selection → Exercise Cards → Questions → Results → Rating → Progress
```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4 + Custom Design System
- **State Management**: React Context + Hooks
- **Build Tool**: Vite
- **Content Management**: Centralized TypeScript system
- **Deployment**: Vercel/Netlify ready

### Project Structure
```
src/
├── App.tsx                     # Main application router
├── main.tsx                    # Application entry point
├── components/                 # React components
│   ├── ContentContext.tsx      # 🔥 Content management system
│   ├── SurveyScreenTemplate.tsx # 🔥 Universal survey component
│   ├── SurveyScreen01-05.tsx   # Individual survey screens
│   ├── OnboardingScreen*.tsx   # Onboarding flow
│   ├── HomeScreen.tsx          # Main dashboard
│   ├── ThemeWelcomeScreen.tsx  # Theme introduction
│   ├── Card*.tsx               # Exercise components
│   └── ui/                     # ShadCN UI library
├── types/
│   ├── content.ts              # 🔥 Content type definitions
│   └── telegram-webapp.d.ts    # Telegram WebApp types
├── data/
│   └── content.ts              # 🔥 Centralized content store
├── utils/
│   └── contentUtils.ts         # Content utility functions
├── imports/                    # Figma-imported components
│   └── BackButton-25-362.tsx   # 🔥 Design system button
├── styles/
│   └── globals.css             # Global styles & design tokens
└── guidelines/
    └── Guidelines.md           # 📖 Design & development rules
```

🔥 = **Critical files for understanding the system**

## 🎨 Design System

### Guidelines Compliance
All components follow strict design guidelines located in `/guidelines/Guidelines.md`:

- **Mobile-First**: Designed for 393px (iPhone 13/14/15) primary target
- **Touch-Friendly**: 44px+ minimum touch targets
- **Responsive**: Adaptive design for all screen sizes
- **Accessibility**: WCAG 2.1 AA compliance

### Key Design Patterns

#### Bottom Fixed CTA Buttons
```typescript
// Standard pattern used throughout the app
<BottomFixedButton onClick={handleAction}>
  Button Text
</BottomFixedButton>

// Renders to: 350px width, 23px left margin, absolute positioning
```

#### Back Button Integration
```typescript
import BackButton from '../imports/BackButton-25-362';

// Use Figma-designed back button
<button onClick={onBack}>
  <BackButton />
</button>
```

#### Color Scheme
- **Primary**: `#E1FF00` (neon yellow)
- **Background**: `#111111` (dark)
- **Text**: White with proper contrast
- **Survey Options**: Gray variants (no blue tints)

## 📊 Survey System

### 5-Screen Survey Architecture

The survey system is the core of user personalization, built with a universal template supporting multiple question types.

#### Survey Screens Overview
1. **Screen 1**: Current Challenges (Multiple choice, Required)
2. **Screen 2**: Duration Assessment (Single choice, Optional)
3. **Screen 3**: Optimal Practice Time (Single choice, Optional)  
4. **Screen 4**: Time Commitment (Single choice, Required)
5. **Screen 5**: Primary Goal (Single choice, Required)

#### Implementation Example
```typescript
// Universal template usage
<SurveyScreenTemplate
  screenId="screen01"
  onNext={handleNext}
  onBack={handleBack}
  initialSelections={savedSelections}
/>
```

#### Data Structure
```typescript
interface SurveyResults {
  screen01: string[];  // ["anxiety", "stress"]
  screen02: string[];  // ["recent"] or []
  screen03: string[];  // ["morning"] or []
  screen04: string[];  // ["10-min"]
  screen05: string[];  // ["reduce-anxiety"]
  completedAt: string; // "2024-01-15T10:30:00Z"
}
```

#### Storage Strategy
- **Local Storage**: `localStorage.setItem('survey-results', JSON.stringify(results))`
- **State Management**: React state with automatic recovery
- **API Ready**: Prepared for backend integration

## 🧠 Content Management

### Centralized Content System

All application content is managed through a centralized TypeScript system that supports localization and provides type safety.

#### Content Structure
```typescript
interface AppContent {
  themes: Record<string, ThemeData>;           // Mental health themes
  cards: Record<string, CardData>;             // Exercise cards  
  emergencyCards: Record<string, EmergencyCardData>; // Crisis support
  onboarding: OnboardingContent;               // Onboarding text
  survey: SurveyContent;                       // Survey questions
}
```

#### Usage Examples
```typescript
// Get localized content
const { getLocalizedText } = useContent();
const title = getLocalizedText(content.title);

// Get survey screen data
const { localizedScreen } = useSurveyScreen('screen01');

// Get theme information
const themeData = useTheme('social-anxiety');
```

#### Adding New Content
```typescript
// 1. Update types in /types/content.ts
interface NewContentType {
  id: string;
  title: LocalizedContent;
  description: LocalizedContent;
}

// 2. Add data in /data/content.ts
export const newContent = {
  id: 'new-feature',
  title: { en: 'New Feature' },
  description: { en: 'Feature description' }
};

// 3. Use in components
const { content } = useContent();
const featureTitle = getLocalizedText(content.newFeature.title);
```

## 🎯 Mental Health Exercises

### Theme Organization
- **Social Anxiety** (4 cards): Progressive difficulty from beginner to intermediate
- **Stress Management** (3 cards): Coping strategies and resilience building  
- **Anger Management** (2 cards): Healthy expression techniques
- **Sadness & Apathy** (2 premium cards): Emotional reconnection exercises

### Exercise Flow
```
Theme Selection → Theme Welcome → Card List → Card Details → 
Card Welcome → Question 1 → Question 2 → Results → Rating → Completion
```

### Card Data Example
```typescript
const cardExample: CardData = {
  id: 'card-1',
  title: { en: 'Understanding Social Triggers' },
  description: { en: 'Identify what triggers your social anxiety...' },
  welcomeMessage: { en: 'This exercise will help you become aware...' },
  duration: { en: '5-7 min' },
  difficulty: 'beginner',
  themeId: 'social-anxiety',
  isPremium: false,
  questions: [
    {
      id: 'q1',
      text: { en: 'What social situations make you anxious?' },
      placeholder: { en: 'Example: Speaking in groups...' },
      helpText: { en: 'Think about recent situations...' }
    }
  ],
  finalMessage: {
    message: { en: 'Awareness is the first step...' },
    practiceTask: { en: 'Notice your triggers this week...' },
    whyExplanation: { en: 'Self-awareness helps distinguish...' }
  }
};
```

## 🔧 Development Guidelines

### Component Standards
```typescript
// Standard component structure
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // =====================================================================================
  // HOOKS AND STATE
  // =====================================================================================
  const [localState, setLocalState] = useState();
  const { getLocalizedText } = useContent();

  // =====================================================================================
  // EVENT HANDLERS  
  // =====================================================================================
  const handleUserAction = () => {
    // Implementation with proper error handling
  };

  // =====================================================================================
  // RENDER
  // =====================================================================================
  return (
    <div className="w-full h-screen bg-[#111111] flex flex-col">
      {/* Component content following Guidelines.md */}
    </div>
  );
}
```

### Code Quality Standards
- **TypeScript**: Strict typing required
- **Comments**: Russian comments for development clarity
- **Error Handling**: Comprehensive error boundaries
- **Performance**: Lazy loading and optimization
- **Accessibility**: WCAG 2.1 AA compliance

### CSS/Tailwind Guidelines
```css
/* Use responsive text utilities */
.text-responsive-base   /* 14px → 15px → 16px across breakpoints */
.text-responsive-3xl    /* 24px → 26px → 28px across breakpoints */

/* Touch-friendly minimum sizes */
.touch-friendly         /* min-height: 44px, min-width: 44px */
.touch-friendly-small   /* min-height: 32px, min-width: 32px */

/* Bottom Fixed Button pattern */
.bottom-fixed-cta       /* 350px width, 23px left, absolute bottom */
```

## 🧪 Testing

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: User flow and navigation testing
- **E2E Tests**: Complete user journey validation
- **Accessibility Tests**: Screen reader and keyboard navigation

### Device Testing Matrix
| Device | Screen Size | Test Priority |
|--------|-------------|---------------|
| iPhone 13/14/15 | 393px | 🔥 Primary |
| iPhone SE | 375px | ⚠️ Secondary |
| iPad | 768px | ⚠️ Secondary |
| Android Flagship | 428px+ | ⚠️ Secondary |

### Browser Testing
- **Primary**: Telegram WebView (iOS/Android)
- **Secondary**: Mobile Safari, Chrome Mobile
- **Desktop**: Chrome, Firefox, Safari, Edge

## 📱 Telegram Integration

### WebApp Configuration
```typescript
// Telegram WebApp initialization
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Usage in components
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();
```

### Bot Integration Points
- **User Authentication**: Telegram user data
- **Deep Linking**: Direct navigation to specific exercises
- **Notifications**: Daily check-in reminders
- **Sharing**: Exercise results and progress

## 🚀 Deployment

[![Netlify Status](https://api.netlify.com/api/v1/badges/b3969c03-dbab-4c50-bcb5-2f212e6979e6/deploy-status)](https://app.netlify.com/projects/menhausen/deploys) - stage bot https://t.me/mnhsn_staging_bot/app?startapp=staging

### Environment Setup
```bash
# .env.local
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://api.menhausen.app
VITE_TELEGRAM_BOT_NAME=@menhausen_bot
VITE_ENVIRONMENT=development

# PostHog Analytics (Optional)
# Set to 'true' to enable PostHog analytics in production
# Set to 'false' or leave unset to disable (recommended for local development and deploy previews)
VITE_POSTHOG_ENABLE=false
VITE_PUBLIC_POSTHOG_KEY=your_posthog_key_here
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Build Process
```bash
# Production build
npm run build

# Preview build locally  
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

### Performance Targets
- **Bundle Size**: <250KB gzipped
- **First Load**: <2 seconds on 3G
- **Lighthouse Score**: >90 across all metrics
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1

## 📈 Analytics & Monitoring

### Privacy-Compliant Analytics (PostHog)
PostHog analytics is **disabled by default** and can be enabled via environment variable.

#### Configuration
- **Environment Control**: Set `VITE_POSTHOG_ENABLE=true` to enable analytics
- **Anonymous Data**: No PII collection
- **User Consent**: Opt-in analytics via environment configuration
- **Local Storage**: Client-side data preference
- **GDPR Compliance**: Data protection by design
- **Production Only**: Recommended to enable only in production environment

#### Analytics Controls
```typescript
// Analytics will only initialize when ALL conditions are met:
// 1. VITE_POSTHOG_ENABLE=true
// 2. VITE_PUBLIC_POSTHOG_KEY is set
// 3. Not in test mode
```

#### Error tracking (production)
When PostHog is enabled, the app captures exceptions via:
- **Exception autocapture** (SDK): `window.onerror` and `unhandledrejection` → `$exception` events
- **PostHogErrorBoundary**: React render errors with a user-facing fallback

To enable exception autocapture in PostHog, turn it on in [Project settings → Error tracking](https://app.posthog.com/settings/project-error-tracking#exception-autocapture). For readable stack traces with minified bundles, upload source maps (see [PostHog docs](https://posthog.com/docs/error-tracking/upload-source-maps/react)).

Manual capture: `import { captureException } from './utils/analytics/posthog'` then `captureException(error, { context: 'my_feature' })`.

### Monitoring Setup
```typescript
// Error tracking
try {
  // Component logic
} catch (error) {
  console.error('Component Error:', error);
  // Send to monitoring service
}

// Performance monitoring
const observer = new PerformanceObserver((list) => {
  // Track Core Web Vitals
});
```

## 🔮 Future Roadmap

### Phase 1: Core Platform (Current)
- ✅ Complete onboarding survey system
- ✅ Mental health exercise library
- ✅ Centralized content management
- ✅ Mobile-first responsive design

### Phase 2: Enhanced Features (Q2 2024)
- 🔄 Backend API integration
- 🔄 User accounts and cloud sync
- 🔄 Advanced analytics dashboard
- 🔄 Professional therapist tools

### Phase 3: AI & Community (Q3 2024)
- 📋 AI-powered personalization
- 📋 Peer support community
- 📋 Mood tracking with insights
- 📋 Integration with health apps

### Phase 4: Global Expansion (Q4 2024)
- 📋 Multi-language support (Russian, Spanish, French)
- 📋 Cultural adaptation for different regions
- 📋 Professional clinical validation
- 📋 Enterprise therapy platform

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** coding standards and guidelines
4. **Test** thoroughly on multiple devices
5. **Commit** with clear messages (`git commit -m 'Add amazing feature'`)
6. **Push** to branch (`git push origin feature/amazing-feature`)
7. **Open** Pull Request with detailed description

### Code Review Checklist
- [ ] Follows TypeScript strict typing
- [ ] Implements Guidelines.md specifications
- [ ] Includes proper error handling
- [ ] Tests on mobile devices
- [ ] Maintains accessibility standards
- [ ] Updates relevant documentation

## 📞 Support

### Documentation
- **Design Guidelines**: `/guidelines/Guidelines.md`
- **Technical Spec**: `/specification.md`
- **API Documentation**: Coming with backend integration

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community questions and ideas
- **Discord**: Real-time developer chat (link coming soon)

### Maintainers
- **Lead Developer**: [Your Name] (@yourusername)
- **UX Designer**: [Designer Name] (@designerusername)
- **Mental Health Advisor**: [Advisor Name] (@advisorusername)

---

**Built with ❤️ for mental health support**

*This project is open source and welcomes contributions from developers who care about mental health accessibility and user experience.*