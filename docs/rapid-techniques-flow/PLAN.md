# Guided Flow быстрых психологических техник (Menhausen) — план доработки

## Контекст
Нужно внедрить **единый guided flow** из **7 последовательных экранов** (референсы из Stitch), который проходит пользователь строго по шагам. Дополнительно обязательное требование продукта — **двойной замер стресса**:

- **До шага 1**: `stress_before`
- **После шага 7** (финал): `stress_after`
- Система должна сохранить: `stress_before`, `stress_after`, **факт завершения** (completion), и данные должны быть пригодны для **истории/аналитики**.

Важные ограничения:
- **Не ломать существующее поведение** приложения.
- **Не вводить новый design system** — привести новые экраны к существующим токенам/паттернам.
- **Хранение + синхронизация обязательны**: использовать текущий механизм персистентности и Supabase incremental sync.
- Entry point выбран: **старт с Home**.
- Resume UX выбран: при возврате в незавершённый flow — **показать выбор** (продолжить / начать заново).

## Текущая архитектура (выжимка по кодовой базе)

### Навигация
- Роутер: `@nanostores/router` в [`src/stores/router.store.ts`](../../src/stores/router.store.ts)
- Legacy фасад / история / back-логика: [`src/stores/navigation.store.ts`](../../src/stores/navigation.store.ts)
- Рендер экрана по роуту: [`src/ScreenRouter.tsx`](../../src/ScreenRouter.tsx) + маппинг роут→экран в [`src/utils/route-screen-map.ts`](../../src/utils/route-screen-map.ts)

### State management
- nanostores (`atom`, `map`), action-модули в `src/stores/actions/*`.

### Персистентность
- Общий слой безопасного storage: [`src/effects/storage.effects.ts`](../../src/effects/storage.effects.ts) (`storageReadJson`, `storageWriteJson`)
- Пример “истории” в localStorage: [`utils/psychologicalTestStorage.ts`](../../utils/psychologicalTestStorage.ts) (пишет history и bump-триггер синка)

### Supabase incremental sync
- Триггеры bump-версий: [`src/stores/sync-triggers.store.ts`](../../src/stores/sync-triggers.store.ts)
- Подписки на изменения и постановка sync в очередь: [`src/sync/storeSyncSubscriptions.ts`](../../src/sync/storeSyncSubscriptions.ts)
- Типы синка: [`utils/supabaseSync/types.ts`](../../utils/supabaseSync/types.ts)
- Состояние ошибок/очереди: [`src/stores/incremental-sync.store.ts`](../../src/stores/incremental-sync.store.ts)

### Аналитика
- Screen views: [`src/effects/screen-view.effect.ts`](../../src/effects/screen-view.effect.ts)
- PostHog wrapper + список событий: [`utils/analytics/posthog.ts`](../../utils/analytics/posthog.ts)

## Активы Stitch (референс)
Локально распакованы 7 экранов (`code.html` + `screen.png`) и `DESIGN.md`. HTML использует CDN (Tailwind, Google Fonts) и внешние изображения/текстуры — это **референс структуры/UX**, но не исходник стилей “как есть”.

## Продуктовое ТЗ флоу

### Шаги
Контроллер управляет шагом:
- `step=0`: ввод `stress_before`
- `step=1..7`: 7 последовательных экранов техники
- `step=8`: ввод `stress_after` + фиксация completion

### Навигация и guards
- **Next**: доступен только в рамках текущего шага, переводит на следующий шаг.
- **Back**: (нужно финализировать в продукте; дефолт) разрешён на предыдущий шаг, без skip вперёд. Back должен вести себя **предсказуемо в Telegram WebView** и использовать существующий паттерн (`goBack()`/router), но **внутри флоу** предпочтительнее управлять шагами программно, не полагаясь на `window.history.back()`.
- **Запрет skip**: нельзя перейти на `step=N`, если не пройдены шаги `<N`.
- **Выход/возврат**: если есть незавершённый draft, при входе с Home показать выбор:
  - “Продолжить” → открыть соответствующий шаг
  - “Начать заново” → сбросить draft и начать новый проход

### Контракт роутинга (важно зафиксировать до реализации)
- Route параметр `:step` должен быть **числом** `0..8`.
- Любое некорректное значение (`NaN`, `>8`, `<0`) должно редиректиться в безопасное состояние (например, `step=0` или в Home).
- При прямом переходе на `step>0` без draft/истории — показать либо `step=0`, либо модал “Начать flow” (выбрать и зафиксировать поведение).

## 1) Аудит Stitch-экранов и нормализация дизайна (обязательно перед переносом)

### Что удалить/не переносить
Из Stitch HTML явно присутствуют элементы, конфликтующие с продуктом Menhausen:
- **Bottom navigation** (нижнее меню) — удалить.
- “Крестики” (close), переходы на профиль/пользователя — удалить.
- Внешние заглушки `href="#"` — не переносить.
- Внешние ассеты из CDN (Tailwind CDN / Google Fonts / `googleusercontent` / `transparenttextures`) — не переносить как зависимость UI.

