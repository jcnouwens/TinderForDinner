import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging for environment variables
console.log('🔍 Supabase Configuration Debug:');
console.log('- URL loaded:', !!supabaseUrl, supabaseUrl ? `(${supabaseUrl})` : '(missing)');
console.log('- Key loaded:', !!supabaseAnonKey, supabaseAnonKey ? '(present)' : '(missing)');

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
        },
    },
});

// Test the connection immediately when the module loads
(async () => {
    try {
        const { error } = await supabase.from('sessions').select('count').limit(1);
        if (error) {
            console.error('❌ Initial Supabase connection test failed:', error);
        } else {
            console.log('✅ Initial Supabase connection test passed');
        }
    } catch (error) {
        console.error('❌ Initial Supabase connection threw error:', error);
    }
})();

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
