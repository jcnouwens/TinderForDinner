import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

const AuthScreen = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { signInWithGoogle, signInWithInstagram, isLoading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Navigation is handled by the AuthContext based on auth state
    } catch (error) {
      console.error('Google sign in error:', error);
      // Handle error (show error message to user)
    }
  };

  const handleInstagramSignIn = async () => {
    try {
      await signInWithInstagram();
      // Navigation is handled by the AuthContext based on auth state
    } catch (error) {
      console.error('Instagram sign in error:', error);
      // Handle error (show error message to user)
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>Tinder for Dinner</Text>
        <Text style={styles.subtitle}>Swipe right to find your perfect meal match!</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.googleButton]} 
          onPress={handleGoogleSignIn}
        >
          <Image 
            source={require('../../assets/google-icon.png')} 
            style={styles.icon} 
          />
          <Text style={[styles.buttonText, styles.googleButtonText]}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.instagramButton]} 
          onPress={handleInstagramSignIn}
        >
          <Image 
            source={require('../../assets/instagram-icon.png')} 
            style={styles.icon} 
          />
          <Text style={[styles.buttonText, styles.instagramButtonText]}>Continue with Instagram</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footer}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF6B6B',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  instagramButton: {
    backgroundColor: '#E1306C',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  googleButtonText: {
    color: '#444',
  },
  instagramButtonText: {
    color: '#fff',
  },
  icon: {
    width: 24,
    height: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    paddingHorizontal: 30,
  },
});

export default AuthScreen;
