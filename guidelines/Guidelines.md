# Menhausen Telegram Mini App - Design Guidelines

## Design Tokens System

### Overview
Все цвета, размеры и другие дизайн-значения определены как CSS переменные и доступны через Tailwind классы. Это обеспечивает централизованное управление дизайном и упрощает поддержку.

### Использование токенов

**Всегда используйте токены вместо захардкоженных значений:**

```tsx
// ❌ Плохо
<div className="bg-[#111111] text-[#e1ff00]">
  Контент
</div>

// ✅ Хорошо
<div className="bg-bg-primary text-brand-primary">
  Контент
</div>
```

### Основные токены

- **Brand Colors**: `bg-brand-primary`, `text-brand-primary`, `bg-brand-primary-hover`
- **Background Colors**: `bg-bg-primary`, `bg-bg-card`, `bg-bg-card-hover`
- **Text Colors**: `text-primary`, `text-secondary`, `text-tertiary`, `text-disabled`, `text-dark`
- **Border Colors**: `border-border-primary`, `border-border-secondary`, `border-border-accent`
- **Status Colors**: `text-status-amber`, `text-status-green`
- **Activity Colors**: Используйте CSS переменные в JavaScript функциях

### Полная документация

См. [Design Tokens Reference](./design-tokens.md) для полного списка доступных токенов и примеров использования.

### Проверка кода

Используйте скрипт `scripts/find-hardcoded-values.js` для автоматического поиска захардкоженных значений:

```bash
node scripts/find-hardcoded-values.js
```

## General Guidelines

### Responsive Design Principles
* **Mobile-First Approach**: Design and develop for mobile devices first, then enhance for larger screens
* **Touch-Friendly Design**: All interactive elements must have a minimum touch target of 44px x 44px
* **Flexible Layouts**: Use flexbox and grid instead of fixed positioning wherever possible
* **Fluid Typography**: Use clamp() functions and viewport units for responsive text sizing
* **Container Queries**: Use responsive containers that adapt to their parent rather than just viewport
* **Safe Areas**: Always account for device safe areas (notches, home indicators)

### Breakpoint System
* **xs**: 320px - 374px (Small phones)
* **sm**: 375px - 639px (Standard phones) 
* **md**: 640px - 767px (Large phones, small tablets)
* **lg**: 768px - 1023px (Tablets)
* **xl**: 1024px+ (Desktop, large tablets)

### Layout Constraints
* **Maximum Content Width**: 393px on mobile, scalable on larger screens
* **Minimum Content Width**: 320px (iPhone 5/SE compatibility)
* **Vertical Spacing**: Use consistent spacing scale (4px, 8px, 16px, 24px, 32px, 48px)
* **Horizontal Padding**: 16px on mobile, 20px on sm, 24px on md+
* **Touch Zones**: Minimum 44px height/width for all clickable elements

---

## Component Guidelines

### Typography
* **Headings**: Use clamp() for responsive scaling
  - H1: `clamp(24px, 5vw, 32px)` with Roboto Slab Regular font
  - H2: `clamp(20px, 4vw, 28px)` 
  - H3: `clamp(18px, 3.5vw, 24px)`
  - Body: `clamp(14px, 2.5vw, 18px)`
* **Line Height**: 0.8 for H1 headings, 1.2 for other headings, 1.5 for body text
* **Font Weights**: Only use 400 (normal) and 500 (medium)
* **Font Families**: 
  - H1: `font-['Roboto_Slab:Regular',_sans-serif] font-normal` with `leading-[0.8]`
  - Body text: `font-['PT_Sans:Regular',_sans-serif]`
  - Buttons: `font-['PT_Sans:Bold',_sans-serif]`

### Buttons
* **Primary Button**
  - Height: 46px minimum (touch-friendly)
  - Padding: 15px horizontal, responsive
  - Font: PT Sans Bold, 15px
  - Border Radius: 12px
  - Active state: `scale(0.98)` transform
