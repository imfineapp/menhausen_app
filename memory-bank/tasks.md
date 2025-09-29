# Memory Bank: Tasks

## Current Task
🎯 **PLAN MODE ACTIVE** - UserInfoBlock Telegram User ID Display Implementation

Status: Planning phase in progress

## Task Analysis & Requirements

### Description
Implement dynamic user ID display in UserInfoBlock component. Replace hardcoded placeholder "#1275" with actual Telegram user ID when running in Telegram WebApp, or display "#MNHSNDEV" when running outside Telegram environment.

**Key Requirements:**
- **Telegram Environment**: Display actual Telegram user ID (e.g., "#123456789")
- **Development Environment**: Display "#MNHSNDEV" as fallback
- **Dynamic Detection**: Automatically detect if running in Telegram WebApp
- **User Experience**: Seamless display without user intervention

### Complexity Assessment
**Level**: 2 (Simple Enhancement)
**Rationale**: 
- Single component modification required
- Simple conditional logic implementation
- Telegram WebApp API integration
- Environment detection logic
- Minimal testing requirements

### Technology Stack
- Framework: React 18 + TypeScript
- Telegram Integration: Telegram WebApp API
- Environment Detection: window.Telegram.WebApp
- State Management: React hooks
- Testing: Vitest (unit), Playwright (E2E)

## Implementation Progress
**Status**: 📋 **PLANNING PHASE** - Comprehensive implementation plan in development

## 📋 **DETAILED PLANNING ANALYSIS**

### Current System Analysis
**Existing Implementation Review:**
- ✅ **UserInfoBlock Components**: Found in both `HomeScreen.tsx` (line 152) and `UserProfileComponents.tsx` (line 45)
- ✅ **Hardcoded Placeholder**: Currently displays "#1275" from `content.ui.home.heroTitle` and `content.ui.profile.heroTitle`
- ✅ **Content System**: Uses ContentContext with fallback values in `ContentContext.tsx` (lines 218, 252)
- ✅ **Telegram Integration**: Basic Telegram WebApp API available with user data access via `window.Telegram.WebApp.initDataUnsafe.user`

**Key Integration Points Identified:**
1. **UserInfoBlock Components**: Two identical implementations need updating
2. **Content System**: Static fallback values need dynamic replacement
3. **Telegram WebApp API**: User ID available via `initDataUnsafe.user.id`
4. **Environment Detection**: Need to detect Telegram vs development environment
5. **TypeScript Types**: Telegram WebApp types already defined

### Technical Architecture Planning

#### Data Flow Architecture
```
Telegram WebApp → User ID Detection → UserInfoBlock → Dynamic Display
     ↓                    ↓              ↓           ↓
Environment Check → User ID Format → Component Update → UI Rendering
```

#### Component Integration Map
```
App.tsx (Environment Detection)
    ↓
UserInfoBlock (HomeScreen.tsx)
    ↓
Dynamic Hero Title Display
    ↓
UserInfoBlock (UserProfileComponents.tsx)
    ↓
Consistent User ID Display
```

### Comprehensive Implementation Plan

#### Phase 1: Telegram User ID Utility Creation
**Objective**: Create utility function for Telegram user ID detection and formatting

1. **TelegramUserUtils Utility Class**:
   - **File**: `utils/telegramUserUtils.ts`
   - **API Methods**:
     - `getTelegramUserId(): string | null`
     - `isTelegramEnvironment(): boolean`
     - `formatUserDisplayId(userId?: number): string`
     - `getUserDisplayId(): string`
   - **Logic**: 
     - Check `window.Telegram?.WebApp?.initDataUnsafe?.user?.id`
     - Return formatted ID "#{userId}" for Telegram, "#MNHSNDEV" for development
   - **Error Handling**: Graceful fallback to development mode

#### Phase 2: UserInfoBlock Component Updates
**Objective**: Update both UserInfoBlock implementations to use dynamic user ID

2. **HomeScreen.tsx UserInfoBlock Update**:
   - **Location**: `components/HomeScreen.tsx` (line 152)
   - **Changes**: 
     - Import `getUserDisplayId` from telegramUserUtils
     - Replace static `content.ui.home.heroTitle` with dynamic user ID
     - Maintain existing styling and layout
   - **Implementation**: 
     ```typescript
     const userDisplayId = getUserDisplayId();
     <h2 className="block">{userDisplayId}</h2>
     ```

3. **UserProfileComponents.tsx UserInfoBlock Update**:
   - **Location**: `components/UserProfileComponents.tsx` (line 45)
   - **Changes**: 
     - Import `getUserDisplayId` from telegramUserUtils
     - Replace static `getUI().profile.heroTitle` with dynamic user ID
     - Maintain existing styling and layout
   - **Implementation**: 
     ```typescript
     const userDisplayId = getUserDisplayId();
     <h2 className="block">{userDisplayId}</h2>
     ```

#### Phase 3: Content System Updates
**Objective**: Update fallback content to reflect new dynamic behavior

