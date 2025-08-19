# Memory Bank: Style Guide

## Design System

### Color Palette
- **Primary**: #E1FF00 (neon yellow) - CTAs and highlights
- **Background**: #111111 (dark) - Main background
- **Text Primary**: #FFFFFF (white) - Main text
- **Text Secondary**: #CCCCCC (light gray) - Secondary text
- **Survey Options**: Gray variants without blue tints

### Typography
- **Responsive**: text-responsive-* classes for adaptive sizing
- **Hierarchy**: Proper heading levels with clamp() functions
- **Touch-Friendly**: Minimum 16px font size to prevent iOS zoom
- **Font Family**: System fonts for optimal performance

### Component Patterns

#### Button Styles
- **Bottom Fixed CTA**: 
  - Width: 350px
  - Margin Left: 23px
  - Background: #E1FF00
  - Text: Black for contrast
- **Back Button**: Figma BackButton component integration
- **Touch Targets**: Minimum 44px×44px for accessibility

#### Layout Patterns
- **Screen Container**: `w-full h-screen bg-[#111111]`
- **Content Padding**: Consistent spacing with Guidelines.md compliance
- **Safe Areas**: iOS notch and home indicator support

### Responsive Design
- **Mobile-First**: Primary target 393px (iPhone 13/14/15)
- **Breakpoints**: 320px, 375px, 640px, 768px, 1024px+
- **Adaptive Text**: clamp() functions for responsive typography
- **Touch-Optimized**: All interactive elements ≥44px

### Accessibility
- **WCAG 2.1 AA**: Full compliance target
- **Color Contrast**: 4.5:1 minimum for text
- **Screen Readers**: Semantic HTML and ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility

### Component Standards
- **Consistent Structure**: Standard component template with sections
- **State Management**: React hooks with proper state organization
- **Event Handlers**: Clearly separated event handling functions
- **Prop Types**: TypeScript interfaces for all props

### Animation Guidelines
- **Subtle Transitions**: Smooth screen transitions
- **Performance**: Prefer CSS animations over JavaScript
- **Accessibility**: Respect user's motion preferences
- **Loading States**: Appropriate feedback for user actions
