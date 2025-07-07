name: "Session Clipboard and Connection Testing PRP"
description: |

## Purpose
Implement clipboard functionality for session codes and enhanced backend connection testing in the TinderForDinner React Native app.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Build clipboard functionality to copy session codes to clipboard with visual feedback and implement comprehensive backend connection testing with user-friendly error handling and fallback mechanisms.

## Why
- **Business value**: Improves user experience by making session code sharing effortless
- **Integration**: Builds upon existing session management and connects to established clipboard patterns
- **Problems solved**: Eliminates manual typing errors when sharing session codes and provides better debugging/troubleshooting for connection issues

## What
User-visible behavior:
- Copy session code to clipboard with single button press
- Visual feedback when code is copied
- Toast/alert confirmation
- Enhanced connection testing with detailed feedback
- Diagnostic information display for troubleshooting

Technical requirements:
- Use existing expo-clipboard dependency
- Integrate with existing session management
- Preserve existing error handling patterns
- Follow React Native best practices

### Success Criteria
- [ ] Session code can be copied to clipboard from session creation flow
- [ ] Session code can be copied from active session lobby
- [ ] Visual feedback confirms successful copy operation
- [ ] Connection testing provides detailed diagnostic information
- [ ] Fallback mechanisms work when connection fails
- [ ] Error handling is graceful and user-friendly

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://docs.expo.dev/versions/latest/sdk/clipboard/
  why: Official expo-clipboard API documentation with methods and examples
  section: setStringAsync, getStringAsync, basic usage patterns
  critical: Web clipboard permissions and async patterns
  
- url: https://blog.logrocket.com/managing-network-connection-status-in-react-native/
  why: Network connection testing patterns and best practices
  section: NetInfo usage, testing patterns, user experience considerations
  critical: Real device testing requirements and offline handling

- file: src/context/SessionContext.tsx
  why: Existing session management patterns, session code generation, error handling
  pattern: generateSessionCode function (lines 121-130), createSession flow
  critical: Session code format: ADJECTIVE-FOOD-NUMBER (e.g., "HAPPY-PASTA-42")

- file: src/screens/HomeScreen.tsx
  why: Current clipboard usage patterns, existing UI components, session creation flow
  pattern: Clipboard.setStringAsync usage (line 46), Alert.alert patterns
  critical: Modal patterns and button styling already implemented

- file: src/services/SupabaseService.ts
  why: Backend connection patterns, error handling, fallback mechanisms
  pattern: try-catch blocks, error logging, service architecture
  critical: Network error detection patterns and retry logic

- file: src/utils/testConnection.ts
  why: Existing connection testing implementations and patterns
  pattern: testSupabaseConnection function, error handling, return formats
  critical: Connection result format: { success: boolean, error?: string, message?: string }

- file: src/utils/testSupabase.ts
  why: Integration testing patterns for backend services
  pattern: testSupabaseIntegration function, cleanup patterns
  critical: Test data generation and cleanup requirements
```

### Current Codebase tree (key files)
```bash
src/
├── context/
│   ├── SessionContext.tsx          # Session management with generateSessionCode
│   └── AuthContext.tsx             # User authentication context
├── screens/
│   ├── HomeScreen.tsx              # Main screen with session creation/join
│   └── SessionLobbyScreen.tsx      # Session lobby (needs clipboard integration)
├── services/
│   ├── SupabaseService.ts          # Backend service with connection patterns
│   ├── MockSupabaseService.ts      # Mock service for fallback
│   └── DebugSupabaseService.ts     # Debug service for testing
├── utils/
│   ├── testConnection.ts           # Basic connection testing
│   ├── testSupabase.ts             # Integration testing
│   └── debugSupabase.ts            # Debug utilities
├── components/
│   └── SupabaseTestComponent.tsx   # Test component for diagnostics
└── types/
    └── index.ts                    # Type definitions
```

### Desired Codebase tree with files to be added and responsibility of file
```bash
src/
├── utils/
│   ├── clipboardUtils.ts           # Clipboard utility functions with feedback
│   └── connectionDiagnostics.ts    # Enhanced connection diagnostic utilities
├── components/
│   ├── CopyButton.tsx              # Reusable copy button component
│   └── ConnectionStatus.tsx        # Connection status display component
└── hooks/
    └── useClipboard.ts             # Custom clipboard hook with feedback
