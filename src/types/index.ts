// Define types for our application
export interface Recipe {
  id: string;
  title: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  summary: string;
  diets: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface SessionParticipant {
  id: string;
  user: User;
  joinedAt: Date;
  isActive: boolean;
  currentSwipeCount: number;
  likes: string[]; // Recipe IDs they liked
  dislikes: string[]; // Recipe IDs they disliked
}

export interface SwipeSession {
  id: string;
  hostId: string;
  participants: SessionParticipant[];
  matches: string[]; // Array of recipe IDs that were matched by all participants
  createdAt: Date;
  active: boolean;
  maxParticipants: number;
  requiresAllToMatch: boolean; // If true, all participants must like a recipe for it to be a match
  sessionCode: string; // Human-readable code for joining
}

// Navigation Types
export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;

  // Main App Stack
  MainTabs: undefined;

  // Individual Screens
  Home: undefined;
  SessionLobby: { sessionId: string; isHost: boolean };
  Swipe: { sessionId: string };
  Match: { recipe: Recipe };
  RecipeDetail: { recipe: Recipe };
  Profile: undefined;
};

// Bottom Tab Navigator Types
export type BottomTabParamList = {
  HomeTab: undefined;
  ProfileTab: undefined;
};

// Screen Props Types
export type AuthScreenNavigationProp = import('@react-navigation/stack').StackNavigationProp<
  RootStackParamList,
  'Auth'
>;

export type HomeScreenNavigationProp = import('@react-navigation/stack').StackNavigationProp<
  RootStackParamList,
  'Home'
>;

export type SwipeScreenRouteProp = import('@react-navigation/native').RouteProp<
  RootStackParamList,
  'Swipe'
>;

export type MatchScreenRouteProp = import('@react-navigation/native').RouteProp<
  RootStackParamList,
  'Match'
>;

export type RecipeDetailScreenRouteProp = import('@react-navigation/native').RouteProp<
  RootStackParamList,
  'RecipeDetail'
>;

export type ProfileScreenNavigationProp = import('@react-navigation/stack').StackNavigationProp<
  RootStackParamList,
  'Profile'
>;
