/**
 * Enhanced Supabase connection utilities for iOS simulator compatibility
 */

import { supabase } from './supabase';

export class SimulatorSupabaseService {

    /**
     * Enhanced session creation with retry logic and better error handling
     */
    static async createSessionWithRetry(
        hostUser: any,
        sessionCode: string,
        maxParticipants: number = 4,
        requiresAllToMatch: boolean = false,
        maxRetries: number = 3
    ) {
        console.log('🚀 Enhanced session creation with retry logic...');

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📝 Attempt ${attempt}/${maxRetries}: Creating session...`);

                // Wait a bit between retries
                if (attempt > 1) {
                    console.log(`⏳ Waiting ${attempt * 1000}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                }

                // Try to create the session
                const { data: sessionData, error: sessionError } = await supabase
                    .from('sessions')
                    .insert({
                        session_code: sessionCode,
                        host_id: hostUser.id,
                        max_participants: maxParticipants,
                        requires_all_to_match: requiresAllToMatch,
                        active: false,
                    })
                    .select()
                    .single();

                if (sessionError) {
                    console.error(`❌ Attempt ${attempt} failed:`, sessionError);

                    if (attempt === maxRetries) {
                        throw new Error(`Session creation failed after ${maxRetries} attempts: ${sessionError.message}`);
                    }
                    continue; // Try again
                }

                console.log(`✅ Session created successfully on attempt ${attempt}:`, sessionData);

                // Add the host as a participant
                const { error: participantError } = await supabase
                    .from('session_participants')
                    .insert({
                        session_id: sessionData.id,
                        user_id: hostUser.id,
                        user_name: hostUser.name,
                        user_email: hostUser.email,
                        is_active: true,
                        current_swipe_count: 0,
                    });

                if (participantError) {
                    console.error(`❌ Failed to add participant on attempt ${attempt}:`, participantError);

                    if (attempt === maxRetries) {
                        throw new Error(`Failed to add host as participant: ${participantError.message}`);
                    }
                    continue; // Try again
                }

                console.log(`✅ Host added as participant successfully on attempt ${attempt}`);

                return {
                    id: sessionData.id,
                    hostId: sessionData.host_id,
                    participants: [],
                    matches: [],
                    createdAt: new Date(sessionData.created_at),
                    active: sessionData.active,
                    maxParticipants: sessionData.max_participants,
                    requiresAllToMatch: sessionData.requires_all_to_match,
                    sessionCode: sessionData.session_code,
                };

            } catch (error) {
                console.error(`❌ Attempt ${attempt} threw error:`, error);

                if (attempt === maxRetries) {
                    console.error('❌ All retry attempts exhausted');
                    throw error;
                }
            }
        }

        throw new Error('Unexpected error in retry logic');
    }

    /**
     * Test connection with multiple methods
     */
    static async comprehensiveConnectionTest() {
        console.log('🔍 Running comprehensive connection test...');

        const tests = [
            {
                name: 'Basic Select',
                test: () => supabase.from('sessions').select('count').limit(1)
            },
            {
                name: 'Health Check',
                test: () => supabase.from('sessions').select('id').limit(0)
            },
            {
                name: 'Schema Info',
                test: () => supabase.rpc('version')
            }
        ];

        const results = [];

        for (const test of tests) {
            try {
                console.log(`🧪 Testing: ${test.name}...`);
                const start = Date.now();
                const { error } = await test.test();
                const duration = Date.now() - start;

                if (error) {
                    console.error(`❌ ${test.name} failed:`, error);
                    results.push({ name: test.name, success: false, error: error.message, duration });
                } else {
                    console.log(`✅ ${test.name} passed (${duration}ms)`);
                    results.push({ name: test.name, success: true, duration });
                }
            } catch (error) {
                console.error(`❌ ${test.name} threw error:`, error);
                results.push({
                    name: test.name,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    duration: 0
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`📊 Connection test results: ${successCount}/${tests.length} passed`);

        return {
            success: successCount > 0,
            results,
            summary: `${successCount}/${tests.length} tests passed`
        };
    }
}
