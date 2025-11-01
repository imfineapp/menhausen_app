# ДОКУМЕНТАЦИЯ СИСТЕМЫ ДОСТИЖЕНИЙ ПОЛЬЗОВАТЕЛЯ

## Обзор

Система достижений (achievements) реализует геймификацию приложения Menhausen, позволяя пользователям получать достижения за различные действия. Система включает 32 достижения с различными условиями разблокировки, системой начисления XP и отображением прогресса.

**Дата создания документации**: 2024
**Версия системы**: 1.0
**Количество достижений**: 32

---

## Архитектура системы

Система достижений состоит из следующих компонентов:

```
┌─────────────────────────────────────────────────────────┐
│              AchievementsContext (React)                 │
│              Централизованное управление состоянием      │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┬──────────────────┬───────────────┐
       │               │                  │               │
┌──────▼──────┐ ┌─────▼─────┐  ┌─────────▼──────┐ ┌─────▼──────┐
│achievement  │ │achievement │  │ userStats      │ │achievements│
│Checker      │ │Storage     │  │ Service        │ │Metadata    │
│(проверка    │ │(хранение   │  │ (статистика    │ │(32         │
│ условий)    │ │ состояния) │  │  пользователя) │ │ достижения)│
└─────────────┘ └────────────┘  └────────────────┘ └────────────┘
```

### Компоненты

1. **AchievementsContext** (`contexts/AchievementsContext.tsx`)
   - React Context для глобального управления состоянием
   - Предоставляет методы для проверки и обновления достижений
   - Автоматическая синхронизация с localStorage

2. **AchievementChecker** (`services/achievementChecker.ts`)
   - Сервис проверки условий разблокировки
   - Регистр функций-проверщиков для каждого типа условия
   - Поддержка комбинированных условий

3. **AchievementStorage** (`services/achievementStorage.ts`)
   - Управление хранением состояния достижений
   - Работа с localStorage
   - Миграция данных при обновлении версии

4. **UserStatsService** (`services/userStatsService.ts`)
   - Управление статистикой пользователя
   - Отслеживание всех действий пользователя
   - Хранение данных о check-ins, открытых карточках, прочитанных статьях и т.д.

5. **AchievementsMetadata** (`data/achievements-metadata.json`)
   - JSON файл с метаданными всех 32 достижений
   - Определяет ID, XP, иконки, условия и категории

---

## Типы условий достижений

### 1. registration_checkin
**Описание**: Регистрация и первый check-in  
**Пример**: "newcomer" - Регистрация + 1 чекин  
**Проверка**: `stats.checkins >= 1`

### 2. cards_opened
**Описание**: Открытие карточек в темах  
**Пример**: "beginner" - 3 карточки в бесплатной теме  
**Проверка**: 
- Для категории "Free Topic": только тема "stress"
- Для категории "Premium Topics": все premium темы
- Поддержка указания конкретной темы через `conditionTopicId`

### 3. topic_completed
**Описание**: Завершение всех карточек в теме  
**Пример**: "topic_closer" - Все 10 карточек в бесплатной теме  
**Проверка**: 
- Для категории "Free Topic": только тема "stress"
- Для категории "Premium Topics": только premium темы

### 4. articles_read
**Описание**: Прочтение статей  
**Пример**: "basic_reader" - 3 статьи  
**Проверка**: `stats.articlesRead >= conditionValue`

### 5. cards_repeated
**Описание**: Повторение карточек  
**Пример**: "hero_secrets" - 5 повторений карточек  
**Проверка**: Подсчет повторений по каждой карточке

### 6. topic_repeated
**Описание**: Повторение всех карточек темы  
**Пример**: "keeper_of_wisdom" - Повторена тема + streak  
**Проверка**: Проверка наличия темы в `stats.topicsRepeated`

### 7. streak
**Описание**: Серия ежедневных check-ins подряд  
**Пример**: "first_chapter_hero" - 10 дней подряд  
**Проверка**: `stats.checkinStreak >= conditionValue`

### 8. referral_invite
**Описание**: Приглашение пользователей  
**Пример**: "recruiter" - 1 приглашенный пользователь  
**Проверка**: `stats.referralsInvited >= conditionValue`

### 9. referral_premium
**Описание**: Приглашенный пользователь купил premium  
**Пример**: "ambassador" - Комбинация invite + premium  
**Проверка**: `stats.referralsPremium >= conditionValue`

