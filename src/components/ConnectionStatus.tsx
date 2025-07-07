import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { runConnectionDiagnostics, runQuickConnectionCheck } from '../utils/connectionDiagnostics';
import { DiagnosticResult, ConnectionDiagnostic } from '../types';

interface ConnectionStatusProps {
  onDiagnosticsComplete?: (result: DiagnosticResult) => void;
}

/**
 * Connection status display component
 * PATTERN: Mirrors pattern from SupabaseTestComponent.tsx
 * PATTERN: Shows diagnostic results in user-friendly format
 * PATTERN: Includes retry and troubleshooting options
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  onDiagnosticsComplete,
}) => {
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunType, setLastRunType] = useState<'full' | 'quick' | null>(null);

  /**
   * Run full diagnostic suite
   * PATTERN: Follow existing async operation patterns
   */
  const handleRunFullDiagnostics = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setLastRunType('full');
    
    try {
      console.log('🔍 Running full connection diagnostics...');
      
      const result = await runConnectionDiagnostics();
      
      setDiagnosticResult(result);
      
      if (onDiagnosticsComplete) {
        onDiagnosticsComplete(result);
      }
      
      // PATTERN: Show user feedback with Alert.alert
      Alert.alert(
        'Diagnostics Complete',
        result.overall 
          ? '✅ All systems operational!'
          : `❌ Found ${result.tests.filter(t => !t.success).length} issue(s)`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
      Alert.alert('Error', 'Diagnostics failed to run properly');
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, onDiagnosticsComplete]);

  /**
   * Run quick connectivity check
   */
  const handleRunQuickCheck = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setLastRunType('quick');
    
    try {
      console.log('⚡ Running quick connection check...');
      
      const result = await runQuickConnectionCheck();
      
      setDiagnosticResult(result);
      
      if (onDiagnosticsComplete) {
        onDiagnosticsComplete(result);
      }
      
    } catch (error) {
      console.error('❌ Quick check failed:', error);
      Alert.alert('Error', 'Quick check failed to run');
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, onDiagnosticsComplete]);

  /**
   * Render individual test result
   */
  const renderTestResult = (test: ConnectionDiagnostic) => (
    <View key={test.test} style={styles.testItem}>
      <View style={styles.testHeader}>
        <Text style={styles.testName}>{test.test}</Text>
        <Text style={[styles.testStatus, test.success ? styles.statusSuccess : styles.statusError]}>
          {test.success ? '✅' : '❌'}
        </Text>
      </View>
      
      <Text style={styles.testDuration}>
        {test.duration}ms
      </Text>
      
      {test.details && (
        <Text style={styles.testDetails}>
          {test.details}
        </Text>
      )}
      
      {test.error && (
        <Text style={styles.testError}>
          Error: {test.error}
        </Text>
      )}
    </View>
  );

  /**
   * Render recommendations
   */
  const renderRecommendations = () => {
    if (!diagnosticResult?.recommendations?.length) return null;

    return (
      <View style={styles.recommendationsSection}>
        <Text style={styles.recommendationsTitle}>Recommendations:</Text>
        {diagnosticResult.recommendations.map((rec, index) => (
          <Text key={index} style={styles.recommendationItem}>
            • {rec}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Diagnostics</Text>
      
      {/* Control buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isRunning && styles.buttonDisabled]}
          onPress={handleRunQuickCheck}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning && lastRunType === 'quick' ? 'Running...' : 'Quick Check'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, isRunning && styles.buttonDisabled]}
          onPress={handleRunFullDiagnostics}
          disabled={isRunning}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            {isRunning && lastRunType === 'full' ? 'Running...' : 'Full Diagnostics'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results display */}
      {diagnosticResult && (
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {/* Overall status */}
          <View style={[styles.overallStatus, diagnosticResult.overall ? styles.statusSuccessBox : styles.statusErrorBox]}>
            <Text style={styles.overallStatusText}>
              {diagnosticResult.overall ? '✅ All Systems Operational' : '❌ Issues Detected'}
            </Text>
            <Text style={styles.timestamp}>
              Last checked: {diagnosticResult.timestamp.toLocaleTimeString()}
            </Text>
          </View>

          {/* Individual test results */}
          <View style={styles.testsSection}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            {diagnosticResult.tests.map(renderTestResult)}
          </View>

          {/* Recommendations */}
          {renderRecommendations()}
        </ScrollView>
      )}

      {/* Instructions */}
      <Text style={styles.instructions}>
        Quick Check tests basic connectivity. Full Diagnostics includes database operations.
        {'\n'}Check console logs for detailed technical information.
      </Text>
    </View>
  );
};

// PATTERN: Mirror styles from SupabaseTestComponent and HomeScreen.tsx
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#FF6B6B',
  },
  resultsContainer: {
    maxHeight: 300,
    marginBottom: 12,
  },
  overallStatus: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statusSuccessBox: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  statusErrorBox: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  overallStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  testsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  testItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  testName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  testStatus: {
    fontSize: 16,
  },
  statusSuccess: {
    color: '#4CAF50',
  },
  statusError: {
    color: '#F44336',
  },
  testDuration: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  testDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  testError: {
    fontSize: 12,
    color: '#F44336',
    fontStyle: 'italic',
  },
  recommendationsSection: {
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    padding: 12,
    borderColor: '#FFD54F',
    borderWidth: 1,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  instructions: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 14,
  },
});

export default ConnectionStatus;