import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Recipe, SwipeSession, SessionParticipant, User } from '../types';
import { SupabaseService } from '../services/SupabaseService';

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
  };

  // Create a new session
  const createSession = async (
    user: User,
    maxParticipants: number = 4,
    requiresAllToMatch: boolean = true
  ): Promise<string> => {
    try {
      setIsLoading(true);

      // Generate session code
      const sessionCode = generateSessionCode();

      // Create session using Supabase
      const session = await SupabaseService.createSession(
        user,
        sessionCode,
        maxParticipants,
        requiresAllToMatch
      );

      if (!session) {
        throw new Error('Failed to create session');
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
      setParticipants(session.participants);
      setIsHost(true);

      return sessionCode;
    } catch (error) {
      console.error('Error creating session:', error);
      Alert.alert('Error', 'Failed to create session. Please try again.');
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
    if (!currentSession) return;

    try {
      setIsLoading(true);

      // Unsubscribe from real-time updates
      if (supabaseChannel) {
        SupabaseService.unsubscribeFromSession(supabaseChannel);
        setSupabaseChannel(null);
      }

      // Leave session using Supabase
      await SupabaseService.leaveSession(currentSession.id);

      // Reset local state
      setCurrentSession(null);
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
    if (!isHost || !currentSession) {
      return false;
    }

    try {
      setIsLoading(true);

      // In a real app, you would call your backend API
      await new Promise(resolve => setTimeout(resolve, 300));

      const updatedParticipants = participants.filter(p => p.id !== participantId);
      const updatedSession: SwipeSession = {
        ...currentSession,
        participants: updatedParticipants
      };

      setCurrentSession(updatedSession);
      setParticipants(updatedParticipants);

      return true;
    } catch (error) {
      console.error('Error removing participant:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Start the session (host only)
  const startSession = async (): Promise<boolean> => {
    if (!isHost || !currentSession) {
      return false;
    }

    try {
      setIsLoading(true);

      // In a real app, you would call your backend API
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedSession: SwipeSession = {
        ...currentSession,
        active: true
      };

      setCurrentSession(updatedSession);

      return true;
    } catch (error) {
      console.error('Error starting session:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle swipe right (like)
  const swipeRight = async (recipeId: string): Promise<boolean> => {
    if (!currentSession) {
      return false;
    }

    try {
      setIsSwiping(true);

      // In a real app, you would send this to your backend to check for matches
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update current user's likes
      const updatedParticipants = participants.map(p => {
        if (p.id === currentSession.hostId || !isHost) { // Current user
          return {
            ...p,
            likes: [...p.likes, recipeId],
            currentSwipeCount: p.currentSwipeCount + 1
          };
        }
        return p;
      });

      setParticipants(updatedParticipants);

      // Check if it's a match based on session settings
      let isMatch = false;

      if (currentSession.requiresAllToMatch) {
        // All participants must like it
        const activeLikes = updatedParticipants
          .filter(p => p.isActive)
          .map(p => p.likes.includes(recipeId));
        isMatch = activeLikes.length > 0 && activeLikes.every(liked => liked);
      } else {
        // Just need majority or at least 2 people
        const likesCount = updatedParticipants
          .filter(p => p.isActive && p.likes.includes(recipeId)).length;
        isMatch = likesCount >= Math.max(2, Math.ceil(updatedParticipants.length / 2));
      }

      if (isMatch) {
        const updatedSession = {
          ...currentSession,
          matches: [...currentSession.matches, recipeId],
          participants: updatedParticipants
        };

        setCurrentSession(updatedSession);
        return true;
      }

      // Update session with new participant data
      const updatedSession = {
        ...currentSession,
        participants: updatedParticipants
      };
      setCurrentSession(updatedSession);

      return false;

    } catch (error) {
      console.error('Error swiping right:', error);
      return false;
    } finally {
      setIsSwiping(false);
    }
  };

  // Handle swipe left (dislike)
  const swipeLeft = (recipeId: string) => {
    if (!currentSession) return;

    // Update current user's dislikes
    const updatedParticipants = participants.map(p => {
      if (p.id === currentSession.hostId || !isHost) { // Current user
        return {
          ...p,
          dislikes: [...p.dislikes, recipeId],
          currentSwipeCount: p.currentSwipeCount + 1
        };
      }
      return p;
    });

    setParticipants(updatedParticipants);

    // Update session
    const updatedSession = {
      ...currentSession,
      participants: updatedParticipants
    };
    setCurrentSession(updatedSession);
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
        currentRecipe,
        isLoading,
        isSwiping,
        participants,
        isHost,
        createSession,
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
