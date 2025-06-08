# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the App
- `npm install` - Install dependencies
- `npm run ios` or `npx expo start --ios` - Run on iOS simulator
- `npm run android` or `npx expo start --android` - Run on Android
- `npm start` or `npx expo start` - Start development server

### Testing
- `npm test` - Run all Jest tests
- `npm test -- --watch` - Run tests in watch mode
- `npm test -- <filename>` - Run specific test file

## Architecture Overview

### State Management Pattern
The app uses React Context for state management with two main contexts:
- **AuthContext** (`src/context/AuthContext.tsx`) - Handles user authentication, OAuth flows, and secure token storage
- **SessionContext** (`src/context/SessionContext.tsx`) - Manages shared swiping sessions between users and recipe data

Both contexts follow the pattern: Context Provider + Custom Hook (e.g., `useAuth()`, `useSession()`).

### Navigation Structure
**Conditional Root Navigation**: Authentication state determines which navigator is rendered:
```
AuthContext → Root Stack Navigator
├── Auth Stack (unauthenticated)
└── Bottom Tab Navigator (authenticated)
    ├── Home Tab → Stack Navigator
    │   ├── HomeScreen
    │   ├── SwipeScreen  
    │   ├── MatchScreen
    │   └── RecipeDetailScreen
    └── Profile Tab → ProfileScreen
```

Key navigation files: `src/navigation/AppNavigator.tsx`

### Theme System
Comprehensive design system located in `src/theme/`:
- **ThemeProvider** - Light/dark theme with system detection
- **colors.ts** - Brand colors (primary: #FF6B6B coral red)
- **styles.ts** - Typography, spacing, shadows, utilities

The theme system is fully implemented but not yet integrated into screen components (screens currently use inline StyleSheet.create).

### Component Patterns
- **Screen Components**: Use hooks extensively, integrate with context via custom hooks
- **Swipe Functionality**: Built with react-native-gesture-handler and Animated API
- **Type Safety**: Full TypeScript with comprehensive navigation typing

### Mock-First Development
All backend interactions are currently mocked with realistic timeouts and data structures. This allows full feature development before backend integration. Mock implementations are in context files and can be easily replaced with real API calls.

### Key Types
Core data structures in `src/types/index.ts`:
- **Recipe** - Complete recipe data with ingredients, instructions, metadata
- **User** - Authentication and profile data  
- **SwipeSession** - Session management between users
- **Navigation types** - Comprehensive React Navigation typing

## Testing Setup
- **Jest + Expo** using jest-expo preset
- **React Native Testing Library** for component testing
- **Setup**: `src/setupTests.ts` with comprehensive mocking
- **Config**: `jest.config.js`

Current test coverage is minimal - when adding features, write corresponding tests following the established patterns in `src/__tests__/` and `src/utils/__tests__/`.

## Unique App Concepts
- **Session-Based Matching**: Users create/join sessions to swipe on recipes together
- **Recipe Discovery**: Tinder-like interface for discovering recipes
- **Shared Decision Making**: Both users must like a recipe for it to be a "match"

## Development Notes
- Expo-based React Native app optimized for rapid development
- Ready for Supabase backend integration (@supabase/supabase-js included)
- Uses @tanstack/react-query for data fetching (not yet implemented)
- All authentication flows use expo-auth-session and expo-secure-store