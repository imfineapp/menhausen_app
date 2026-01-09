# Telegram User API Sync - Implementation Tasks

## Task Overview
**Task**: Telegram Users API Sync with Supabase  
**Complexity**: Level 4 - Complex System  
**Status**: Phase 1-3 Complete → Phase 4 (Testing & Deployment) In Progress  
**Created**: 2025-01-XX  
**Current Phase**: Phase 4 - Testing & Deployment

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2) ✅ **COMPLETE**

#### 1.1 Supabase Setup ✅
- [x] Create Supabase project
- [x] Set up Supabase CLI
- [x] Configure environment variables
- [x] Set up database connection

#### 1.2 Database Schema Implementation ✅
- [x] Create users table
- [x] Create survey_results table
- [x] Create daily_checkins table
- [x] Create user_stats table
- [x] Create user_achievements table
- [x] Create user_points table
- [x] Create points_transactions table
- [x] Create user_preferences table
- [x] Create app_flow_progress table
- [x] Create psychological_test_results table
- [x] Create card_progress table
- [x] Create referral_data table
- [x] Create sync_metadata table
- [x] Create all indexes
- [x] Set up Row Level Security (RLS) policies
- [x] Test schema with sample data

#### 1.3 Telegram Authentication ✅
- [x] Create Telegram auth validation Edge Function
- [x] Implement initData parsing
- [x] Implement signature verification
- [x] Extract telegram_user_id
- [x] Handle expiration checks
- [x] Add error handling
- [x] Write unit tests for auth validation

#### 1.4 Basic Sync Endpoints ✅
- [x] Create sync-user-data Edge Function (POST)
- [x] Create get-user-data Edge Function (GET)
- [x] Implement basic request/response handling
- [x] Add Telegram auth validation to endpoints
- [x] Test endpoints with Postman/curl

#### 1.5 Client Sync Service Structure ✅
- [x] Create `utils/supabaseSync/` directory
- [x] Create `supabaseSyncService.ts` skeleton
- [x] Create `dataTransformers.ts` skeleton
- [x] Create `conflictResolver.ts` skeleton
- [x] Create `encryption.ts` skeleton
- [x] Create `types.ts` with TypeScript interfaces
- [x] Set up Supabase client configuration

#### 1.6 Basic Data Transformers ✅
- [x] Implement transform for survey-results
- [x] Implement transform for checkin-data
- [x] Implement transform for user_stats
- [x] Write unit tests for transformers

**Phase 1 Success Criteria**: ✅ **ALL MET**
- ✅ Database schema deployed and tested
- ✅ Telegram auth validation working
- ✅ Basic sync endpoints functional
- ✅ Client sync service structure in place
- ✅ Unit tests passing

**QA Validation**: See `memory-bank/qa-phase1-results.md`

---

### Phase 2: Core Sync (Weeks 3-4) ✅ **COMPLETE**

#### 2.1 Complete Data Transformers ✅
- [x] Transform for achievements
- [x] Transform for points (balance + transactions)
- [x] Transform for preferences
- [x] Transform for flow-progress
- [x] Transform for psychological-test-results
- [x] Transform for card-progress (with answer removal)
- [x] Transform for referral-data
- [x] Transform for language preference
- [x] Handle all edge cases
- [x] Write comprehensive unit tests

#### 2.2 Card Answer Removal Logic ✅
- [x] Implement function to remove question1/question2 from card progress
- [x] Handle nested completedAttempts arrays
- [x] Preserve all other card progress data
- [x] Write unit tests for answer removal
- [x] Test with various card progress structures

#### 2.3 Conflict Resolution Implementation ✅
- [x] Implement remote wins strategy for preferences
- [x] Implement smart merge for check-ins (by date_key)
- [x] Implement smart merge for transactions (by transaction_id)
- [x] Implement merge for achievements (by achievementId)
- [x] Implement merge for arrays (readArticleIds, etc.)
- [x] Handle all edge cases
- [x] Write comprehensive unit tests

#### 2.4 Full Sync Implementation (GET) ✅
- [x] Implement fetch all user data from Supabase
- [x] Transform API format to localStorage format
- [x] Merge with existing local data using conflict resolver
- [x] Update localStorage with merged data
- [x] Handle missing data gracefully
- [x] Write integration tests

