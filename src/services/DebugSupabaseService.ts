/**
 * Debug utilities for testing Supabase in different environments
 */

import { SupabaseService } from './SupabaseService';
import { MockSupabaseService } from './MockSupabaseService';

export class DebugSupabaseService {
    /**
     * Force creation of a real Supabase session, bypassing fallbacks
     */
    static async forceCreateRealSession(
        hostUser: any,
        sessionCode: string,
        maxParticipants: number = 4,
        requiresAllToMatch: boolean = false
    ) {
        console.log('🚀 FORCE MODE: Creating real Supabase session...');
        console.log('🔧 This will fail if network is unavailable');

        try {
            const session = await SupabaseService.createSession(
                hostUser,
                sessionCode,
                maxParticipants,
                requiresAllToMatch
            );

            console.log('✅ SUCCESS: Real Supabase session created!');
            console.log('📊 Session details:', session);
            return { success: true, session, type: 'real' };

        } catch (error) {
            console.error('❌ FAILED: Real Supabase session creation failed');
            console.error('🔍 Error details:', error);
            return { success: false, error, type: 'real' };
        }
    }

    /**
     * Test connectivity to Supabase without creating a session
     */
    static async testSupabaseConnectivity() {
        console.log('🔍 Testing Supabase connectivity...');

        try {
            // Import supabase client directly
            const { supabase } = require('./supabase');

            // Try a simple query
            const { data, error } = await supabase
                .from('sessions')
                .select('count')
                .limit(1);

            if (error) {
                console.error('❌ Connectivity test failed:', error);
                return { connected: false, error };
            }

            console.log('✅ Connectivity test passed');
            return { connected: true, data };

        } catch (error) {
            console.error('❌ Connectivity test error:', error);
            return { connected: false, error };
        }
    }

    /**
     * Get environment info for debugging
     */
    static getEnvironmentInfo() {
        const info = {
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
            supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
            platform: 'react-native',
            timestamp: new Date().toISOString()
        };

        console.log('🔍 Environment Info:', info);
        return info;
    }
}