### Что привести к Menhausen-паттернам
- **TopBar**: логотип/бренд + back, поведение back как в приложении (через `goBack()` или router).
- **Единые кнопки**: primary/secondary, одинаковые размеры/радиусы/active состояния.
- **Типографика/цвета/spacing**: только существующие токены/конвенции проекта.

### Результат аудита
Составить мэппинг:
`Stitch_element -> (remove | replace_with_existing_component | keep)`

## 2) Интеграция в роутинг (новый маршрут guided flow)

### Изменения (файлы)
- Добавить новый route в [`src/stores/router.store.ts`](../../src/stores/router.store.ts)
  - Вариант: `/techniques/rapid-flow/:step`
- Обновить `AppScreen` (в `types/userState`, где он определён) и маппинг в [`src/utils/route-screen-map.ts`](../../src/utils/route-screen-map.ts)
- Подключить рендеринг через route-renderer:
  - либо добавить в существующий [`src/screen-routes/misc.routes.tsx`](../../src/screen-routes/misc.routes.tsx)
  - либо создать `src/screen-routes/rapid-techniques.routes.tsx` и подключить в [`src/ScreenRouter.tsx`](../../src/ScreenRouter.tsx)

### Решение по entry point с Home
- На Home добавить CTA/блок “Rapid Techniques” и навигацию на новый route.

## 3) Центральный Flow Controller (один контролируемый экран)

### Компонент-контейнер
`RapidTechniquesFlowScreen` (новый компонент) — единственная точка управления:
- читает `step` из route params (и/или из store)
- рендерит sub-screen по шагу
- применяет guards (нельзя skip)
- управляет draft/hydration/resume modal

### State (nanostore)
Сделать отдельный nanostore для состояния текущего прохождения (draft):
- `draftId`
- `techniqueId` (например `rapid_techniques_v1`)
- `step`
- `stressBefore?: number`
- `stressAfter?: number`
- `startedAt: string`
- `updatedAt: string`
- `completedAt?: string | null`

Важно: **draft** и **history** — разные сущности хранения.

## 4) Данные: хранение результатов + история + синк

### 4.1 Структура данных (history)
Запись “прохождения” (одна запись на completion):
- `id: string`
- `techniqueId: string`
- `startedAt: string`
- `completedAt: string`
- `durationMs?: number`
- `stressBefore: number` (0..10)
- `stressAfter: number` (0..10)
- `version: number`

Контейнер в storage:
- `lastCompletedAt?: string`
- `history: RapidFlowHistoryEntry[]`

### 4.2 Где хранить
Следовать текущему паттерну “domain → localStorage cache”:
- использовать `storageReadJson` / `storageWriteJson` из [`src/effects/storage.effects.ts`](../../src/effects/storage.effects.ts)
- выделить отдельный ключ:
  - `rapid-techniques-flow-results` (history)
  - `rapid-techniques-flow-draft` (draft)

### 4.3 Когда сохранять
- Draft сохранять на каждом значимом действии (stress_before, переход шага, stress_after).
- В history добавлять запись **только на completion** (после step=8 подтверждения).

### 4.3.1 Поведение при недоступном storage (Telegram WebView / private mode)
Так как `storage.effects.ts` безопасно “глотает” ошибки, нужно заранее определить UX:
- если storage недоступен, flow **должен продолжать работать** в памяти, но:
  - resume не будет работать
  - completion сохранять некуда → решить, показываем ли пользователю предупреждение или просто работаем best-effort
- аналитика не должна ломать UX (как и сейчас в `posthog.ts`).

### 4.4 Подключение к Supabase incremental sync
Требование: синхронизировать как доменные данные.

План:
- Расширить `SyncDataType` в [`utils/supabaseSync/types.ts`](../../utils/supabaseSync/types.ts) новым типом, например:
  - `rapidTechniquesResults`
- Добавить bump-триггер в [`src/stores/sync-triggers.store.ts`](../../src/stores/sync-triggers.store.ts):
  - `$rapidTechniquesResultsVersion` + `bumpRapidTechniquesResultsSyncVersion()`
- Подписать bump в [`src/sync/storeSyncSubscriptions.ts`](../../src/sync/storeSyncSubscriptions.ts):
  - `onSet($rapidTechniquesResultsVersion, () => queueIfNeeded('rapidTechniquesResults'))`
- Дальше потребуется интеграция в sync payload/merge (в месте, где сервис формирует `payload` по `SyncDataType`).
  - Это место нужно уточнить/найти при реализации (по `getSyncService().queueSync(type)`).

