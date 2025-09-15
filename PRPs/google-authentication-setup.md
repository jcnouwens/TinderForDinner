# Google Authentication Setup PRP

## Overview
This PRP provides a comprehensive implementation of Google authentication for the Tinder for Dinner application using Expo AuthSession, replacing the current mock authentication system.

## Context and Research

### Current State Analysis
The application currently uses a mock authentication system in `src/context/AuthContext.tsx` where all OAuth flows are simulated with setTimeout delays. The `signInWithGoogle` function simply creates a mock user object without actually connecting to Google's OAuth service.

### Required Dependencies (Already Installed)
- `expo-auth-session`: Provides OAuth2/OIDC authentication for Expo apps
- `expo-web-browser`: Required for web browser login flows
- `expo-secure-store`: Securely stores authentication tokens
- `expo-application`: App info for Google OAuth configuration

### Implementation Architecture

The implementation will follow this flow:
```
User Action → AuthContext → Expo AuthSession → Google OAuth → Supabase Backend → Store Token → Update State
```

## Implementation Blueprint

### 1. Environment Configuration
**File: .env.example**
```
# Google OAuth Configuration
GOOGLE_EXPO_CLIENT_ID=your-expo-google-client-id
GOOGLE_IOS_CLIENT_ID=your-ios-google-client-id
GOOGLE_ANDROID_CLIENT_ID=your-android-google-client-id
GOOGLE_WEB_CLIENT_ID=your-web-google-client-id

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# App Configuration
EXPO_PUBLIC_SCHEME=com.yourcompany.tinderfordinner
```

### 2. Google OAuth Configuration

**Steps to configure Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API for the project
4. Create OAuth 2.0 credentials:
   - Web application for Expo client
   - iOS bundle ID matching your app
   - Android package name and SHA1 fingerprint

5. Update client IDs in development environment

### 3. Updated AuthContext Implementation

**Critical Changes to make in src/context/AuthContext.tsx:**

#### Import Additional Dependencies
```typescript
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { useEffect, useState } from 'react';
import * as Application from 'expo-application';
```

#### Modify the Google Authentication Flow

```typescript
// Replace the current signInWithGoogle function with:
const signInWithGoogle = async (): Promise<void> => {
  try {
    setIsLoading(true);
    
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    const clientId = Constants.expoConfig?.extra?.googleClientId || process.env.GOOGLE_EXPO_CLIENT_ID;
    const redirectUri = makeRedirectUri();

    const authRequest = new AuthRequest({
      clientId,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: ResponseType.Token,
    });

    const authResult = await authRequest.promptAsync(discovery);
    
    if (authResult.type === 'success') {
      // Exchange code for supabase session
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: authResult.params.id_token,
      });

      if (error) throw error;
      
      if (data.user) {
        const user: User = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          email: data.user.email || '',
          avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
          token: data.session?.access_token || '',
        };
        
        await SecureStore.setItemAsync('userToken', user.token);
        setUser(user);
      }
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

### 4. Supabase Configuration

**File: src/services/supabase.ts**
```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 5. App Configuration Updates

**File: app.json updates required**
```json
{
  "expo": {
    "scheme": "com.yourcompany.tinderfordinner",
    "extra": {
      "googleClientId": "GOOGLE_EXPO_CLIENT_ID"
    },
    "ios": {
      "config": {
        "googleSignIn": {
          "reservedClientId": "GOOGLE_IOS_CLIENT_ID"
        }
      }
    },
    "android": {
      "package": "com.yourcompany.tinderfordinner",
      "config": {
        "googleSignIn": {
          "certificateHash": "YOUR_ANDROID_SHA1_FINGERPRINT"
        }
      }
    }
  }
}
```

## Step-by-Step Implementation Tasks

### Task 1: Environment Setup
1. Create `.env.example` with Google OAuth placeholders
2. Update `.gitignore` to ignore `.env`
3. Create separate .env files for local development

### Task 2: Configure Google OAuth in Google Cloud Console
1. Create OAuth 2.0 credential for web application
2. Create separate credentials for iOS and Android
3. Add authorized redirect URIs matching your Expo scheme
4. Download client IDs for each platform

### Task 3: Update AuthContext
1. Import new dependencies
2. Create Supabase client instance
3. Replace mock signInWithGoogle with real implementation
4. Add error handling and loading states
5. Update user session management

