/**
 * Mock Supabase Service for offline development
 * Use this when network connectivity issues prevent normal operation
 */

import { User, Recipe, SwipeSession, SessionParticipant } from '../types';

// In-memory storage for mock data
let mockSessions: SwipeSession[] = [];
let mockParticipants: SessionParticipant[] = [];

export class MockSupabaseService {
    // Session Management
    static async createSession(hostUser: User, sessionCode: string, maxParticipants: number = 4, requiresAllToMatch: boolean = false): Promise<SwipeSession | null> {
        try {
            console.log('🔧 [MOCK] Creating session with:', {
                sessionCode,
                hostUserId: hostUser.id,
                maxParticipants,
                requiresAllToMatch
            });

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const session: SwipeSession = {
                id: `mock-session-${Date.now()}`,
                hostId: hostUser.id,
                participants: [],
                matches: [],
                createdAt: new Date(),
                active: false,
                maxParticipants,
                requiresAllToMatch,
                sessionCode,
            };

            // Add host as participant
            const hostParticipant: SessionParticipant = {
                id: `mock-participant-${Date.now()}`,
                user: hostUser,
                joinedAt: new Date(),
                isActive: true,
                currentSwipeCount: 0,
                likes: [],
                dislikes: [],
            };

            session.participants = [hostParticipant];
            mockSessions.push(session);
            mockParticipants.push(hostParticipant);

            console.log('✅ [MOCK] Session created successfully:', session);
            return session;
        } catch (error) {
            console.error('❌ [MOCK] Error in createSession:', error);
            throw error;
        }
    }

    static async joinSession(sessionCode: string, user: User): Promise<SwipeSession | null> {
        try {
            console.log('🔧 [MOCK] Joining session with code:', sessionCode);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const session = mockSessions.find(s => s.sessionCode === sessionCode);
            if (!session) {
                console.error('❌ [MOCK] Session not found');
                return null;
            }

            // Check if user already in session
            const existingParticipant = session.participants.find(p => p.user.id === user.id);
            if (existingParticipant) {
                console.log('✅ [MOCK] User already in session');
                return session;
            }

            // Check if session is full
            if (session.participants.length >= session.maxParticipants) {
                console.error('❌ [MOCK] Session is full');
                return null;
            }

            // Add participant
            const participant: SessionParticipant = {
                id: `mock-participant-${Date.now()}`,
                user: user,
                joinedAt: new Date(),
                isActive: true,
                currentSwipeCount: 0,
                likes: [],
                dislikes: [],
            };

            session.participants.push(participant);
            mockParticipants.push(participant);

            console.log('✅ [MOCK] User joined session successfully');
            return session;
        } catch (error) {
            console.error('❌ [MOCK] Error in joinSession:', error);
            return null;
        }
    }

    static async getSession(sessionId: string): Promise<SwipeSession | null> {
        const session = mockSessions.find(s => s.id === sessionId);
        return session || null;
    }

    static subscribeToSession(sessionId: string, callback: (session: SwipeSession | null) => void) {
        // Mock real-time subscription - just call callback immediately
        const session = mockSessions.find(s => s.id === sessionId);
        setTimeout(() => callback(session || null), 100);

        // Return mock channel
        return {
            unsubscribe: () => {
                console.log('🔧 [MOCK] Unsubscribed from session');
            }
        };
    }

    // Add other methods as needed for mock functionality
    static async removeParticipant(sessionId: string, participantId: string): Promise<boolean> {
        console.log('🔧 [MOCK] Removing participant:', participantId);

        const session = mockSessions.find(s => s.id === sessionId);
        if (!session) return false;

        session.participants = session.participants.filter(p => p.id !== participantId);
        return true;
    }

    static async startSession(sessionId: string): Promise<boolean> {
        console.log('🔧 [MOCK] Starting session:', sessionId);

        const session = mockSessions.find(s => s.id === sessionId);
        if (!session) return false;

        session.active = true;
        return true;
    }
}

/**
 * Toggle between real and mock Supabase service
 */
export const useMockMode = (): boolean => {
    // You can change this to true to enable mock mode
    return false;
};
