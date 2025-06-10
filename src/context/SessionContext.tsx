import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Recipe } from '../types';

// Define the shape of a session
type Session = {
  id: string;
  userIds: string[];
  matches: string[]; // Array of recipe IDs that were matched
  active: boolean;
  createdAt: Date;
};

// Define the shape of our session context
type SessionContextData = {
  currentSession: Session | null;
  currentRecipe: Recipe | null;
  isLoading: boolean;
  isSwiping: boolean;
  createSession: (userId: string) => Promise<string>; // Returns session ID
  joinSession: (sessionId: string, userId: string) => Promise<boolean>;
  leaveSession: () => void;
  swipeRight: (recipeId: string) => Promise<boolean>; // Returns true if it's a match
  swipeLeft: (recipeId: string) => void;
  fetchNextRecipe: () => Promise<void>;
};

// Create the context with a default value
const SessionContext = createContext<SessionContextData>({} as SessionContextData);

// Custom hook to use the session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context || Object.keys(context).length === 0) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

// Session provider component
type SessionProviderProps = {
  children: ReactNode;
};

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);

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
      // Add more mock recipes as needed
    ];

    setRecipes(mockRecipes);
    if (mockRecipes.length > 0) {
      setCurrentRecipe(mockRecipes[0]);
    }
  }, []);

  // Create a new session
  const createSession = async (userId: string): Promise<string> => {
    try {
      setIsLoading(true);

      // In a real app, you would call your backend API to create a session
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate a random session ID
      const sessionId = `sess_${Math.random().toString(36).substr(2, 9)}`;

      const newSession: Session = {
        id: sessionId,
        userIds: [userId],
        matches: [],
        active: true,
        createdAt: new Date(),
      };

      setCurrentSession(newSession);

      return sessionId;

    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create a new session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Join an existing session
  const joinSession = async (sessionId: string, userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // In a real app, you would validate the session ID with your backend
      await new Promise(resolve => setTimeout(resolve, 500));

      // For demo purposes, we'll simulate joining a session
      const existingSession: Session = {
        id: sessionId,
        userIds: ['user1', userId], // Add the current user to the session
        matches: [],
        active: true,
        createdAt: new Date(),
      };

      setCurrentSession(existingSession);

      return true;

    } catch (error) {
      console.error('Error joining session:', error);
      throw new Error('Failed to join the session. Please check the session ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Leave the current session
  const leaveSession = () => {
    // In a real app, you would notify the backend that the user left
    setCurrentSession(null);
    setCurrentRecipe(recipes[0] || null);
    setCurrentRecipeIndex(0);
  };

  // Handle swipe right (like)
  const swipeRight = async (recipeId: string): Promise<boolean> => {
    try {
      setIsSwiping(true);

      // In a real app, you would send this to your backend to check for matches
      await new Promise(resolve => setTimeout(resolve, 500));

      // For demo purposes, we'll simulate a 30% chance of a match
      const isMatch = Math.random() < 0.3;

      if (isMatch && currentSession) {
        // Add to matches
        const updatedSession = {
          ...currentSession,
          matches: [...currentSession.matches, recipeId],
        };

        setCurrentSession(updatedSession);
        return true;
      }

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
    // In a real app, you might want to track dislikes
    console.log('Disliked recipe:', recipeId);
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

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        currentRecipe,
        isLoading,
        isSwiping,
        createSession,
        joinSession,
        leaveSession,
        swipeRight,
        swipeLeft,
        fetchNextRecipe,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default SessionContext;