### 10. Комбинированные условия
**Описание**: Несколько условий через массив или разделитель "+"  
**Пример**: `["cards_repeated", "streak"]` или `"cards_repeated + streak"`  
**Логика**: Все условия должны быть выполнены (AND), прогресс = минимум из всех условий

---

## Структура данных

### UserStats (Статистика пользователя)
```typescript
interface UserStats {
  version: number;
  checkins: number;                    // Общее количество check-ins
  checkinStreak: number;               // Текущая серия дней подряд
  lastCheckinDate: string | null;      // Дата последнего check-in
  cardsOpened: Record<string, number>; // topicId -> количество открытых карточек
  topicsCompleted: string[];           // Массив ID завершенных тем
  cardsRepeated: Record<string, number>; // cardId -> количество повторений
  topicsRepeated: string[];            // Массив ID повторенных тем
  articlesRead: number;                // Количество прочитанных статей
  referralsInvited: number;            // Количество приглашенных
  referralsPremium: number;            // Количество приглашенных с premium
  lastUpdated: string;                 // ISO timestamp последнего обновления
}
```

### AchievementDefinition (Определение достижения)
```typescript
interface AchievementDefinition {
  id: string;                          // Уникальный ID достижения
  xp: number;                          // Количество очков опыта
  iconName: string;                    // Название иконки из lucide-react
  conditionType: string | string[];    // Тип условия или массив условий
  category: string;                    // Категория (Free Topic, Premium Topics, и т.д.)
  conditionValue?: number;             // Значение условия (сколько нужно)
  conditionTopicId?: string;           // Конкретная тема (опционально)
  conditionTopicsCount?: number;       // Количество тем (для premium)
  conditionRepeatValue?: number;       // Значение для повторений
  conditionAllArticles?: boolean;      // Флаг "все статьи" (для reading_master)
}
```

### UserAchievement (Состояние достижения пользователя)
```typescript
interface UserAchievement {
  achievementId: string;
  unlocked: boolean;                   // Разблокировано ли достижение
  unlockedAt: string | null;           // Дата разблокировки (ISO timestamp)
  progress: number;                    // Прогресс 0-100%
  xp: number;                          // Количество XP за это достижение
  lastChecked: string;                 // Дата последней проверки
}
```

### UserAchievementsState (Общее состояние)
```typescript
interface UserAchievementsState {
  version: number;
  achievements: Record<string, UserAchievement>; // ID -> состояние
  totalXP: number;                     // Общая сумма XP за все разблокированные
  unlockedCount: number;               // Количество разблокированных
  lastSyncedAt: string | null;         // Дата последней синхронизации
}
```

---

## Логика работы системы

### 1. Инициализация

При запуске приложения:
1. `AchievementsProvider` монтируется в корне приложения
2. Загружаются данные из localStorage через `loadUserAchievements()`
3. Состояние инициализируется в React Context

### 2. Обновление статистики пользователя

Когда пользователь выполняет действие:

```typescript
// Пример: Открытие карточки
incrementCardsOpened('stress'); // Обновляет stats.cardsOpened['stress']++
saveUserStats(stats);           // Сохраняет в localStorage
```

### 3. Проверка достижений

Проверка может быть триггерной или автоматической:

**Триггерная проверка** (после значимого действия):
```typescript
const { checkAndUnlockAchievements } = useAchievements();
const newlyUnlocked = await checkAndUnlockAchievements();
// Возвращает массив ID только что разблокированных достижений
```

**Автоматическая проверка**:
- При монтировании компонентов
- При изменении статистики (через хуки)

### 4. Процесс проверки условий

```
1. Загружается UserStats из localStorage
2. Загружаются все AchievementDefinition из метаданных
3. Для каждого достижения:
   a. Проверяется, разблокировано ли уже (для оптимизации)
   b. Вызывается соответствующий проверщик из conditionCheckers
   c. Получается результат: { unlocked: boolean, progress: number }
   d. Обновляется UserAchievement в состоянии
   e. Если достижение только что разблокировано - добавляется в список новых
4. Пересчитывается totalXP и unlockedCount
5. Состояние сохраняется в localStorage
6. React Context обновляется
```

### 5. Расчет прогресса

Для каждого типа условия:
- **Простой прогресс**: `(current / required) * 100`
- **Комбинированный прогресс**: `Math.min(...allConditionsProgress)`

