import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import {
  mockOnAuthStateChanged,
  mockGetDoc,
  mockFirebaseUser,
  mockUserProfile,
  resetFirebaseMocks,
} from '../../test/mocks/firebase';

// Mock the auth service module which AuthContext imports
vi.mock('../../services/auth', () => ({
  onAuthChange: (callback: (user: unknown) => void) => mockOnAuthStateChanged({}, callback),
  getUserProfile: (uid: string) => mockGetDoc(uid),
}));

// Test component that uses the auth context
const TestConsumer = () => {
  const { firebaseUser, userProfile, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'loaded'}</span>
      <span data-testid="user">{firebaseUser?.email || 'no-user'}</span>
      <span data-testid="profile">{userProfile?.displayName || 'no-profile'}</span>
      <span data-testid="status">{userProfile?.status || 'no-status'}</span>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  it('shows loading state initially', () => {
    // Don't call the auth callback yet - simulate pending auth state
    mockOnAuthStateChanged.mockImplementation(() => () => {});

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('updates state when user logs in', async () => {
    // Mock auth state change with user
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(mockFirebaseUser);
      return () => {};
    });

    // Mock fetching user profile
    mockGetDoc.mockResolvedValue(mockUserProfile);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  });

  it('clears state when user logs out', async () => {
    // First login, then logout
    let authCallback: ((user: unknown) => void) | null = null;
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      authCallback = callback;
      callback(mockFirebaseUser); // Initial login
      return () => {};
    });

    mockGetDoc.mockResolvedValue(mockUserProfile);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    // Simulate logout wrapped in act to handle state updates
    await act(async () => {
      if (authCallback) {
        authCallback(null);
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });
  });

  it('fetches user profile after auth', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(mockFirebaseUser);
      return () => {};
    });

    mockGetDoc.mockResolvedValue(mockUserProfile);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
    });

    expect(mockGetDoc).toHaveBeenCalledWith(mockFirebaseUser.uid);
  });

  it('handles profile fetch failure gracefully', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(mockFirebaseUser);
      return () => {};
    });

    // Simulate profile fetch failure
    mockGetDoc.mockRejectedValue(new Error('Network error'));

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // User should be set but profile should be null
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');

    consoleSpy.mockRestore();
  });
});