```

### Known Gotchas of our codebase & Library Quirks
```typescript
// CRITICAL: expo-clipboard requires async/await patterns
// Example: Always use await Clipboard.setStringAsync(text)
// Never use synchronous clipboard access

// CRITICAL: iOS Simulator network issues are common
// Example: Real device testing required for network features
// Mock services should be used as fallbacks

// CRITICAL: Session codes are generated in specific format
// Example: generateSessionCode() returns "ADJECTIVE-FOOD-NUMBER"
// Must preserve this format when copying

// CRITICAL: Alert patterns already established
// Example: Alert.alert with specific button configurations
// Should follow existing patterns in HomeScreen.tsx

// CRITICAL: Error handling follows specific patterns
// Example: try-catch blocks with console.error and user-friendly messages
// Should integrate with existing error handling in SessionContext
```

## Implementation Blueprint

### Data models and structure
```typescript
// Types to be added to src/types/index.ts
export interface ClipboardResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ConnectionDiagnostic {
  test: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: string;
}

export interface DiagnosticResult {
  overall: boolean;
  tests: ConnectionDiagnostic[];
  timestamp: Date;
  recommendations?: string[];
}
```

### list of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1:
CREATE src/utils/clipboardUtils.ts:
  - IMPLEMENT copyToClipboard function with feedback
  - MIRROR pattern from: src/screens/HomeScreen.tsx (line 46)
  - ADD visual feedback and error handling
  - RETURN ClipboardResult type

Task 2:
CREATE src/hooks/useClipboard.ts:
  - IMPLEMENT custom hook for clipboard operations
  - INCLUDE loading state and feedback mechanisms
  - MIRROR pattern from: existing context hooks
  - PROVIDE reusable clipboard functionality

Task 3:
CREATE src/components/CopyButton.tsx:
  - IMPLEMENT reusable copy button component
  - MIRROR styling from: src/screens/HomeScreen.tsx button styles
  - INCLUDE loading state and success feedback
  - ACCEPT text prop and onCopy callback

Task 4:
MODIFY src/screens/HomeScreen.tsx:
  - FIND pattern: Alert.alert with Copy Code button (line 44-47)
  - REPLACE with: Enhanced copy button with feedback
  - PRESERVE existing Alert.alert structure
  - ADD visual feedback for copy success

Task 5:
MODIFY src/screens/SessionLobbyScreen.tsx:
  - FIND pattern: Session code display area
  - INJECT CopyButton component next to session code
  - PRESERVE existing layout patterns
  - ADD copy functionality to active sessions

Task 6:
CREATE src/utils/connectionDiagnostics.ts:
  - IMPLEMENT comprehensive connection testing
  - MIRROR pattern from: src/utils/testConnection.ts
  - EXTEND with multiple diagnostic tests
  - RETURN DiagnosticResult type

Task 7:
CREATE src/components/ConnectionStatus.tsx:
  - IMPLEMENT connection status display
  - MIRROR pattern from: src/components/SupabaseTestComponent.tsx
  - SHOW diagnostic results in user-friendly format
  - INCLUDE retry and troubleshooting options

Task 8:
MODIFY src/screens/HomeScreen.tsx:
  - FIND pattern: Debug connection section (lines 312-337)
  - ENHANCE with: ConnectionStatus component
  - PRESERVE existing debug functionality
  - ADD better user experience for diagnostics
```

### Per task pseudocode as needed added to each task

