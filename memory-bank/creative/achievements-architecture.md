🎨🎨🎨 ENTERING CREATIVE PHASE: ARCHITECTURE DESIGN

# АРХИТЕКТУРА СИСТЕМЫ ДОСТИЖЕНИЙ

## Компонент 1: Система хранения и проверки условий достижений

### Описание компонента
Компонент отвечает за проверку условий разблокировки достижений. Должен обрабатывать простые и комбинированные условия из CSV (например, "cards_opened + streak").

### Требования и ограничения
- Поддержка 10+ типов условий
- Комбинированные условия через `+` (например, "cards_repeated + streak")
- Эффективная проверка (не проверять уже разблокированные)
- Возможность расчета progress для каждого условия
- Масштабируемость для добавления новых типов условий

### Варианты архитектуры

#### ВАРИАНТ 1: Функциональный подход с регистром проверчиков
**Описание**: Каждый тип условия - отдельная функция-проверщик, зарегистрированная в объекте.

**Структура**:
```typescript
type ConditionChecker = (
  userStats: UserStats, 
  achievement: AchievementDefinition
) => { unlocked: boolean; progress: number };

const conditionCheckers: Record<string, ConditionChecker> = {
  registration_checkin: checkRegistrationCheckin,
  cards_opened: checkCardsOpened,
  streak: checkStreak,
  // ...
};

function checkCombinedCondition(
  conditionType: string,
  userStats: UserStats,
  achievement: AchievementDefinition
): { unlocked: boolean; progress: number } {
  const conditions = conditionType.split(' + ');
  const results = conditions.map(c => {
    const checker = conditionCheckers[c.trim()];
    return checker(userStats, achievement);
  });
  
  return {
    unlocked: results.every(r => r.unlocked),
    progress: Math.min(...results.map(r => r.progress))
  };
}
```

**Плюсы**:
- Простота добавления новых типов условий
- Четкое разделение логики для каждого типа
- Легко тестировать каждый проверщик отдельно
- Type-safe при правильной типизации

**Минусы**:
- Может быть избыточно для простых условий
- Требует регистрации всех проверщиков

---

#### ВАРИАНТ 2: Класс-based подход с Strategy паттерном
**Описание**: Каждый тип условия - отдельный класс, реализующий интерфейс ConditionStrategy.

**Структура**:
```typescript
interface ConditionStrategy {
  check(userStats: UserStats, achievement: AchievementDefinition): ConditionResult;
  calculateProgress(userStats: UserStats, achievement: AchievementDefinition): number;
}

class CardsOpenedCondition implements ConditionStrategy {
  check(userStats: UserStats, achievement: AchievementDefinition): ConditionResult {
    const required = achievement.conditionValue || 0;
    const current = this.getCardsOpenedCount(userStats, achievement);
    return {
      unlocked: current >= required,
      progress: Math.min(100, (current / required) * 100)
    };
  }
  // ...
}

class CombinedCondition implements ConditionStrategy {
  constructor(private strategies: ConditionStrategy[]) {}
  check(userStats: UserStats, achievement: AchievementDefinition): ConditionResult {
    const results = this.strategies.map(s => s.check(userStats, achievement));
    return {
      unlocked: results.every(r => r.unlocked),
      progress: Math.min(...results.map(r => r.progress))
    };
  }
}
```

**Плюсы**:
- Соответствует принципам ООП
- Легко расширять через наследование
- Инкапсуляция логики каждого условия

**Минусы**:
- Больше boilerplate кода
- Может быть избыточно для простых условий
- Больше сложности для TypeScript

---

#### ВАРИАНТ 3: Конфигурационный подход с правилами
**Описание**: Условия описываются в конфигурации, проверка выполняется универсальным движком.

**Структура**:
```typescript
interface ConditionRule {
  type: string;
  field: keyof UserStats | string;
  operator: '>=' | '<=' | '==' | 'in';
  value: number | string[];
  progressField?: string;
}

const conditionRules: Record<string, ConditionRule> = {
  cards_opened: {
    type: 'cards_opened',
    field: 'cardsOpened',
    operator: '>=',
    value: 'conditionValue',
    progressField: 'cardsOpened'
  },
  // ...
};

function checkCondition(
  rule: ConditionRule,
  userStats: UserStats,
  achievement: AchievementDefinition
): ConditionResult {
  const actualValue = getNestedValue(userStats, rule.field);
  const requiredValue = rule.value === 'conditionValue' 
    ? achievement.conditionValue 
    : rule.value;
    
  return {
    unlocked: compare(actualValue, rule.operator, requiredValue),
    progress: calculateProgress(actualValue, requiredValue)
  };
}
```