4. **ContentContext.tsx Fallback Updates**:
   - **Location**: `components/ContentContext.tsx` (lines 218, 252)
   - **Changes**: 
     - Update fallback `heroTitle` values to "#MNHSNDEV"
     - Add comments explaining dynamic behavior
     - Maintain backward compatibility
   - **Implementation**: 
     ```typescript
     heroTitle: '#MNHSNDEV', // Dynamic: Telegram user ID or development fallback
     ```

#### Phase 4: Testing Implementation
**Objective**: Create comprehensive tests for new functionality

5. **Unit Testing Suite**:
   - **telegramUserUtils.test.ts**: Test all utility functions
   - **UserInfoBlock.test.tsx**: Test component rendering with dynamic IDs
   - **Environment Detection**: Test Telegram vs development environment
   - **Edge Cases**: Test missing user data, API failures

6. **E2E Testing Suite**:
   - **user-id-display.spec.ts**: Test user ID display in both environments
   - **telegram-integration.spec.ts**: Test Telegram WebApp integration
   - **fallback-behavior.spec.ts**: Test development environment fallback

## 📋 **IMPLEMENTATION CHECKLIST**

### Phase 1 Checklist: Telegram User ID Utility ✅ **READY**
- [ ] Create `utils/telegramUserUtils.ts` with all API methods
- [ ] Implement `getTelegramUserId()` function
- [ ] Implement `isTelegramEnvironment()` function
- [ ] Implement `formatUserDisplayId()` function
- [ ] Implement `getUserDisplayId()` function
- [ ] Add comprehensive error handling and fallbacks
- [ ] Create unit tests for telegramUserUtils

### Phase 2 Checklist: UserInfoBlock Component Updates ✅ **READY**
- [ ] Update `components/HomeScreen.tsx` UserInfoBlock
- [ ] Update `components/UserProfileComponents.tsx` UserInfoBlock
- [ ] Import telegramUserUtils in both components
- [ ] Replace static heroTitle with dynamic user ID
- [ ] Maintain existing styling and layout
- [ ] Test component rendering with dynamic IDs

### Phase 3 Checklist: Content System Updates ✅ **READY**
- [ ] Update fallback values in `components/ContentContext.tsx`
- [ ] Change heroTitle fallback to "#MNHSNDEV"
- [ ] Add comments explaining dynamic behavior
- [ ] Maintain backward compatibility
- [ ] Test fallback behavior

### Phase 4 Checklist: Testing & Validation ✅ **READY**
- [ ] Create unit tests for telegramUserUtils
- [ ] Create component tests for UserInfoBlock updates
- [ ] Create E2E tests for user ID display
- [ ] Test Telegram environment detection
- [ ] Test development environment fallback
- [ ] Verify all existing tests still pass

## 🚨 **RISK ASSESSMENT & MITIGATION**

### Low Risk Areas
- **Component Updates**: Simple function calls and imports
  - *Mitigation*: Incremental updates with testing at each step
- **Utility Creation**: Standard TypeScript utility functions
  - *Mitigation*: Well-defined API with comprehensive error handling
- **Fallback Values**: Simple string replacements
  - *Mitigation*: Maintain backward compatibility

### Medium Risk Areas
- **Telegram API Integration**: Dependency on external API availability
  - *Mitigation*: Graceful fallback to development mode
- **Environment Detection**: Browser environment variations
  - *Mitigation*: Robust detection logic with multiple fallbacks

### Components Affected
- `utils/telegramUserUtils.ts` (new utility class)
- `components/HomeScreen.tsx` (UserInfoBlock update)
- `components/UserProfileComponents.tsx` (UserInfoBlock update)
- `components/ContentContext.tsx` (fallback values)

### Dependencies
- Telegram WebApp API (already available)
- Existing React/TypeScript infrastructure
- Current component structure

### Success Metrics
- ✅ Telegram user ID displays correctly when running in Telegram
- ✅ "#MNHSNDEV" displays when running in development environment
- ✅ Both UserInfoBlock components show consistent user ID
- ✅ Graceful fallback when Telegram API unavailable
- ✅ All existing tests continue to pass
- ✅ No performance degradation

## 🎯 **PLANNING PHASE COMPLETE**

**Status**: ✅ **PLANNING COMPLETE** - Ready for Implementation

**Planning Summary:**
- ✅ **Requirements Analysis**: Complete with clear user ID display requirements
- ✅ **Technical Architecture**: Data flow and component integration mapped
- ✅ **4-Phase Implementation Plan**: Detailed specifications for each phase
- ✅ **Risk Assessment**: Low/Medium risk areas identified with mitigations
- ✅ **Implementation Checklists**: Comprehensive task lists for each phase
- ✅ **Testing Strategy**: Unit and E2E testing plans defined
- ✅ **Success Metrics**: Clear criteria for task completion

**Key Deliverables Planned:**
1. **TelegramUserUtils**: Core utility for user ID detection and formatting
2. **UserInfoBlock Updates**: Dynamic user ID display in both components
3. **Content System Updates**: Fallback values and documentation
4. **Comprehensive Testing**: Full test coverage for all functionality

**Ready for Next Phase**: **IMPLEMENTATION MODE** - Phase 1: Telegram User ID Utility Creation