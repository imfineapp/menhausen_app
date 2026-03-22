/**
 * Stable import boundary for Supabase sync (tests can mock `@/src/persistence/supabaseAdapter`).
 */
export { getSyncService, deleteUserDataFromSupabase, clearJWTToken } from '@/utils/supabaseSync'
