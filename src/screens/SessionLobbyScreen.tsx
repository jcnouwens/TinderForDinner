import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Share,
    ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, SessionParticipant } from '../types';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';

type SessionLobbyRouteProp = RouteProp<RootStackParamList, 'SessionLobby'>;
type SessionLobbyNavigationProp = StackNavigationProp<RootStackParamList, 'SessionLobby'>;

const SessionLobbyScreen = () => {
    const navigation = useNavigation<SessionLobbyNavigationProp>();
    const route = useRoute<SessionLobbyRouteProp>();
    const { sessionId, isHost } = route.params;
    const { user } = useAuth();

    const {
        currentSession,
        participants,
        isLoading,
        removeParticipant,
        startSession,
        leaveSession,
    } = useSession();

    const [isStarting, setIsStarting] = useState(false);

    // Navigate to swipe screen when session becomes active
    useEffect(() => {
        if (currentSession?.active) {
            navigation.navigate('Swipe', { sessionId });
        }
    }, [currentSession?.active, navigation, sessionId]);

    const handleCopySessionCode = async () => {
        if (currentSession?.sessionCode) {
            await Clipboard.setStringAsync(currentSession.sessionCode);
            Alert.alert('Copied!', 'Session code copied to clipboard');
        }
    };

    const handleShareSession = async () => {
        if (currentSession?.sessionCode) {
            console.log('Attempting to share session code:', currentSession.sessionCode);
            try {
                const result = await Share.share({
                    message: `Join my Tinder for Dinner session! Use code: ${currentSession.sessionCode}`,
                    title: 'Join my cooking session',
                });
                console.log('Share result:', result);

                // If sharing completed successfully, show confirmation
                if (result.action === Share.sharedAction) {
                    Alert.alert('Shared!', 'Session code has been shared successfully');
                } else if (result.action === Share.dismissedAction) {
                    // User dismissed the share dialog
                    console.log('Share dialog was dismissed');
                }
            } catch (error) {
                console.error('Error sharing:', error);
                // Fallback: show the session code in an alert
                Alert.alert(
                    'Share Session Code',
                    `Share this code with others:\n\n${currentSession.sessionCode}\n\nThey can enter this code on the home screen to join your session.`,
                    [
                        { text: 'Copy Code', onPress: handleCopySessionCode },
                        { text: 'OK', style: 'default' }
                    ]
                );
            }
        } else {
            Alert.alert('Error', 'No session code available to share');
        }
    };

    const handleRemoveParticipant = async (participantId: string) => {
        Alert.alert(
            'Remove Participant',
            'Are you sure you want to remove this participant?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await removeParticipant(participantId);
                        if (!success) {
                            Alert.alert('Error', 'Failed to remove participant');
                        }
                    },
                },
            ]
        );
    };

    const handleStartSession = async () => {
        if (participants.length < 2) {
            Alert.alert(
                'Need More Participants',
                'You need at least 2 participants to start a session.'
            );
            return;
        }

        setIsStarting(true);
        const success = await startSession();

        if (success) {
            // Navigation will happen automatically via useEffect
        } else {
            Alert.alert('Error', 'Failed to start session');
            setIsStarting(false);
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

    const handleShowSessionCode = () => {
        if (currentSession?.sessionCode) {
            Alert.alert(
                'Session Code',
                `Share this code with others to let them join:\n\n${currentSession.sessionCode}\n\nThey can enter this code on the home screen.`,
                [
                    { text: 'Copy Code', onPress: handleCopySessionCode },
                    { text: 'Close', style: 'default' }
                ]
            );
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6b6b" />
                <Text style={styles.loadingText}>Loading session...</Text>
            </View>
        );
    }

    if (!currentSession) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Session not found</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.buttonText}>Go Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderParticipant = (participant: SessionParticipant, index: number) => (
        <View key={participant.id} style={styles.participantCard}>
            <View style={styles.participantInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {participant.user.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.participantDetails}>
                    <Text style={styles.participantName}>{participant.user.name}</Text>
                    <Text style={styles.participantEmail}>{participant.user.email}</Text>
                    <Text style={styles.participantJoined}>
                        Joined {participant.joinedAt.toLocaleTimeString()}
                    </Text>
                </View>
            </View>

            {isHost && participant.id !== user?.id && (
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveParticipant(participant.id)}
                >
                    <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
            )}

            {participant.id === currentSession.hostId && (
                <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>HOST</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Session Lobby</Text>
                <Text style={styles.subtitle}>
                    {isHost ? 'Waiting for participants...' : 'Waiting for host to start...'}
                </Text>
            </View>

            <View style={styles.sessionInfo}>
                <Text style={styles.sessionCode}>Session Code</Text>
                <View style={styles.codeContainer}>
                    <Text style={styles.code}>{currentSession.sessionCode}</Text>
                    <TouchableOpacity style={styles.copyButton} onPress={handleCopySessionCode}>
                        <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                </View>

                {isHost && (
                    <View style={styles.shareButtonsContainer}>
                        <TouchableOpacity style={styles.shareButton} onPress={handleShareSession}>
                            <Text style={styles.shareButtonText}>Share Session</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.showCodeButton} onPress={handleShowSessionCode}>
                            <Text style={styles.showCodeButtonText}>Show Code</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.participantsSection}>
                <Text style={styles.sectionTitle}>
                    Participants ({participants.length}/{currentSession.maxParticipants})
                </Text>

                <ScrollView style={styles.participantsList}>
                    {participants.map(renderParticipant)}
                </ScrollView>
            </View>

            <View style={styles.sessionSettings}>
                <Text style={styles.settingsTitle}>Session Settings</Text>
                <Text style={styles.settingItem}>
                    • Max Participants: {currentSession.maxParticipants}
                </Text>
                <Text style={styles.settingItem}>
                    • Match Requirement: {currentSession.requiresAllToMatch ? 'Everyone must agree' : 'Majority wins'}
                </Text>
            </View>

            <View style={styles.footer}>
                {isHost ? (
                    <TouchableOpacity
                        style={[
                            styles.startButton,
                            (participants.length < 2 || isStarting) && styles.disabledButton
                        ]}
                        onPress={handleStartSession}
                        disabled={participants.length < 2 || isStarting}
                    >
                        {isStarting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.startButtonText}>Start Session</Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={styles.waitingContainer}>
                        <ActivityIndicator size="small" color="#ff6b6b" />
                        <Text style={styles.waitingText}>Waiting for host to start...</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveSession}>
                    <Text style={styles.leaveButtonText}>Leave Session</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#ff6b6b',
        marginBottom: 20,
        textAlign: 'center',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    sessionInfo: {
        backgroundColor: '#fff',
        margin: 15,
        padding: 20,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sessionCode: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    code: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ff6b6b',
        fontFamily: 'monospace',
    },
    copyButton: {
        backgroundColor: '#ff6b6b',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    copyButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    shareButton: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
        marginRight: 5,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    shareButtonsContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    showCodeButton: {
        backgroundColor: '#6c757d',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
        marginLeft: 5,
    },
    showCodeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    participantsSection: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 15,
        marginTop: 0,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    participantsList: {
        flex: 1,
    },
    participantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    participantInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ff6b6b',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    participantDetails: {
        flex: 1,
    },
    participantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    participantEmail: {
        fontSize: 14,
        color: '#666',
    },
    participantJoined: {
        fontSize: 12,
        color: '#999',
    },
    removeButton: {
        backgroundColor: '#ff4757',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 10,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    hostBadge: {
        backgroundColor: '#4ecdc4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    hostBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    sessionSettings: {
        backgroundColor: '#fff',
        margin: 15,
        marginTop: 0,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    settingsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    settingItem: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    footer: {
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    startButton: {
        backgroundColor: '#ff6b6b',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    waitingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        marginBottom: 10,
    },
    waitingText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#666',
    },
    leaveButton: {
        backgroundColor: '#6c757d',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    leaveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#ff6b6b',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SessionLobbyScreen;
