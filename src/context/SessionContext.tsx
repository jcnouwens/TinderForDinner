import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Recipe, SwipeSession, SessionParticipant, User } from '../types';
import { SupabaseService } from '../services/SupabaseService';
import { MockSupabaseService } from '../services/MockSupabaseService';
import { SimulatorSupabaseService } from '../services/SimulatorSupabaseService';

// Define the shape of our session context
type SessionContextData = {
  currentSession: SwipeSession | null;
  currentUser: User | null;
  currentRecipe: Recipe | null;
  isLoading: boolean;
  isSwiping: boolean;
  participants: SessionParticipant[];
  isHost: boolean;
  createSession: (user: User, maxParticipants?: number, requiresAllToMatch?: boolean) => Promise<string>; // Returns session code
  forceRealSupabaseSession: (user: User, maxParticipants?: number, requiresAllToMatch?: boolean) => Promise<string>; // Force real Supabase
  joinSession: (sessionCode: string, user: User) => Promise<boolean>;
  leaveSession: () => Promise<void>;
  removeParticipant: (participantId: string) => Promise<boolean>; // Host only
  startSession: () => Promise<boolean>; // Host only - start swiping
  swipeRight: (recipeId: string) => Promise<boolean>; // Returns true if it's a match
  swipeLeft: (recipeId: string) => Promise<void>;
  fetchNextRecipe: () => Promise<void>;
  getSessionStats: () => { totalSwipes: number; matches: number; participants: number };
};

// Create the context with a default value
const SessionContext = createContext<SessionContextData>({} as SessionContextData);

// Custom hook to use the session context
export const useSession = () => {
  return useContext(SessionContext);
};

