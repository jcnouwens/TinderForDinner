# Supabase Integration Setup

This document explains how to set up and use Supabase for the "Tinder for Dinner" app's real-time, multi-device session support.

## Prerequisites

1. A Supabase account (free tier is sufficient for development)
2. A Supabase project created at <https://app.supabase.com>

## Setup Instructions

### 1. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands from `database_setup.sql` to create the required tables, policies, and functions

The database schema includes:

- `sessions` - Main session table
- `session_participants` - Users participating in sessions  
- `session_swipes` - Individual swipe records
- `session_matches` - Matched recipes

### 2. Environment Configuration

1. Copy your Supabase project URL and anon key from your project settings
2. Update `.env` with your actual credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Row Level Security (RLS)

The database setup includes RLS policies that:

- Allow users to read/write their own session data
- Restrict session management to hosts
- Enable real-time subscriptions for session participants

## Features Implemented

### ✅ Session Management

- **Create Session**: Host creates a session with customizable settings
- **Join Session**: Users join via session code
- **Leave Session**: Participants can leave at any time
- **Remove Participant**: Host can remove participants
- **Start Session**: Host initiates the swiping phase

### ✅ Real-time Updates

- Live participant updates when users join/leave
- Real-time match notifications across all devices
- Session state synchronization

### ✅ Swiping & Matching

- Record likes/dislikes for each participant
- Configurable matching rules (all must match vs majority)
- Automatic match detection and recording

### ✅ Multi-device Support

- Multiple users can join the same session
- Real-time synchronization across all devices
- Persistent session state

## Usage

### Creating a Session

```typescript
import { useSession } from '../context/SessionContext';

const { createSession } = useSession();
const user = { id: 'user1', name: 'Alice', email: 'alice@example.com' };

// Create session with custom settings
const sessionCode = await createSession(user, 6, false); // max 6 participants, majority match
```

### Joining a Session

```typescript
const { joinSession } = useSession();
const success = await joinSession('TASTY-PIZZA-42', user);
```

### Swiping on Recipes

```typescript
const { swipeRight, swipeLeft } = useSession();

// Like a recipe
const isMatch = await swipeRight('recipe-123');
if (isMatch) {
  console.log('🎉 It\'s a match!');
}

// Dislike a recipe  
await swipeLeft('recipe-456');
```

### Real-time Session Updates

The `SessionContext` automatically subscribes to real-time updates when joining a session. All participants will receive updates when:

- New participants join
- Participants leave
- Matches are found
- Session settings change

## Testing

A test utility is available at `src/utils/testSupabase.ts`:

```typescript
import { testSupabaseIntegration } from '../utils/testSupabase';

// Run integration tests
const result = await testSupabaseIntegration();
console.log('Test result:', result);
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Working**
   - Ensure `.env` is in the project root
   - Restart the Expo development server after changing `.env`
   - Verify variables start with `EXPO_PUBLIC_`

2. **Database Errors**
   - Check that all SQL from `database_setup.sql` was executed successfully
   - Verify RLS policies are enabled
   - Check Supabase project logs for detailed error messages

3. **Real-time Updates Not Working**
   - Ensure your Supabase plan supports real-time subscriptions
   - Check that the subscription is properly set up in the component lifecycle
   - Verify the user has the required permissions

### Debugging

Enable debug logging by adding to your component:

```typescript
useEffect(() => {
  console.log('Current session:', currentSession);
  console.log('Participants:', participants);
  console.log('Is host:', isHost);
}, [currentSession, participants, isHost]);
```

## Security Considerations

- Row Level Security (RLS) is enabled to protect user data
- Anonymous authentication is used (suitable for this demo app)
- For production, consider implementing proper user authentication
- Session codes are human-readable but should be treated as sensitive

## Next Steps

For production deployment, consider:

1. **User Authentication**: Implement proper user accounts with Supabase Auth
2. **Recipe API**: Integrate with a real recipe API (Spoonacular, etc.)
3. **Push Notifications**: Notify users of matches and session updates
4. **Analytics**: Track usage patterns and popular recipes
5. **Rate Limiting**: Implement limits to prevent abuse

## API Reference

See `src/services/SupabaseService.ts` for the complete API including:

- `createSession()`
- `joinSession()`
- `leaveSession()`
- `recordSwipe()`
- `checkForMatch()`
- `subscribeToSession()`

All methods include proper error handling and return appropriate success/failure indicators.