Пример:
```typescript
// Для cards_opened с required = 10, current = 7
progress = Math.min(100, (7 / 10) * 100) = 70

// Для комбинированного условия ["cards_repeated", "streak"]
// Если cards_repeated = 80%, streak = 60%
progress = Math.min(80, 60) = 60
```

---

## Интеграция с компонентами

### BadgesScreen
**Файл**: `components/BadgesScreen.tsx`

Отображает все достижения пользователя:
- Загружает данные через `useAchievements()`
- Показывает статистику: разблокировано, в процессе, общий XP
- Использует `BadgesSlider` для навигации
- Поддерживает локализацию через `ContentContext`

**Статистика**:
- **Разблокировано**: `badges.filter(b => b.unlocked).length`
- **В процессе**: `badges.filter(b => !b.unlocked && b.progress > 0).length`
- **Очки**: `totalXP` из контекста

### RewardScreen
**Файл**: `components/RewardScreen.tsx`

Экран показа разблокированного достижения:
- Принимает массив `achievements` (ID разблокированных)
- Показывает анимацию и детали достижения
- Кнопка "Продолжить" для возврата в приложение

### Интеграция с событиями приложения

**Check-in** (`components/CheckInScreen.tsx`):
```typescript
incrementCheckin(); // Обновляет статистику
checkAndUnlockAchievements(); // Проверяет достижения
```

**Открытие карточки** (`App.tsx`):
```typescript
incrementCardsOpened(themeId); // Обновляет статистику
setTimeout(() => {
  checkAndShowAchievements(); // Проверяет через 300ms
}, 300);
```

**Завершение темы**:
```typescript
// При завершении последней карточки темы
// Автоматически добавляется в topicsCompleted
// Затем проверяются достижения
```

---

## 32 достижения - полный список

### Категория: Onboarding (1)
1. **newcomer** - Регистрация + 1 чекин (50 XP)

### Категория: Free Topic (4)
2. **beginner** - 3 карточки в бесплатной теме (120 XP)
3. **seeker** - 5 карточек в бесплатной теме (200 XP)
4. **apprentice** - 8 карточек в бесплатной теме (300 XP)
5. **topic_closer** - Все 10 карточек в бесплатной теме (400 XP)

### Категория: Articles (3)
6. **basic_reader** - 3 статьи (450 XP)
7. **knowledge_lover** - 5 статей (1300 XP)
8. **reading_master** - Все статьи (6500 XP)
9. **enlightened_mind** - 10 статей (2400 XP)

### Категория: Repetition & Streak (4)
10. **hero_secrets** - 5 повторений карточек + streak 5 (500 XP)
11. **keeper_of_wisdom** - Повторена тема + streak (650 XP)
12. **persistence_master** - Streak 14 + 14 повторений (1800 XP)
13. **doubt_slayer** - 20 повторений + streak 20 (3100 XP)
14. **balance_keeper** - 4 повторения тем + streak (5300 XP)

### Категория: Streak (4)
15. **first_chapter_hero** - Streak 10 дней (800 XP)
16. **sage** - Streak 21 день (2500 XP)
17. **mind_protector** - Streak 30 дней (3500 XP)

### Категория: Premium Topics (10)
18. **explorer** - 8 карточек в premium темах (1000 XP)
19. **path_chooser** - Завершена 1 premium тема (1200 XP)
20. **traveler** - 5 карточек в premium темах (1400 XP)
21. **fear_conqueror** - 2 завершенные + 2 повторенные premium темы (1600 XP)
22. **inspirer** - 2 повторенные premium темы (2000 XP)
23. **harmony_seeker** - 5 карточек + повторения в premium темах (2200 XP)
24. **depth_explorer** - 3 завершенные + 3 повторенные premium темы (2800 XP)
25. **mentor** - 4 завершенные + 4 повторенные premium темы (3900 XP)
26. **pathfinder** - 5 карточек + повторения в premium темах (4300 XP)
27. **chaos_conqueror** - 5 завершенных premium тем (4800 XP)
28. **legendary_hero** - 6 завершенных + 6 повторенных premium тем (6000 XP)

### Категория: Referral (3)
29. **recruiter** - 1 приглашенный пользователь (500 XP)
30. **spreader** - 3 приглашенных пользователя (1500 XP)
31. **ambassador** - 5 приглашенных + 1 купил premium (3000 XP)

### Категория: Mastery (1)
32. **menhausen_master** - Повторены темы + streak 6 (7000 XP)

---

## Хранение данных

### localStorage структура

