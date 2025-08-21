# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

```bash
# Install dependencies
npm install

# Development
npm run ios              # iOS simulator
npm run android          # Android emulator
npm start               # Metro bundler + QR codes
npm run web             # Expo web

# Testing
npm test                # All Jest tests
npm test -- --watch     # Watch mode
npm test -- <file>      # Specific test file

# Expo Dev Tools
npx expo-doctor         # Health check
npx expo-config         # View current config
```

## Architecture Overview

### Navigation Flow
```
App.tsx (Root)
├── AuthContext (/src/context/AuthContext.tsx)
│   ├── Not authenticated → AuthStack → AuthScreen
│   └── Authenticated → TabNavigator → Bottom Tabs
│       ├── HomeStack → HomeScreen → SwipeScreen → MatchScreen
│       └── Profile → ProfileScreen
```

### State Management
- **AuthContext**: OAuth flows, secure token storage, user profile
- **SessionContext**: Swiping sessions, recipe data, real-time sync
- Both contexts expose `useAuth()` and `useSession()` hooks

### Key Directories
- **Navigation**: `/src/navigation/AppNavigator.tsx` - Type-safe routing
- **Contexts**: `/src/context/` - Auth + Session state management  
- **Screens**: `/src/screens/` - All app screens (conditionally rendered)
- **Theme**: `/src/theme/` - Design system (colors, spacing, typography)
- **Types**: `/src/types/index.ts` - Recipe, User, SwipeSession interfaces
- **Services**: `/src/services/` - Supabase client + mock implementations

### Development Patterns
- **Type-First**: Strong TypeScript throughout with navigation types
- **Mock-First**: All API calls mocked in contexts, ready for real Supabase integration
- **Theme Integration**: Design system exists but not fully applied to screens
- **Swipe Engine**: react-native-gesture-handler + Reanimated animations
- **Test Approach**: Jest + React Native Testing Library (minimal coverage currently)

### Core Data Types
```typescript
// From /src/types/index.ts
Recipe: full recipe with ingredients, instructions, images
User: profile data, OAuth tokens, preferences  
SwipeSession: shared session IDs, matching logic, real-time state
```

### Unique Features
- Session-based collaborative recipe swiping (Tinder-style)
- Real-time recipe matching between two users
- OAuth authentication (Google) + secure token storage
- Expo-based for rapid cross-platform development
- Ready for Supabase backend integration