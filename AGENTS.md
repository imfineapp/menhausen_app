# AGENTS.md - Menhausen Telegram Mini App

## Quick Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production (tsc && vite build)
npm run lint         # ESLint
npm run lint:css     # Stylelint
npm run lint:all     # Both linting
npm run type-check  # TypeScript
npm run test:run     # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run test:all     # Both test suites
```

## Pre-Merge Checklist

Run in order: `npm run lint:all && npm run type-check && npm run test:all`

## Architecture Summary

- **Entry**: `main.tsx` → `App.tsx` → `AppContent.tsx`
- **Routing**: `src/ScreenRouter.tsx` + `src/screen-routes/*.routes.tsx`
- **State**: Nanostores (`src/stores/*.store.ts`)
- **Business Logic**: Pure functions in `src/domain/*.domain.ts`
- **Orchestration**: Action modules in `src/stores/actions/*.actions.ts`
- **Content**: JSON files in `data/content/{ru,en}/`

## Key Conventions

1. **State**: Use Nanostores, not React Context for global state
2. **Domain**: Pure logic only, no store imports
3. **Localization**: Use `getText(ru, en)` or `getLocalizedText(obj)`, never pass raw `{ru, en}` to JSX
4. **Colors**: Use design tokens from `styles/globals.css`, avoid hardcoded hex
5. **Touch targets**: Minimum 44x44px

## Known Quirks

- **PostHog**: Disabled by default. Set `VITE_POSTHOG_ENABLE=true` in `.env` to enable
- **Check-in reset**: Daily reset at 6 AM local time
- **Multi-bot**: Supports multiple Telegram bots, don't assume single-token
- **Local-first**: Primary storage is localStorage; Supabase sync is optional
- **Content types**: Defined in `types/content.ts`, must match JSON structure

## File Organization

| Layer | Location |
|---|---|
| Screens/Components | `components/` |
| UI Primitives | `components/ui/` |
| Global State | `src/stores/` |
| Side Effects | `src/stores/actions/` |
| Pure Logic | `src/domain/` |
| Backend | `supabase/functions/` |
| DB Migrations | `supabase/migrations/` |
| Unit Tests | `tests/unit/` |
| E2E Tests | `tests/e2e/` |

## Adding a New Screen

1. Add type to `types/userState.ts` (`AppScreen` union)
2. Create component in `components/`
3. Register in `src/screen-routes/*.routes.tsx`
4. Add navigation handlers in `src/stores/actions/`
5. Add screen params to `$screenParams` if needed

## Anti-Patterns

- Don't import stores inside `src/domain/*`
- Don't create new React Context for global state
- Don't hardcode colors outside design tokens
- Don't skip type-checking with `any`

## Reference

Full architecture details in `DEVELOPMENT_with_ai.md`.