### 4.4.1 Merge/конфликты при pull sync (обязательно предусмотреть)
Так как данные будут синхронизироваться, важно определить правила мерджа:
- **History**: предпочтительно стратегия “append + de-dup по `id`”, сортировка по `completedAt`.
- **Draft**: как правило, **не синкать** (локальная сессия), чтобы не создавать конфликты между устройствами. Зафиксировать: draft — локальный, history — синкается.
- **Idempotency**: completion не должен создавать дубликаты на ретраях оффлайн-очереди.

## 5) Компонентизация 7 Stitch-экранов (UI слой)

### Принципы
- HTML не переносим напрямую; переносим **layout/иерархию/UX намерение**.
- Всё “лишнее” (bottom nav, крестики, профили, внешние картинки) удаляем.
- Компоненты должны использовать существующие UI primitives из `components/ui/*`.

### Набор экранов (предлагаемый mapping)
- step0: Stress entry (аналог `001_Compact Stress Entry`, но без close/nav и на Menhausen UI)
- step1: Stop-frame (`002_Stop-frame`)
- step2: Breathing 4–6 (`003_Breathing 4–6`)
- step3: Grounding 5–4–3–2–1 (`004_Grounding 5–4–3–2–1`) — можно частично переиспользовать существующий экран [`components/mental-techniques/Grounding54321Screen.tsx`](../../components/mental-techniques/Grounding54321Screen.tsx) и привести к новому виду
- step4: Brain Dump (`005_Brain Dump`)
- step5: Post-cycle assessment (`006_Post-Cycle Assessment`)
- step6: Results summary / insight (`007_Results Summary`)
- step8: Stress after (финальный слайдер + completion)

Примечание: в Stitch “Results summary” содержит карточки “Before/After/Delta”, но фактические числа должны опираться на введённые stress_before/stress_after (или на будущие метрики, если появятся).

### Shared UI компоненты (минимальный набор)
- `FlowTopBar` (логотип + back)
- `FlowProgress` (X/7, optional)
- `FlowPrimaryButton`, `FlowSecondaryButton`
- `StressSlider` (0..10, подписанные крайние значения)

### i18n и текстовые ресурсы (не забыть)
Так как приложение локализовано, тексты flow (заголовки, подсказки, CTA, предупреждения resume) нужно вынести в i18n сообщения по существующему паттерну (см. `src/i18n/messages/*`).

## 6) UX детали (низкая когнитивная нагрузка)
- Один основной CTA на экран.
- Ясный прогресс “шаг X из 7”.
- Плавные переходы за счёт существующих анимаций `ScreenRouter` (не вводить новый роутер/transition слой).

### Exit / Cancel сценарии
Нужно явно определить:
- что происходит при выходе из flow без completion (draft остаётся, показываем resume)
- есть ли кнопка “выйти” (и где), или только системный back
- фиксируем ли `rapid_flow_dropped` (аналитика) и на каком шаге

## 7) Аналитика (минимально достаточная)
Через [`utils/analytics/posthog.ts`](../../utils/analytics/posthog.ts):
- `rapid_flow_started` (techniqueId, startedAt)
- `rapid_flow_step_completed` (step, techniqueId)
- `rapid_flow_completed` (stress_before, stress_after, durationMs)
- `rapid_flow_dropped` (step, reason)

Важно: не дублировать “screen_view” — он уже есть глобально в `initScreenViewTracking`.

## 8) Тест-план (smoke)
- Home → start flow → step0 ввод → step8 ввод → запись в history + bump sync.
- Resume modal: начать flow → уйти → вернуться → выбрать продолжить/сброс.
- Guards: невозможно перепрыгнуть на stepN напрямую без прохождения.
- Back/Next: корректная работа и отсутствие выхода из флоу в неожиданные места.
- Проверить, что существующие техники/экраны работают без изменений.

## 9) Риски и как снижать
- **Разнобой UI из Stitch** → обязательная нормализация и shared UI слой до массового переноса.
- **CDN зависимости в HTML** → переносим только структуру; ассеты оформляем по правилам проекта.
- **Sync интеграция** → аккуратно расширять `SyncDataType` и payload/merge, тестировать offline queue.

## Предлагаемый порядок реализации (итеративно, безопасно)
1. Design audit + mapping “что удалить/заменить”.
2. Новый route + skeleton `RapidTechniquesFlowScreen`.
3. Draft store + storage (без sync) + resume modal.
4. Stress step0/step8 UI + запись history на completion.
5. Sync: новый `SyncDataType` + bump + подписка + payload.
6. Перенос шагов 1..7 (по одному экрану за итерацию).
7. Аналитика + финальная полировка.

## 10) Чеклист “не сломать существующее”
- Не менять поведение `goBack()` в [`src/stores/navigation.store.ts`](../../src/stores/navigation.store.ts).
- Новый route не должен конфликтовать с существующими `/techniques/*`.
- Новые SyncDataType не должны ломать существующую очередь (обязательно smoke: offline → enqueue → retry → success).

