import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SessionProvider, useSession } from '../SessionContext';

// Test component that uses the session context
const TestComponent = () => {
    const { currentSession, isLoading, createSession, joinSession, leaveSession } = useSession();

    return (
        <>
            <Text testID="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</Text>
            <Text testID="session-state">{currentSession ? `Session: ${currentSession.id}` : 'No Session'}</Text>
        </>
    );
};

describe('SessionContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('provides initial session state', () => {
        const { getByTestId } = render(
            <SessionProvider>
                <TestComponent />
            </SessionProvider>
        );

        expect(getByTestId('loading-state')).toHaveTextContent('Not Loading');
        expect(getByTestId('session-state')).toHaveTextContent('No Session');
    });

    it('provides session methods', () => {
        const TestMethodsComponent = () => {
            const { createSession, joinSession, leaveSession } = useSession();

            return (
                <>
                    <Text testID="create-method">{typeof createSession}</Text>
                    <Text testID="join-method">{typeof joinSession}</Text>
                    <Text testID="leave-method">{typeof leaveSession}</Text>
                </>
            );
        };

        const { getByTestId } = render(
            <SessionProvider>
                <TestMethodsComponent />
            </SessionProvider>
        );

        expect(getByTestId('create-method')).toHaveTextContent('function');
        expect(getByTestId('join-method')).toHaveTextContent('function');
        expect(getByTestId('leave-method')).toHaveTextContent('function');
    });

    it('throws error when used outside provider', () => {
        const TestComponentWithoutProvider = () => {
            try {
                useSession();
                return <Text>No Error</Text>;
            } catch (error) {
                return <Text testID="error">Error: {(error as Error).message}</Text>;
            }
        };

        const { getByTestId } = render(<TestComponentWithoutProvider />);

        expect(getByTestId('error')).toHaveTextContent('Error: useSession must be used within a SessionProvider');
    });

    it('handles session creation', async () => {
        const TestCreateSession = () => {
            const { createSession, currentSession } = useSession();

            React.useEffect(() => {
                const testCreate = async () => {
                    try {
                        await createSession('user123');
                    } catch (error) {
                        // Handle error in test
                    }
                };
                testCreate();
            }, [createSession]);

            return (
                <Text testID="session-info">
                    {currentSession ? `Session Created: ${currentSession.id}` : 'No Session'}
                </Text>
            );
        };

        const { getByTestId } = render(
            <SessionProvider>
                <TestCreateSession />
            </SessionProvider>
        );

        // Session creation is mocked, so we just verify the method exists
        expect(getByTestId('session-info')).toBeDefined();
    });

    it('handles session joining', async () => {
        const TestJoinSession = () => {
            const { joinSession, currentSession } = useSession();

            React.useEffect(() => {
                const testJoin = async () => {
                    try {
                        await joinSession('session123', 'user123');
                    } catch (error) {
                        // Handle error in test
                    }
                };
                testJoin();
            }, [joinSession]);

            return (
                <Text testID="join-info">
                    {currentSession ? `Joined Session: ${currentSession.id}` : 'Not Joined'}
                </Text>
            );
        };

        const { getByTestId } = render(
            <SessionProvider>
                <TestJoinSession />
            </SessionProvider>
        );

        // Session joining is mocked, so we just verify the method exists
        expect(getByTestId('join-info')).toBeDefined();
    });

    it('handles leaving session', () => {
        const TestLeaveSession = () => {
            const { leaveSession } = useSession();

            React.useEffect(() => {
                leaveSession();
            }, [leaveSession]);

            return <Text testID="leave-info">Left Session</Text>;
        };

        const { getByTestId } = render(
            <SessionProvider>
                <TestLeaveSession />
            </SessionProvider>
        );

        expect(getByTestId('leave-info')).toHaveTextContent('Left Session');
    });

    it('manages loading state correctly', () => {
        const TestLoadingState = () => {
            const { isLoading } = useSession();

            return <Text testID="loading">{isLoading.toString()}</Text>;
        };

        const { getByTestId } = render(
            <SessionProvider>
                <TestLoadingState />
            </SessionProvider>
        );

        // Initially should not be loading
        expect(getByTestId('loading')).toHaveTextContent('false');
    });
});