#### 2.5 Full Sync Implementation (POST) ✅
- [x] Transform all localStorage data to API format
- [x] Send to sync-user-data endpoint
- [x] Handle server-side conflict resolution
- [x] Update sync_metadata table
- [x] Handle errors and retries
- [x] Write integration tests

#### 2.6 Initial Sync on App Load ✅
- [x] Detect if user has existing localStorage data
- [x] Check if user exists in Supabase
- [x] If new user: upload all data
- [x] If existing user: fetch and merge
- [x] Update sync_metadata after initial sync
- [x] Handle migration errors gracefully
- [x] Write E2E tests

#### 2.7 Sync Status Tracking ✅
- [x] Implement sync status state management
- [x] Track last sync time
- [x] Track pending syncs
- [x] Track sync errors
- [x] Create sync status UI indicator (optional)
- [x] Write unit tests

**Phase 2 Success Criteria**: ✅ **ALL MET**
- ✅ All data types transformable
- ✅ Card answers excluded correctly
- ✅ Conflict resolution working for all cases
- ✅ Full sync functional (GET and POST)
- ✅ Initial sync works for new and existing users
- ✅ Sync status tracking implemented

**QA Validation**: See `memory-bank/qa-phase2-results.md` and `memory-bank/build-phase2-summary.md`

---

### Phase 3: Real-time Sync (Weeks 5-6) ✅ **COMPLETE**

#### 3.1 LocalStorage Interceptor ✅
- [x] Create localStorage wrapper/interceptor
- [x] Intercept localStorage.setItem calls
- [x] Detect which keys changed
- [x] Queue sync operations
- [x] Handle localStorage.getItem/removeItem
- [x] Ensure backward compatibility
- [x] Write unit tests

#### 3.2 Debouncing Implementation ✅
- [x] Implement debounce function (100-200ms)
- [x] Apply debouncing to rapid localStorage changes
- [x] Batch multiple changes when possible
- [x] Handle debounce cancellation
- [x] Test with rapid changes
- [x] Write unit tests

#### 3.3 Incremental Sync (PATCH) ✅
- [x] Create sync-data-type Edge Function (PATCH)
- [x] Implement incremental sync in sync service
- [x] Track which data types changed
- [x] Send only changed data
- [x] Update sync_metadata for changed types
- [x] Handle incremental sync errors
- [x] Write integration tests

#### 3.4 Encryption Layer Integration ⚠️ **DEFERRED** (Optional Enhancement)
- [ ] Identify sensitive data types
- [ ] Integrate with CriticalDataManager encryption
- [ ] Encrypt before sending to API
- [ ] Decrypt after receiving from API
- [ ] Handle encryption errors
- [ ] Test encryption/decryption flow
- [ ] Write unit tests
- **Note**: Encryption is optional enhancement, not blocking Phase 4

#### 3.5 Offline Queue ✅
- [x] Create offline queue storage
- [x] Queue failed sync operations
- [x] Persist queue to localStorage
- [x] Detect when online
- [x] Retry queued operations when online
- [x] Handle queue overflow
- [x] Write unit tests

#### 3.6 Retry Logic ✅
- [x] Implement exponential backoff
- [x] Retry failed sync operations
- [x] Limit retry attempts
- [x] Handle permanent failures
- [x] Log retry attempts
- [x] Write unit tests

#### 3.7 Real-time Sync Integration ✅
- [x] Connect localStorage interceptor to sync service
- [x] Apply debouncing
- [x] Trigger incremental sync
- [x] Handle errors gracefully
- [x] Ensure no UI blocking
- [x] Test end-to-end flow
- [x] Write E2E tests

**Phase 3 Success Criteria**: ✅ **ALL MET** (Core functionality)
- ✅ Real-time sync on localStorage changes
- ✅ Debouncing working (150ms)
- ✅ Incremental sync functional
- ⚠️ Encryption for sensitive data (deferred - optional)
- ✅ Offline queue with retry
- ✅ No UI blocking during sync
- ✅ Sync completes within 2 seconds

