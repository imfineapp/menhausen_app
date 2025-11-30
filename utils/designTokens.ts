/**
 * Design Tokens - TypeScript типы и константы
 * 
 * Централизованная система дизайн-токенов для типобезопасного доступа к цветам,
 * размерам и другим дизайн-значениям.
 * 
 * Все значения соответствуют CSS переменным из styles/globals.css
 */

/**
 * Brand Colors - Брендовые цвета
 */
export const brandColors = {
  primary: '#e1ff00',
  primaryHover: '#d1ef00',
  primaryMuted: '#b8b800',
} as const;

/**
 * Background Colors - Цвета фона
 */
export const backgroundColors = {
  primary: '#111111',
  card: 'rgba(217, 217, 217, 0.04)',
  cardHover: 'rgba(217, 217, 217, 0.06)',
  cardActive: 'rgba(217, 217, 217, 0.08)',
} as const;

/**
 * Text Colors - Цвета текста
 */
export const textColors = {
  primary: '#ffffff',
  secondary: '#cfcfcf',
  tertiary: '#696969',
  disabled: '#9a9a9a',
  disabledLight: '#8a8a8a',
  dark: '#2d2b2b',
} as const;

/**
 * Border Colors - Цвета границ
 */
export const borderColors = {
  primary: '#212121',
  secondary: '#505050',
  accent: '#e1ff00',
} as const;

/**
 * Status Colors - Цвета статусов
 */
export const statusColors = {
  amber: '#fbbf24',
  green: '#22c55e',
  gray: 'rgba(128, 128, 128, 0.1)',
} as const;

/**
 * Activity Colors - Цвета активности
 */
export const activityColors = {
  active: '#e1ff00',
  activeGlow: 'rgba(225, 255, 0, 0.5)',
  partial: '#b8b800',
  partialGlow: 'rgba(184, 184, 0, 0.4)',
  none: 'rgba(128, 128, 128, 0.1)',
} as const;

/**
 * Font Sizes - Размеры шрифтов
 */
export const fontSizes = {
  h1: 'clamp(24px, 5vw, 32px)',
  h2: 'clamp(20px, 4vw, 28px)',
  h3: 'clamp(18px, 3.5vw, 24px)',
  body: 'clamp(14px, 2.5vw, 18px)',
  button: '15px',
  caption: 'clamp(12px, 2vw, 14px)',
  small: 'clamp(10px, 1.8vw, 12px)',
} as const;

/**
 * Spacing - Отступы
 */
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
} as const;

/**
 * Border Radius - Радиусы скругления
 */
export const borderRadius = {
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  full: '999px',
} as const;

/**
 * Button Sizes - Размеры кнопок
 */
export const buttonSizes = {
  width: '350px',
  height: '46px',
  bottom: '35px',
  paddingX: '126px',
  paddingY: '15px',
  radius: '12px',
} as const;

/**
 * CSS Variable Names - Имена CSS переменных
 * Используются для доступа к CSS переменным через var()
 */
export const cssVariables = {
  // Brand Colors
  brandPrimary: 'var(--color-brand-primary)',
  brandPrimaryHover: 'var(--color-brand-primary-hover)',
  brandPrimaryMuted: 'var(--color-brand-primary-muted)',
  
  // Background Colors
  bgPrimary: 'var(--color-bg-primary)',
  bgCard: 'var(--color-bg-card)',
  bgCardHover: 'var(--color-bg-card-hover)',
  bgCardActive: 'var(--color-bg-card-active)',
  
  // Text Colors
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textTertiary: 'var(--color-text-tertiary)',
  textDisabled: 'var(--color-text-disabled)',
  textDisabledLight: 'var(--color-text-disabled-light)',
  textDark: 'var(--color-text-dark)',
  
  // Border Colors
  borderPrimary: 'var(--color-border-primary)',
  borderSecondary: 'var(--color-border-secondary)',
  borderAccent: 'var(--color-border-accent)',
  
  // Status Colors
  statusAmber: 'var(--color-status-amber)',
  statusGreen: 'var(--color-status-green)',
  statusGray: 'var(--color-status-gray)',
  
  // Activity Colors
  activityActive: 'var(--color-activity-active)',
  activityActiveGlow: 'var(--color-activity-active-glow)',
  activityPartial: 'var(--color-activity-partial)',
  activityPartialGlow: 'var(--color-activity-partial-glow)',
  activityNone: 'var(--color-activity-none)',
} as const;

/**
 * Type Definitions - Типы для токенов
 */
export type BrandColor = typeof brandColors[keyof typeof brandColors];
export type BackgroundColor = typeof backgroundColors[keyof typeof backgroundColors];
export type TextColor = typeof textColors[keyof typeof textColors];
export type BorderColor = typeof borderColors[keyof typeof borderColors];
export type StatusColor = typeof statusColors[keyof typeof statusColors];
export type ActivityColor = typeof activityColors[keyof typeof activityColors];
export type FontSize = typeof fontSizes[keyof typeof fontSizes];
export type Spacing = typeof spacing[keyof typeof spacing];
export type BorderRadius = typeof borderRadius[keyof typeof borderRadius];
export type CssVariable = typeof cssVariables[keyof typeof cssVariables];

/**
 * Helper Functions - Вспомогательные функции
 */

/**
 * Получить CSS переменную для цвета активности
 * Используется в компонентах ActivityBlockNew и ActivityHeatmapBlock
 */
export function getActivityColor(activityType: 'active' | 'partial' | 'none'): string {
  switch (activityType) {
    case 'active':
      return cssVariables.activityActive;
    case 'partial':
      return cssVariables.activityPartial;
    case 'none':
    default:
      return cssVariables.activityNone;
  }
}

/**
 * Получить CSS переменную для эффекта свечения активности
 */
export function getActivityGlowColor(activityType: 'active' | 'partial' | 'none'): string {
  switch (activityType) {
    case 'active':
      return cssVariables.activityActiveGlow;
    case 'partial':
      return cssVariables.activityPartialGlow;
    case 'none':
    default:
      return 'none';
  }
}

/**
 * Получить стиль box-shadow для эффекта свечения
 */
export function getActivityGlowStyle(activityType: 'active' | 'partial' | 'none'): string {
  if (activityType === 'none') {
    return 'none';
  }
  const glowColor = getActivityGlowColor(activityType);
  return `0 0 10px 0 ${glowColor}`;
}

/**
 * Получить цвет текста в зависимости от состояния
 */
export function getTextColorByState(state: 'default' | 'disabled' | 'disabledLight'): string {
  switch (state) {
    case 'disabled':
      return cssVariables.textDisabled;
    case 'disabledLight':
      return cssVariables.textDisabledLight;
    case 'default':
    default:
      return cssVariables.textPrimary;
  }
}

/**
 * Получить цвет статуса
 */
export function getStatusColor(status: 'amber' | 'green' | 'gray'): string {
  switch (status) {
    case 'amber':
      return cssVariables.statusAmber;
    case 'green':
      return cssVariables.statusGreen;
    case 'gray':
    default:
      return cssVariables.statusGray;
  }
}

/**
 * Default Export - Все токены в одном объекте
 */
export const designTokens = {
  colors: {
    brand: brandColors,
    background: backgroundColors,
    text: textColors,
    border: borderColors,
    status: statusColors,
    activity: activityColors,
  },
  typography: {
    fontSizes,
  },
  spacing,
  borderRadius,
  buttons: buttonSizes,
  cssVariables,
} as const;

/**
 * Type для всего объекта designTokens
 */
export type DesignTokens = typeof designTokens;







