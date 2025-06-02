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

export interface SwipeSession {
  id: string;
  userIds: string[];
  matches: string[]; // Array of recipe IDs that were matched
  createdAt: Date;
  active: boolean;
}

// Navigation Types
export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;
  
  // Main App Stack
  MainTabs: undefined;
  
  // Individual Screens
  Home: undefined;
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