```typescript
// Task 1: src/utils/clipboardUtils.ts
import * as Clipboard from 'expo-clipboard';

export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  try {
    // PATTERN: Always use async clipboard operations
    await Clipboard.setStringAsync(text);
    
    // PATTERN: Return consistent result format
    return {
      success: true,
      message: 'Copied to clipboard!'
    };
  } catch (error) {
    // PATTERN: Follow existing error handling
    console.error('Clipboard copy failed:', error);
    return {
      success: false,
      error: 'Failed to copy to clipboard'
    };
  }
}

// Task 2: src/hooks/useClipboard.ts
export function useClipboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastCopied, setLastCopied] = useState<string | null>(null);
  
  const copyText = async (text: string) => {
    setIsLoading(true);
    try {
      // PATTERN: Use utility function for consistency
      const result = await copyToClipboard(text);
      if (result.success) {
        setLastCopied(text);
        // PATTERN: Show user feedback
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return { copyText, isLoading, lastCopied };
}

// Task 6: src/utils/connectionDiagnostics.ts
export async function runConnectionDiagnostics(): Promise<DiagnosticResult> {
  const tests: ConnectionDiagnostic[] = [];
  
  // PATTERN: Test basic connectivity first
  const basicTest = await testBasicConnection();
  tests.push(basicTest);
  
  // PATTERN: Test Supabase specifically
  const supabaseTest = await testSupabaseConnection();
  tests.push(supabaseTest);
  
  // PATTERN: Test CRUD operations
  const crudTest = await testCRUDOperations();
  tests.push(crudTest);
  
  const overall = tests.every(test => test.success);
  
  return {
    overall,
    tests,
    timestamp: new Date(),
    recommendations: overall ? [] : generateRecommendations(tests)
  };
}
```

### Integration Points
```yaml
SESSION_CONTEXT:
  - modify: src/context/SessionContext.tsx
  - add: clipboard integration to session creation flow
  - preserve: existing session code generation patterns

NAVIGATION:
  - modify: src/screens/HomeScreen.tsx
  - add: enhanced copy functionality to session creation
  - preserve: existing modal and button patterns

STYLING:
  - follow: existing button styles in HomeScreen.tsx
  - pattern: styles.button, styles.primaryButton, styles.secondaryButton
  - maintain: consistent color scheme (#FF6B6B)

ALERTS:
  - follow: existing Alert.alert patterns
  - pattern: Alert.alert with title, message, and button array
  - maintain: consistent user experience
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npx tsc --noEmit                     # Type checking
npm run test -- --passWithNoTests   # Run tests if any exist

# Expected: No type errors or compilation issues
```

### Level 2: Unit Tests for new components
```typescript
// CREATE __tests__/clipboardUtils.test.ts
import { copyToClipboard } from '../utils/clipboardUtils';

describe('clipboardUtils', () => {
  it('should copy text to clipboard successfully', async () => {
    const result = await copyToClipboard('TEST-PASTA-42');
    expect(result.success).toBe(true);
    expect(result.message).toBe('Copied to clipboard!');
  });

  it('should handle clipboard errors gracefully', async () => {
    // Mock clipboard failure
    jest.spyOn(require('expo-clipboard'), 'setStringAsync').mockRejectedValue(new Error('Mock error'));
    
    const result = await copyToClipboard('TEST-PASTA-42');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to copy to clipboard');
  });
});
```

```bash
# Run and iterate until passing:
npm test -- __tests__/clipboardUtils.test.ts
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Start the development server
npm start

# Test on iOS simulator
npm run ios

# Test on real device for network features
# Expected: Can copy session codes and see connection diagnostics
```

## Final validation Checklist
- [ ] All tests pass: `npm test`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] Manual test successful: Copy session code from creation flow
- [ ] Manual test successful: Copy session code from lobby screen
- [ ] Manual test successful: Connection diagnostics show proper results
- [ ] Error cases handled gracefully (network failures, clipboard failures)
- [ ] Logs are informative but not verbose
- [ ] UI follows existing design patterns and color scheme

---

## Anti-Patterns to Avoid
- ❌ Don't use synchronous clipboard operations
- ❌ Don't skip error handling for clipboard failures
- ❌ Don't ignore network testing on real devices
- ❌ Don't create new UI patterns when existing ones work
- ❌ Don't modify session code format or generation logic
- ❌ Don't break existing Alert.alert patterns
- ❌ Don't remove existing fallback mechanisms
- ❌ Don't hardcode session codes in tests

## PRP Confidence Score: 9/10

This PRP provides comprehensive context, clear implementation steps, and detailed validation procedures. The high score reflects:
- Complete codebase analysis with specific file references
- Official documentation links for expo-clipboard
- Existing patterns identified and preserved
- Progressive implementation with clear dependencies
- Comprehensive testing strategy including real device considerations
- Error handling patterns that match existing codebase

The score is 9/10 rather than 10/10 because real device testing may reveal platform-specific issues that cannot be fully anticipated.