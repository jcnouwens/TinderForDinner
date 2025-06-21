import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

type SwipeScreenRouteProp = RouteProp<RootStackParamList, 'Swipe'>;
type SwipeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Swipe'>;

const SwipeScreen = () => {
  const route = useRoute<SwipeScreenRouteProp>();
  const navigation = useNavigation<SwipeScreenNavigationProp>();
  const { user } = useAuth();

  const {
    currentSession,
    currentRecipe,
    participants,
    isHost,
    isSwiping,
    swipeRight,
    swipeLeft,
    fetchNextRecipe,
    leaveSession,
    getSessionStats,
  } = useSession();

  // Get sessionId with a safe default
  const sessionId = route.params?.sessionId;

  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  // State
  const [showSessionInfo, setShowSessionInfo] = useState(false);

  // Handle missing sessionId or session
  useEffect(() => {
    if (!sessionId) {
      console.warn('No sessionId provided, navigating back');
      navigation.goBack();
      return;
    }

    // For solo sessions, we don't need session context
    if (sessionId === 'solo-session') {
      return;
    }

    // For multi-user sessions, check if we have a valid session
    if (!currentSession) {
      Alert.alert(
        'Session Not Found',
        'Unable to find your session. Please try joining again.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
      return;
    }

    // Check if session is active
    if (!currentSession.active && sessionId !== 'solo-session') {
      Alert.alert(
        'Session Not Active',
        'This session hasn\'t been started yet.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
  }, [sessionId, currentSession, navigation]);

  // Early return if no sessionId or recipe
  if (!sessionId || !currentRecipe) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading recipes...</Text>
      </View>
    );
  }

  const handleSwipeRight = async () => {
    if (isSwiping) return;

    if (sessionId === 'solo-session') {
      // Solo mode - just move to next recipe
      handleNextRecipe();
      return;
    }

    const isMatch = await swipeRight(currentRecipe.id);

    if (isMatch) {
      navigation.navigate('Match', { recipe: currentRecipe });
    } else {
      handleNextRecipe();
    }
  };

  const handleSwipeLeft = () => {
    if (isSwiping) return;

    if (sessionId !== 'solo-session') {
      swipeLeft(currentRecipe.id);
    }

    handleNextRecipe();
  };

  const handleNextRecipe = () => {
    // Animate card off screen first
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      fetchNextRecipe();
    });
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;

      if (Math.abs(translationX) > SWIPE_THRESHOLD) {
        // Animate card off screen
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: translationX > 0 ? width : -width,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: translationX > 0 ? 1 : -1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (translationX > 0) {
            handleSwipeRight();
          } else {
            handleSwipeLeft();
          }

          // Reset animations
          translateX.setValue(0);
          translateY.setValue(0);
          rotate.setValue(0);
        });
      } else {
        // Snap back to center
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  const handleLeaveSession = () => {
    Alert.alert(
      'Leave Session',
      'Are you sure you want to leave this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveSession();
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const SessionInfoBar = () => {
    if (sessionId === 'solo-session') {
      return (
        <View style={styles.sessionBar}>
          <Text style={styles.sessionTitle}>Solo Mode</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.leaveButton}>Exit</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!currentSession) return null;

    const stats = getSessionStats();

    return (
      <View style={styles.sessionBar}>
        <TouchableOpacity
          style={styles.sessionInfo}
          onPress={() => setShowSessionInfo(!showSessionInfo)}
        >
          <Text style={styles.sessionTitle}>{currentSession.sessionCode}</Text>
          <Text style={styles.sessionSubtitle}>
            {stats.participants} participants • {stats.matches} matches
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLeaveSession}>
          <Text style={styles.leaveButton}>Leave</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const ParticipantsList = () => {
    if (sessionId === 'solo-session' || !showSessionInfo || !currentSession) {
      return null;
    }

    return (
      <View style={styles.participantsOverlay}>
        <Text style={styles.participantsTitle}>Session Participants</Text>
        {participants.map((participant, index) => (
          <View key={participant.id} style={styles.participantRow}>
            <View style={styles.participantAvatar}>
              <Text style={styles.participantAvatarText}>
                {participant.user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.participantInfo}>
              <Text style={styles.participantName}>
                {participant.user.name}
                {participant.id === currentSession.hostId && ' (Host)'}
                {participant.id === user?.id && ' (You)'}
              </Text>
              <Text style={styles.participantStats}>
                {participant.currentSwipeCount} swipes • {participant.likes.length} likes
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Current recipe state and animations
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recipes, setRecipes] = useState([
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
  ]);

  // For solo mode, use local recipe management
  const currentDisplayRecipe = sessionId === 'solo-session'
    ? recipes[currentIndex]
    : currentRecipe;

  // Rotation interpolation handled above

  const handleSwipe = (direction: 'left' | 'right') => {
    const newX = direction === 'right' ? width * 1.5 : -width * 1.5;

    Animated.timing(translateX, {
      toValue: newX,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (sessionId === 'solo-session') {
        // Solo mode - just move to next recipe
        if (currentIndex < recipes.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0); // Loop back to start
        }
        translateX.setValue(0);
        rotate.setValue(0);
      } else {
        // Multi-user mode
        if (direction === 'right') {
          handleSwipeRight();
        } else {
          handleSwipeLeft();
        }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  sessionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  leaveButton: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  participantsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingTop: 100,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  participantsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  participantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  participantAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  participantStats: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 2,
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


