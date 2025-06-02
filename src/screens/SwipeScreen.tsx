import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

type SwipeScreenRouteProp = RouteProp<RootStackParamList, 'Swipe'>;
type SwipeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Swipe'>;

// Mock data - in a real app, this would come from an API
const MOCK_RECIPES: any[] = [
  {
    id: '1',
    title: 'Creamy Garlic Pasta',
    image: 'https://spoonacular.com/recipeImages/716429-556x370.jpg',
    readyInMinutes: 25,
    servings: 2,
    sourceUrl: 'https://spoonacular.com/creamy-garlic-pasta-716429',
  },
  {
    id: '2',
    title: 'Avocado Toast with Egg',
    image: 'https://spoonacular.com/recipeImages/716300-556x370.jpg',
    readyInMinutes: 15,
    servings: 2,
    sourceUrl: 'https://spoonacular.com/avocado-toast-with-egg-716300',
  },
  {
    id: '3',
    title: 'Chicken Tikka Masala',
    image: 'https://spoonacular.com/recipeImages/715594-556x370.jpg',
    readyInMinutes: 40,
    servings: 4,
    sourceUrl: 'https://spoonacular.com/chicken-tikka-masala-715594',
  },
  {
    id: '4',
    title: 'Vegetable Stir Fry',
    image: 'https://spoonacular.com/recipeImages/716304-556x370.jpg',
    readyInMinutes: 20,
    servings: 2,
    sourceUrl: 'https://spoonacular.com/vegetable-stir-fry-716304',
  },
  {
    id: '5',
    title: 'Classic Margherita Pizza',
    image: 'https://spoonacular.com/recipeImages/715594-556x370.jpg',
    readyInMinutes: 30,
    servings: 4,
    sourceUrl: 'https://spoonacular.com/classic-margherita-pizza-715594',
  },
  {
    id: '6',
    title: 'Beef Tacos',
    image: 'https://spoonacular.com/recipeImages/715594-556x370.jpg',
    readyInMinutes: 25,
    servings: 4,
    sourceUrl: 'https://spoonacular.com/beef-tacos-715594',
  },
  {
    id: '7',
    title: 'Greek Salad',
    image: 'https://spoonacular.com/recipeImages/715594-556x370.jpg',
    readyInMinutes: 15,
    servings: 2,
    sourceUrl: 'https://spoonacular.com/greek-salad-715594',
  },
  {
    id: '8',
    title: 'Chocolate Chip Cookies',
    image: 'https://spoonacular.com/recipeImages/715594-556x370.jpg',
    readyInMinutes: 30,
    servings: 24,
    sourceUrl: 'https://spoonacular.com/chocolate-chip-cookies-715594',
  }
];

const SwipeScreen = () => {
  const route = useRoute<SwipeScreenRouteProp>();
  const navigation = useNavigation<SwipeScreenNavigationProp>();
  
  // Get sessionId with a safe default
  const sessionId = route.params?.sessionId;
  
  // Handle missing sessionId
  useEffect(() => {
    if (!sessionId) {
      console.warn('No sessionId provided, navigating back');
      navigation.goBack();
    }
  }, [sessionId, navigation]);
  
  // Early return if no sessionId
  if (!sessionId) {
    return null;
  }
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recipes, setRecipes] = useState(MOCK_RECIPES);
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = translateX.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-20deg', '0deg', '20deg'],
    extrapolate: 'clamp',
  });

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      
      if (translationX > SWIPE_THRESHOLD) {
        // Swiped right (like)
        handleSwipe('right');
      } else if (translationX < -SWIPE_THRESHOLD) {
        // Swiped left (dislike)
        handleSwipe('left');
      } else {
        // Return to center
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const newX = direction === 'right' ? width * 1.5 : -width * 1.5;
    
    Animated.timing(translateX, {
      toValue: newX,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // After animation completes, handle the action
      if (direction === 'right') {
        // In a real app, this would communicate with your backend
        console.log('Liked:', recipes[currentIndex].title);
      }
      
      // Move to next card or reset if at the end
      if (currentIndex < recipes.length - 1) {
        setCurrentIndex(currentIndex + 1);
        translateX.setValue(0);
      } else {
        // Reset or fetch more recipes
        setCurrentIndex(0);
        translateX.setValue(0);
      }
    });
  };

  const renderCard = (recipe: any, index: number) => {
    if (index < currentIndex) {
      return null;
    }

    if (index === currentIndex) {
      // Current active card
      return (
        <PanGestureHandler
          key={recipe.id}
          onGestureEvent={Animated.event(
            [{ nativeEvent: { translationX: translateX } }],
            { useNativeDriver: true }
          )}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { translateX },
                  { rotate },
                ],
              },
            ]}
          >
            <Image source={{ uri: recipe.image }} style={styles.image} />
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <Text style={styles.recipeMeta}>
                {recipe.readyInMinutes} min • {recipe.servings} servings
              </Text>
            </View>
          </Animated.View>
        </PanGestureHandler>
      );
    }

    // Upcoming cards
    return (
      <Animated.View
        key={recipe.id}
        style={[
          styles.card,
          styles.upcomingCard,
          { zIndex: -index },
        ]}
      >
        <Image source={{ uri: recipe.image }} style={styles.image} />
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Text style={styles.recipeMeta}>
            {recipe.readyInMinutes} min • {recipe.servings} servings
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        {recipes.map((recipe, index) => renderCard(recipe, index))}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.dislikeButton]} 
          onPress={() => handleSwipe('left')}
        >
          <Text style={styles.buttonText}>👎</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.likeButton]} 
          onPress={() => handleSwipe('right')}
        >
          <Text style={styles.buttonText}>👍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SwipeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  card: {
    width: width * 0.9,
    height: height * 0.6,
    backgroundColor: '#fff',
    borderRadius: 15,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  upcomingCard: {
    transform: [{ scale: 0.9 }],
    opacity: 0.8,
  },
  image: {
    width: '100%',
    height: '80%',
    resizeMode: 'cover',
  },
  recipeInfo: {
    padding: 15,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  recipeMeta: {
    fontSize: 14,
    color: '#666',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 20,
    marginBottom: 30,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  likeButton: {
    backgroundColor: '#FF6B6B',
  },
  dislikeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 30,
  },
});