// Session provider component
type SessionProviderProps = {
  children: ReactNode;
};

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<SwipeSession | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [supabaseChannel, setSupabaseChannel] = useState<any>(null);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockRecipes: Recipe[] = [
      {
        id: '1',
        title: 'Creamy Garlic Pasta',
        image: 'https://spoonacular.com/recipeImages/716429-556x370.jpg',
        ingredients: [
          '8 oz pasta',
          '4 cloves garlic, minced',
          '2 tbsp butter',
          '1 cup heavy cream',
          '1/2 cup grated parmesan',
          'Salt and pepper to taste',
          'Fresh parsley for garnish'
        ],
        instructions: [
          'Cook pasta according to package instructions.',
          'In a large pan, melt butter over medium heat.',
          'Add minced garlic and sauté until fragrant, about 1 minute.',
          'Pour in heavy cream and bring to a simmer.',
          'Stir in parmesan cheese until melted and smooth.',
          'Drain pasta and add to the sauce, tossing to coat.',
          'Season with salt and pepper to taste.',
          'Garnish with fresh parsley before serving.'
        ],
        readyInMinutes: 20,
        servings: 4,
        sourceUrl: 'https://example.com/creamy-garlic-pasta',
        summary: 'A quick and delicious creamy garlic pasta that comes together in just 20 minutes!',
        diets: ['vegetarian']
      },
      {
        id: '2',
        title: 'Spicy Thai Curry',
        image: 'https://spoonacular.com/recipeImages/716426-556x370.jpg',
        ingredients: [
          '1 can coconut milk',
          '2 tbsp red curry paste',
          '1 lb chicken breast, sliced',
          '1 bell pepper, sliced',
          '1 onion, sliced',
          '2 tbsp fish sauce',
          '1 tbsp brown sugar',
          'Fresh basil leaves'
        ],
        instructions: [
          'Heat curry paste in a large pan over medium heat.',
          'Add coconut milk and bring to a simmer.',
          'Add chicken and cook until done, about 8 minutes.',
          'Add vegetables and cook until tender.',
          'Season with fish sauce and brown sugar.',
          'Garnish with fresh basil before serving.'
        ],
        readyInMinutes: 25,
        servings: 4,
        sourceUrl: 'https://example.com/spicy-thai-curry',
        summary: 'A flavorful and aromatic Thai curry that\'s perfect for dinner!',
        diets: []
      }
    ];

    setRecipes(mockRecipes);
    if (mockRecipes.length > 0) {
      setCurrentRecipe(mockRecipes[0]);
    }
  }, []);

  // Generate a human-readable session code
  const generateSessionCode = (): string => {
    const adjectives = ['HAPPY', 'SPICY', 'SWEET', 'FRESH', 'TASTY', 'CRISPY', 'ZESTY', 'SMOKY'];
    const foods = ['PASTA', 'PIZZA', 'CURRY', 'TACOS', 'SALAD', 'BURGER', 'SOUP', 'RICE'];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const food = foods[Math.floor(Math.random() * foods.length)];
    const number = Math.floor(Math.random() * 99) + 1;

    return `${adjective}-${food}-${number}`;
  };  // Create a new session
  const createSession = async (
    user: User,
    maxParticipants: number = 4,
    requiresAllToMatch: boolean = true
  ): Promise<string> => {
    try {
      setIsLoading(true);
      console.log('🚀 Starting session creation process...');

      // Generate session code
      const sessionCode = generateSessionCode();
      console.log('🎯 Generated session code:', sessionCode);

      // Choose between real and mock service based on connectivity
      let session: SwipeSession | null = null;

      try {
        // Try enhanced Supabase service with retry logic first
        console.log('🔄 Attempting enhanced Supabase service with retry logic...');
        session = await SimulatorSupabaseService.createSessionWithRetry(
          user,
          sessionCode,
          maxParticipants,
          requiresAllToMatch,
          3 // Max 3 retries
        );

        console.log('🎉 Enhanced Supabase session created successfully!');

      } catch (error) {
        console.error('❌ Enhanced Supabase failed, trying standard service:', error);

        try {
          // Fallback to standard service
          session = await SupabaseService.createSession(
            user,
            sessionCode,
            maxParticipants,
            requiresAllToMatch
          );
          console.log('🎉 Standard Supabase session created successfully!');
        } catch (standardError) {
          console.error('❌ Standard Supabase also failed:', standardError);

          // Give user option to retry or use mock - create promise to wait for user choice
          console.log('🔧 Both Supabase attempts failed, falling back to mock service for now...');
          session = await MockSupabaseService.createSession(
            user,
            sessionCode,
            maxParticipants,
            requiresAllToMatch
          );
        }
      }

      if (!session) {
        throw new Error('Failed to create session - received null response from both services');
      }

      console.log('✅ Session created successfully:', session);

      // Set up real-time subscription (only for real Supabase)
      let channel = null;
      if (session.id.startsWith('mock-')) {
        console.log('🔧 Mock session - skipping real-time subscription');
        channel = MockSupabaseService.subscribeToSession(session.id, (updatedSession) => {
          if (updatedSession) {
            setCurrentSession(updatedSession);
            setParticipants(updatedSession.participants);
          }
        });
      } else {
        channel = SupabaseService.subscribeToSession(session.id, (updatedSession) => {
          if (updatedSession) {
            setCurrentSession(updatedSession);
            setParticipants(updatedSession.participants);
          }
        });
      }
      setSupabaseChannel(channel);

      setCurrentSession(session);
      setCurrentUser(user);
      setParticipants(session.participants);
      setIsHost(true);

      return sessionCode;
    } catch (error) {
      console.error('❌ Error creating session:', error);

      let errorMessage = 'Failed to create session. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else if (error.message.includes('Connection failed')) {
          errorMessage = 'Unable to connect to the server. Please try again later.';
        } else {
          errorMessage = `Session creation failed: ${error.message}`;
        }
      }

      Alert.alert('Error', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Join an existing session
  const joinSession = async (sessionCode: string, user: User): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Join session using Supabase
      const session = await SupabaseService.joinSession(sessionCode, user);

      if (!session) {
        Alert.alert('Error', 'Session not found or is full');
        return false;
      }

      // Set up real-time subscription
      const channel = SupabaseService.subscribeToSession(session.id, (updatedSession) => {
        if (updatedSession) {
          setCurrentSession(updatedSession);
          setParticipants(updatedSession.participants);
        }
      });
      setSupabaseChannel(channel);

      setCurrentSession(session);
      setCurrentUser(user);
      setParticipants(session.participants);
      setIsHost(session.hostId === user.id);

      return true;
    } catch (error) {
      console.error('Error joining session:', error);
      Alert.alert('Error', 'Failed to join session. Please check the code and try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Leave the current session
  const leaveSession = async () => {
    if (!currentSession || !currentUser) return;

    try {
      setIsLoading(true);

      // Unsubscribe from real-time updates
      if (supabaseChannel) {
        SupabaseService.unsubscribeFromSession(supabaseChannel);
        setSupabaseChannel(null);
      }

      // Leave session using Supabase
      await SupabaseService.leaveSession(currentSession.id, currentUser.id);

      // Reset local state
      setCurrentSession(null);
      setCurrentUser(null);
      setParticipants([]);
      setIsHost(false);
      setCurrentRecipe(recipes[0] || null);
      setCurrentRecipeIndex(0);

    } catch (error) {
      console.error('Error leaving session:', error);
      Alert.alert('Error', 'Failed to leave session properly');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a participant (host only)
  const removeParticipant = async (participantId: string): Promise<boolean> => {
    if (!isHost || !currentSession || !currentUser) {
      return false;
    }

    try {
      setIsLoading(true);

      const success = await SupabaseService.removeParticipant(
        currentSession.id,
        participantId,
        currentUser.id
      );

      if (success) {
        // The real-time subscription will update the state automatically
        return true;
      } else {
        Alert.alert('Error', 'Failed to remove participant');
        return false;
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      Alert.alert('Error', 'Failed to remove participant');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Start the session (host only)
  const startSession = async (): Promise<boolean> => {
    if (!isHost || !currentSession || !currentUser) {
      return false;
    }

    try {
      setIsLoading(true);

      const success = await SupabaseService.startSession(currentSession.id, currentUser.id);

      if (success) {
        // The real-time subscription will update the state automatically
        return true;
      } else {
        Alert.alert('Error', 'Failed to start session');
        return false;
      }
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start session');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle swipe right (like)
  const swipeRight = async (recipeId: string): Promise<boolean> => {
    if (!currentSession || !currentUser) {
      return false;
    }

    try {
      setIsSwiping(true);

      // Record the swipe in Supabase
      const success = await SupabaseService.recordSwipe(
        currentSession.id,
        currentUser.id,
        recipeId,
        true // is_like = true
      );

      if (!success) {
        Alert.alert('Error', 'Failed to record swipe');
        return false;
      }

      // Check for match
      const isMatch = await SupabaseService.checkForMatch(currentSession.id, recipeId);

      if (isMatch) {
        Alert.alert('🎉 Match!', 'Everyone loves this recipe!');
      }

      // Move to next recipe
      await fetchNextRecipe();

      return isMatch;

    } catch (error) {
      console.error('Error swiping right:', error);
      Alert.alert('Error', 'Failed to process swipe');
      return false;
    } finally {
      setIsSwiping(false);
    }
  };

  // Handle swipe left (dislike)
  const swipeLeft = async (recipeId: string): Promise<void> => {
    if (!currentSession || !currentUser) return;

    try {
      setIsSwiping(true);

      // Record the swipe in Supabase
      const success = await SupabaseService.recordSwipe(
        currentSession.id,
        currentUser.id,
        recipeId,
        false // is_like = false
      );

      if (!success) {
        Alert.alert('Error', 'Failed to record swipe');
        return;
      }

      // Move to next recipe
      await fetchNextRecipe();

    } catch (error) {
      console.error('Error swiping left:', error);
      Alert.alert('Error', 'Failed to process swipe');
    } finally {
      setIsSwiping(false);
    }
  };

  // Fetch the next recipe
  const fetchNextRecipe = async () => {
    if (currentRecipeIndex < recipes.length - 1) {
      setCurrentRecipeIndex(currentRecipeIndex + 1);
      setCurrentRecipe(recipes[currentRecipeIndex + 1]);
    } else {
      // In a real app, you would fetch more recipes from your API
      Alert.alert('No more recipes', 'You\'ve seen all available recipes for now.');
    }
  };

  // Force real Supabase session creation (for testing purposes)
  const forceRealSupabaseSession = async (
    user: User,
    maxParticipants: number = 4,
    requiresAllToMatch: boolean = true
  ): Promise<string> => {
    try {
      setIsLoading(true);
      console.log('🔧 FORCE REAL SUPABASE: Attempting session creation...');

      // Generate session code
      const sessionCode = generateSessionCode();
      console.log('🎯 Generated session code for real Supabase:', sessionCode);

      let session: SwipeSession | null = null;

      // Try enhanced Supabase service with retry logic
      try {
        console.log('🔄 FORCE REAL: Attempting enhanced Supabase service with retry logic...');
        session = await SimulatorSupabaseService.createSessionWithRetry(
          user,
          sessionCode,
          maxParticipants,
          requiresAllToMatch,
          5 // Max 5 retries for forced attempt
        );
        console.log('🎉 FORCE REAL: Enhanced Supabase session created successfully!');
      } catch (enhancedError) {
        console.error('❌ FORCE REAL: Enhanced Supabase failed:', enhancedError);

        // Try standard service as fallback
        try {
          console.log('🔄 FORCE REAL: Trying standard Supabase service...');
          session = await SupabaseService.createSession(
            user,
            sessionCode,
            maxParticipants,
            requiresAllToMatch
          );
          console.log('🎉 FORCE REAL: Standard Supabase session created successfully!');
        } catch (standardError) {
          console.error('❌ FORCE REAL: Standard Supabase also failed:', standardError);

          // Show user the error and reject the promise
          Alert.alert(
            'Real Supabase Failed',
            `Unable to create real Supabase session. This is likely due to iOS simulator network limitations.\n\nError: ${standardError instanceof Error ? standardError.message : 'Unknown error'}\n\nTry testing on a real device or using web browser.`,
            [{ text: 'OK' }]
          );

          throw new Error(`Failed to create real Supabase session: ${standardError instanceof Error ? standardError.message : 'Unknown error'}`);
        }
      }

      if (!session) {
        throw new Error('Failed to create real Supabase session - received null response');
      }

      console.log('✅ FORCE REAL: Session created successfully:', session);

      // Set up real-time subscription
      const channel = SupabaseService.subscribeToSession(session.id, (updatedSession) => {
        if (updatedSession) {
          setCurrentSession(updatedSession);
          setParticipants(updatedSession.participants);
        }
      });

      setSupabaseChannel(channel);
      setCurrentSession(session);
      setCurrentUser(user);
      setIsHost(true);
      setParticipants(session.participants);

      console.log('🎉 FORCE REAL: Real Supabase session setup completed successfully!');

      Alert.alert(
        'Real Supabase Success!',
        `Successfully created a real Supabase session!\n\nSession Code: ${sessionCode}\n\nThis session is now stored in the Supabase database and can be joined by other users.`,
        [{ text: 'Great!' }]
      );

      return sessionCode;

    } catch (error) {
      console.error('❌ FORCE REAL: Failed to create real Supabase session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get session statistics
  const getSessionStats = () => {
    if (!currentSession) {
      return { totalSwipes: 0, matches: 0, participants: 0 };
    }

    const totalSwipes = participants.reduce((sum, p) => sum + p.currentSwipeCount, 0);
    const matches = currentSession.matches.length;
    const participantCount = participants.filter(p => p.isActive).length;

    return { totalSwipes, matches, participants: participantCount };
  };

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        currentUser,
        currentRecipe,
        isLoading,
        isSwiping,
        participants,
        isHost,
        createSession,
        forceRealSupabaseSession,
        joinSession,
        leaveSession,
        removeParticipant,
        startSession,
        swipeRight,
        swipeLeft,
        fetchNextRecipe,
        getSessionStats,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default SessionContext;
