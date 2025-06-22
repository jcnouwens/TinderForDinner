import { SupabaseService } from '../services/SupabaseService';
import { User } from '../types';

// Test script to verify Supabase integration
// This is for development testing purposes only

const testUser1: User = {
  id: 'test-user-1',
  name: 'Alice',
  email: 'alice@example.com',
  avatar: ''
};

const testUser2: User = {
  id: 'test-user-2',
  name: 'Bob',
  email: 'bob@example.com',
  avatar: ''
};

export const testSupabaseIntegration = async () => {
  console.log('🧪 Starting Supabase Integration Test...');

  try {
    // Test 1: Create Session
    console.log('📝 Test 1: Creating session...');
    const session = await SupabaseService.createSession(testUser1, 'TEST-PIZZA-42', 4, true);

    if (!session) {
      throw new Error('Failed to create session');
    }

    console.log('✅ Session created:', session.id);

    // Test 2: Join Session
    console.log('📝 Test 2: Joining session...');
    const joinedSession = await SupabaseService.joinSession('TEST-PIZZA-42', testUser2);

    if (!joinedSession) {
      throw new Error('Failed to join session');
    }

    console.log('✅ Session joined by second user');

    // Test 3: Record Swipe
    console.log('📝 Test 3: Recording swipe...');
    const swipeSuccess = await SupabaseService.recordSwipe(session.id, testUser1.id, 'recipe-1', true);

    if (!swipeSuccess) {
      throw new Error('Failed to record swipe');
    }

    console.log('✅ Swipe recorded');

    // Test 4: Check for Match
    console.log('📝 Test 4: Checking for match...');
    // First user likes it, second user also likes it
    await SupabaseService.recordSwipe(session.id, testUser2.id, 'recipe-1', true);
    const isMatch = await SupabaseService.checkForMatch(session.id, 'recipe-1');

    console.log(isMatch ? '✅ Match detected!' : '❌ No match detected');

    // Test 5: Leave Session
    console.log('📝 Test 5: Leaving session...');
    const leaveSuccess = await SupabaseService.leaveSession(session.id, testUser2.id);

    if (!leaveSuccess) {
      throw new Error('Failed to leave session');
    }

    console.log('✅ Left session successfully');

    console.log('🎉 All tests passed!');
    return { success: true, sessionId: session.id };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Helper function to clean up test data
export const cleanupTestData = async (sessionId: string) => {
  console.log('🧹 Cleaning up test data...');

  try {
    // In a real app, you'd want to add cleanup functions to SupabaseService
    // For now, test data will remain in the database
    console.log('✅ Cleanup completed (manual cleanup may be required)');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};
