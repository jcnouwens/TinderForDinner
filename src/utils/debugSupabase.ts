import { supabase } from '../services/supabase';
import { runNetworkTests } from './networkTest';

/**
 * Debug utility to help troubleshoot Supabase connection issues
 */
export const debugSupabaseConnection = async () => {
    console.log('🔍 Starting Supabase connection debug...');

    // Check environment variables
    console.log('📝 Environment variables:');
    console.log('- EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('- EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

    if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
        console.log('- URL value:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    }

    // Test basic connection
    try {
        console.log('🔌 Testing basic connection...');
        const { data, error } = await supabase
            .from('sessions')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Connection test failed:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            return false;
        }

        console.log('✅ Basic connection test passed');
        return true;

    } catch (error) {
        console.error('❌ Connection test threw exception:', error);

        if (error instanceof TypeError && error.message.includes('Network request failed')) {
            console.error('🌐 This is a network connectivity issue. Possible causes:');
            console.error('1. No internet connection');
            console.error('2. Firewall blocking the request');
            console.error('3. Proxy configuration issues');
            console.error('4. Supabase service is down');
            console.error('5. Invalid Supabase URL');
        }

        return false;
    }
};

/**
 * Test if we can create a minimal test record
 */
export const testDatabaseWrite = async () => {
    console.log('✏️ Testing database write operations...');

    try {
        const testCode = `DEBUG-${Date.now()}`;
        const { data, error } = await supabase
            .from('sessions')
            .insert({
                session_code: testCode,
                host_id: 'debug-test-user',
                max_participants: 2,
                requires_all_to_match: false,
                active: false,
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Write test failed:', error);
            return false;
        }

        console.log('✅ Write test passed, created session:', data.id);

        // Clean up test record
        const { error: deleteError } = await supabase
            .from('sessions')
            .delete()
            .eq('id', data.id);

        if (deleteError) {
            console.warn('⚠️ Could not clean up test record:', deleteError);
        } else {
            console.log('🧹 Test record cleaned up');
        }

        return true;

    } catch (error) {
        console.error('❌ Write test threw exception:', error);
        return false;
    }
};

/**
 * Run all debug tests
 */
export const runAllDebugTests = async () => {
    console.log('🚀 Running all Supabase debug tests...');

    // First, test network connectivity
    console.log('📡 Step 1: Network connectivity tests');
    const networkResults = await runNetworkTests();

    if (!networkResults.internet) {
        console.log('❌ Network tests failed, skipping Supabase tests');
        return false;
    }

    console.log('📊 Step 2: Supabase connection tests');
    const connectionTest = await debugSupabaseConnection();
    if (!connectionTest) {
        console.log('❌ Connection test failed, skipping write test');
        return false;
    }

    console.log('✏️ Step 3: Database operation tests');
    const writeTest = await testDatabaseWrite();

    const allPassed = networkResults.overall && connectionTest && writeTest;

    if (allPassed) {
        console.log('✅ All tests passed! Supabase connection is working correctly.');
        return true;
    } else {
        console.log('❌ Some tests failed. Check the logs above for details.');
        console.log('Test results:');
        console.log('- Internet connectivity:', networkResults.internet ? '✅' : '❌');
        console.log('- Supabase reachability:', networkResults.supabase ? '✅' : '❌');
        console.log('- Supabase connection:', connectionTest ? '✅' : '❌');
        console.log('- Database operations:', writeTest ? '✅' : '❌');
        return false;
    }
};
