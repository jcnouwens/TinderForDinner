import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, Switch, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import SupabaseTestComponent from '../components/SupabaseTestComponent';
import { runAllDebugTests } from '../utils/debugSupabase';
import { DebugSupabaseService } from '../services/DebugSupabaseService';
import { testIOSSimulatorConnection, testSupabaseConnection } from '../services/supabase';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [sessionCode, setSessionCode] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [requiresAllToMatch, setRequiresAllToMatch] = useState(true);
  const { createSession, joinSession, forceRealSupabaseSession, isLoading } = useSession();
  const { user } = useAuth();

  const handleCreateSession = async () => {
    console.log('🚀 handleCreateSession called');
    console.log('User:', user);

    if (!user) {
      console.log('❌ No user found, showing alert');
      Alert.alert('Error', 'Please sign in to create a session');
      return;
    }

    try {
      console.log('🔄 Calling createSession...');
      const sessionCode = await createSession(user, maxParticipants, requiresAllToMatch);
      console.log('✅ Session created with code:', sessionCode);
      setShowCreateModal(false);

      Alert.alert(
        'Session Created!',
        `Your session code is: ${sessionCode}\n\nShare this code with friends to invite them.`,
        [
          {
            text: 'Copy Code',
            onPress: () => Clipboard.setStringAsync(sessionCode),
          },
          {
            text: 'Go to Lobby',
            onPress: () => navigation.navigate('SessionLobby', {
              sessionId: sessionCode,
              isHost: true
            }),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Create session error:', error);
      Alert.alert('Error', 'Unable to create session. Please try again.');
    }
  };

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      Alert.alert('Error', 'Please enter a session code');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please sign in to join a session');
      return;
    }

    try {
      const success = await joinSession(sessionCode.toUpperCase().trim(), user);

      if (success) {
        navigation.navigate('SessionLobby', {
          sessionId: sessionCode.toUpperCase().trim(),
          isHost: false
        });
      } else {
        Alert.alert('Error', 'Failed to join session. Please check the code and try again.');
      }
    } catch (error) {
      console.error('Join session error:', error);
      Alert.alert('Error', 'Unable to join session. Please check the code and try again.');
    }
  };

  const handleStartSolo = () => {
    // Navigate directly to swipe screen for solo mode
    navigation.navigate('Swipe', { sessionId: 'solo-session' });
  };

  const handleDebugConnection = async () => {
    console.log('🔧 Running debug tests...');
    try {
      const result = await runAllDebugTests();
      Alert.alert(
        'Debug Test Results',
        result ? 'All tests passed! Connection is working.' : 'Some tests failed. Check console logs for details.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Debug test error:', error);
      Alert.alert('Debug Error', 'Failed to run debug tests. Check console.');
    }
  };

  const handleForceRealSupabase = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    Alert.alert(
      'Force Real Supabase',
      'This will attempt to create a session directly in Supabase database, bypassing fallbacks. This may fail in iOS simulator.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Force Create',
          onPress: async () => {
            try {
              console.log('🚀 FORCING real Supabase session creation via context...');

              const sessionCode = await forceRealSupabaseSession(user, 4, true);

              console.log('✅ Successfully created real Supabase session with code:', sessionCode);

              // Optionally navigate to the session lobby
              Alert.alert(
                'Navigate to Session?',
                'Real Supabase session created successfully! Would you like to go to the session lobby?',
                [
                  { text: 'Stay Here', style: 'cancel' },
                  {
                    text: 'Go to Lobby',
                    onPress: () => navigation.navigate('SessionLobby', {
                      sessionId: sessionCode,
                      isHost: true
                    }),
                  }
                ]
              );

            } catch (error) {
              console.error('❌ Force real Supabase error:', error);
              // The error alert is already shown in the forceRealSupabaseSession function
            }
          }
        }
      ]
    );
  };

  const handleNetworkTest = async () => {
    Alert.alert(
      'Network Connectivity Test',
      'This will test your network connection and Supabase reachability. Useful for diagnosing iOS simulator network issues.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Run Test',
          onPress: async () => {
            try {
              console.log('🔍 Starting comprehensive network test...');

              // Test 1: iOS Simulator network test
              const iosTestResult = await testIOSSimulatorConnection();

              // Test 2: Supabase connection test
              const supabaseTestResult = await testSupabaseConnection();

              // Test 3: Debug service test
              const debugTestResult = await runAllDebugTests();

              const results = [
                `iOS Network: ${iosTestResult ? '✅ Pass' : '❌ Fail'}`,
                `Supabase: ${supabaseTestResult ? '✅ Pass' : '❌ Fail'}`,
                `Debug Tests: ${debugTestResult ? '✅ Pass' : '❌ Fail'}`,
              ];

              const overallSuccess = iosTestResult || supabaseTestResult;

              Alert.alert(
                `Network Test ${overallSuccess ? 'Results' : 'Failed'}`,
                `${results.join('\n')}\n\n${overallSuccess ?
                  'Your network connection appears to be working! If you\'re still having issues, try testing on a real device.' :
                  'Network connectivity issues detected. This is common in iOS simulator. Try:\n• Testing on a real device\n• Testing in web browser\n• Checking your network settings'
                }`,
                [
                  { text: 'OK' },
                  ...(overallSuccess ? [{
                    text: 'Try Real Session',
                    onPress: () => handleForceRealSupabase()
                  }] : [])
                ]
              );

            } catch (error) {
              console.error('Network test error:', error);
              Alert.alert('Test Error', 'Failed to run network tests. Check console for details.');
            }
          }
        }
      ]
    );
  };

  const CreateSessionModal = () => (
    <Modal
      visible={showCreateModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Session</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Max Participants: {maxParticipants}</Text>
            <View style={styles.participantButtons}>
              {[2, 3, 4, 5, 6].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.participantButton,
                    maxParticipants === num && styles.participantButtonActive
                  ]}
                  onPress={() => setMaxParticipants(num)}
                >
                  <Text style={[
                    styles.participantButtonText,
                    maxParticipants === num && styles.participantButtonTextActive
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Match Requirement</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                {requiresAllToMatch ? 'Everyone must agree' : 'Majority wins'}
              </Text>
              <Switch
                value={requiresAllToMatch}
                onValueChange={setRequiresAllToMatch}
                trackColor={{ false: '#ccc', true: '#ff6b6b' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleCreateSession}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating...' : 'Create Session'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <CreateSessionModal />

      <View style={styles.header}>
        <Text style={styles.title}>Tinder for Dinner</Text>
        <Text style={styles.subtitle}>Swipe, match, and cook together!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Temporary Supabase Test Component - Remove after testing */}
        <SupabaseTestComponent />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Start a New Session</Text>
          <Text style={styles.cardDescription}>
            Create a multiplayer session and invite friends to join you in finding the perfect meal.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => setShowCreateModal(true)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating...' : 'Create Multi-Player Session'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, styles.createButton]}
            onPress={handleStartSolo}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Start Solo Session
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, styles.joinCard]}>
          <Text style={styles.cardTitle}>Join a Session</Text>
          <Text style={styles.cardDescription}>
            Already have a session code? Enter it below to join your friend's swipe session.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter session code (e.g., HAPPY-PASTA-42)"
            value={sessionCode}
            onChangeText={setSessionCode}
            autoCapitalize="characters"
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              (!sessionCode.trim() || isLoading) && styles.disabledButton
            ]}
            onPress={handleJoinSession}
            disabled={!sessionCode.trim() || isLoading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              {isLoading ? 'Joining...' : 'Join Session'}
            </Text>
          </TouchableOpacity>
        </View>

        <SupabaseTestComponent />

        {/* Debug button - remove after fixing connection issues */}
        <View style={[styles.card, { backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }]}>
          <Text style={styles.cardTitle}>🔧 Debug Connection</Text>
          <Text style={styles.cardDescription}>
            Current user: {user ? `${user.name} (${user.id})` : 'Not signed in'}
          </Text>
          <Text style={styles.cardDescription}>
            If you're experiencing connection issues, tap this button to run diagnostic tests.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#fdcb6e' }]}
            onPress={handleDebugConnection}
          >
            <Text style={[styles.buttonText, { color: '#2d3436' }]}>
              Run Debug Tests
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#e17055', marginTop: 10 }]}
            onPress={handleForceRealSupabase}
          >
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
              🚀 Force Real Supabase
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#0984e3', marginTop: 10 }]}
            onPress={handleNetworkTest}
          >
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
              🌐 Test Network
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileButtonText}>Profile</Text>
        </TouchableOpacity>
      </ScrollView>
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
  disabledButton: {
    opacity: 0.5,
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
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingRow: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  participantButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  participantButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  participantButtonActive: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b',
  },
  participantButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  participantButtonTextActive: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default HomeScreen;
