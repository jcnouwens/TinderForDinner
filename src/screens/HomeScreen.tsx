import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [sessionCode, setSessionCode] = useState('');
  const { createSession } = useSession();
  const { user } = useAuth();

  const handleCreateSession = async () => {
    try {
      const sessionId = await createSession(user?.id || 'guest');
      Alert.alert(
        'Session Created',
        `Share this code: ${sessionId}`,
        [
          {
            text: 'Copy',
            onPress: () => Clipboard.setStringAsync(sessionId),
          },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      console.error('Create session error:', error);
      Alert.alert('Error', 'Unable to create session');
    }
  };

  const handleStartNewSession = () => {
    // TODO: Implement session creation logic
    // For now, navigate directly to Swipe screen with a mock session ID
    navigation.navigate('Swipe', { sessionId: 'mock-session-id' });
  };

  const handleJoinSession = () => {
    if (!sessionCode.trim()) {
      Alert.alert('Error', 'Please enter a session code');
      return;
    }
    // TODO: Implement session joining logic
    // For now, navigate to Swipe screen with the entered code
    navigation.navigate('Swipe', { sessionId: sessionCode });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tinder for Dinner</Text>
        <Text style={styles.subtitle}>Swipe, match, and cook together!</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Start a New Session</Text>
        <Text style={styles.cardDescription}>
          Create a new swipe session and invite a friend to join you in finding the perfect meal.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleStartNewSession}
        >
          <Text style={styles.buttonText}>Start Swiping</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, styles.createButton]}
          onPress={handleCreateSession}
        >
          <Text style={styles.buttonText}>Create Session</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, styles.joinCard]}>
        <Text style={styles.cardTitle}>Join a Session</Text>
        <Text style={styles.cardDescription}>
          Already have a session code? Enter it below to join your friend's swipe session.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter session code"
          value={sessionCode}
          onChangeText={setSessionCode}
          autoCapitalize="characters"
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={handleJoinSession}
          disabled={!sessionCode.trim()}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Join Session
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate('ProfileTab')}
      >
        <Text style={styles.profileButtonText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  joinCard: {
    marginBottom: 40,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#FF6B6B',
  },
  createButton: {
    marginTop: 10,
  },
  profileButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  profileButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
