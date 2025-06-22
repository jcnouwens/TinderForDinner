import { supabase } from '../services/supabase';

/**
 * Simple test to verify Supabase connection
 * Run this from a React component to test the database connection
 */
export const testSupabaseConnection = async () => {
    console.log('🔌 Testing Supabase connection...');

    try {
        // Test basic connection by checking if we can query the sessions table
        const { data, error } = await supabase
            .from('sessions')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Connection test failed:', error.message);
            return { success: false, error: error.message };
        }

        console.log('✅ Supabase connection successful!');
        return { success: true, message: 'Connected to Supabase successfully' };

    } catch (error) {
        console.error('❌ Connection test error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown connection error'
        };
    }
};

/**
 * Test basic CRUD operations
 */
export const testBasicOperations = async () => {
    console.log('🧪 Testing basic database operations...');

    try {
        // Test creating a session
        const testSessionCode = `TEST-${Date.now()}`;
        const { data: sessionData, error: createError } = await supabase
            .from('sessions')
            .insert({
                session_code: testSessionCode,
                host_id: 'test-user-' + Date.now(),
                max_participants: 4,
                requires_all_to_match: true,
                active: false,
            })
            .select()
            .single();

        if (createError) {
            console.error('❌ Create test failed:', createError.message);
            return { success: false, error: createError.message };
        }

        console.log('✅ Session created successfully:', sessionData.id);

        // Test reading the session
        const { data: readData, error: readError } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', sessionData.id)
            .single();

        if (readError) {
            console.error('❌ Read test failed:', readError.message);
            return { success: false, error: readError.message };
        }

        console.log('✅ Session read successfully');

        // Clean up test data
        const { error: deleteError } = await supabase
            .from('sessions')
            .delete()
            .eq('id', sessionData.id);

        if (deleteError) {
            console.warn('⚠️ Cleanup warning:', deleteError.message);
        } else {
            console.log('✅ Test data cleaned up');
        }

        return {
            success: true,
            message: 'All basic operations completed successfully',
            sessionId: sessionData.id
        };

    } catch (error) {
        console.error('❌ Basic operations test error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown test error'
        };
    }
};
