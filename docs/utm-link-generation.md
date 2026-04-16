# Telegram Mini App: передача UTM-параметров

## Проблема

При открытии Mini App через Direct Link с UTM-параметрами нужно отслеживать источник пользователя. Однако Telegram передаёт параметры специфичным образом.

## Решение

### Формат ссылки

Использовать **`?startapp=`** (не `?start=`):

```
https://t.me/mnhsn_staging_bot/app?startapp=eyJzIjoiZmFjZWJvb2siLCJ0IjoxNzc2MjcwOTkwLCJ2IjoxfQ
```

### Генерация UTM-параметров

1. Создать JSON с данными:
```json
{
  "s": "facebook",   // utm_source
  "t": 1776270990, // timestamp (unixtime)
  "v": 1          // version
}
```

2. Закодировать в base64url:
```javascript
// JavaScript
const data = JSON.stringify({ s: 'facebook', t: Math.floor(Date.now() / 1000), v: 1 })
const base64 = btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
```

3. Добавить к ссылке:
```
https://t.me/mnhsn_staging_bot/app?startapp=<base64>
```

### Полный список полей

| Поле | Описание | Пример |
|------|----------|--------|
| `s` | utm_source | `facebook`, `google`, `instagram` |
| `m` | utm_medium | `cpc`, `email`, `organic` |
| `c` | utm_campaign | `summer_sale`, `onboarding` |
| `r` | referrer (domain) | `facebook.com` |
| `t` | timestamp | `1776270990` |
| `v` | version (всегда 1) | `1` |

### Примеры ссылок

**Только source:**
```
https://t.me/mnhsn_staging_bot/app?startapp=eyJzIjoiZ29vZ2xlIiwidCI6MTc3NjI3MDk5MCwidjEiF0
```

**Полная атрибуция:**
```
https://t.me/mnhsn_staging_bot/app?startapp=eyJzIjoiZmFjZWJvb2siLCJtIjoiY3BjIiwiYyI6InN1bW1lcl9zYWxlIiwiciI6ImZhY2Vib29rLmNvbSIsInQiOjE3NzYyNzAwOTkwLCJ2IjoxfQ
```

## Где отслеживать

- **PostHog**: `utm_source`, `utm_medium`, `utm_campaign`, `utm_referrer` автоматически добавляются к:
  - Person properties (при identify)
  - Event properties (при каждом track)

- **Console**: При запуске приложения логируется:
```
[Attribution] Start param: <значение>
[Attribution] Decoded attribution: <данные>
[Attribution] Attribution data: <распарсенные данные>
```

## Ограничения

- **Только `?startapp=`**: Параметр `?start=` **НЕ работает** для Direct Links
- **Direct Links vs Attachment Menu**: Для attachment menu параметры передаются иначе
- **Base64url**: Использовать base64url encoding (заменить `+` на `-`, `/` на `_`)

## Тестирование

```bash
# Скопировать ссылку в буфер обмена
# Открыть в Telegram
# Проверить консоль браузера
```

## Длина

Максимум 512 символов для `startapp` параметра.