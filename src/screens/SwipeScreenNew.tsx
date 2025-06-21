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

// Mock data for solo mode
const MOCK_RECIPES = [
    {
        id: '1',
        title: 'Creamy Garlic Pasta',
        image: 'https://spoonacular.com/recipeImages/716429-556x370.jpg',
        readyInMinutes: 25,
        servings: 2,
        sourceUrl: 'https://spoonacular.com/creamy-garlic-pasta-716429',
        ingredients: ['8 oz pasta', '4 cloves garlic', '2 tbsp butter', '1 cup heavy cream', '1/2 cup parmesan'],
        instructions: ['Cook pasta', 'Sauté garlic', 'Add cream', 'Toss with pasta'],
        summary: 'A delicious creamy garlic pasta perfect for dinner.',
        diets: ['vegetarian'],
    },
    {
        id: '2',
        title: 'Avocado Toast with Egg',
        image: 'https://spoonacular.com/recipeImages/716300-556x370.jpg',
        readyInMinutes: 15,
        servings: 2,
        sourceUrl: 'https://spoonacular.com/avocado-toast-with-egg-716300',
        ingredients: ['2 slices bread', '1 avocado', '2 eggs', 'salt', 'pepper'],
        instructions: ['Toast bread', 'Mash avocado', 'Fry eggs', 'Assemble'],
        summary: 'Healthy and delicious avocado toast topped with a fried egg.',
        diets: ['vegetarian'],
    },
    {
        id: '3',
        title: 'Chicken Tikka Masala',
        image: 'https://spoonacular.com/recipeImages/715594-556x370.jpg',
        readyInMinutes: 40,
        servings: 4,
        sourceUrl: 'https://spoonacular.com/chicken-tikka-masala-715594',
        ingredients: ['1 lb chicken', '1 can coconut milk', '2 tbsp curry paste', 'onion', 'garlic'],
        instructions: ['Marinate chicken', 'Cook chicken', 'Make sauce', 'Combine'],
        summary: 'Authentic and flavorful chicken tikka masala with aromatic spices.',
        diets: ['gluten-free'],
    },
    {
        id: '4',
        title: 'Vegetable Stir Fry',
        image: 'https://spoonacular.com/recipeImages/716304-556x370.jpg',
        readyInMinutes: 20,
        servings: 2,
        sourceUrl: 'https://spoonacular.com/vegetable-stir-fry-716304',
        ingredients: ['mixed vegetables', 'soy sauce', 'garlic', 'ginger', 'oil'],
        instructions: ['Heat oil', 'Add garlic and ginger', 'Stir fry vegetables', 'Add sauce'],
        summary: 'Quick and healthy vegetable stir fry with Asian flavors.',
        diets: ['vegan', 'vegetarian'],
    },
];

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

    // Get sessionId
    const sessionId = route.params?.sessionId;

    // Animation values
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    // State for solo mode
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showSessionInfo, setShowSessionInfo] = useState(false);

    // Determine current recipe to display
    const currentDisplayRecipe = sessionId === 'solo-session'
        ? MOCK_RECIPES[currentIndex]
        : currentRecipe;

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
        if (!currentSession.active) {
            Alert.alert(
                'Session Not Active',
                'This session hasn\'t been started yet.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
            return;
        }
    }, [sessionId, currentSession, navigation]);

    // Early return if no recipe to display
    if (!currentDisplayRecipe) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading recipes...</Text>
            </View>
        );
    }

    const handleSwipeRight = async () => {
        if (isSwiping) return;

        if (sessionId === 'solo-session') {
            handleNextRecipe();
            return;
        }

        const isMatch = await swipeRight(currentDisplayRecipe.id);

        if (isMatch) {
            navigation.navigate('Match', { recipe: currentDisplayRecipe });
        } else {
            handleNextRecipe();
        }
    };

    const handleSwipeLeft = () => {
        if (isSwiping) return;

        if (sessionId !== 'solo-session') {
            swipeLeft(currentDisplayRecipe.id);
        }

        handleNextRecipe();
    };

    const handleNextRecipe = () => {
        if (sessionId === 'solo-session') {
            // Solo mode - cycle through mock recipes
            if (currentIndex < MOCK_RECIPES.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setCurrentIndex(0);
            }
        } else {
            // Multi-user mode - fetch next recipe
            fetchNextRecipe();
        }

        // Reset animations
        translateX.setValue(0);
        translateY.setValue(0);
        rotate.setValue(0);
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
        if (sessionId === 'solo-session') {
            navigation.navigate('Home');
            return;
        }

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
                    <TouchableOpacity onPress={handleLeaveSession}>
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
                {participants.map((participant) => (
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

    return (
        <View style={styles.container}>
            <SessionInfoBar />
            <ParticipantsList />

            <View style={styles.cardsContainer}>
                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                >
                    <Animated.View
                        style={[
                            styles.card,
                            {
                                transform: [
                                    { translateX },
                                    { translateY },
                                    { rotate: rotateInterpolate },
                                ],
                            },
                        ]}
                    >
                        <Image source={{ uri: currentDisplayRecipe.image }} style={styles.image} />
                        <View style={styles.recipeInfo}>
                            <Text style={styles.recipeTitle}>{currentDisplayRecipe.title}</Text>
                            <Text style={styles.recipeMeta}>
                                {currentDisplayRecipe.readyInMinutes} min • {currentDisplayRecipe.servings} servings
                            </Text>
                        </View>
                    </Animated.View>
                </PanGestureHandler>
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.dislikeButton]}
                    onPress={handleSwipeLeft}
                    disabled={isSwiping}
                >
                    <Text style={styles.buttonText}>👎</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.likeButton]}
                    onPress={handleSwipeRight}
                    disabled={isSwiping}
                >
                    <Text style={styles.buttonText}>👍</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        fontSize: 16,
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
        color: '#ff6b6b',
        fontWeight: '600',
    },
    participantsOverlay: {
        backgroundColor: '#fff',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    participantsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    participantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    participantAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#ff6b6b',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    participantAvatarText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    participantInfo: {
        flex: 1,
    },
    participantName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    participantStats: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    cardsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    card: {
        width: width * 0.9,
        height: height * 0.65,
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '75%',
        resizeMode: 'cover',
    },
    recipeInfo: {
        padding: 20,
        flex: 1,
        justifyContent: 'center',
    },
    recipeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    recipeMeta: {
        fontSize: 16,
        color: '#666',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 30,
        paddingHorizontal: 50,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
    },
    dislikeButton: {
        backgroundColor: '#ff4757',
    },
    likeButton: {
        backgroundColor: '#2ed573',
    },
    buttonText: {
        fontSize: 24,
    },
});

export default SwipeScreen;
