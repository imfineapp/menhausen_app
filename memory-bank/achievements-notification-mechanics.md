# Механика показа уведомлений для достижений

## Обзор

Реализована система отложенного показа уведомлений (reward screen) для всех типов достижений. Каждый тип достижений имеет свою логику показа в зависимости от контекста разблокировки.

**Дата реализации**: 2025-11-11  
**Версия**: 1.0  
**Статус**: ✅ Реализовано и протестировано

---

## Типы достижений и механика показа

### 1. Достижения с карточками

**Типы условий**: `cards_opened`, `topic_completed`, `cards_repeated`, `topic_repeated`

**Механика показа**:
- При разблокировке на экране `card-details` → откладывается для показа
- Показывается на экране `theme-home` при переходе на него
- Флаг отслеживания: `shownOnThemeHome`

**Затронутые достижения**:
- `beginner`, `seeker`, `apprentice` (Free Topic)
- `explorer`, `traveler` (Premium Topics)
- `topic_closer`, `path_chooser`, `chaos_conqueror` (topic_completed)
- `hero_secrets`, `persistence_master`, `doubt_slayer` (cards_repeated)
- `keeper_of_wisdom`, `inspirer`, `balance_keeper`, `menhausen_master` (topic_repeated)
- Комбинированные: `fear_conqueror`, `depth_explorer`, `mentor`, `legendary_hero`

**Файлы**:
- `App.tsx` - фильтрация и логика отложенного показа (строки 585-695)
- `contexts/AchievementsContext.tsx` - установка флага `shownOnThemeHome` (строки 103-167)
- `App.tsx` - проверка на `theme-home` (строки 863-920)

---

### 2. Достижения со статьями

**Тип условия**: `articles_read`

**Механика показа**:
- При разблокировке на экране `article` → откладывается для показа
- Показывается при нажатии кнопки "назад" из статьи
- Возврат на правильный экран: `home` или `all-articles` (в зависимости от источника)
- Флаг отслеживания: `shownOnArticleBack`

**Затронутые достижения**:
- `basic_reader` - 3 статьи (450 XP)
- `knowledge_lover` - 5 статей (1300 XP)
- `enlightened_mind` - 10 статей (2400 XP)
- `reading_master` - все статьи (6500 XP)

**Файлы**:
- `components/ArticleScreen.tsx` - проверка достижений при возврате (строки 90-139)
- `App.tsx` - фильтрация достижений со статьями (строки 601-612)
- `App.tsx` - логика возврата из reward screen (строки 2101-2137)
- `contexts/AchievementsContext.tsx` - установка флага `shownOnArticleBack` (строки 113-166)

---

### 3. Достижения со streak

**Типы условий**: `streak`, `streak_repeat` (без условий карточек)

**Механика показа**:
- При разблокировке на экране `checkin` → откладывается для показа
- Показывается на экране `home` после завершения чекина
- Флаг отслеживания: `shownOnHomeAfterCheckin`

**Затронутые достижения**:
- `first_chapter_hero` - 10 дней подряд (800 XP)
- `sage` - 21 день подряд (2500 XP)
- `mind_protector` - 30 дней подряд (3500 XP)
- Комбинированные (только streak, без карточек): `hero_secrets`, `keeper_of_wisdom`, `persistence_master`, `doubt_slayer`, `balance_keeper`, `menhausen_master`

**Особенность**: Для комбинированных достижений (streak + cards) используется логика карточек, если есть условия карточек.

**Файлы**:
- `App.tsx` - фильтрация streak достижений (строки 614-635)
- `App.tsx` - проверка на `home` (строки 732-801)
- `App.tsx` - обновление `handleCheckInSubmit` (строки 1226-1263)
- `contexts/AchievementsContext.tsx` - установка флага `shownOnHomeAfterCheckin` (строки 118-166)

---

### 4. Достижения с referral

**Типы условий**: `referral_invite`, `referral_premium`

**Механика показа**:
- При разблокировке (обновление через storage event) → откладывается для показа
- Показывается при открытии экрана `profile`
- Флаг отслеживания: `shownOnProfile`

**Затронутые достижения**:
- `recruiter` - 1 приглашение (500 XP)
- `spreader` - 3 приглашения (1500 XP)
- `ambassador` - referral_invite + referral_premium (3000 XP)

**Файлы**:
- `App.tsx` - фильтрация referral достижений (строки 637-648)
- `App.tsx` - проверка на `profile` (строки 803-861)
- `contexts/AchievementsContext.tsx` - установка флага `shownOnProfile` (строки 125-166)

---

## Техническая реализация

### Расширение типов

**Файл**: `types/achievements.ts`

Добавлены новые флаги в интерфейс `UserAchievement`:
```typescript
shownOnThemeHome?: boolean;        // Для карточек
shownOnArticleBack?: boolean;      // Для статей
shownOnHomeAfterCheckin?: boolean; // Для streak
shownOnProfile?: boolean;          // Для referral
```

### Логика определения типа достижения

**Файл**: `contexts/AchievementsContext.tsx`

Проверка типа достижения происходит в следующем порядке:
1. **Карточки** (`isCardRelated`) - проверяется первым
2. **Статьи** (`isArticleRelated`)
3. **Streak** (`isStreakRelated`) - только если нет условий карточек
4. **Referral** (`isReferralRelated`)

**Важно**: Для комбинированных достижений приоритет у условий карточек.

### Фильтрация в checkAndShowAchievements

**Файл**: `App.tsx` (строки 585-695)