* **Secondary Button**  
  - Same dimensions as primary
  - Outline style with transparent background
  - Hover: Background opacity change
* **Icon Buttons**
  - 48px x 48px minimum touch target
  - 24px icon size, centered
  - 12px border radius

#### Bottom Fixed Buttons (Call-to-Action)
* **Positioning**: Fixed to bottom of screen using absolute positioning
* **Width**: 350px fixed width
* **Height**: 46px minimum (touch-friendly)
* **Margins**: 
  - Left: 23px from screen edge
  - Right: Auto-calculated (~20px on 393px screens)
  - Bottom: Positioned using `bottom-[35px]` for consistent bottom spacing
* **Background**: #E1FF00 (primary yellow)
* **Hover State**: #D1EF00 (slightly darker yellow)
* **Border Radius**: 12px (rounded-xl)
* **Typography**: PT Sans Bold, 15px, #2D2B2B color, center-aligned
* **Usage**: Apply this exact positioning pattern to all primary action buttons on onboarding, survey, PIN setup, and similar full-screen flows
* **Safe Area**: Ensure bottom positioning accounts for device safe area and home indicator

#### Scrollable Content with Fixed Bottom Buttons
* **Problem**: Never use `bottom-[170px]` or similar bottom positioning on scrollable containers as this creates visible black areas under fixed buttons
* **Solution**: Always use `bottom-0` for scrollable containers and add padding-bottom to inner content
* **Pattern**: 
  - Scrollable container: `absolute top-[141px] left-0 right-0 bottom-0 overflow-y-auto`
  - Inner content: `pb-[180px]` to provide space for the fixed button
* **Why**: This ensures the scrollable area takes full height without creating visual gaps while providing adequate spacing for fixed buttons
* **Application**: Apply this pattern to all screens with scrollable content and fixed bottom buttons (ThemeHomeScreen, CardDetailsScreen, etc.)

### Input Fields
* **Height**: 46px minimum
* **Padding**: 16px horizontal
* **Border**: 1px solid with focus states
* **Font Size**: Minimum 16px on iOS (prevents zoom)
* **Border Radius**: 12px

### Cards and Containers
* **Border Radius**: 12px for small cards, 16px for large containers
* **Padding**: 16px mobile, 20px tablet, 24px desktop
* **Margins**: 16px between cards on mobile
* **Max Width**: Cards should not exceed parent container width
* **Shadow**: Subtle shadows only, avoid heavy drop shadows

### Navigation
* **Header Height**: 56px minimum
* **Back Button**: 48px x 48px touch target
* **Logo**: Scalable but maintain aspect ratio
* **Safe Area**: Always account for status bar and notch

---

## Screen-Specific Guidelines

### Onboarding Screens
* **Content Area**: Center-aligned, max-width 351px
* **Progress Indicators**: Bottom-aligned with safe-area offset
* **Buttons**: Use Bottom Fixed Button pattern (see Buttons section) - 350px width, 23px left margin, absolute positioning
* **Text Hierarchy**: Large headings with generous whitespace

### PIN Setup
* **Number Buttons**: 68px x 68px grid layout
* **Grid Spacing**: 38px gap between buttons
* **PIN Display**: 4 blocks with 21px spacing
* **Responsive**: Stack vertically on very small screens

### Home Screen
* **Content Width**: 351px max-width, centered
* **Scroll Area**: Full height with safe bottom padding
* **Card Spacing**: 60px gaps between major sections
* **Slider**: Horizontal scroll with navigation indicators

### Check-in Screen
* **Mood Slider**: Full width with 4px padding
* **Touch Target**: Entire slider track is clickable
* **Feedback**: Immediate visual response to interactions
* **Button**: Fixed bottom position with safe area

---

## Accessibility Guidelines

### Touch Targets
* **Minimum Size**: 44px x 44px (WCAG AA)
* **Spacing**: 8px minimum between touch targets
* **Visual Feedback**: Clear hover/active/focus states
* **Error States**: Clear error messaging with sufficient contrast

