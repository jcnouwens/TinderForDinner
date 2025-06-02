import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  
  // Mock user data - in a real app, this would come from your auth context or state
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    memberSince: 'January 2023',
  });
  
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    vegetarian: false,
    vegan: false,
    glutenFree: false,
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // In a real app, you would handle the logout logic here
            // For now, we'll just navigate back to auth
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const togglePreference = (preference: keyof typeof preferences) => {
    setPreferences({
      ...preferences,
      [preference]: !preferences[preference],
    });
  };

  const renderPreferenceItem = (label: string, preference: keyof typeof preferences, icon: string) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceLabel}>
        <MaterialIcons name={icon as any} size={24} color="#666" style={styles.preferenceIcon} />
        <Text style={styles.preferenceText}>{label}</Text>
      </View>
      <Switch
        value={preferences[preference]}
        onValueChange={() => togglePreference(preference)}
        trackColor={{ false: '#ddd', true: '#FF6B6B' }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editButton}>
              <MaterialIcons name="edit" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.memberSince}>Member since {user.memberSince}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderPreferenceItem('Notifications', 'notifications', 'notifications')}
          {renderPreferenceItem('Dark Mode', 'darkMode', 'dark-mode')}
          <View style={styles.divider} />
          <Text style={styles.dietaryTitle}>Dietary Preferences</Text>
          {renderPreferenceItem('Vegetarian', 'vegetarian', 'eco')}
          {renderPreferenceItem('Vegan', 'vegan', 'spa')}
          {renderPreferenceItem('Gluten Free', 'glutenFree', 'grain')}
        </View>

        <View style={[styles.section, styles.actionsSection]}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="history" size={24} color="#FF6B6B" style={styles.actionIcon} />
            <Text style={styles.actionText}>Swipe History</Text>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="favorite" size={24} color="#FF6B6B" style={styles.actionIcon} />
            <Text style={styles.actionText}>Saved Recipes</Text>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="help" size={24} color="#FF6B6B" style={styles.actionIcon} />
            <Text style={styles.actionText}>Help & Support</Text>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Tinder for Dinner v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  memberSince: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 15,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceIcon: {
    marginRight: 15,
  },
  preferenceText: {
    fontSize: 16,
    color: '#333',
  },
  dietaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 20,
  },
  actionsSection: {
    padding: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginVertical: 20,
  },
});

export default ProfileScreen;
