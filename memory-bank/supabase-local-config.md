# Local Supabase Configuration - Quick Reference

**Project**: Menhausen Telegram Mini App  
**Date**: 2025-12-14  
**Status**: ✅ Local Supabase Running

---

## 🚀 Local Supabase Instance

### Instance Details
- **Project ID**: `menhausen_app`
- **Status**: ✅ Running
- **Supabase CLI Version**: v2.65.5

### Service URLs

**API Services**:
- **Project URL**: http://127.0.0.1:54321
- **REST API**: http://127.0.0.1:54321/rest/v1
- **GraphQL API**: http://127.0.0.1:54321/graphql/v1
- **Edge Functions**: http://127.0.0.1:54321/functions/v1

**Development Tools**:
- **Supabase Studio**: http://127.0.0.1:54323
- **Mailpit (Email Testing)**: http://127.0.0.1:54324
- **MCP**: http://127.0.0.1:54321/mcp

**Database**:
- **Connection String**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **Port**: 54322
- **Version**: PostgreSQL 17

### Authentication Keys

**Local Development Keys**:
- **Publishable Key**: `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`
- **Secret Key**: `**************************`

⚠️ **Note**: These are local development keys only. Production keys will be different.

---

## 🔧 Configuration

### Config File
- **Location**: `supabase/config.toml`
- **Status**: ✅ Configured

### Key Settings
- **API Port**: 54321
- **Database Port**: 54322
- **Studio Port**: 54323
- **Max Rows**: 1000
- **Schema**: public, graphql_public

---

## 📝 Environment Variables for Local Development

Add these to `.env.local` for local development:

```bash
# Local Supabase Configuration
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
VITE_SUPABASE_SERVICE_KEY=**************************

# Telegram Bot Configuration (for auth validation)
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
```

**Note**: `.env.local` should be in `.gitignore` and not committed to version control.

---

## 🛠️ Development Workflow

### Starting Local Supabase

```bash
# Start local Supabase instance
supabase start

# Check status
supabase status

# Stop local instance
supabase stop
```

### Working with Migrations

```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db reset

# Check migration status
supabase migration list
```

### Working with Edge Functions

```bash
# Create new Edge Function
supabase functions new function_name

# Serve functions locally
supabase functions serve

# Deploy function
supabase functions deploy function_name
```

---

## 🗄️ Database Schema

### Schema Location
- **Migrations**: `supabase/migrations/`
- **Seeds**: `supabase/seed.sql`

### Current Status
- Schema not yet created (will be created in BUILD Phase 1)
- Ready for migration deployment

---

## 📊 Monitoring & Debugging

### Supabase Studio
- **URL**: http://127.0.0.1:54323
- **Features**:
  - Table Editor
  - SQL Editor
  - API Documentation
  - Database Schema Visualization

### Logs

```bash
# View API logs
supabase logs api

# View database logs
supabase logs db

# View all logs
supabase logs
```

---

## 🔐 Security Notes

1. **Local Keys**: The provided keys are for local development only
2. **Never Commit**: Never commit `.env.local` or production keys
3. **Bot Token**: Store Telegram bot token securely
4. **Production**: Use production Supabase project for production deployment

---

## ✅ Next Steps (BUILD Phase 1)

1. Add `@supabase/supabase-js` to package.json
2. Configure `.env.local` with local Supabase URLs
3. Create database schema migrations
4. Deploy migrations to local instance
5. Create Edge Functions structure
6. Test locally before production deployment

---

**Last Updated**: 2025-12-14

