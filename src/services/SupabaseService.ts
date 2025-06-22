import { supabase } from './supabase';
import { User, Recipe, SwipeSession, SessionParticipant } from '../types';

export class SupabaseService {
    // Session Management
    static async createSession(hostUser: User, sessionCode: string, maxParticipants: number = 4, requiresAllToMatch: boolean = false): Promise<SwipeSession | null> {
        try {
            console.log('🔧 Creating session with:', {
                sessionCode,
                hostUserId: hostUser.id,
                maxParticipants,
                requiresAllToMatch
            });

            console.log('🚀 Attempting direct session creation in Supabase...');

            // Create the session
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
                console.error('❌ Error creating session:', sessionError);
                throw new Error(`Session creation failed: ${sessionError.message}`);
            }

            console.log('✅ Session created successfully:', sessionData);

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
                console.error('❌ Error adding host as participant:', participantError);
                throw new Error(`Failed to add host as participant: ${participantError.message}`);
            }

            console.log('✅ Host added as participant successfully');

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
            console.error('❌ Error in createSession:', error);

            // More detailed error logging
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }

            // Check if it's a network error
            if (error instanceof TypeError && error.message.includes('Network request failed')) {
                console.error('🌐 Network connectivity issue detected');
                console.error('Please check:');
                console.error('1. Internet connection');
                console.error('2. Supabase URL and credentials');
                console.error('3. Firewall/proxy settings');
            }

            throw error; // Re-throw to be handled by the calling function
        }
    }

    static async joinSession(sessionCode: string, user: User): Promise<SwipeSession | null> {
        try {
            // Find the session by code
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .select('*')
                .eq('session_code', sessionCode)
                .single();

            if (sessionError || !sessionData) {
                console.error('Session not found:', sessionError);
                return null;
            }

            // Check if session is full
            const { data: participants, error: participantsError } = await supabase
                .from('session_participants')
                .select('*')
                .eq('session_id', sessionData.id)
                .eq('is_active', true);

            if (participantsError) {
                console.error('Error fetching participants:', participantsError);
                return null;
            }

            if (participants && participants.length >= sessionData.max_participants) {
                console.error('Session is full');
                return null;
            }

            // Check if user is already in the session
            const existingParticipant = participants?.find(p => p.user_id === user.id);
            if (existingParticipant) {
                // User is already in session, just return the session
                return await this.getSession(sessionData.id);
            }

            // Add user to the session
            const { error: joinError } = await supabase
                .from('session_participants')
                .insert({
                    session_id: sessionData.id,
                    user_id: user.id,
                    user_name: user.name,
                    user_email: user.email,
                    is_active: true,
                    current_swipe_count: 0,
                });

            if (joinError) {
                console.error('Error joining session:', joinError);
                return null;
            }

            return await this.getSession(sessionData.id);
        } catch (error) {
            console.error('Error in joinSession:', error);
            return null;
        }
    }

    static async getSession(sessionId: string): Promise<SwipeSession | null> {
        try {
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (sessionError || !sessionData) {
                return null;
            }

            const { data: participants, error: participantsError } = await supabase
                .from('session_participants')
                .select('*')
                .eq('session_id', sessionId)
                .eq('is_active', true);

            if (participantsError) {
                console.error('Error fetching participants:', participantsError);
                return null;
            }

            const { data: matches, error: matchesError } = await supabase
                .from('session_matches')
                .select('recipe_id')
                .eq('session_id', sessionId);

            if (matchesError) {
                console.error('Error fetching matches:', matchesError);
                return null;
            }

            return {
                id: sessionData.id,
                hostId: sessionData.host_id,
                participants: participants?.map(p => ({
                    id: p.id,
                    user: {
                        id: p.user_id,
                        name: p.user_name,
                        email: p.user_email,
                    },
                    joinedAt: new Date(p.joined_at),
                    isActive: p.is_active,
                    currentSwipeCount: p.current_swipe_count,
                    likes: [], // We'll fetch this separately if needed
                    dislikes: [], // We'll fetch this separately if needed
                })) || [],
                matches: matches?.map(m => m.recipe_id) || [],
                createdAt: new Date(sessionData.created_at),
                active: sessionData.active,
                maxParticipants: sessionData.max_participants,
                requiresAllToMatch: sessionData.requires_all_to_match,
                sessionCode: sessionData.session_code,
            };
        } catch (error) {
            console.error('Error in getSession:', error);
            return null;
        }
    }

    static async startSession(sessionId: string, hostUserId: string): Promise<boolean> {
        try {
            // Verify that the requester is the host
            const { data: session, error: sessionError } = await supabase
                .from('sessions')
                .select('host_id')
                .eq('id', sessionId)
                .single();

            if (sessionError || !session || session.host_id !== hostUserId) {
                console.error('Unauthorized: Only host can start session');
                return false;
            }

            // Start the session
            const { error } = await supabase
                .from('sessions')
                .update({ active: true })
                .eq('id', sessionId);

            if (error) {
                console.error('Error starting session:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in startSession:', error);
            return false;
        }
    }

    static async leaveSession(sessionId: string, userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('session_participants')
                .update({ is_active: false })
                .eq('session_id', sessionId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error leaving session:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in leaveSession:', error);
            return false;
        }
    }

    static async removeParticipant(sessionId: string, participantUserId: string, hostUserId: string): Promise<boolean> {
        try {
            // First verify that the requester is the host
            const { data: session, error: sessionError } = await supabase
                .from('sessions')
                .select('host_id')
                .eq('id', sessionId)
                .single();

            if (sessionError || !session || session.host_id !== hostUserId) {
                console.error('Unauthorized: Only host can remove participants');
                return false;
            }

            // Remove the participant
            const { error } = await supabase
                .from('session_participants')
                .update({ is_active: false })
                .eq('session_id', sessionId)
                .eq('user_id', participantUserId);

            if (error) {
                console.error('Error removing participant:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in removeParticipant:', error);
            return false;
        }
    }

    static async getSessionByCode(sessionCode: string): Promise<SwipeSession | null> {
        try {
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .select('*')
                .eq('session_code', sessionCode)
                .single();

            if (sessionError || !sessionData) {
                return null;
            }

            return await this.getSession(sessionData.id);
        } catch (error) {
            console.error('Error in getSessionByCode:', error);
            return null;
        }
    }

    // Swipe Management
    static async recordSwipe(sessionId: string, userId: string, recipeId: string, isLike: boolean): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('session_swipes')
                .insert({
                    session_id: sessionId,
                    user_id: userId,
                    recipe_id: recipeId,
                    is_like: isLike,
                });

            if (error) {
                console.error('Error recording swipe:', error);
                return false;
            }

            // Update participant swipe count
            const { error: updateError } = await supabase
                .rpc('increment_swipe_count', {
                    p_session_id: sessionId,
                    p_user_id: userId,
                });

            if (updateError) {
                console.error('Error updating swipe count:', updateError);
            }

            return true;
        } catch (error) {
            console.error('Error in recordSwipe:', error);
            return false;
        }
    }

    static async checkForMatch(sessionId: string, recipeId: string): Promise<boolean> {
        try {
            // Get all participants in the session
            const { data: participants, error: participantsError } = await supabase
                .from('session_participants')
                .select('user_id')
                .eq('session_id', sessionId)
                .eq('is_active', true);

            if (participantsError || !participants) {
                return false;
            }

            // Get all likes for this recipe in this session
            const { data: likes, error: likesError } = await supabase
                .from('session_swipes')
                .select('user_id')
                .eq('session_id', sessionId)
                .eq('recipe_id', recipeId)
                .eq('is_like', true);

            if (likesError || !likes) {
                return false;
            }

            // Get session settings
            const { data: session, error: sessionError } = await supabase
                .from('sessions')
                .select('requires_all_to_match')
                .eq('id', sessionId)
                .single();

            if (sessionError || !session) {
                return false;
            }

            const requiredLikes = session.requires_all_to_match ? participants.length : Math.ceil(participants.length / 2);
            const hasMatch = likes.length >= requiredLikes;

            if (hasMatch) {
                // Record the match
                const { error: matchError } = await supabase
                    .from('session_matches')
                    .insert({
                        session_id: sessionId,
                        recipe_id: recipeId,
                    });

                if (matchError) {
                    console.error('Error recording match:', matchError);
                }
            }

            return hasMatch;
        } catch (error) {
            console.error('Error in checkForMatch:', error);
            return false;
        }
    }

    // Real-time subscriptions
    static subscribeToSession(sessionId: string, callback: (session: SwipeSession | null) => void) {
        const sessionChannel = supabase
            .channel(`session-${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'sessions',
                    filter: `id=eq.${sessionId}`,
                },
                () => {
                    // Refetch session data when changes occur
                    this.getSession(sessionId).then(callback);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'session_participants',
                    filter: `session_id=eq.${sessionId}`,
                },
                () => {
                    // Refetch session data when participants change
                    this.getSession(sessionId).then(callback);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'session_matches',
                    filter: `session_id=eq.${sessionId}`,
                },
                () => {
                    // Refetch session data when matches are found
                    this.getSession(sessionId).then(callback);
                }
            )
            .subscribe();

        return sessionChannel;
    }

    static unsubscribeFromSession(channel: any) {
        supabase.removeChannel(channel);
    }
}
