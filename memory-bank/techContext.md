# Memory Bank: Technical Context

## Technology Stack

### Frontend Framework
- **React 18** with TypeScript
- **Vite** as build tool and dev server
- **Tailwind CSS v4** for styling
- **ShadCN/UI** component library

### Key Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.2",
  "vite": "^7.1.2",
  "tailwindcss": "^4.0.0-alpha.25",
  "@vitejs/plugin-react": "^4.0.3"
}
```

### UI Component Library
- **Radix UI**: Comprehensive set of primitives (@radix-ui/*)
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variants
- **Tailwind Merge**: Utility merging

### State Management
- **React Hooks**: useState, useEffect for local state
- **Context API**: Content management and global state
- **Local Storage**: Data persistence
- **Points System**: Transaction-based points with idempotency
- **Event-Driven Updates**: `points:updated` events for real-time UI reactivity

### Build Configuration
- **TypeScript**: Strict typing throughout
- **ESLint**: Code quality enforcement
- **Terser**: Production minification
- **Autoprefixer**: CSS vendor prefixes

### Development Environment
- **Host Mode**: `vite --host` for network access (Telegram testing)
- **Type Checking**: Separate `tsc --noEmit` command
- **Hot Reload**: Vite HMR for development

### Platform Compatibility
- **Primary**: Telegram WebView (iOS/Android)
- **Secondary**: Mobile Safari, Chrome Mobile
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Minimum**: iOS 12, Android 8.0

### File Structure
```
menhausen_app/
├── components/          # React components
├── data/               # Content management
├── types/              # TypeScript definitions
├── utils/              # Utility functions
├── styles/             # Global styles
├── imports/            # Figma imports
└── memory-bank/        # Project documentation
```

### Performance Considerations
- **Bundle Size**: Target <250KB gzipped
- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: 44px minimum touch targets
- **Offline Support**: Core functionality without internet
