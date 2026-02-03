# Быстрый старт: Тестирование платежа Telegram Stars

## Минимальные шаги для теста

### 1. Откройте приложение в Telegram

Откройте ваше Mini App через бота в Telegram (не в браузере!).

### 2. Перейдите на экран Premium

Найдите и откройте экран покупки Premium подписки.

### 3. Выберите план и нажмите "Купить"

- Выберите один из планов: Monthly, Annual, или Lifetime
- Нажмите кнопку покупки

### 4. Подтвердите платеж

- В открывшемся инвойсе Telegram Stars нажмите "Оплатить"
- Подтвердите платеж в Telegram

### 5. Проверьте результат

#### В приложении:
- ✅ Должно появиться сообщение об успешной покупке
- ✅ Статус Premium должен обновиться

#### В базе данных (Supabase Dashboard → SQL Editor):

```sql
-- Проверить подписку
SELECT * FROM premium_subscriptions 
WHERE telegram_user_id = <ваш_telegram_user_id>
ORDER BY created_at DESC LIMIT 1;

-- Проверить статус премиума
SELECT telegram_user_id, has_premium 
FROM users 
WHERE telegram_user_id = <ваш_telegram_user_id>;
```

## Что проверить

✅ **Подписка создана** в таблице `premium_subscriptions`  
✅ **Статус `active`**  
✅ **`bot_id` заполнен** правильно  
✅ **`is_test_payment`** установлен правильно (true для тестовых ботов)  
✅ **`has_premium`** обновлён (только для продакшен ботов)  

## Если что-то не работает

1. **Проверьте логи Edge Functions** в Supabase Dashboard
2. **Проверьте webhook** - должен быть настроен через `setWebhook`
3. **Проверьте секреты** - `TELEGRAM_WEBHOOK_SECRET` должен совпадать

Подробная инструкция: `docs/test-payment-flow.md`
