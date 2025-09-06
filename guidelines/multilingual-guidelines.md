# 🌍 Правила мультиязычности (Multilingual Guidelines)

## 📋 Общие принципы

### 1. **Структура переводов**
- Все переводы хранятся в `data/content/{language}/` (ru, en)
- Используется JSON-структура с вложенными объектами
- Каждый ключ должен иметь переводы на всех поддерживаемых языках

### 2. **Типы контента**
- **UI тексты**: `data/content/{language}/ui.json` - кнопки, заголовки, сообщения
- **Контент карточек**: `data/content/{language}/cards.json` - вопросы, рекомендации
- **Темы**: `data/content/{language}/themes.json` - названия тем, описания
- **Ментальные техники**: `data/content/{language}/mental-techniques.json` - техники дыхания, заземления

## 🔧 Технические правила

### 1. **Использование хуков локализации**

#### ✅ ПРАВИЛЬНО - для UI текстов:
```typescript
import { useLanguage } from '../LanguageContext';

const { currentLanguage } = useLanguage();

const getText = (ruText: string, enText: string) => {
  return currentLanguage === 'ru' ? ruText : enText;
};

// Использование:
<h1>{getText('Заголовок', 'Title')}</h1>
<button>{getText('Кнопка', 'Button')}</button>
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
{currentLanguage === 'ru' ? 'Текст' : 'Text'}
```

### 2. **Структура JSON файлов**

#### `ui.json` - UI элементы:
```json
{
  "navigation": {
    "back": { "ru": "Назад", "en": "Back" },
    "next": { "ru": "Далее", "en": "Next" },
    "continue": { "ru": "Продолжить", "en": "Continue" }
  },
  "buttons": {
    "save": { "ru": "Сохранить", "en": "Save" },
    "cancel": { "ru": "Отмена", "en": "Cancel" }
  },
  "messages": {
    "error": { "ru": "Ошибка", "en": "Error" },
    "success": { "ru": "Успешно", "en": "Success" }
  }
}
```

#### `cards.json` - Контент карточек:
```json
{
  "card-1": {
    "title": { "ru": "Название карточки", "en": "Card Title" },
    "questions": [
      {
        "question": { "ru": "Вопрос 1", "en": "Question 1" },
        "placeholder": { "ru": "Введите ответ", "en": "Enter answer" }
      }
    ],
    "finalMessage": {
      "title": { "ru": "Рекомендация", "en": "Recommendation" },
      "content": { "ru": "Текст рекомендации", "en": "Recommendation text" }
    }
  }
}
```

## 📝 Создание новых компонентов

### 1. **Шаблон компонента с локализацией**

```typescript
import React from 'react';
import { useContent } from '../ContentContext';
import { useLanguage } from '../LanguageContext';

interface NewComponentProps {
  onBack: () => void;
}

export function NewComponent({ onBack }: NewComponentProps) {
  const { getLocalizedText } = useContent();
  const { currentLanguage } = useLanguage();
  
  // Функция для UI текстов
  const getText = (ruText: string, enText: string) => {
    return currentLanguage === 'ru' ? ruText : enText;
  };
  
  return (
    <div>
      {/* UI тексты - используем getText */}
      <h1>{getText('Заголовок', 'Title')}</h1>
      <button>{getText('Кнопка', 'Button')}</button>
      
      {/* Контент из JSON - используем getLocalizedText */}
      <p>{getLocalizedText(someDataFromJSON.title)}</p>
    </div>
  );
}
```

### 2. **Добавление новых переводов**

#### Шаг 1: Добавить в `types/content.ts`
```typescript
export interface UITexts {
  // ... существующие поля
  newSection: {
    title: LocalizedContent;
    description: LocalizedContent;
    button: LocalizedContent;
  };
}
```

#### Шаг 2: Добавить в `data/content/ru/ui.json`
```json
{
  "newSection": {
    "title": { "ru": "Новый раздел", "en": "New Section" },
    "description": { "ru": "Описание", "en": "Description" },
    "button": { "ru": "Кнопка", "en": "Button" }
  }
}
```

#### Шаг 3: Добавить в `data/content/en/ui.json`
```json
{
  "newSection": {
    "title": { "ru": "Новый раздел", "en": "New Section" },
    "description": { "ru": "Описание", "en": "Description" },
    "button": { "ru": "Кнопка", "en": "Button" }
  }
}
```

#### Шаг 4: Обновить fallback в `ContentContext.tsx`
```typescript
const fallbackUI: UITexts = {
  // ... существующие поля
  newSection: {
    title: { ru: 'Новый раздел', en: 'New Section' },
    description: { ru: 'Описание', en: 'Description' },
    button: { ru: 'Кнопка', en: 'Button' }
  }
};
```

## 🚫 Частые ошибки и как их избежать

### 1. **Ошибка "Objects are not valid as a React child"**
```typescript
// ❌ НЕПРАВИЛЬНО
{getLocalizedText({ ru: 'Текст', en: 'Text' })}

// ✅ ПРАВИЛЬНО
const getText = (ruText: string, enText: string) => {
  return currentLanguage === 'ru' ? ruText : enText;
};
{getText('Текст', 'Text')}
```

### 2. **Неправильное использование getLocalizedText**
```typescript
// ❌ НЕПРАВИЛЬНО - для UI текстов
{getLocalizedText({ ru: 'Кнопка', en: 'Button' })}

// ✅ ПРАВИЛЬНО - для UI текстов
{getText('Кнопка', 'Button')}

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
function SimplePage({ onBack }: { onBack: () => void }) {
  const { currentLanguage } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return currentLanguage === 'ru' ? ruText : enText;
  };
  
  return (
    <div>
      <h1>{getText('Заголовок страницы', 'Page Title')}</h1>
      <button onClick={onBack}>
        {getText('Назад', 'Back')}
      </button>
      <button>
        {getText('Сохранить', 'Save')}
      </button>
    </div>
  );
}
```

### 2. **Страница с контентом из JSON**
```typescript
function ContentPage({ onBack }: { onBack: () => void }) {
  const { getLocalizedText, getCard } = useContent();
  const { currentLanguage } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return currentLanguage === 'ru' ? ruText : enText;
  };
  
  const cardData = getCard('card-1');
  
  return (
    <div>
      {/* UI элементы */}
      <button onClick={onBack}>
        {getText('Назад', 'Back')}
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
- [ ] Все UI тексты используют `getText()`
- [ ] Весь контент из JSON использует `getLocalizedText()`
- [ ] Нет передачи объектов `{ru: '...', en: '...'}` в JSX
- [ ] Все переводы добавлены в оба языка (ru, en)
- [ ] Типы обновлены в `types/content.ts`
- [ ] Fallback обновлен в `ContentContext.tsx`

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

- **Основные файлы локализации**: `components/ContentContext.tsx`, `components/LanguageContext.tsx`
- **Типы**: `types/content.ts`
- **Контент**: `data/content/{language}/`
- **Примеры**: `components/mental-techniques/`

---

**💡 Помните**: Консистентность в локализации критически важна для пользовательского опыта. Всегда следуйте этим правилам при создании новых компонентов!