### Color and Contrast  
* **Primary Color**: #E1FF00 (neon yellow)
* **Background**: #111111 (dark)
* **Text**: White (#FFFFFF) with 4.5:1 contrast minimum
* **Secondary Text**: #696969 with 3:1 contrast minimum
* **Focus Indicators**: Always visible and high contrast

### Motion and Animation
* **Duration**: 200-300ms for micro-interactions
* **Easing**: Use `ease-out` for most transitions
* **Reduced Motion**: Respect `prefers-reduced-motion` setting
* **Purpose**: Animations should enhance, not distract

---

## Performance Guidelines

### Images and Assets
* **SVGs**: Use for icons and simple graphics
* **Optimization**: Compress all images
* **Loading**: Use appropriate loading strategies
* **Fallbacks**: Always provide fallbacks for images

### Code Practices
* **Bundle Size**: Keep JavaScript bundles under 250KB
* **Critical CSS**: Inline critical styles
* **Lazy Loading**: Implement for off-screen content
* **Caching**: Use appropriate cache headers

### Mobile Optimizations
* **Viewport**: Set appropriate viewport meta tag
* **Touch Events**: Use touch events appropriately  
* **Momentum Scrolling**: Enable on iOS with `-webkit-overflow-scrolling: touch`
* **Prevent Zoom**: Set font-size to 16px minimum on inputs

---

## Testing Guidelines

### Device Testing
* **Primary**: iPhone 13/14/15 (393px width)
* **Secondary**: iPhone SE (375px), iPad (768px), Android flagship
* **Edge Cases**: iPhone 5S (320px), large Android phones (428px+)

### Browser Testing
* **Mobile**: Safari iOS, Chrome Android
* **Desktop**: Chrome, Firefox, Safari, Edge
* **WebViews**: Test in Telegram WebView specifically

### Interaction Testing
* **Touch**: Test all touch interactions on actual devices
* **Keyboard**: Test keyboard navigation where applicable
* **Landscape**: Ensure landscape mode works appropriately
* **Rotation**: Test orientation changes

---

## Code Standards

### CSS Classes
* Use Tailwind utilities where possible
* Create custom classes for complex responsive patterns
* Follow BEM naming for custom components
* Use semantic class names, not presentational

#### Standard Button Classes Reference
* **Bottom Fixed CTA Button**: `absolute bg-[#e1ff00] box-border content-stretch flex flex-row gap-2.5 h-[46px] items-center justify-center left-[23px] px-[126px] py-[15px] rounded-xl bottom-[35px] w-[350px] cursor-pointer hover:bg-[#d1ef00]`
* **Typography for CTA**: `font-['PT_Sans:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]`
* **Text Container**: `adjustLetterSpacing block leading-[16px] whitespace-pre` (inside p tag)

### JavaScript
* Use TypeScript for all components
* Implement proper error boundaries
* Handle loading and error states
* Use modern React patterns (hooks, functional components)

### File Organization
* One component per file
* Group related components in folders
* Use consistent naming conventions
* Keep utility functions separate

## 🌍 Multilingual Support

### Localization Guidelines
* **Detailed Rules**: See [Multilingual Guidelines](./multilingual-guidelines.md) for comprehensive localization rules
* **Key Principles**:
  - Use `getText()` for UI elements (buttons, labels, messages)
  - Use `getLocalizedText()` for content from JSON files
  - Never pass `{ru: '...', en: '...'}` objects directly to JSX
  - Always update types, JSON files, and fallbacks together
* **Supported Languages**: Russian (ru), English (en)
* **Content Structure**: `data/content/{language}/` with separate files for UI, cards, themes, techniques

### Quick Reference
```typescript
// UI texts
const getText = (ruText: string, enText: string) => {
  return currentLanguage === 'ru' ? ruText : enText;
};

// Content from JSON
const { getLocalizedText } = useContent();
{getLocalizedText(dataFromJSON.title)}
```

Remember: This is a Telegram Mini App, so prioritize mobile experience while ensuring it works well on all devices that access Telegram Web.