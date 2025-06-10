import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions, Modal, ScrollView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';

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
    summary: 'A rich and creamy pasta dish with garlic that\'s perfect for a cozy dinner.',
    ingredients: [
      '8 oz fettuccine pasta',
      '4 cloves garlic, minced',
      '1 cup heavy cream',
      '1/2 cup parmesan cheese',
      '2 tbsp butter',
      'Salt and pepper to taste',
      'Fresh parsley for garnish'
    ]
  },
  {
    id: '2',
    title: 'Avocado Toast with Egg',
    image: 'https://spoonacular.com/recipeImages/716300-556x370.jpg',
    readyInMinutes: 15,
    servings: 2,
    sourceUrl: 'https://spoonacular.com/avocado-toast-with-egg-716300',
    summary: 'A healthy and delicious breakfast or brunch option with creamy avocado and perfectly cooked eggs.',
    ingredients: [
      '2 slices whole grain bread',
      '1 ripe avocado',
      '2 eggs',
      '1 tsp lemon juice',
      'Salt and pepper to taste',
      'Red pepper flakes (optional)',
      'Everything bagel seasoning'
    ]
  },
  {
    id: '3',
    title: 'Chicken Tikka Masala',
    image: 'https://spoonacular.com/recipeImages/715594-556x370.jpg',
    readyInMinutes: 40,
    servings: 4,
    sourceUrl: 'https://spoonacular.com/chicken-tikka-masala-715594',
    summary: 'A flavorful Indian curry with tender chicken in a rich, creamy tomato-based sauce.',
    ingredients: [
      '1 lb chicken breast, cubed',
      '1 cup plain yogurt',
      '2 tsp garam masala',
      '1 can crushed tomatoes',
      '1 cup heavy cream',
      '1 onion, diced',
      '3 cloves garlic, minced',
      '1 inch ginger, grated',
      'Basmati rice for serving'
    ]
  },
  {
    id: '4',
    title: 'Vegetable Stir Fry',
    image: 'https://spoonacular.com/recipeImages/716304-556x370.jpg',
    readyInMinutes: 20,
    servings: 2,
    sourceUrl: 'https://spoonacular.com/vegetable-stir-fry-716304',
    summary: 'A quick and healthy stir fry packed with colorful vegetables and Asian flavors.',
    ingredients: [
      '2 cups mixed vegetables (broccoli, bell peppers, carrots)',
      '2 tbsp vegetable oil',
      '2 cloves garlic, minced',
      '1 tbsp soy sauce',
      '1 tsp sesame oil',
      '1 tsp cornstarch',
      'Green onions for garnish',
      'Sesame seeds for garnish'
    ]
  },
  {
    id: '5',
    title: 'Classic Margherita Pizza',
    image: 'https://spoonacular.com/recipeImages/715594-556x370.jpg',
    readyInMinutes: 30,
    servings: 4,
    sourceUrl: 'https://spoonacular.com/classic-margherita-pizza-715594',
    summary: 'A classic Italian pizza with fresh mozzarella, tomatoes, and basil.',
    ingredients: [
      '1 pizza dough',
      '1/2 cup pizza sauce',
      '8 oz fresh mozzarella',
      '2 fresh tomatoes, sliced',
      'Fresh basil leaves',
      '2 tbsp olive oil',
      'Salt and pepper to taste'
    ]
  },
  {
    id: '6',
    title: 'Beef Tacos',
    image: 'https://spoonacular.com/recipeImages/715594-556x370.jpg',
    readyInMinutes: 25,
    servings: 4,
    sourceUrl: 'https://spoonacular.com/beef-tacos-715594',
    summary: 'Delicious and easy beef tacos with seasoned ground beef and fresh toppings.',
    ingredients: [
      '1 lb ground beef',
      '8 taco shells',
      '1 packet taco seasoning',
      '1 cup shredded lettuce',
      '1 cup shredded cheese',
      '2 tomatoes, diced',
      '1/2 cup sour cream',
      'Salsa for serving'
    ]
  },
  {
    id: '7',
    title: 'Greek Salad',
    image: 'https://spoonacular.com/recipeImages/715594-556x370.jpg',
    readyInMinutes: 15,
    servings: 2,
    sourceUrl: 'https://spoonacular.com/greek-salad-715594',
    summary: 'A fresh and healthy Mediterranean salad with feta cheese and olives.',
    ingredients: [
      '2 cucumbers, chopped',
      '3 tomatoes, chopped',
      '1/2 red onion, sliced',
      '1/2 cup kalamata olives',
      '4 oz feta cheese, crumbled',
      '3 tbsp olive oil',
      '1 tbsp red wine vinegar',
      'Dried oregano'
    ]
  },
  {
    id: '8',
    title: 'Chocolate Chip Cookies',
    image: 'https://spoonacular.com/recipeImages/715594-556x370.jpg',
    readyInMinutes: 30,
    servings: 24,
    sourceUrl: 'https://spoonacular.com/chocolate-chip-cookies-715594',
    summary: 'Classic homemade chocolate chip cookies that are crispy on the outside and chewy on the inside.',
    ingredients: [
      '2 1/4 cups all-purpose flour',
      '1 cup butter, softened',
      '3/4 cup brown sugar',
      '1/2 cup white sugar',
      '2 eggs',
      '2 tsp vanilla extract',
      '1 tsp baking soda',
      '2 cups chocolate chips'
    ]
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
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

  const handleImagePress = (recipe: any) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRecipe(null);
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
            <TouchableOpacity
              onPress={() => handleImagePress(recipe)}
              activeOpacity={0.9}
              testID={`recipe-image-${index}`}
            >
              <Image source={{ uri: recipe.image }} style={styles.image} />
            </TouchableOpacity>
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
        <TouchableOpacity
          onPress={() => handleImagePress(recipe)}
          activeOpacity={0.9}
          testID={`recipe-image-${index}`}
        >
          <Image source={{ uri: recipe.image }} style={styles.image} />
        </TouchableOpacity>
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

      {/* Recipe Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRecipe && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton} testID="close-modal-button">
                    <MaterialIcons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScrollView}>
                  <Image source={{ uri: selectedRecipe.image }} style={styles.modalImage} />

                  <View style={styles.modalMeta}>
                    <View style={styles.modalMetaItem}>
                      <MaterialIcons name="schedule" size={20} color="#666" />
                      <Text style={styles.modalMetaText}>{selectedRecipe.readyInMinutes} min</Text>
                    </View>
                    <View style={styles.modalMetaItem}>
                      <MaterialIcons name="restaurant" size={20} color="#666" />
                      <Text style={styles.modalMetaText}>{selectedRecipe.servings} servings</Text>
                    </View>
                  </View>

                  {selectedRecipe.summary && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Description</Text>
                      <Text style={styles.modalDescription}>{selectedRecipe.summary}</Text>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Ingredients</Text>
                    {selectedRecipe.ingredients && selectedRecipe.ingredients.map((ingredient: string, index: number) => (
                      <View key={index} style={styles.ingredientItem}>
                        <View style={styles.bulletPoint} />
                        <Text style={styles.ingredientText}>{ingredient}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalScrollView: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  modalMetaText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  modalSection: {
    padding: 20,
    paddingTop: 0,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 15,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B6B',
    marginRight: 10,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});