**QA Validation**: See `memory-bank/qa-phase3-final.md` and `memory-bank/build-phase3-summary.md`

---

### Phase 4: Testing & Deployment (Week 7) ⏭️ **CURRENT PHASE**

#### 4.1 Comprehensive Testing ⏭️ **IN PROGRESS**
- [ ] Unit tests for all transformers (>90% coverage)
- [ ] Unit tests for conflict resolvers
- [ ] Unit tests for encryption layer
- [ ] Integration tests for sync flows
- [ ] E2E tests for multi-device sync
- [ ] E2E tests for migration
- [ ] Performance tests
- [ ] Load tests

#### 4.2 Security Audit
- [ ] Review Telegram auth validation
- [ ] Review encryption implementation
- [ ] Review API endpoint security
- [ ] Review data transmission security
- [ ] Test for injection vulnerabilities
- [ ] Review RLS policies
- [ ] Security penetration testing (optional)

#### 4.3 Performance Optimization
- [ ] Profile sync operations
- [ ] Optimize database queries
- [ ] Optimize data transformations
- [ ] Minimize payload sizes
- [ ] Test sync latency (target <2s)
- [ ] Test with large datasets
- [ ] Optimize Supabase usage

#### 4.4 Migration Testing
- [ ] Test migration for new users
- [ ] Test migration for existing users with data
- [ ] Test migration with various data sizes
- [ ] Test migration error handling
- [ ] Test rollback scenarios
- [ ] Test with real user data (sanitized)

#### 4.5 Documentation
- [ ] API documentation
- [ ] Architecture documentation
- [ ] Developer guide
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] User-facing documentation (if needed)

#### 4.6 Production Deployment
- [ ] Set up production Supabase project
- [ ] Deploy database schema to production
- [ ] Deploy Edge Functions to production
- [ ] Configure production environment variables
- [ ] Set up monitoring and alerts
- [ ] Deploy client code with sync enabled
- [ ] Monitor initial sync operations
- [ ] Handle any production issues

**Phase 4 Success Criteria**:
- ✅ Test coverage >80%
- ✅ All security checks passed
- ✅ Performance targets met (<2s sync)
- ✅ Migration tested and working
- ✅ Documentation complete
- ✅ Production deployment successful
- ✅ Zero data loss incidents

---

## Key Implementation Files

### Frontend Files to Create/Modify

**New Files**:
- `utils/supabaseSync/supabaseSyncService.ts`
- `utils/supabaseSync/dataTransformers.ts`
- `utils/supabaseSync/conflictResolver.ts`
- `utils/supabaseSync/encryption.ts`
- `utils/supabaseSync/types.ts`
- `utils/telegramAuth/telegramAuthService.ts`
- `supabase/functions/sync-user-data/index.ts`
- `supabase/functions/get-user-data/index.ts`
- `supabase/functions/sync-data-type/index.ts`
- `supabase/migrations/001_initial_schema.sql`

**Files to Modify**:
- `App.tsx` - Add initial sync on mount
- `utils/useEnhancedStorage.ts` - Integrate sync service
- `package.json` - Add Supabase dependencies

### Backend Files (Supabase)

**Edge Functions**:
- `supabase/functions/sync-user-data/index.ts`
- `supabase/functions/get-user-data/index.ts`
- `supabase/functions/sync-data-type/index.ts`
- `supabase/functions/_shared/telegram-auth.ts`

**Migrations**:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_add_indexes.sql`
- `supabase/migrations/003_add_rls_policies.sql`

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x"
  },
  "devDependencies": {
    "@supabase/cli": "^1.x.x"
  }
}
```

---

## Testing Checklist

### Unit Tests
- [ ] Data transformers (all data types)
- [ ] Conflict resolvers (all merge strategies)
- [ ] Encryption/decryption
- [ ] Telegram auth utilities
- [ ] Card answer removal

### Integration Tests
- [ ] Full sync flow (GET)
- [ ] Full sync flow (POST)
- [ ] Incremental sync flow
- [ ] Conflict resolution scenarios
- [ ] Offline queue behavior