Логика отложенного показа:
- `card-details` + карточки → отложить
- `article` + статьи → отложить
- `checkin` + streak → отложить
- referral → всегда отложить (обновляется асинхронно)

### Проверка на целевых экранах

**App.tsx**:
- `theme-home` (строки 863-920) - проверка карточных достижений
- `home` (строки 732-801) - проверка streak достижений
- `profile` (строки 803-861) - проверка referral достижений

**ArticleScreen.tsx** (строки 90-139):
- Проверка при нажатии "назад"
- Определение правильного экрана возврата

### Обновление handleCheckInSubmit

**Файл**: `App.tsx` (строки 1226-1263)

Изменено с прямого вызова `checkAndUnlockAchievements` на `checkAndShowAchievements` для правильной фильтрации и отложенного показа streak достижений.

---

## Структура файлов

### Измененные файлы

1. **types/achievements.ts**
   - Добавлены флаги `shownOnArticleBack`, `shownOnHomeAfterCheckin`, `shownOnProfile`

2. **contexts/AchievementsContext.tsx**
   - Добавлена проверка `isArticleRelated`, `isStreakRelated`, `isReferralRelated`
   - Логика установки флагов при разблокировке

3. **services/achievementStorage.ts**
   - Обновлена функция `updateAchievement` для сохранения новых флагов

4. **App.tsx**
   - Расширена фильтрация в `checkAndShowAchievements`
   - Добавлены `useEffect` для проверки на `home` и `profile`
   - Обновлен `handleCheckInSubmit`
   - Обновлена логика возврата из reward screen

5. **components/ArticleScreen.tsx**
   - Добавлена проверка достижений при возврате
   - Модифицирован обработчик `onBack`
   - Добавлен вызов `checkAndShowAchievements` после чтения статьи

---

## Логика работы

### Последовательность для карточек

1. Пользователь открывает карточку → `incrementCardsOpened`
2. Вызывается `checkAndShowAchievements`
3. Если достижение разблокировано на `card-details` → сохраняется с `shownOnThemeHome = false`
4. При переходе на `theme-home` → проверяются достижения с `shownOnThemeHome = false`
5. Показывается reward screen
6. Флаг обновляется на `true`

### Последовательность для статей

1. Пользователь читает статью → `markArticleRead`
2. Вызывается `checkAndShowAchievements`
3. Если достижение разблокировано на `article` → сохраняется с `shownOnArticleBack = false`
4. При нажатии "назад" → проверяются достижения с `shownOnArticleBack = false`
5. Показывается reward screen
6. Возврат на правильный экран (`home` или `all-articles`)
7. Флаг обновляется на `true`

### Последовательность для streak

1. Пользователь делает чекин → `incrementCheckin`
2. Вызывается `checkAndShowAchievements`
3. Если достижение разблокировано на `checkin` → сохраняется с `shownOnHomeAfterCheckin = false`
4. При переходе на `home` → проверяются достижения с `shownOnHomeAfterCheckin = false`
5. Показывается reward screen
6. Флаг обновляется на `true`

### Последовательность для referral

1. Статистика рефералов обновляется → storage event
2. Вызывается `checkAndShowAchievements`
3. Достижение сохраняется с `shownOnProfile = false`
4. При открытии `profile` → проверяются достижения с `shownOnProfile = false`
5. Показывается reward screen
6. Флаг обновляется на `true`

---

## Комбинированные достижения

Достижения с несколькими условиями обрабатываются по приоритету:

1. **Если есть условия карточек** → используется логика карточек (theme-home)
2. **Если только streak** → используется логика streak (home после чекина)
3. **Если streak_repeat с cards_opened** → используется логика карточек (theme-home)

**Примеры**:
- `harmony_seeker` (cards_opened + streak_repeat) → theme-home
- `pathfinder` (cards_opened + streak_repeat) → theme-home
- `hero_secrets` (cards_repeated + streak) → theme-home (есть cards_repeated)
- `keeper_of_wisdom` (topic_repeated + streak) → theme-home (есть topic_repeated)

---

## Заблокированные экраны

Экраны, на которых не показывается reward screen автоматически:

```typescript
const blockedScreensForReward: AppScreen[] = [
  'onboarding1', 'onboarding2', 
  'survey01', 'survey02', 'survey03', 'survey04', 'survey05', 'survey06',
  'pin', 'checkin', 'reward', 
  'card-welcome', 'question-01', 'question-02', 'final-message', 'rate-card'
];
```

**Примечание**: `card-details` и `article` не заблокированы, но имеют специальную логику отложенного показа.

---

## Тестирование

### Проверка типов
```bash
npm run type-check
```
✅ Все проверки пройдены

### Юнит тесты
```bash
npx vitest run
```
✅ 312 тестов пройдено | 1 пропущен

### Линтеры
✅ Ошибок не найдено

---

## Зависимости

- `types/achievements.ts` - базовые типы
- `contexts/AchievementsContext.tsx` - контекст достижений
- `services/achievementStorage.ts` - хранение достижений
- `services/achievementChecker.ts` - проверка условий
- `utils/achievementsMetadata.ts` - метаданные достижений
- `components/RewardScreen.tsx` - компонент показа награды
- `components/RewardManager.tsx` - менеджер последовательного показа

---

## Связанные документы

- `memory-bank/achievements-system-documentation.md` - общая документация системы достижений
- `memory-bank/changelog-achievements-fixes.md` - история изменений

---

## Версия

**v1.0** - 2025-11-11
- Реализована механика для всех типов достижений
- Добавлены флаги отслеживания показа
- Реализована логика отложенного показа
- Обновлена логика возврата из reward screen

