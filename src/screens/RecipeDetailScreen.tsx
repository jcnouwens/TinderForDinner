import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Share } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

type RecipeDetailScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;

export const RecipeDetailScreen = () => {
  const route = useRoute<RecipeDetailScreenRouteProp>();
  const { recipe } = route.params;

  const handleShareRecipe = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe.title} - ${recipe.sourceUrl}`,
        title: recipe.title,
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  const handleViewOriginal = () => {
    Linking.openURL(recipe.sourceUrl).catch(err =>
      console.error("Couldn't load page", err)
    );
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: recipe.image }} style={styles.recipeImage} testID="recipe-detail-image" />

      <ScrollView style={styles.content} testID="recipe-detail-scroll">
        <View style={styles.header}>
          <Text style={styles.title}>{recipe.title}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={20} color="#666" />
              <Text style={styles.metaText}>{recipe.readyInMinutes} min</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="restaurant" size={20} color="#666" />
              <Text style={styles.metaText}>{recipe.servings} servings</Text>
            </View>
          </View>

          {recipe.summary && (
            <Text style={styles.summary}>
              {recipe.summary.replace(/<[^>]*>?/gm, '')}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View testID="ingredients-list">
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient: string, index: number) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No ingredients listed.</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View testID="instructions-list">
            {recipe.instructions && recipe.instructions.length > 0 ? (
              recipe.instructions.map((step: string, index: number) => (
                <View key={index} style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{step}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No instructions available.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleViewOriginal}
        >
          <Text style={styles.secondaryButtonText}>View Original</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleShareRecipe}
        >
          <MaterialIcons name="share" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Share Recipe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  recipeImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    lineHeight: 34,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  summary: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  noDataText: {
    fontStyle: 'italic',
    color: '#999',
    marginTop: 5,
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 15,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default RecipeDetailScreen;
