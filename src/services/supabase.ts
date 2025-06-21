import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
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
});

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
