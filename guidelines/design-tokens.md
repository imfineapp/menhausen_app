# Design Tokens Reference - Menhausen App

## Обзор

Эта документация описывает систему дизайн-токенов, используемую в приложении Menhausen. Все цвета, размеры и другие дизайн-значения определены как CSS переменные и доступны через Tailwind классы.

## TypeScript поддержка

Для типобезопасного доступа к токенам используйте файл `utils/designTokens.ts`:

```tsx
import { cssVariables, getActivityColor, designTokens } from '../utils/designTokens';

// Использование CSS переменных
<div style={{ backgroundColor: cssVariables.bgPrimary }}>
  Контент
</div>

// Использование helper функций
const color = getActivityColor('active'); // 'var(--color-activity-active)'

// Доступ к токенам
const primaryColor = designTokens.colors.brand.primary; // '#e1ff00'
```

## Цветовая палитра

### Brand Colors (Брендовые цвета)

Основные цвета бренда приложения.

#### Tailwind классы:
- `bg-brand-primary` / `text-brand-primary` - Основной желтый (#e1ff00)
- `bg-brand-primary-hover` / `text-brand-primary-hover` - Желтый при наведении (#d1ef00)
- `bg-brand-primary-muted` / `text-brand-primary-muted` - Приглушенный желтый (#b8b800)

#### CSS переменные:
```css
--color-brand-primary: #e1ff00;
--color-brand-primary-hover: #d1ef00;
--color-brand-primary-muted: #b8b800;
```

#### Использование:
```tsx
// Кнопка с основным цветом
<button className="bg-brand-primary text-dark">
  Нажми меня
</button>

// Текст с брендовым цветом
<h1 className="text-brand-primary">Заголовок</h1>
```

### Background Colors (Цвета фона)

Цвета для фоновых элементов.

#### Tailwind классы:
- `bg-bg-primary` - Основной фон (#111111)
- `bg-bg-card` - Фон карточек (rgba(217, 217, 217, 0.04))
- `bg-bg-card-hover` - Фон карточек при наведении (rgba(217, 217, 217, 0.06))
- `bg-bg-card-active` - Фон карточек в активном состоянии (rgba(217, 217, 217, 0.08))

#### CSS переменные:
```css
--color-bg-primary: #111111;
--color-bg-card: rgba(217, 217, 217, 0.04);
--color-bg-card-hover: rgba(217, 217, 217, 0.06);
--color-bg-card-active: rgba(217, 217, 217, 0.08);
```

#### Использование:
```tsx
// Основной фон экрана
<div className="bg-bg-primary min-h-screen">
  Контент
</div>

// Карточка с hover эффектом
<div className="bg-bg-card hover:bg-bg-card-hover">
  Содержимое карточки
</div>
```

### Text Colors (Цвета текста)

Цвета для текстовых элементов.

#### Tailwind классы:
- `text-primary` - Основной текст (#ffffff)
- `text-secondary` - Вторичный текст (#cfcfcf)
- `text-tertiary` - Третичный текст (#696969)
- `text-disabled` - Отключенный текст (#9a9a9a)
- `text-disabled-light` - Светлый отключенный текст (#8a8a8a)
- `text-dark` - Темный текст (#2d2b2b)

#### CSS переменные:
```css
--color-text-primary: #ffffff;
--color-text-secondary: #cfcfcf;
--color-text-tertiary: #696969;
--color-text-disabled: #9a9a9a;
--color-text-disabled-light: #8a8a8a;
--color-text-dark: #2d2b2b;
```

#### Использование:
```tsx
// Основной текст
<p className="text-primary">Основной текст</p>

// Вторичный текст
<p className="text-secondary">Вторичный текст</p>

// Третичный текст (подписи, метки)
<span className="text-tertiary">Метка</span>

// Отключенный текст
<p className="text-disabled">Недоступно</p>

// Темный текст на светлом фоне
<p className="text-dark">Текст на желтом фоне</p>
```

### Border Colors (Цвета границ)

Цвета для границ элементов.

#### Tailwind классы:
- `border-border-primary` - Основная граница (#212121)
- `border-border-secondary` - Вторичная граница (#505050)
- `border-border-accent` - Акцентная граница (#e1ff00)

#### CSS переменные:
```css
--color-border-primary: #212121;
--color-border-secondary: #505050;
--color-border-accent: #e1ff00;
```

#### Использование:
```tsx
// Карточка с границей
<div className="border border-border-primary rounded-xl">
  Содержимое
</div>

// Акцентная граница
<div className="border border-border-accent">
  Выделенный элемент
</div>
```

### Status Colors (Цвета статусов)

Цвета для отображения статусов и состояний.

#### Tailwind классы:
- `bg-status-amber` / `text-status-amber` - Янтарный (для in-progress) (#fbbf24)
- `bg-status-green` / `text-status-green` - Зеленый (для успеха) (#22c55e)
- `bg-status-gray` / `text-status-gray` - Серый (для неактивных) (rgba(128, 128, 128, 0.1))

#### CSS переменные:
```css
--color-status-amber: #fbbf24;
--color-status-green: #22c55e;
--color-status-gray: rgba(128, 128, 128, 0.1);
```

#### Использование:
```tsx
// Статус "в процессе"
<span className="text-status-amber">В процессе</span>

// Статус "успешно"
<span className="text-status-green">Завершено</span>
```

### Activity Colors (Цвета активности)

Цвета для отображения активности пользователя.

#### Tailwind классы:
- `bg-activity-active` / `text-activity-active` - Активная активность (#e1ff00)
- `bg-activity-active-glow` - Свечение активной активности (rgba(225, 255, 0, 0.5))
- `bg-activity-partial` / `text-activity-partial` - Частичная активность (#b8b800)
- `bg-activity-partial-glow` - Свечение частичной активности (rgba(184, 184, 0, 0.4))
- `bg-activity-none` - Отсутствие активности (rgba(128, 128, 128, 0.1))

#### CSS переменные:
```css
--color-activity-active: #e1ff00;
--color-activity-active-glow: rgba(225, 255, 0, 0.5);
--color-activity-partial: #b8b800;
--color-activity-partial-glow: rgba(184, 184, 0, 0.4);
--color-activity-none: rgba(128, 128, 128, 0.1);
```

#### Использование:
```tsx
// В JavaScript функциях для inline стилей
const getColor = (activityType) => {
  switch (activityType) {
    case ActivityType.CHECKIN_AND_EXERCISE:
      return 'var(--color-activity-active)';
    case ActivityType.CHECKIN_ONLY:
      return 'var(--color-activity-partial)';
    default:
      return 'var(--color-activity-none)';
  }
};
```

## Типографика

### Размеры шрифтов

Используйте классы типографики вместо фиксированных размеров:

- `typography-h1` - Заголовок H1 (clamp(24px, 5vw, 32px))
- `typography-h2` - Заголовок H2 (clamp(20px, 4vw, 28px))
- `typography-h3` - Заголовок H3 (clamp(18px, 3.5vw, 24px))
- `typography-body` - Основной текст (clamp(14px, 2.5vw, 18px))
- `typography-button` - Текст кнопок (15px)
- `typography-caption` - Подпись (clamp(12px, 2vw, 14px))
- `typography-small` - Мелкий текст (clamp(10px, 1.8vw, 12px))

#### Tailwind классы:
- `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-button`, `text-caption`, `text-small`

#### Использование:
```tsx
// ❌ Плохо - захардкоженный размер
<p className="text-[12px]">Текст</p>

// ✅ Хорошо - использование токена
<p className="typography-caption">Текст</p>
// или
<p className="text-caption">Текст</p>
```

## Размеры элементов

### Кнопки

Используйте CSS переменные для размеров кнопок:

```css
--bottom-button-width: 350px;
--bottom-button-height: 46px;
--bottom-button-bottom: 35px;
--bottom-button-radius: 12px;
```

### Отступы

Используйте стандартные Tailwind классы для отступов:
- `p-4` (16px), `p-5` (20px), `p-6` (24px)
- `px-4`, `py-4` для отдельных осей
- `gap-4`, `gap-8` для flex/grid контейнеров

## Миграция существующего кода

### Паттерны замены

#### Цвета:
```tsx
// ❌ Старый код
<div className="bg-[#111111] text-[#e1ff00]">
  Контент
</div>

// ✅ Новый код
<div className="bg-bg-primary text-brand-primary">
  Контент
</div>
```

#### Размеры шрифтов:
```tsx
// ❌ Старый код
<p className="text-[12px]">Текст</p>

// ✅ Новый код
<p className="text-caption">Текст</p>
```

#### Границы:
```tsx
// ❌ Старый код
<div className="border border-[#212121]">
  Контент
</div>

// ✅ Новый код
<div className="border border-border-primary">
  Контент
</div>
```

## Best Practices

1. **Всегда используйте токены** вместо захардкоженных значений
2. **Проверяйте код** с помощью скрипта `scripts/find-hardcoded-values.js`
3. **Используйте семантические имена** - `text-primary` вместо `text-white`
4. **Для inline стилей** используйте CSS переменные: `style={{ color: 'var(--color-brand-primary)' }}`
5. **Тестируйте в темной теме** - убедитесь, что токены работают корректно

## Добавление новых токенов

1. Добавьте CSS переменную в `styles/globals.css` в секцию `:root`
2. Добавьте соответствующий класс в `tailwind.config.js`
3. Добавьте токен в `utils/designTokens.ts` для типобезопасности
4. Обновите эту документацию
5. Мигрируйте существующий код на использование нового токена

## См. также

- [Typography System](./typography-system.md)
- [Guidelines](./Guidelines.md)