### E2E Tests
- [ ] Multi-device sync
- [ ] Migration from localStorage-only
- [ ] Error handling and recovery
- [ ] Performance under load

---

## Risk Mitigation Checklist

- [ ] localStorage remains source of truth locally
- [ ] Backup before overwriting in conflict resolution
- [ ] Fallback to local-only mode if auth fails
- [ ] Debouncing to reduce API calls
- [ ] Incremental sync to minimize data transfer
- [ ] Comprehensive unit tests for merge logic
- [ ] Usage monitoring for Supabase costs
- [ ] Error logging and alerting

---

## Success Metrics

- **Sync Success Rate**: >99%
- **Sync Latency**: <2s for incremental, <5s for full
- **Test Coverage**: >80%
- **Zero Data Loss**: 100% data integrity
- **Performance**: No UI blocking
- **Cost**: Within Supabase budget

---

**Last Updated**: 2025-01-25  
**Status**: ✅ Phases 1-3 Complete - Phase 4 (Testing & Deployment) In Progress  
**Next Steps**: 
1. Comprehensive Testing (Unit, Integration, E2E)
2. Security Audit
3. Performance Optimization
4. Migration Testing
5. Documentation
6. Production Deployment

---

# Supabase Auth Integration - Implementation Tasks

## Task Overview
**Task**: Supabase Auth Integration with JWT Tokens  
**Complexity**: Level 4 - Complex System  
**Status**: Planning → Ready for Implementation  
**Created**: 2026-01-09  
**Current Phase**: Phase 1 - Database Schema Updates  
**Related Plan**: `memory-bank/supabase-auth-integration-plan.md`

---

## Implementation Phases

### Phase 1: Database Schema Updates ⏭️ **NEXT PHASE**

#### 1.1 Create Auth Users Link Table
- [ ] Create migration file `supabase/migrations/[timestamp]_link_auth_users.sql`
- [ ] Create `auth_user_mapping` table
- [ ] Add foreign key to `auth.users(id)`
- [ ] Add foreign key to `users(telegram_user_id)`
- [ ] Create index on `telegram_user_id`
- [ ] Test migration locally

#### 1.2 Enable RLS on All Tables
- [ ] Create migration file `supabase/migrations/[timestamp]_enable_rls.sql`
- [ ] Create helper function `get_telegram_user_id_from_jwt()`
- [ ] Enable RLS on `users` table
- [ ] Enable RLS on `survey_results` table
- [ ] Enable RLS on `daily_checkins` table
- [ ] Enable RLS on `user_stats` table
- [ ] Enable RLS on `user_achievements` table
- [ ] Enable RLS on `user_points` table
- [ ] Enable RLS on `points_transactions` table
- [ ] Enable RLS on `user_preferences` table
- [ ] Enable RLS on `app_flow_progress` table
- [ ] Enable RLS on `psychological_test_results` table
- [ ] Enable RLS on `card_progress` table
- [ ] Enable RLS on `referral_data` table
- [ ] Enable RLS on `sync_metadata` table
- [ ] Create SELECT policies for all tables
- [ ] Create INSERT policies for all tables
- [ ] Create UPDATE policies for all tables
- [ ] Create DELETE policies for all tables
- [ ] Test RLS policies locally

**Phase 1 Success Criteria**:
- ✅ `auth_user_mapping` table created and tested
- ✅ RLS enabled on all tables
- ✅ Helper function working correctly
- ✅ All RLS policies created and tested
- ✅ No breaking changes to existing functionality

---

### Phase 2: Auth Edge Function ⏭️ **PENDING**

#### 2.1 Create Auth Function
- [ ] Create `supabase/functions/auth-telegram/` directory
- [ ] Create `supabase/functions/auth-telegram/index.ts`
- [ ] Implement Telegram initData validation
- [ ] Implement check for existing Supabase Auth user
- [ ] Implement user creation using `supabase.auth.admin.createUser()`
- [ ] Store `telegram_user_id` in `user_metadata`
- [ ] Implement JWT token generation with custom claims
- [ ] Link auth user to `telegram_user_id` in `auth_user_mapping`
- [ ] Add error handling
- [ ] Add CORS headers
- [ ] Write unit tests
- [ ] Test locally with Supabase CLI

