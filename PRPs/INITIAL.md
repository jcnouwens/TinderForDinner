# PRP: Initial Project Setup and Core Features Implementation

## Overview

This PRP covers the implementation of fundamental features for the TinderForDinner React Native application, focusing on copying session codes to clipboard, testing backend connections, and setting up Google authentication with comprehensive documentation.

## Current State Analysis

Based on codebase analysis, the application uses:
- **Expo/React Native** with TypeScript
- **Supabase** as backend (realtime + auth + database)
- **Reanimated + Gesture Handler** for swipe animations
- **SecureStore** for authentication tokens
- **Context-based state management** with AuthContext and SessionContext
- **Mock services** as fallback when Supabase fails (especially on iOS simulator)

## Research Findings

### Existing Patterns Identified

**Clipboard Management** (`src/utils/clipboardUtils.ts:8-31`):
- Uses `expo-clipboard` for cross-platform clipboard operations
- Returns standardized `ClipboardResult` objects with success/error state
- Includes comprehensive logging with emoji indicators
- Follows async/await pattern throughout

**Authentication** (`src/context/AuthContext.ts:121-149`):
- Mock Google OAuth currently implemented in `signInWithGoogle` method
- Uses `expo-secure-store` for token persistence
- Provides consistent user object shape with User interface
- Follows async/await with error handling patterns

**Connection Testing** (`src/services/supabase.ts:115-170`):
- Realtime connection tests with timeout handling
- iOS simulator specific detection and handling
- Fallback to mock services when connectivity fails
- Logging system with emoji indicators for debugging

**State Management** (`src/context/SessionContext.ts:120-248`):
- Uses React Context with TypeScript interfaces
- Combines real Supabase services with mock services
- Includes retry mechanisms and user feedback
- Real-time subscription management with Supabase channels

## Implementation Tasks

### 1. Copy Session Code to Clipboard

**Pattern to follow:** Use existing clipboard utilities with enhanced UX pattern.

**Implementation Approach:**
```typescript
// Enhanced clipboard functionality for session codes
import { copyToClipboard } from '../utils/clipboardUtils';
import { ClipboardResult } from '../types';

// In SessionContext or relevant component
const copySessionCode = async (): Promise<ClipboardResult> => {
  if (!currentSession?.sessionCode) {
    return {
      success: false,
      error: 'No active session'
    };
  }
  
  return await copyToClipboard(currentSession.sessionCode);
};
```

**File to create/modify:** `src/components/CopyButton.tsx` and integration into `SessionLobbyScreen.tsx`

### 2. Backend Connection Testing

**Pattern to follow:** Use the existing connection testing infrastructure from supabase.ts.

**Implementation Approach:**
```typescript
// Connection testing component leveraging existing patterns
import { testSupabaseConnection, testIOSSimulatorConnection } from '../services/supabase';

// Test implementation following existing patterns
const runConnectionTests = async (): Promise<{
  supabase: boolean;
  network: boolean;
  simulator: boolean;
}> => {
  const results = {
    supabase: await testSupabaseConnection(),
    network: await testIOSSimulatorConnection(),
    simulator: typeof navigator !== 'undefined' && navigator.userAgent.includes('iPhone Simulator')
  };
  
  return results;
};
```

**File to create/modify:** `src/components/ConnectionStatus.tsx`

### 3. Google Authentication Setup

**Pattern to follow:** Enhance existing `signInWithGoogle` method to use real Google OAuth.

**Implementation Approach:**
```typescript
// Enhanced Google OAuth using expo-auth-session
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';

// Replace existing mock implementation with real OAuth flow
const signInWithGoogle = async () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
  });

  if (response?.type === 'success') {
    const { authentication } = response;
    // Verify token with backend and create user session
    const user = await verifyGoogleToken(authentication.accessToken);
    await SecureStore.setItemAsync('userToken', user.token);
    setUser(user);
  }
};
```

**Files to modify:** 
- `src/context/AuthContext.ts` (lines 121-149)
- `App.json` (add Google OAuth scheme)

## Detailed Implementation Steps

### Phase 1: Environment Setup
1. **Create `.env.example`** with all required variables
2. **Update `.gitignore`** to exclude `.env` and sensitive files
3. **Verify package.json** includes required dependencies (expo-clipboard, expo-secure-store, expo-auth-session)

### Phase 2: Clipboard Feature
1. **Enhance existing clipboard utilities** with session-specific implementation
2. **Create reusable CopyButton component** following existing UI patterns
3. **Integrate into SessionLobbyScreen** with visual feedback
4. **Add tests** following existing test patterns in `__tests__`

### Phase 3: Connection Testing
1. **Create ConnectionStatus component** using existing debugging patterns
2. **Implement comprehensive connection tests** based on existing `supabase.ts:115-170`
3. **Add visual indicators** for connection states
4. **Integrate into development mode only** following existing patterns

### Phase 4: Google Authentication
1. **Set up Google OAuth credentials** in Google Cloud Console
2. **Install expo-auth-session** and configure app.json scheme
3. **Replace mock Google auth** with real OAuth flow in `AuthContext.ts:121-149`
4. **Add token verification** with Supabase backend
5. **Test authentication flow** with Google Cloud Console tokens

### Phase 5: Documentation & README
1. **Create comprehensive README** with project structure diagram
2. **Add setup instructions** for Supabase and Google OAuth
3. **Document environment variables** with `.env.example`
4. **Add troubleshooting section** for common iOS simulator issues

