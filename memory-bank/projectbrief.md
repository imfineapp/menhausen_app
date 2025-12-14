# Memory Bank: Project Brief

## Project Name
Menhausen Telegram Mini App

## Project Overview
Menhausen is a Telegram mini app focused on mental health support, featuring a comprehensive onboarding process, personalized exercises, and daily check-ins. The application provides evidence-based psychological techniques through an intuitive, mobile-first interface with a complete centralized content management system.

## Core Technology Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **State Management**: React hooks with Context API
- **Content Management**: Centralized TypeScript-based system
- **Routing**: Component-based navigation system
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel/Netlify

## Architecture
- Mobile-first Telegram WebApp
- Component-based React architecture
- Centralized content management system
- Survey system with 5-screen onboarding
- Exercise card system with themes
- Local storage persistence with cloud sync (IN PROGRESS)
- Premium feature support

## Current Status
✅ Core application structure implemented
✅ Survey system (5 screens) completed
✅ Content management system active
✅ Component library (ShadCN) integrated
✅ Navigation system functional
🔄 **IN PROGRESS**: Telegram User API Sync with Supabase
  - Comprehensive architectural plan completed
  - Ready for CREATIVE phase for detailed design decisions
  - See: `memory-bank/creative/creative-telegram-sync-architecture.md`

## Cloud Sync Architecture (NEW)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Sync Strategy**: Incremental sync with debouncing
- **Authentication**: Telegram WebApp initData validation
- **Data Privacy**: Client-side encryption for sensitive data
- **Conflict Resolution**: Remote wins for preferences, smart merge for collections
- **Migration**: Auto-sync existing users on app load
