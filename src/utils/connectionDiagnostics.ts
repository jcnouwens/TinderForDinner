import { supabase } from '../services/supabase';
import { SupabaseService } from '../services/SupabaseService';
import { ConnectionDiagnostic, DiagnosticResult, User } from '../types';
import { testSupabaseConnection, testBasicOperations } from './testConnection';

/**
 * Comprehensive connection diagnostics utility
 * PATTERN: Extends existing connection testing patterns from testConnection.ts
 * PATTERN: Follows error handling patterns from SupabaseService.ts
 */

/**
 * Test basic network connectivity
 */
async function testBasicConnectivity(): Promise<ConnectionDiagnostic> {
  const startTime = Date.now();
  
  try {
    console.log('🌐 Testing basic network connectivity...');
    
    // Test basic fetch to a reliable endpoint
    const response = await fetch('https://httpbin.org/json', {
      method: 'GET',
      timeout: 5000,
    } as any);
    
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      console.log('✅ Basic connectivity successful');
      return {
        test: 'Basic Network Connectivity',
        success: true,
        duration,
        details: `Network accessible, response time: ${duration}ms`
      };
    } else {
      console.error('❌ Basic connectivity failed - bad response');
      return {
        test: 'Basic Network Connectivity',
        success: false,
        duration,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: 'Network is reachable but returned an error'
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Basic connectivity error:', error);
    
    return {
      test: 'Basic Network Connectivity',
      success: false,
      duration,
      error: error instanceof Error ? error.message : 'Network unreachable',
      details: 'Unable to reach external endpoints - check internet connection'
    };
  }
}

/**
 * Test Supabase connection
 * PATTERN: Uses existing testSupabaseConnection function
 */
async function testSupabaseConnectivity(): Promise<ConnectionDiagnostic> {
  const startTime = Date.now();
  
  try {
    console.log('🔌 Testing Supabase connectivity...');
    
    const result = await testSupabaseConnection();
    const duration = Date.now() - startTime;
    
    return {
      test: 'Supabase Connection',
      success: result.success,
      duration,
      error: result.error,
      details: result.success 
        ? `Connected to Supabase successfully, response time: ${duration}ms`
        : 'Failed to connect to Supabase database'
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Supabase connectivity error:', error);
    
    return {
      test: 'Supabase Connection',
      success: false,
      duration,
      error: error instanceof Error ? error.message : 'Connection failed',
      details: 'Unable to establish connection to Supabase'
    };
  }
}

/**
 * Test database operations
 * PATTERN: Uses existing testBasicOperations function
 */
async function testDatabaseOperations(): Promise<ConnectionDiagnostic> {
  const startTime = Date.now();
  
  try {
    console.log('🧪 Testing database operations...');
    
    const result = await testBasicOperations();
    const duration = Date.now() - startTime;
    
    return {
      test: 'Database Operations',
      success: result.success,
      duration,
      error: result.error,
      details: result.success 
        ? `CRUD operations completed successfully, total time: ${duration}ms`
        : 'Failed to perform basic database operations'
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Database operations error:', error);
    
    return {
      test: 'Database Operations',
      success: false,
      duration,
      error: error instanceof Error ? error.message : 'Operations failed',
      details: 'Unable to perform database read/write operations'
    };
  }
}

/**
 * Test session service functionality
 */
async function testSessionService(): Promise<ConnectionDiagnostic> {
  const startTime = Date.now();
  
  try {
    console.log('🎯 Testing session service...');
    
    // Create a test user
    const testUser: User = {
      id: `diag-test-${Date.now()}`,
      name: 'Diagnostic Test User',
      email: 'diagnostic@test.com',
      avatar: ''
    };
    
    // Test session creation
    const sessionCode = `DIAG-TEST-${Date.now()}`;
    const session = await SupabaseService.createSession(testUser, sessionCode, 2, false);
    
    if (!session) {
      throw new Error('Failed to create test session');
    }
    
    // Test session retrieval
    const retrievedSession = await SupabaseService.getSessionByCode(sessionCode);
    
    if (!retrievedSession) {
      throw new Error('Failed to retrieve test session');
    }
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Session service test successful');
    
    return {
      test: 'Session Service',
      success: true,
      duration,
      details: `Session service working correctly, session created: ${session.id}`
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Session service error:', error);
    
    return {
      test: 'Session Service',
      success: false,
      duration,
      error: error instanceof Error ? error.message : 'Service failed',
      details: 'Session creation or management failed'
    };
  }
}

/**
 * Generate recommendations based on failed tests
 * PATTERN: Follows user-friendly error messaging patterns
 */
function generateRecommendations(tests: ConnectionDiagnostic[]): string[] {
  const recommendations: string[] = [];
  const failedTests = tests.filter(test => !test.success);
  
  if (failedTests.length === 0) {
    return ['All systems operational! 🎉'];
  }
  
  for (const test of failedTests) {
    switch (test.test) {
      case 'Basic Network Connectivity':
        recommendations.push('Check your internet connection and try again');
        recommendations.push('If using iOS Simulator, try testing on a real device');
        break;
        
      case 'Supabase Connection':
        recommendations.push('Verify Supabase credentials are correctly configured');
        recommendations.push('Check if Supabase service is currently operational');
        recommendations.push('Consider using offline mode for development');
        break;
        
      case 'Database Operations':
        recommendations.push('Database may be temporarily unavailable');
        recommendations.push('Check database permissions and table structure');
        break;
        
      case 'Session Service':
        recommendations.push('Session management service may need attention');
        recommendations.push('Try clearing app data and signing in again');
        break;
    }
  }
  
  // Add general recommendations
  if (failedTests.length > 1) {
    recommendations.push('Multiple systems affected - consider restarting the app');
  }
  
  return [...new Set(recommendations)]; // Remove duplicates
}

/**
 * Run comprehensive connection diagnostics
 * PATTERN: Returns DiagnosticResult type as specified in PRP
 */
export async function runConnectionDiagnostics(): Promise<DiagnosticResult> {
  console.log('🔍 Starting comprehensive connection diagnostics...');
  
  const tests: ConnectionDiagnostic[] = [];
  
  try {
    // Run all diagnostic tests
    // PATTERN: Test basic connectivity first
    const basicTest = await testBasicConnectivity();
    tests.push(basicTest);
    
    // PATTERN: Test Supabase specifically
    const supabaseTest = await testSupabaseConnectivity();
    tests.push(supabaseTest);
    
    // Only run advanced tests if basic connection works
    if (basicTest.success && supabaseTest.success) {
      // PATTERN: Test CRUD operations
      const dbTest = await testDatabaseOperations();
      tests.push(dbTest);
      
      // Test session service
      const sessionTest = await testSessionService();
      tests.push(sessionTest);
    }
    
    const overall = tests.every(test => test.success);
    
    console.log(`🏁 Diagnostics complete. Overall success: ${overall}`);
    
    return {
      overall,
      tests,
      timestamp: new Date(),
      recommendations: generateRecommendations(tests)
    };
  } catch (error) {
    console.error('❌ Diagnostics failed unexpectedly:', error);
    
    return {
      overall: false,
      tests,
      timestamp: new Date(),
      recommendations: [
        'Diagnostic system encountered an unexpected error',
        'Try restarting the app or contact support'
      ]
    };
  }
}

/**
 * Run quick connection check (basic tests only)
 * For when you need a faster diagnostic
 */
export async function runQuickConnectionCheck(): Promise<DiagnosticResult> {
  console.log('⚡ Running quick connection check...');
  
  const tests: ConnectionDiagnostic[] = [];
  
  try {
    const basicTest = await testBasicConnectivity();
    tests.push(basicTest);
    
    const supabaseTest = await testSupabaseConnectivity();
    tests.push(supabaseTest);
    
    const overall = tests.every(test => test.success);
    
    return {
      overall,
      tests,
      timestamp: new Date(),
      recommendations: generateRecommendations(tests)
    };
  } catch (error) {
    console.error('❌ Quick check failed:', error);
    
    return {
      overall: false,
      tests,
      timestamp: new Date(),
      recommendations: ['Quick check failed - try full diagnostics']
    };
  }
}