# Multi-Bot Configuration Guide

**Project**: Menhausen Telegram Mini App  
**Date**: 2026-01-30  
**Status**: ✅ Implemented

---

## 📋 Overview

The application now supports multiple Telegram bots for authentication and operations. This allows staging and production environments to use different bots while sharing the same backend infrastructure.

---

## 🔧 Configuration

### Environment Variables

The system supports multiple bot tokens through environment variables. Configure them in your Supabase Edge Functions secrets:

#### Required (Primary Bot)
- `TELEGRAM_BOT_TOKEN` - Primary bot token (required for backward compatibility)

#### Optional (Additional Bots)
- `TELEGRAM_BOT_TOKEN_STAGING` - Staging bot token
- `TELEGRAM_BOT_TOKEN_PRODUCTION` - Production bot token
- `TELEGRAM_BOT_TOKEN_2` - Additional bot token (if needed)
- `TELEGRAM_BOT_TOKEN_3` - Additional bot token (if needed)
- ... and so on

### How It Works

1. **Token Collection**: The system collects all configured bot tokens from environment variables
2. **Validation Attempt**: When validating Telegram `initData`, the system tries each token sequentially
3. **Success on Match**: Validation succeeds as soon as one token matches the signature
4. **Error Handling**: If all tokens fail, validation fails with an appropriate error

---

## 🚀 Setup Instructions

### For Supabase Edge Functions

Set secrets using Supabase CLI:

```bash
# Set primary bot token (required)
supabase secrets set TELEGRAM_BOT_TOKEN=your_primary_bot_token

# Set staging bot token (optional)
supabase secrets set TELEGRAM_BOT_TOKEN_STAGING=your_staging_bot_token

# Set production bot token (optional)
supabase secrets set TELEGRAM_BOT_TOKEN_PRODUCTION=your_production_bot_token

# Set additional bot tokens if needed
supabase secrets set TELEGRAM_BOT_TOKEN_2=your_additional_bot_token
```

### For Local Development

Add to your `.env.local` file (for local Supabase functions):

```bash
# Primary bot token
TELEGRAM_BOT_TOKEN=your_primary_bot_token

# Staging bot token (optional)
TELEGRAM_BOT_TOKEN_STAGING=your_staging_bot_token

# Production bot token (optional)
TELEGRAM_BOT_TOKEN_PRODUCTION=your_production_bot_token
```

**Note**: Local development environment variables are different from client-side variables. Edge Functions use `TELEGRAM_BOT_TOKEN` (without `VITE_` prefix).

---

## 📝 Implementation Details

### Functions Updated

The following Edge Functions now support multiple bot tokens:

1. **`auth-telegram`** - Telegram authentication endpoint
2. **`sync-user-data`** - User data synchronization endpoint
3. **`get-user-data`** - User data retrieval endpoint

### Code Changes

#### New Functions in `telegram-auth.ts`

- `getTelegramBotTokens()` - Returns array of all configured bot tokens
- `validateTelegramAuthWithMultipleTokens()` - Validates initData against multiple tokens

#### Backward Compatibility

- `getTelegramBotToken()` - Still available for backward compatibility (returns primary token only)
- `validateTelegramAuth()` - Still available for single-token validation

---

## 🔍 Validation Flow

```
initData received
    ↓
Collect all bot tokens from environment
    ↓
For each token:
    ├─ Try validation
    ├─ If valid → Return success ✅
    └─ If invalid signature → Try next token
    ↓
If all tokens fail → Return error ❌
```

---

## 🧪 Testing

### Test with Multiple Bots

1. Configure multiple bot tokens in environment
2. Send `initData` from staging bot
3. System should validate successfully with staging token
4. Send `initData` from production bot
5. System should validate successfully with production token

### Verify Configuration

Check logs in Edge Functions to see which tokens are configured:

```
[TelegramAuth] Found 2 bot token(s) configured
[TelegramAuth] Trying bot token 1/2
[TelegramAuth] Validation succeeded with bot token 1
```

---

## ⚠️ Important Notes

1. **At least one token required**: `TELEGRAM_BOT_TOKEN` must be set (for backward compatibility)
2. **Token order**: Tokens are tried in order: primary → staging → production → additional
3. **Performance**: Validation stops as soon as one token succeeds (no performance impact)
4. **Security**: All tokens must be kept secure and never exposed in client-side code
5. **Error messages**: If validation fails, error message indicates that none of the tokens matched

---

## 🔐 Security Considerations

- **Never commit tokens**: Bot tokens should never be committed to version control
- **Use secrets**: Always use Supabase secrets for production tokens
- **Rotate tokens**: Regularly rotate bot tokens for security
- **Monitor logs**: Check Edge Function logs for authentication failures

---

## 📚 Related Documentation

- `memory-bank/supabase-local-config.md` - Local development configuration
- `memory-bank/supabase-auth-integration-plan.md` - Authentication integration details

---

**Last Updated**: 2026-01-30  
**Status**: ✅ Production Ready