**Ключ**: `menhausen_user_stats`
```json
{
  "version": 1,
  "checkins": 15,
  "checkinStreak": 5,
  "lastCheckinDate": "2024-01-15T10:30:00.000Z",
  "cardsOpened": {
    "stress": 8,
    "anxiety": 5
  },
  "topicsCompleted": ["stress"],
  "cardsRepeated": {
    "STRESS-01": 3,
    "STRESS-02": 2
  },
  "topicsRepeated": ["stress"],
  "articlesRead": 5,
  "referralsInvited": 2,
  "referralsPremium": 0,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

**Ключ**: `menhausen_achievements`
```json
{
  "version": 1,
  "achievements": {
    "newcomer": {
      "achievementId": "newcomer",
      "unlocked": true,
      "unlockedAt": "2024-01-01T12:00:00.000Z",
      "progress": 100,
      "xp": 50,
      "lastChecked": "2024-01-15T10:30:00.000Z"
    },
    "beginner": {
      "achievementId": "beginner",
      "unlocked": false,
      "unlockedAt": null,
      "progress": 75,
      "xp": 120,
      "lastChecked": "2024-01-15T10:30:00.000Z"
    }
  },
  "totalXP": 50,
  "unlockedCount": 1,
  "lastSyncedAt": null
}
```

---

## Оптимизация производительности

### Кэширование результатов проверки
- Достижения проверяются только при изменении статистики
- Уже разблокированные достижения пропускаются (но прогресс обновляется)

### Batch обновления
- Все достижения обновляются за один проход
- Одно сохранение в localStorage для всех изменений

### Debouncing
- Проверки могут быть отложены для группировки изменений
- Используется `useRef` для хранения временных данных

---

## Расширение системы

### Добавление нового типа условия

1. Добавить проверщик в `achievementChecker.ts`:
```typescript
conditionCheckers: Record<string, ConditionChecker> = {
  // ... существующие
  new_condition_type: (stats, achievement) => ({
    unlocked: /* логика проверки */,
    progress: /* расчет прогресса */
  })
}
```

2. Обновить типы в `types/achievements.ts` если нужно

3. Добавить достижение в `data/achievements-metadata.json`

4. Добавить локализацию в `data/content/*/badges.json`

### Добавление нового достижения

1. Добавить запись в `data/achievements-metadata.json`:
```json
{
  "id": "new_achievement",
  "xp": 500,
  "iconName": "icon-name",
  "conditionType": "existing_condition",
  "category": "Category Name",
  "conditionValue": 10
}
```

2. Добавить переводы в `data/content/ru/badges.json` и `data/content/en/badges.json`

3. Добавить иконку через `getAchievementIcon()` если нужно

4. Добавить в порядок отображения в `BadgesScreen.tsx` (ACHIEVEMENT_DISPLAY_ORDER)

---

## Тестирование

### Unit тесты
**Файл**: `tests/unit/achievements.test.ts`

Покрывает:
- Проверку условий разблокировки для каждого типа
- Комбинированные условия
- Интеграцию с React Context
- Хранение и загрузку данных

### E2E тесты
Интеграционные тесты проверяют:
- Отображение достижений на экране
- Разблокировку при выполнении действий
- Сохранение состояния после перезагрузки

---

## Известные ограничения и TODO

1. **Условие "все статьи"**: Требует получения общего количества статей из контента
2. **Premium темы**: Упрощенная логика для условий "N карточек в M темах"
3. **Синхронизация с бэкендом**: Реализована только локальная версия, API синхронизация - TODO
4. **Миграция данных**: Базовая версия, может потребоваться расширение при изменении структуры

---

## История изменений

### Версия 1.0 (Текущая)
- ✅ Реализованы 32 достижения
- ✅ Система проверки условий с регистром проверщиков
- ✅ Комбинированные условия
- ✅ Локальное хранение в localStorage
- ✅ React Context для управления состоянием
- ✅ Интеграция с событиями приложения
- ✅ Отображение на экранах BadgesScreen и RewardScreen
- ✅ Подсчет прогресса для всех типов условий
- ✅ Исправление: блок "В процессе" показывает количество достижений с прогрессом > 0
- ✅ Удалено расширенное логирование с экранов тем и карточек
- ✅ Все тесты пройдены (265 unit + 81 e2e)

---

## Контакты и поддержка

При возникновении вопросов или необходимости расширения системы, обращайтесь к разработчикам команды Menhausen.

**Документация обновлена**: 2024
**Статус**: Production Ready ✅

