import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Types
import { RootStackParamList, BottomTabParamList } from '../types';

// Context
import { useAuth } from '../context/AuthContext';

// Screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import SwipeScreen from '../screens/SwipeScreen';
import MatchScreen from '../screens/MatchScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Create stack and tab navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// Main App Stack - Handles the main authenticated flow
const MainAppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Tinder for Dinner',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="Swipe" 
        component={SwipeScreen}
        options={{ 
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <Stack.Screen 
        name="Match" 
        component={MatchScreen}
        options={{ 
          title: 'It\'s a Match!',
          headerBackTitle: 'Back',
          headerTintColor: '#FF6B6B',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="RecipeDetail" 
        component={RecipeDetailScreen}
        options={{ 
          title: 'Recipe Details',
          headerBackTitle: 'Back',
          headerTintColor: '#FF6B6B',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          paddingVertical: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={MainAppStack} 
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          headerShown: true,
          headerTitle: 'My Profile',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You can return a loading screen here while checking auth state
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is authenticated
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs} 
            />
            {/* Additional screens that should be accessible without tabs */}
            <Stack.Screen 
              name="Swipe" 
              component={SwipeScreen} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Match" component={MatchScreen} />
          </>
        ) : (
          // User is not authenticated
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
