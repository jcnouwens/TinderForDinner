import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging for environment variables
console.log('🔍 Supabase Configuration Debug:');
console.log('- URL loaded:', !!supabaseUrl, supabaseUrl ? `(${supabaseUrl})` : '(missing)');
console.log('- Key loaded:', !!supabaseAnonKey, supabaseAnonKey ? '(present)' : '(missing)');

// iOS Simulator Network Diagnostics
console.log('🔍 iOS Simulator Network Diagnostics:');
console.log('- User Agent:', navigator.userAgent);
console.log('- Network State:', navigator.onLine ? 'Online' : 'Offline');
console.log('- Platform:', typeof navigator !== 'undefined' ? navigator.platform : 'Unknown');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('Please ensure you have:');
    console.error('1. A .env file in your project root');
    console.error('2. EXPO_PUBLIC_SUPABASE_URL defined');
    console.error('3. EXPO_PUBLIC_SUPABASE_ANON_KEY defined');
    console.error('4. Restarted your development server after adding the .env file');
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
    db: {
        schema: 'public',
    },
    global: {
        headers: {
            'X-Client-Info': 'expo-react-native',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        fetch: async (url, options = {}) => {
            // Enhanced fetch for iOS simulator compatibility
            const timeoutMs = 8000; // Reduced to 8 second timeout for simulator
            const maxRetries = 1; // Reduced retries for faster fallback

            console.log('🌐 Supabase fetch attempt:', url);

            // Detect iOS simulator environment
            const isIOSSimulator = typeof navigator !== 'undefined' &&
                (navigator.userAgent === undefined || navigator.onLine === false);

            if (isIOSSimulator) {
                console.log('📱 iOS Simulator detected - using reduced timeout');
            }

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const controller = new AbortController();
                    const actualTimeout = isIOSSimulator ? timeoutMs / 2 : timeoutMs; // Even shorter for simulator

                    const timeoutId = setTimeout(() => {
                        console.log(`⏰ Fetch timeout after ${actualTimeout}ms (attempt ${attempt})`);
                        controller.abort();
                    }, actualTimeout);

                    const response = await fetch(url, {
                        ...options,
                        signal: controller.signal,
                        headers: {
                            ...options.headers,
                            'Cache-Control': 'no-cache',
                            'Connection': 'close', // Changed from keep-alive for simulator
                            'User-Agent': isIOSSimulator ? 'TinderForDinner/1.0 (iOS Simulator)' : 'TinderForDinner/1.0',
                        },
                        // Remove keepalive for iOS simulator
                        ...(isIOSSimulator ? {} : { keepalive: true }),
                    });

                    clearTimeout(timeoutId);
                    console.log(`✅ Fetch successful on attempt ${attempt}:`, response.status);
                    return response;

                } catch (error) {
                    console.error(`❌ Fetch attempt ${attempt} failed:`, error);

                    if (attempt === maxRetries) {
                        console.error('🚫 All fetch attempts failed, throwing error');
                        // For iOS simulator, fail fast to enable quick fallback
                        if (isIOSSimulator) {
                            console.log('📱 iOS Simulator - failing fast to enable mock service fallback');
                        }
                        throw error;
                    }

                    // Shorter wait for iOS simulator
                    const retryDelay = isIOSSimulator ? 500 : (attempt * 1000);
                    console.log(`⏳ Waiting ${retryDelay}ms before fetch retry...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }

            throw new Error('Fetch failed after all retries');
        },
    },
});

// Optional: Test the connection when explicitly requested
export const testSupabaseConnection = async () => {
    try {
        console.log('🔌 Testing Supabase connection...');
        const { error } = await supabase.from('sessions').select('count').limit(1);
        if (error) {
            console.error('❌ Supabase connection test failed:', error);
            return false;
        } else {
            console.log('✅ Supabase connection test passed');
            return true;
        }
    } catch (error) {
        console.error('❌ Supabase connection threw error:', error);
        return false;
    }
};

// iOS Simulator specific connection test
export const testIOSSimulatorConnection = async () => {
    console.log('📱 Testing iOS Simulator specific connection...');

    try {
        // Test basic network connectivity first
        console.log('🌐 Testing basic network connectivity...');

        const controller1 = new AbortController();
        const timeout1 = setTimeout(() => controller1.abort(), 5000);

        const testResponse = await fetch('https://httpbin.org/status/200', {
            method: 'GET',
            signal: controller1.signal,
        });
        clearTimeout(timeout1);
        console.log('✅ Basic network test passed:', testResponse.status);

        // Test Supabase URL reachability
        if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
            console.log('🏗️ Testing Supabase URL reachability...');

            const controller2 = new AbortController();
            const timeout2 = setTimeout(() => controller2.abort(), 5000);

            const supabaseTestResponse = await fetch(process.env.EXPO_PUBLIC_SUPABASE_URL + '/health', {
                method: 'GET',
                signal: controller2.signal,
            });
            clearTimeout(timeout2);
            console.log('✅ Supabase URL reachable:', supabaseTestResponse.status);
        }

        return true;
    } catch (error) {
        console.error('❌ iOS Simulator connection test failed:', error);
        return false;
    }
};

// Database types for TypeScript
export interface Database {
    public: {
        Tables: {
            sessions: {
                Row: {
                    id: string;
                    session_code: string;
                    host_id: string;
                    max_participants: number;
                    requires_all_to_match: boolean;
                    active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    session_code: string;
                    host_id: string;
                    max_participants?: number;
                    requires_all_to_match?: boolean;
                    active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    session_code?: string;
                    host_id?: string;
                    max_participants?: number;
                    requires_all_to_match?: boolean;
                    active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            session_participants: {
                Row: {
                    id: string;
                    session_id: string;
                    user_id: string;
                    user_name: string;
                    user_email: string;
                    joined_at: string;
                    is_active: boolean;
                    current_swipe_count: number;
                };
                Insert: {
                    id?: string;
                    session_id: string;
                    user_id: string;
                    user_name: string;
                    user_email: string;
                    joined_at?: string;
                    is_active?: boolean;
                    current_swipe_count?: number;
                };
                Update: {
                    id?: string;
                    session_id?: string;
                    user_id?: string;
                    user_name?: string;
                    user_email?: string;
                    joined_at?: string;
                    is_active?: boolean;
                    current_swipe_count?: number;
                };
            };
            session_swipes: {
                Row: {
                    id: string;
                    session_id: string;
                    user_id: string;
                    recipe_id: string;
                    is_like: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    session_id: string;
                    user_id: string;
                    recipe_id: string;
                    is_like: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    session_id?: string;
                    user_id?: string;
                    recipe_id?: string;
                    is_like?: boolean;
                    created_at?: string;
                };
            };
            session_matches: {
                Row: {
                    id: string;
                    session_id: string;
                    recipe_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    session_id: string;
                    recipe_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    session_id?: string;
                    recipe_id?: string;
                    created_at?: string;
                };
            };
        };
    };
}
