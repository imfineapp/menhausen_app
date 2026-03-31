# 🌍 Правила мультиязычности (Multilingual Guidelines)

## 📋 Общие принципы

### 1. **Структура переводов**
- UI строки хранятся в `src/i18n/messages/*.ts` (domain stores) и переводятся через `data/translations/ru.json` (en по умолчанию).
- Контентные строки хранятся в `data/content/{language}/` и используются через `useContent()` (включая `about.json`).
- Для UI и контента действует правило: каждый ключ/поле должен присутствовать на поддерживаемых языках (или компонент обязан иметь fallback).

### 2. **Типы контента**
- **UI тексты**: domain stores в `src/i18n/messages/*.ts` (например `navigationMessages`, `homeMessages`, `cardsMessages`) и переводы в `data/translations/ru.json`.
- **Контент**: файлы `data/content/{language}/*` (темы, карточки, mental-techniques, тесты, `about.json` и т.д.) — достаются через `useContent()`.

## 🔧 Технические правила

### 1. **Использование хуков локализации**

#### ✅ ПРАВИЛЬНО - для UI текстов:
```typescript
import { useStore } from '@nanostores/react';
import { navigationMessages } from '@/src/i18n/messages/navigation';

const nav = useStore(navigationMessages);

// Использование:
<button>{nav.next}</button>
```

#### ✅ ПРАВИЛЬНО - для контента из JSON:
```typescript
import { useContent } from '../ContentContext';

const { getLocalizedText } = useContent();

// Использование:
<h1>{getLocalizedText(technique.title)}</h1>
<p>{getLocalizedText(cardData.question)}</p>
```

#### ❌ НЕПРАВИЛЬНО - НЕ ДЕЛАЙТЕ ТАК:
```typescript
// ❌ Передача объекта в JSX
{getLocalizedText({ ru: 'Текст', en: 'Text' })}

// ❌ Прямое использование объекта
// ❌ Прямое переключение текста вручную — используйте UI domain stores через `useStore(...)`
{/* example omitted */ ''}
```

### 2. **Структура JSON файлов**

#### `data/translations/ru.json` - переводы для UI domain stores
Ключи должны соответствовать тому, как UI строки описаны в `src/i18n/messages/<domain>.ts`.

#### `data/content/{language}/` - контент приложения
Контентные JSON файлы подключаются через content-loader (используйте `useContent()` / `getLocalizedText()` там, где требуется).
Для страницы "О приложении" используются `data/content/{language}/about.json`.

## 📝 Создание новых компонентов

### 1. **Шаблон компонента с локализацией**

```typescript
import React from 'react';
import { useContent } from '../ContentContext';
import { useStore } from '@nanostores/react';
import { navigationMessages } from '@/src/i18n/messages/navigation';

interface NewComponentProps {
  onBack: () => void;
}

export function NewComponent({ onBack }: NewComponentProps) {
  const { getLocalizedText } = useContent();
  const nav = useStore(navigationMessages);
  
  return (
    <div>
      {/* UI тексты - используем nanostores/i18n domain stores */}
      <button onClick={onBack}>{nav.back}</button>
      
      {/* Контент из JSON - используем getLocalizedText */}
      <p>{getLocalizedText(someDataFromJSON.title)}</p>
    </div>
  );
}
```

### 2. **Добавление новых переводов**
Для UI строк (nanostores/i18n):
1. Добавьте базовую строку в `src/i18n/messages/<domain>.ts`.
2. Добавьте перевод в `data/translations/ru.json` в нужном namespace (ключи должны совпадать с путями из `<domain>.ts`).

Для контента (data/content):
1. Добавьте/обновите поле в `data/content/en/...`.
2. Добавьте/обновите поле в `data/content/ru/...`.
3. Убедитесь, что компонент использует `useContent()` и `getLocalizedText()` там, где требуется.

## 🚫 Частые ошибки и как их избежать

### 1. **Ошибка "Objects are not valid as a React child"**
```typescript
// ❌ НЕПРАВИЛЬНО
{getLocalizedText({ ru: 'Текст', en: 'Text' })}

// ✅ ПРАВИЛЬНО
const nav = useStore(navigationMessages);
<button>{nav.next}</button>
```

### 2. **Неправильное использование getLocalizedText**
```typescript
// ❌ НЕПРАВИЛЬНО - для UI текстов
{getLocalizedText({ ru: 'Кнопка', en: 'Button' })}

// ✅ ПРАВИЛЬНО - для UI текстов
const nav = useStore(navigationMessages);
<button>{nav.next}</button>

// ✅ ПРАВИЛЬНО - для контента из JSON
{getLocalizedText(technique.title)}
```

### 3. **Забывание обновить типы**
```typescript
// ❌ НЕПРАВИЛЬНО - добавили в JSON, но забыли типы
// Результат: TypeScript ошибки

// ✅ ПРАВИЛЬНО - обновляем типы, JSON и fallback
```

## 📚 Примеры использования

### 1. **Простая страница с кнопками**
```typescript
import { useStore } from '@nanostores/react';
import { navigationMessages } from '@/src/i18n/messages/navigation';

function SimplePage({ onBack }: { onBack: () => void }) {
  const nav = useStore(navigationMessages);

  return (
    <div>
      <h1>{/* example */}</h1>
      <button onClick={onBack}>{nav.back}</button>
      <button>{/* save example */}</button>
    </div>
  );
}
```

### 2. **Страница с контентом из JSON**
```typescript
import { useStore } from '@nanostores/react';
import { navigationMessages } from '@/src/i18n/messages/navigation';

function ContentPage({ onBack }: { onBack: () => void }) {
  const { getLocalizedText, getCard } = useContent();
  const nav = useStore(navigationMessages);
  
  const cardData = getCard('card-1');
  
  return (
    <div>
      {/* UI элементы */}
      <button onClick={onBack}>
        {nav.back}
      </button>
      
      {/* Контент из JSON */}
      <h1>{getLocalizedText(cardData?.title)}</h1>
      <p>{getLocalizedText(cardData?.description)}</p>
    </div>
  );
}
```

## 🔍 Проверка качества

### 1. **Чек-лист для новых компонентов**
- [ ] Все UI тексты используют nanostores/i18n domain stores через `useStore(...)`
- [ ] Весь контент из JSON использует `getLocalizedText()`
- [ ] Нет передачи объектов `{ru: '...', en: '...'}` в JSX
- [ ] Переводы добавлены в правильные места: UI в `src/i18n/messages/*` + `data/translations/ru.json`, контент в `data/content/*`

### 2. **Тестирование**
```bash
# Проверка линтера
npm run lint

# Проверка типов
npm run type-check

# Запуск приложения
npm run dev
```

## 📖 Дополнительные ресурсы

- **Основные файлы локализации**: `components/ContentContext.tsx`, `src/i18n/messages/*`
- **Типы**: `types/content.ts`
- **Контент**: `data/content/{language}/`
- **Примеры**: `components/mental-techniques/`

---

**💡 Помните**: Консистентность в локализации критически важна для пользовательского опыта. Всегда следуйте этим правилам при создании новых компонентов!
