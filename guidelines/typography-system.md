# Typography System - Menhausen App

## Overview
Единая типографическая система для приложения Menhausen, созданная в соответствии с Guidelines.md и обеспечивающая responsive scaling на всех устройствах.

## Typography Classes

### Headings

#### H1 - Main Headings
```css
.typography-h1
```
- **Font Family**: Roboto Slab, SF Pro Display, -apple-system, serif
- **Font Size**: `clamp(24px, 5vw, 32px)`
- **Line Height**: `0.8`
- **Font Weight**: `400`
- **Usage**: Главные заголовки экранов (Onboarding, Check-in, etc.)

#### H2 - Section Headings
```css
.typography-h2
```
- **Font Family**: Roboto Slab, SF Pro Display, -apple-system, serif
- **Font Size**: `clamp(20px, 4vw, 28px)`
- **Line Height**: `0.8`
- **Font Weight**: `400`
- **Usage**: Заголовки секций (Home screen, Profile sections, etc.)

#### H3 - Subsection Headings
```css
.typography-h3
```
- **Font Family**: Roboto Slab, SF Pro Display, -apple-system, serif
- **Font Size**: `clamp(18px, 3.5vw, 24px)`
- **Line Height**: `0.8`
- **Font Weight**: `400`
- **Usage**: Подзаголовки и заголовки карточек

### Body Text

#### Body - Main Text
```css
.typography-body
```
- **Font Family**: PT Sans, SF Pro Text, -apple-system, sans-serif
- **Font Size**: `clamp(14px, 2.5vw, 18px)`
- **Line Height**: `1.5`
- **Font Weight**: `400`
- **Usage**: Основной текст, описания, контент

#### Caption - Secondary Text
```css
.typography-caption
```
- **Font Family**: PT Sans, SF Pro Text, -apple-system, sans-serif
- **Font Size**: `clamp(12px, 2vw, 14px)`
- **Line Height**: `1.4`
- **Font Weight**: `400`
- **Usage**: Вторичный текст, подписи, метки

#### Small - Small Text
```css
.typography-small
```
- **Font Family**: PT Sans, SF Pro Text, -apple-system, sans-serif
- **Font Size**: `clamp(10px, 1.8vw, 12px)`
- **Line Height**: `1.3`
- **Font Weight**: `400`
- **Usage**: Мелкий текст, сноски, детали

### Interactive Elements

#### Button - Button Text
```css
.typography-button
```
- **Font Family**: PT Sans, SF Pro Text, -apple-system, sans-serif
- **Font Size**: `15px`
- **Line Height**: `1.4`
- **Font Weight**: `500`
- **Usage**: Текст кнопок, ссылки, интерактивные элементы

## Utility Classes

### Line Height Utilities
```css
.typography-compact  /* line-height: 1.2 */
.typography-tight    /* line-height: 1.1 */
.typography-loose    /* line-height: 1.6 */
```

### Responsive Utilities
```css
.typography-responsive /* clamp(14px, 2.5vw, 18px) with line-height: 1.5 */
```

## Tailwind Integration

### Font Sizes
```javascript
// Available in Tailwind config
text-h1      // clamp(24px, 5vw, 32px)
text-h2      // clamp(20px, 4vw, 28px)
text-h3      // clamp(18px, 3.5vw, 24px)
text-body    // clamp(14px, 2.5vw, 18px)
text-button  // 15px
text-caption // clamp(12px, 2vw, 14px)
text-small   // clamp(10px, 1.8vw, 12px)
```

### Font Families
```javascript
// Available in Tailwind config
font-heading // Roboto Slab, SF Pro Display, -apple-system, serif
font-sans    // PT Sans, SF Pro Text, -apple-system, sans-serif
```

## Usage Examples

### React Component Usage
```tsx
// H1 Heading
<h1 className="typography-h1 text-[#e1ff00]">
  Welcome to Menhausen
</h1>

// H2 Heading
<h2 className="typography-h2 text-[#2d2b2b]">
  How are you feeling?
</h2>

// Body Text
<p className="typography-body text-[#ffffff]">
  This is the main content text that will scale responsively.
</p>

// Button Text
<button className="typography-button text-[#2d2b2b]">
  Continue
</button>
```

### Tailwind Classes Usage
```tsx
// Using Tailwind classes
<h1 className="font-heading text-h1 text-[#e1ff00] leading-[0.8]">
  Welcome to Menhausen
</h1>

<p className="font-sans text-body text-[#ffffff] leading-[1.5]">
  This is the main content text.
</p>
```

## Migration Guide

### From Old Typography
```tsx
// OLD - Fixed sizes
<div className="text-[36px] font-heading">
  <p className="leading-[0.8]">Title</p>
</div>

// NEW - Responsive typography
<div className="typography-h1">
  <p>Title</p>
</div>
```

### Common Patterns
```tsx
// OLD - Complex responsive classes
<div className="font-heading text-[20px] sm:text-[22px] md:text-[24px]">
  <p className="leading-[0.8]">Section Title</p>
</div>

// NEW - Simple responsive class
<div className="typography-h2">
  <p>Section Title</p>
</div>
```

## Browser Support

### iOS Safari
- ✅ Full support with SF Pro Display/Text fallbacks
- ✅ Optimized font loading and rendering
- ✅ Proper text scaling and antialiasing

### Android Chrome
- ✅ Full support with system font fallbacks
- ✅ Responsive scaling works correctly
- ✅ Touch-friendly text sizing

### Desktop Browsers
- ✅ Full support across all major browsers
- ✅ Proper font rendering and scaling
- ✅ Accessibility compliance

## Performance

### Font Loading
- ✅ Preloaded Google Fonts for optimal performance
- ✅ System font fallbacks for instant rendering
- ✅ Font display optimization for better UX

### CSS Optimization
- ✅ Minimal CSS footprint
- ✅ Efficient clamp() functions
- ✅ Optimized for mobile performance

## Accessibility

### WCAG Compliance
- ✅ Sufficient color contrast ratios
- ✅ Scalable text up to 200%
- ✅ Proper semantic markup support
- ✅ Screen reader compatibility

### Touch Accessibility
- ✅ Minimum 44px touch targets
- ✅ Readable text at all sizes
- ✅ Proper spacing and line heights

## Maintenance

### Adding New Typography
1. Add new class to `styles/globals.css`
2. Update Tailwind config if needed
3. Document usage in this file
4. Test across all devices

### Updating Existing Typography
1. Update CSS class in `styles/globals.css`
2. Test all components using the class
3. Update documentation
4. Verify responsive behavior

## Best Practices

### Do's
- ✅ Use typography classes instead of inline styles
- ✅ Test on multiple screen sizes
- ✅ Maintain consistent spacing
- ✅ Use semantic HTML elements

### Don'ts
- ❌ Don't use fixed font sizes
- ❌ Don't mix different typography systems
- ❌ Don't override typography classes unnecessarily
- ❌ Don't use font-bold (700) - use font-medium (500)

## Troubleshooting

### Common Issues
1. **Text not scaling**: Check if clamp() is supported
2. **Font not loading**: Verify font family fallbacks
3. **Line height issues**: Use typography classes instead of custom values
4. **iOS rendering**: Ensure -webkit-font-smoothing is applied

### Debug Tools
- Browser DevTools for font inspection
- Responsive design testing tools
- Font loading performance tools
- Accessibility testing tools
