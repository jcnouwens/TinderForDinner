import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { testSupabaseConnection, testBasicOperations } from '../utils/testConnection';

/**
 * Debug component to test Supabase integration
 * Add this temporarily to your App.tsx or any screen to test the connection
 */
export const SupabaseTestComponent: React.FC = () => {
    const [connectionStatus, setConnectionStatus] = useState<string>('Not tested');
    const [operationsStatus, setOperationsStatus] = useState<string>('Not tested');
    const [isLoading, setIsLoading] = useState(false);

    const handleTestConnection = async () => {
        setIsLoading(true);
        setConnectionStatus('Testing...');

        const result = await testSupabaseConnection();

        if (result.success) {
            setConnectionStatus('✅ Connected');
            Alert.alert('Success', 'Supabase connection successful!');
        } else {
            setConnectionStatus('❌ Failed');
            Alert.alert('Connection Failed', result.error || 'Unknown error');
        }

        setIsLoading(false);
    };

    const handleTestOperations = async () => {
        setIsLoading(true);
        setOperationsStatus('Testing...');

        const result = await testBasicOperations();

        if (result.success) {
            setOperationsStatus('✅ All operations passed');
            Alert.alert('Success', 'All database operations completed successfully!');
        } else {
            setOperationsStatus('❌ Operations failed');
            Alert.alert('Operations Failed', result.error || 'Unknown error');
        }

        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Supabase Integration Test</Text>

            <View style={styles.testSection}>
                <Text style={styles.sectionTitle}>Connection Test</Text>
                <Text style={styles.status}>{connectionStatus}</Text>
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleTestConnection}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Test Connection</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.testSection}>
                <Text style={styles.sectionTitle}>Operations Test</Text>
                <Text style={styles.status}>{operationsStatus}</Text>
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleTestOperations}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Test CRUD Operations</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.instructions}>
                Run these tests to verify your Supabase setup is working correctly.
                Check the console logs for detailed information.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        margin: 10,
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    testSection: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    status: {
        fontSize: 14,
        marginBottom: 10,
        color: '#666',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
    },
    instructions: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
    },
});

export default SupabaseTestComponent;
