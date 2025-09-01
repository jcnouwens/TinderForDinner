# TinderForDinner 🍽️

A React Native + Expo app that brings the swipe-right experience to meal planning. Collaborate with friends to find the perfect recipe - swipe right on what you like, left on what you don't, and let the matching algorithm do the rest!

## Features

- 🔐 **OAuth Authentication** - Secure Google sign-in with expo-auth-session
- 📱 **Cross-platform** - iOS, Android, and Web support via Expo
- 🎯 **Real-time Sessions** - Share session codes to swipe with friends
- ✅ **Smart Matching** - Algorithm finds recipes everyone likes
- 🎨 **Beautiful UI** - Swipe cards with smooth animations

## Quick Start

### Prerequisites
- Node.js (v16+)
- Expo CLI (`npm install -g expo-cli`)
- Git

### Installation

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd TinderForDinner

# 2. Install dependencies
npm install

# 3. Environment setup
cp .env.example .env
# Edit .env with your actual values (see setup guides below)

# 4. Start the app
npm start            # Expo dev tools + QR codes
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run web          # Expo web version
```

### Development Commands

```bash
# Development
npm run ios              # Launch iOS simulator
npm run android          # Launch Android emulator
npm start               # Metro bundler + QR codes
npm run web             # Expo web

# Testing
npm test                # All Jest tests
npm test -- --watch     # Watch mode
npm test -- <file>      # Specific test file

# Expo tools
npx expo-doctor         # Health check
npx expo-config         # View current config
```

## Setup Guides

### Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Set Environment Variables**
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Database Schema**
   The app expects these tables:
   - `sessions` - Swipe session data
   - `participants` - Session participants
   - `swipes` - Individual swipe records
   - `matches` - Recipe matches between users

### Google OAuth Setup

1. **Google Cloud Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API

2. **Create OAuth Credentials**
   - Navigate to APIs & Services > Credentials
   - Create OAuth 2.0 Client IDs
   - Add authorized redirect URIs:
     - iOS: `host.exp.exponent://oauth` (for development)
     - Web: `https://auth.expo.io/@yourusername/TinderForDinner`

3. **Set Environment Variables**
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_web_client_id
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
   ```

## Architecture Overview

### Navigation Structure
```
App.tsx (Root)
├── AuthContext (/src/context/AuthContext.tsx)
│   ├── Not authenticated → AuthStack → AuthScreen
│   └── Authenticated → TabNavigator → Bottom Tabs
│       ├── HomeStack → HomeScreen → SwipeScreen → MatchScreen
│       └── Profile → ProfileScreen
```

### Key Directories
- **Navigation**: `/src/navigation/AppNavigator.tsx` - Type-safe routing
- **Contexts**: `/src/context/` - Auth + Session state management
- **Screens**: `/src/screens/` - All app screens
- **Theme**: `/src/theme/` - Design system (colors, spacing, typography)
- **Types**: `/src/types/index.ts` - TypeScript interfaces
- **Services**: `/src/services/` - Supabase client + API calls
- **Utils**: `/src/utils/` - Helper functions (clipboard, validation)

### Core Concepts
- **Session Codes**: Shareable codes like "HAPPY-PASTA-42"
- **Swipe Sessions**: Real-time collaborative recipe swiping
- **Recipe Matching**: Algorithm finds overlap between users' preferences
- **OAuth Flow**: Secure authentication with token storage

## Environment Variables

Required variables in `.env` file:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_web_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id

# Development
EXPO_PUBLIC_ENV=development
```

## Testing

The project uses Jest with React Native Testing Library:

```bash
npm test                # Run all tests
npm test -- --watch     # Watch mode
npm test HomeScreen     # Test specific component
```

## Technologies

- **Frontend**: React Native, Expo
- **Authentication**: OAuth via expo-auth-session
- **Backend**: Supabase (PostgreSQL + Realtime)
- **State**: React Context + Custom Hooks
- **Navigation**: React Navigation v6
- **Testing**: Jest + React Native Testing Library
- **Styling**: React Native StyleSheet + Styled Components

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.