**Phase 2 Success Criteria**:
- ✅ Auth function validates Telegram initData
- ✅ Creates Supabase Auth users correctly
- ✅ Generates JWT tokens with `telegram_user_id` claim
- ✅ Links users in `auth_user_mapping` table
- ✅ Returns JWT token to client
- ✅ Error handling works correctly

---

### Phase 3: Update Existing Edge Functions ⏭️ **PENDING**

#### 3.1 Update get-user-data Function
- [ ] Update `supabase/functions/get-user-data/index.ts`
- [ ] Accept JWT token in `Authorization` header
- [ ] Validate JWT token using Supabase client
- [ ] Extract `telegram_user_id` from JWT claims
- [ ] Replace Service Role Key with Anon Key + JWT token
- [ ] Remove direct Telegram validation (keep for backward compatibility initially)
- [ ] Add backward compatibility for Telegram initData header
- [ ] Test with JWT token
- [ ] Test backward compatibility

#### 3.2 Update sync-user-data Function
- [ ] Update `supabase/functions/sync-user-data/index.ts`
- [ ] Accept JWT token in `Authorization` header
- [ ] Validate JWT token
- [ ] Extract `telegram_user_id` from JWT claims
- [ ] Replace Service Role Key with Anon Key + JWT token
- [ ] Remove direct Telegram validation (keep for backward compatibility initially)
- [ ] Add backward compatibility for Telegram initData header
- [ ] Test with JWT token
- [ ] Test backward compatibility

**Phase 3 Success Criteria**:
- ✅ Both Edge Functions accept JWT tokens
- ✅ JWT tokens validated correctly
- ✅ `telegram_user_id` extracted from claims
- ✅ Anon Key + JWT token used instead of Service Role Key
- ✅ Backward compatibility maintained
- ✅ All existing functionality works

---

### Phase 4: Client-Side Updates ⏭️ **PENDING**

#### 4.1 Create Auth Service
- [ ] Create `utils/supabaseSync/authService.ts`
- [ ] Implement `authenticateWithTelegram()` function
- [ ] Implement `getJWTToken()` function
- [ ] Implement `refreshJWTToken()` function
- [ ] Implement `storeJWTToken()` function
- [ ] Implement `retrieveJWTToken()` function
- [ ] Implement `isJWTTokenExpired()` function
- [ ] Implement `clearJWTToken()` function
- [ ] Add error handling
- [ ] Write unit tests

#### 4.2 Update Supabase Client Initialization
- [ ] Update `utils/supabaseSync/supabaseSyncService.ts`
- [ ] Modify `initializeSupabase()` to accept JWT token
- [ ] Use `accessToken` option when creating client
- [ ] Add `refreshJWTTokenBeforeCall()` method
- [ ] Implement token expiration check
- [ ] Implement automatic token refresh
- [ ] Handle token refresh errors
- [ ] Update constructor to initialize auth

#### 4.3 Update API Calls
- [ ] Update `fetchFromSupabase()` to include JWT token
- [ ] Update `syncToSupabase()` to include JWT token
- [ ] Update `fastSyncCriticalData()` to use JWT token
- [ ] Add token refresh before each API call
- [ ] Handle token refresh failures
- [ ] Update all direct REST API calls
- [ ] Test all API calls with JWT tokens

**Phase 4 Success Criteria**:
- ✅ Auth service created and tested
- ✅ JWT tokens stored and retrieved correctly
- ✅ Token refresh works automatically
- ✅ Supabase client initialized with JWT tokens
- ✅ All API calls include JWT tokens
- ✅ Token expiration handled gracefully

---

### Phase 5: Migration Strategy ⏭️ **PENDING**

#### 5.1 Data Migration Script
- [ ] Create `supabase/migrations/[timestamp]_migrate_existing_users.sql`
- [ ] Query all existing users from `users` table
- [ ] For each user, create Supabase Auth user
- [ ] Store `telegram_user_id` in `user_metadata`
- [ ] Populate `auth_user_mapping` table
- [ ] Generate JWT tokens for existing users
- [ ] Test migration script on local database
- [ ] Test migration with sample data
- [ ] Document migration process