## Environment Variables Configuration

**Required `.env` variables:**
```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_web_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your_google_expo_client_id

# Optional: Development debugging
EXPO_PUBLIC_DEBUG_MODE=true
```

## External Documentation References

### React Native/Expo
- [Expo Clipboard Documentation](https://docs.expo.dev/versions/latest/sdk/clipboard/)
- [Expo Auth Session - Google](https://docs.expo.dev/guides/google-authentication/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)

### Supabase
- [Supabase Auth - Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

### Google Cloud Console
- [Google OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)

## Error Handling Strategy

Following existing patterns in the codebase:

**Logging Pattern:** Use emoji-indicated logging for debugging (`✅`, `❌`, `🔍`, `📱`)
**User Feedback:** Use Alert component for user-facing errors
**Fallback Strategy:** Automatic fallback to mock services when real services fail
**Timeout Handling:** Configurable timeouts with retry mechanisms (5-8 seconds for simulator, 15 seconds for real)

## Validation Gates

### Pre-commit validation
```bash
# Run TypeScript checks
npm run type-check

# Run Jest tests
npm test

# Run linting
npm run lint

# Test connection with both real and mock services
npm run test:connection
```

### Development mode validation
```bash
# Test clipboard functionality
expo clipboard:read

# Test Google OAuth flow
expo start --ios
expo start --android

# Test connection diagnostics
npm run debug:connection
```

### Production validation
```bash
# Test environment variables
expo config --type public

# Verify Google OAuth scheme registration
expo prebuild
```

## Code Examples to Reference

### Clipboard Pattern (`src/utils/clipboardUtils.ts:8-31`):
```typescript
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  try {
    console.log('📋 Copying to clipboard:', text);
    await Clipboard.setStringAsync(text);
    return { success: true, message: 'Copied to clipboard!' };
  } catch (error) {
    console.error('❌ Clipboard copy failed:', error);
    return { success: false, error: 'Failed to copy to clipboard' };
  }
}
```

### Async/Await Pattern (`src/services/supabase.ts:48-111`):
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
try {
  const response = await fetch(url, options);
  clearTimeout(timeoutId);
  return response;
} catch (error) {
  clearTimeout(timeoutId);
  throw error;
}
```

### Authentication Pattern (`src/context/AuthContext.ts:120-149`):
```typescript
const signInWithGoogle = async () => {
  try {
    setIsLoading(true);
    // OAuth flow here - replace mock with real implementation
    const user = await verifyGoogleToken(authentication.accessToken);
    await SecureStore.setItemAsync('userToken', user.token);
    setUser(user);
  } catch (error) {
    throw new Error('Failed to sign in with Google');
  } finally {
    setIsLoading(false);
  }
};
```

## Testing Strategy

### Unit Tests
- Test clipboard operations with mock clipboard
- Test connection tests with mock fetch responses
- Test Google OAuth flow with mocked navigation

### Integration Tests
- Test complete user flow: auth → create session → copy code
- Test connection state transitions
- Test error handling and fallbacks

### Manual Tests
- Test on iOS simulator (connection failures expected)
- Test on Android emulator (connection should work)
- Test force-fallback to mock services
- Test Google OAuth flow end-to-end

## Project Structure Documentation

```
TinderForDinner/
├── 📱 src/
│   ├── 🏗️ contexts/         # State management
│   │   ├── AuthContext.ts
│   │   └── SessionContext.ts
│   ├── 🎯 screens/         # Main app screens
│   │   ├── AuthScreen.tsx
│   │   ├── SessionLobbyScreen.tsx
│   │   └── SwipeScreen.tsx
│   ├── 🎨 components/      # Reusable components
│   │   ├── CopyButton.tsx
│   │   └── ConnectionStatus.tsx
│   ├── 🔧 services/        # Backend services
│   │   ├── supabase.ts
│   │   └── MockSupabaseService.ts
│   └── ✅ tests/           # Testing utilities
├── 📋 PRPs/               # PRPs and templates
└── 📚 README.md           # Comprehensive documentation
```

## Common Gotchas & Solutions

1. **iOS Simulator Connectivity:** Always falls back to mock services - this is expected
2. **Google OAuth Client IDs:** Different for iOS, Android, and Expo web - must all be configured
3. **Environment Variables:** Must restart Metro after changing .env files
4. **SecureStore:** Different behavior on iOS vs Android - test both platforms
5. **Clipboard Permissions:** Works on mobile but may need web platform polyfill

## Success Criteria

- [ ] User can copy session code with visual feedback
- [ ] User can see connection status and test connectivity
- [ ] User can authenticate with Google OAuth successfully
- [ ] All environment variables are properly documented
- [ ] README includes complete setup instructions
- [ ] Tests pass on both iOS simulator and Android emulator
- [ ] Mock services work as fallback when connectivity fails
- [ ] Error handling is user-friendly with clear error messages

## Confidence Score: 9/10

This PRP provides a highly confident implementation path because:
1. All patterns exist in current codebase and are battle-tested
2. Features are incremental improvements rather than new technology
3. Fallback mechanisms are already in place for clutch scenarios
4. Comprehensive testing strategy covers all major use cases
5. Documentation and examples are based on existing, working patterns

The only uncertainty is Google OAuth configuration complexity, but fallback to mock auth ensures the app remains functional even if OAuth setup is incomplete.