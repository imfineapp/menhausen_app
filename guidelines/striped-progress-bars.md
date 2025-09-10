# Полосатые прогресс-бары - Руководство по использованию

## Обзор

Полосатые прогресс-бары используют диагональные полосы под углом -45° с двумя цветами для создания современного и привлекательного визуального эффекта.

## CSS Классы

### Базовые классы

```css
.striped-progress-bar          /* Базовый контейнер */
.striped-progress-bar-bg       /* Фон прогресс-бара */
.striped-progress-bar-fill     /* Полосатый прогресс */
```

### Размеры

```css
.striped-progress-bar-sm       /* 0.625rem (h-2.5) */
.striped-progress-bar-md       /* 1rem (h-4) */
.striped-progress-bar-lg       /* 1.5rem (h-6) */
.striped-progress-bar-xl       /* 2rem (h-8) */
```

### Варианты фона

```css
.striped-progress-bar-bg-light /* rgba(217,217,217,0.04) - по умолчанию */
.striped-progress-bar-bg-dark  /* #313131 */
.striped-progress-bar-bg-gray  /* #212121 */
```

### Состояния

```css
.striped-progress-bar-animated /* Анимированные полосы */
.striped-progress-bar-active   /* Активное состояние с подсветкой */
```

## Использование в React

### Компонент StripedProgressBar

```tsx
import { StripedProgressBar } from './ui/StripedProgressBar';

// Базовое использование
<StripedProgressBar progress={75} />

// С настройками
<StripedProgressBar 
  progress={50}
  size="lg"
  backgroundVariant="dark"
  animated={true}
  active={true}
  className="w-full"
/>
```

### Параметры компонента

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `progress` | `number` | - | Процент прогресса (0-100) |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Размер прогресс-бара |
| `showBackground` | `boolean` | `true` | Показывать фон |
| `backgroundVariant` | `'light' \| 'dark' \| 'gray'` | `'light'` | Вариант фона |
| `animated` | `boolean` | `false` | Анимированные полосы |
| `active` | `boolean` | `false` | Активное состояние |
| `className` | `string` | `""` | Дополнительные CSS классы |

## Прямое использование CSS классов

### HTML структура

```html
<div class="striped-progress-bar striped-progress-bar-lg">
  <div class="striped-progress-bar-bg striped-progress-bar-bg-light"></div>
  <div class="striped-progress-bar-fill" style="width: 75%"></div>
</div>
```

### Примеры использования

#### Маленький прогресс-бар
```html
<div class="striped-progress-bar striped-progress-bar-sm w-8">
  <div class="striped-progress-bar-bg striped-progress-bar-bg-dark"></div>
  <div class="striped-progress-bar-fill" style="width: 100%"></div>
</div>
```

#### Большой анимированный прогресс-бар
```html
<div class="striped-progress-bar striped-progress-bar-xl striped-progress-bar-animated w-full">
  <div class="striped-progress-bar-bg"></div>
  <div class="striped-progress-bar-fill" style="width: 60%"></div>
</div>
```

#### Активный прогресс-бар
```html
<div class="striped-progress-bar striped-progress-bar-md striped-progress-bar-active w-full">
  <div class="striped-progress-bar-bg striped-progress-bar-bg-gray"></div>
  <div class="striped-progress-bar-fill" style="width: 90%"></div>
</div>
```

## Цветовая схема

- **Основной цвет**: `#e1ff00` (ярко-желтый)
- **Дополнительный цвет**: `#d1ef00` (темно-желтый)
- **Ширина полосы**: 16px
- **Угол**: -45° (диагональные полосы)

## Анимации

### Анимированные полосы
```css
.striped-progress-bar-animated .striped-progress-bar-fill {
  animation: striped-progress-shift 2s linear infinite;
}
```

### Hover эффекты
```css
.striped-progress-bar:hover .striped-progress-bar-fill {
  filter: brightness(1.1);
}
```

## Лучшие практики

1. **Используйте компонент StripedProgressBar** для React приложений
2. **Выбирайте подходящий размер** в зависимости от контекста
3. **Применяйте анимацию** только для интерактивных элементов
4. **Используйте активное состояние** для текущих задач
5. **Сохраняйте консистентность** - используйте одинаковые размеры в одном интерфейсе

## Совместимость

- ✅ Все современные браузеры
- ✅ Мобильные устройства
- ✅ Tailwind CSS
- ✅ React компоненты
- ✅ TypeScript
