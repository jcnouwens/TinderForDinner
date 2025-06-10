import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Modal, ScrollView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

type MatchScreenRouteProp = RouteProp<RootStackParamList, 'Match'>;
type MatchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Match'>;

const { width, height } = Dimensions.get('window');

const MatchScreen = () => {
  const route = useRoute<MatchScreenRouteProp>();
  const navigation = useNavigation<MatchScreenNavigationProp>();
  const { recipe } = route.params;
  const [modalVisible, setModalVisible] = useState(false);

  const handleStartCooking = () => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleBackToSwiping = () => {
    navigation.goBack();
  };

  const handleImagePress = () => {
    console.log('Recipe data:', JSON.stringify(recipe, null, 2));
    console.log('Recipe summary:', recipe.summary);
    console.log('Recipe ingredients:', recipe.ingredients);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>It's a Match! 🎉</Text>
        <Text style={styles.subtitle}>You both want to make:</Text>

        <View style={styles.recipeCard}>
          <TouchableOpacity
            onPress={handleImagePress}
            activeOpacity={0.9}
            testID="recipe-image-touchable"
          >
            <Image source={{ uri: recipe.image }} style={styles.recipeImage} testID="recipe-image" />
          </TouchableOpacity>
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

          {/* Test button for modal */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleImagePress}
          >
            <Text style={styles.primaryButtonText}>Test Modal</Text>
          </TouchableOpacity>
        </View>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{recipe.title}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton} testID="close-modal-button">
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={true}
            >
              <Image source={{ uri: recipe.image }} style={styles.modalImage} />

              <View style={styles.modalMeta}>
                <View style={styles.modalMetaItem}>
                  <MaterialIcons name="schedule" size={20} color="#666" />
                  <Text style={styles.modalMetaText}>{recipe.readyInMinutes} min</Text>
                </View>
                <View style={styles.modalMetaItem}>
                  <MaterialIcons name="restaurant" size={20} color="#666" />
                  <Text style={styles.modalMetaText}>{recipe.servings} servings</Text>
                </View>
              </View>

              {recipe.summary && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Description</Text>
                  <Text style={styles.modalDescription}>
                    {recipe.summary.replace(/<[^>]*>?/gm, '')}
                  </Text>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Ingredients</Text>
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
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  noDataText: {
    fontStyle: 'italic',
    color: '#999',
    marginTop: 5,
  },
});

export default MatchScreen;