#### 5.2 Backward Compatibility
- [ ] Keep Telegram validation in Edge Functions
- [ ] Support both JWT token and Telegram initData headers
- [ ] Add feature flag for auth method selection
- [ ] Test both auth methods
- [ ] Document deprecation timeline
- [ ] Plan removal of old auth method

**Phase 5 Success Criteria**:
- ✅ Migration script works correctly
- ✅ All existing users migrated
- ✅ JWT tokens generated for existing users
- ✅ Backward compatibility maintained
- ✅ Feature flag works correctly
- ✅ Migration documented

---

### Phase 6: Testing & Deployment ⏭️ **PENDING**

#### 6.1 Comprehensive Testing
- [ ] Unit tests for JWT token generation
- [ ] Unit tests for JWT token validation
- [ ] Unit tests for auth service
- [ ] Integration tests for auth flow
- [ ] Integration tests for RLS policies
- [ ] E2E tests for full auth flow
- [ ] E2E tests for token refresh
- [ ] E2E tests for data access with RLS
- [ ] Test existing user migration
- [ ] Test backward compatibility
- [ ] Performance tests
- [ ] Security tests

#### 6.2 Security Audit
- [ ] Review JWT token generation
- [ ] Review JWT token validation
- [ ] Review RLS policies
- [ ] Review Service Role Key usage
- [ ] Test for token tampering
- [ ] Test for unauthorized access
- [ ] Review token storage security

#### 6.3 Production Deployment
- [ ] Deploy database migrations to production
- [ ] Deploy auth function to production
- [ ] Deploy updated Edge Functions to production
- [ ] Configure production environment variables
- [ ] Run migration script on production
- [ ] Enable RLS policies in production
- [ ] Monitor initial auth operations
- [ ] Monitor RLS policy enforcement
- [ ] Handle any production issues

**Phase 6 Success Criteria**:
- ✅ Test coverage >80%
- ✅ All security checks passed
- ✅ RLS policies working correctly
- ✅ Migration completed successfully
- ✅ Production deployment successful
- ✅ No breaking changes for users
- ✅ Performance maintained

---

## Key Implementation Files

### New Files
- `supabase/migrations/[timestamp]_link_auth_users.sql` - Auth user mapping table
- `supabase/migrations/[timestamp]_enable_rls.sql` - RLS policies
- `supabase/migrations/[timestamp]_migrate_existing_users.sql` - Data migration
- `supabase/functions/auth-telegram/index.ts` - Auth function
- `utils/supabaseSync/authService.ts` - Client auth service

### Modified Files
- `supabase/functions/get-user-data/index.ts` - Use JWT tokens
- `supabase/functions/sync-user-data/index.ts` - Use JWT tokens
- `utils/supabaseSync/supabaseSyncService.ts` - JWT token handling
- `supabase/functions/_shared/telegram-auth.ts` - Keep for validation, add JWT generation

---

## Environment Variables

### Edge Functions (New)
- `SUPABASE_JWT_SECRET` - JWT secret for signing custom tokens

### Edge Functions (Existing)
- `SUPABASE_URL` - Already exists
- `SUPABASE_SERVICE_ROLE_KEY` - Already exists (only for auth function)
- `TELEGRAM_BOT_TOKEN` - Already exists

### Client (No Changes)
- `VITE_SUPABASE_URL` - Already exists
- `VITE_SUPABASE_ANON_KEY` - Already exists

---

## Success Metrics

- **Auth Success Rate**: >99%
- **JWT Token Generation**: <500ms
- **RLS Policy Enforcement**: 100% data isolation
- **Migration Success**: 100% of existing users migrated
- **Backward Compatibility**: Both auth methods work during transition
- **Performance**: No degradation in API response times
- **Security**: Service Role Key only used in auth function

---

**Last Updated**: 2026-01-09  
**Status**: ⏭️ Phase 1 (Database Schema Updates) - Ready to Start  
**Next Steps**: 
1. Create `auth_user_mapping` table migration
2. Create RLS policies migration
3. Test migrations locally
4. Deploy to local Supabase instance
