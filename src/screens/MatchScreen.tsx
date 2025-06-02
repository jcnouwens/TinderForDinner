import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

type MatchScreenRouteProp = RouteProp<RootStackParamList, 'Match'>;
type MatchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Match'>;

const { width } = Dimensions.get('window');

const MatchScreen = () => {
  const route = useRoute<MatchScreenRouteProp>();
  const navigation = useNavigation<MatchScreenNavigationProp>();
  const { recipe } = route.params;

  const handleStartCooking = () => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleBackToSwiping = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>It's a Match! 🎉</Text>
        <Text style={styles.subtitle}>You both want to make:</Text>
        
        <View style={styles.recipeCard}>
          <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <View style={styles.recipeMeta}>
              <Text style={styles.recipeMetaText}>
                <MaterialIcons name="schedule" size={16} color="#666" /> {recipe.readyInMinutes} min
              </Text>
              <Text style={styles.recipeMetaText}>•</Text>
              <Text style={styles.recipeMetaText}>
                <MaterialIcons name="restaurant" size={16} color="#666" /> {recipe.servings} servings
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleStartCooking}
          >
            <Text style={styles.primaryButtonText}>Start Cooking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleBackToSwiping}
          >
            <Text style={styles.secondaryButtonText}>Keep Swiping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  recipeCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recipeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  recipeInfo: {
    padding: 15,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  recipeMetaText: {
    marginHorizontal: 5,
    color: '#666',
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    borderWidth: 2,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#FF6B6B',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MatchScreen;