**Плюсы**:
- Гибкость через конфигурацию
- Единая логика проверки
- Легко добавлять новые типы через конфиг

**Минусы**:
- Меньше type safety
- Может быть сложнее для нестандартных условий
- Требует обработки edge cases

---

### Рекомендуемый подход: Вариант 1 (Функциональный с регистром)

**Обоснование**:
1. Баланс между простотой и гибкостью
2. Легко тестировать и отлаживать
3. TypeScript-friendly
4. Понятная структура для команды
5. Легко расширять новыми типами условий

**Итоговая реализация**:
- Файл: `services/achievementChecker.ts`
- Каждый тип условия - отдельная функция
- Комбинированные условия обрабатываются через split по `+`
- Результат: `{ unlocked: boolean, progress: number }`

---

## Компонент 2: Система хранения статистики пользователя

### Описание компонента
Сервис для отслеживания и хранения статистики пользователя (чек-ины, карточки, темы и т.д.).

### Требования и ограничения
- Персистентность данных (localStorage)
- Эффективное обновление отдельных метрик
- Синхронизация с бэкендом (опционально)
- Версионирование структуры данных
- Миграция данных при изменениях

### Варианты архитектуры

#### ВАРИАНТ 1: Плоская структура с отдельными ключами
**Описание**: Каждая метрика хранится отдельно в localStorage.

**Плюсы**: Простота, быстрый доступ
**Минусы**: Много обращений к storage, нет атомарности

---

#### ВАРИАНТ 2: Единый объект состояния
**Описание**: Вся статистика хранится в одном объекте.

**Плюсы**: Атомарность, легко версионировать, удобно синхронизировать
**Минусы**: Нужно сериализовать весь объект

---

### Рекомендуемый подход: Вариант 2 (Единый объект)

**Обоснование**:
1. Атомарность обновлений
2. Легко мигрировать на IndexedDB в будущем
3. Удобно синхронизировать с API

**Итоговая реализация**:
- Файл: `services/userStatsService.ts`
- Структура: `UserStats` объект со всеми метриками
- Функции: `loadUserStats()`, `saveUserStats()`, `updateUserStats()`
- Вспомогательные: `incrementCheckin()`, `incrementCardsOpened()`, и т.д.

---

## Компонент 3: Система хранения достижений пользователя

### Описание компонента
Хранение состояния достижений пользователя (разблокированы/не разблокированы, progress, дата разблокировки).

### Рекомендуемая архитектура

**Итоговая реализация**:
- Файл: `services/achievementStorage.ts`
- Структура: `UserAchievementsState` с маппингом achievementId -> UserAchievement
- Автоматический пересчет `totalXP` и `unlockedCount`
- Функции: `loadUserAchievements()`, `saveUserAchievements()`, `updateAchievement()`

---

## Компонент 4: React Context для управления состоянием

### Описание компонента
Централизованное управление состоянием достижений через React Context.

### Рекомендуемая архитектура

**Итоговая реализация**:
- Файл: `contexts/AchievementsContext.tsx`
- Провайдер: `AchievementsProvider`
- Хук: `useAchievements()`
- Методы: `checkAndUnlockAchievements()`, `updateAchievementProgress()`, `refreshAchievements()`

---

## Компонент 5: Хук для автоматической проверки достижений

### Описание компонента
Хук, который автоматически проверяет достижения при изменении статистики пользователя.

### Рекомендуемая архитектура

**Итоговая реализация**:
- Файл: `hooks/useAchievementTracker.ts`
- Автоматическая проверка при монтировании
- Debounce для предотвращения частых проверок
- Отслеживание изменений в localStorage
- Возвращает список новых разблокированных достижений

---

## Итоговая архитектура зависимостей

```
ContentContext (данные о достижениях)
    ↓
AchievementsContext (управление состоянием)
    ↓
achievementStorage (локальное хранение)
    ↓
achievementChecker (проверка условий)
    ↓
userStatsService (статистика пользователя)
    ↓
useAchievementTracker (автоматическая проверка)
    ↓
[UI Компоненты] (отображение - без изменений)
```

---

## Ключевые решения архитектуры

1. **Функциональный подход для проверчиков условий** - баланс простоты и гибкости
2. **Единый объект для статистики** - атомарность и удобство синхронизации
3. **React Context для состояния** - централизованное управление
4. **Debounce для проверок** - оптимизация производительности
5. **Версионирование данных** - поддержка миграций

---

## Следующие шаги

Все компоненты спроектированы. Готовы к реализации в IMPLEMENT MODE.

🎨🎨🎨 EXITING CREATIVE PHASE
