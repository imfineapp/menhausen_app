# Применение миграции в продакшене

## Команда для применения миграции

### Вариант 1: Через `supabase db push` (рекомендуется)

```bash
# Убедитесь, что проект связан с продакшеном
supabase link --project-ref <your-project-ref>

# Применить все неприменённые миграции
supabase db push
```

### Вариант 2: Через Supabase Dashboard

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Выберите ваш проект
3. Перейдите в **Database** → **Migrations**
4. Найдите миграцию `20260130120000_premium_subscriptions.sql`
5. Нажмите **Apply migration**

### Вариант 3: Через SQL Editor в Dashboard

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Скопируйте содержимое файла `supabase/migrations/20260130120000_premium_subscriptions.sql`
5. Вставьте в SQL Editor и выполните

## Проверка статуса миграций

```bash
# Проверить, какие миграции применены
supabase migration list

# Проверить статус проекта
supabase status
```

## Проверка после применения

После применения миграции проверьте:

1. **Таблица создана:**
   ```sql
   SELECT * FROM premium_subscriptions LIMIT 1;
   ```

2. **Поле has_premium добавлено в users:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users' AND column_name = 'has_premium';
   ```

3. **Триггеры созданы:**
   ```sql
   SELECT trigger_name, event_manipulation, event_object_table
   FROM information_schema.triggers
   WHERE event_object_table = 'premium_subscriptions';
   ```

4. **Индексы созданы:**
   ```sql
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE tablename = 'premium_subscriptions';
   ```

## Troubleshooting

### Ошибка "relation already exists"
Если таблица уже существует, проверьте:
```sql
SELECT * FROM premium_subscriptions LIMIT 1;
```

Если таблица существует, но структура отличается, возможно нужно:
1. Проверить текущую структуру таблицы
2. Создать новую миграцию для изменений
3. Или вручную применить недостающие изменения

### Ошибка "permission denied"
Убедитесь, что:
- Вы используете правильный проект (production)
- У вас есть права на изменение схемы БД
- Используете правильный access token для Supabase CLI

### Проверка прав доступа

```bash
# Проверить текущий проект
supabase projects list

# Проверить статус связи
supabase status
```

## Безопасность

⚠️ **Важно:** Перед применением миграции в продакшене:

1. ✅ Создайте резервную копию БД
2. ✅ Протестируйте миграцию на staging окружении
3. ✅ Проверьте, что миграция не нарушит существующие данные
4. ✅ Примените миграцию в период низкой нагрузки (если возможно)

## Откат миграции (если нужно)

Если нужно откатить миграцию:

```sql
-- Удалить триггеры
DROP TRIGGER IF EXISTS update_user_premium_status_trigger ON premium_subscriptions;
DROP TRIGGER IF EXISTS update_premium_subscriptions_updated_at ON premium_subscriptions;

-- Удалить функции
DROP FUNCTION IF EXISTS update_user_premium_status();
DROP FUNCTION IF EXISTS update_premium_subscriptions_updated_at();

-- Удалить таблицу (ОСТОРОЖНО: удалит все данные!)
-- DROP TABLE IF EXISTS premium_subscriptions CASCADE;

-- Удалить поле has_premium из users (если нужно)
-- ALTER TABLE users DROP COLUMN IF EXISTS has_premium;
```