### Task 4: Update AuthScreen UI
1. Remove Instagram OAuth (or implement Instagram Basic Display separately)
2. Update button handlers to use new auth flow
3. Add proper error messaging
4. Style the Google sign-in button appropriately

### Task 5: Test the Integration
1. Test on iOS simulator
2. Test on Android emulator
3. Test on web (if applicable)
4. Verify token storage and retrieval

## Error Handling Strategy

### Common Errors and Solutions

1. **Invalid client ID**: Ensure Google Cloud Console credentials match platform
2. **Deep linking issues**: Verify scheme configuration in app.json
3. **Redirect URI mismatch**: Update authorized redirect URIs in Google Console
4. **Session storage errors**: Use try-catch around SecureStore operations
5. **Network failures**: Add fallback for offline states

### Error Responses to Users
- Display user-friendly error messages
- Provide fallback authentication options
- Log detailed errors for debugging

## Security Considerations

1. **Token Storage**: Use SecureStore for sensitive tokens
2. **Client Secrets**: Never expose web client secret in mobile app
3. **Token Validation**: Implement server-side token validation if using custom backend
4. **HTTPS**: Ensure all OAuth flows use HTTPS-only redirect URIs
5. **PKCE**: Leverage built-in PKCE support in expo-auth-session

## Testing Approach

### Integration Tests
```javascript
// Example test structure in src/context/__tests__/AuthContext.test.tsx
describe('Google Authentication', () => {
  it('should handle successful OAuth flow', async () => {
    // Mock expo-auth-session response
  });
  
  it('should handle OAuth cancellation', async () => {
    // Test user cancellation flow
  });
  
  it('should store token on successful auth', async () => {
    // Test SecureStore integration
  });
});
```

### Manual Testing Checklist
- [ ] Google sign-in flow works on iOS
- [ ] Google sign-in flow works on Android
- [ ] Token persists across app restarts
- [ ] Sign-out clears all stored tokens
- [ ] Error messages display correctly

## README Updates Required

**Add to existing README:**

### Google Authentication Setup

#### Prerequisites
1. Google Cloud Platform project with OAuth 2.0 credentials
2. Supabase account and project configured for Google OAuth

#### Configuration Steps

1. **Create Google OAuth Credentials:**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials for:
     - Web application (for Expo Go)
     - iOS (bundle identifier: `com.yourcompany.tinderfordinner`)
     - Android (package name: `com.yourcompany.tinderfordinner`)

2. **Setup .env file:**
   ```bash
   cp .env.example .env
   # Edit .env with your Google client IDs
   ```

3. **Configure Supabase:**
   - In Supabase dashboard:
   - Authentication > Providers > Enable Google
   - Add your Google client IDs and client secret
   - Set authorized redirect URI to your Supabase project URL/auth/v1/callback

4. **Test the setup:**
   ```bash
   npx expo start --ios
   # or
   npx expo start --android
   ```

## Validation Gates

### Pre-implementation Validation
```bash
# 1. Install dependencies if needed
npm install expo-auth-session expo-web-browser expo-secure-store

# 2. Confirm environment variables are properly configured
grep -n "GOOGLE_" .env

# 3. Verify Google client ID is valid format
node -e "console.log(process.env.GOOGLE_EXPO_CLIENT_ID && process.env.GOOGLE_EXPO_CLIENT_ID.startsWith('google-client-id-'))"

# 4. Test Supabase connection
npx expo-doctor
```

### Post-implementation Validation
```bash
# 1. Run app tests
npm test

# 2. Test authentication flow on iOS
npm run ios

# 3. Test authentication flow on Android
npm run android

# 4. Verify token persistence
#   - Sign in with Google
#   - Close app
#   - Reopen app - should maintain authenticated state
```

## Confidence Score: 9/10

This PRP achieves a 9/10 confidence score due to:
- Comprehensive research on current Expo AuthSession patterns
- Detailed step-by-step implementation guide
- Complete error handling strategy
- Security best practices included
- Testing approach clearly defined
- Documentation covers all expected scenarios

The remaining 1% uncertainty accounts for potential Google API changes or platform-specific issues that may arise during implementation.

## Key Files to Reference During Implementation
1. `src/context/AuthContext.tsx:120-149` - Current mock Google sign-in implementation
2. `src/screens/AuthScreen.tsx:14-21` - Current Google button handler
3. Check package.json dependencies for expo-auth-session and related packages
4. Use existing patterns from project for error handling and state management
5. Follow established TypeScript patterns in codebase