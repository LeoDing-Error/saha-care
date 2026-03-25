import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import RoleGuard from '../RoleGuard';
import { AuthContext } from '../../contexts/AuthContext';
import {
  mockFirebaseUser,
  mockUserProfile,
  mockPendingUserProfile,
} from '../../test/mocks/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '../../types';

// Mock auth context value factory
const createAuthContextValue = (overrides: {
  firebaseUser?: FirebaseUser | null;
  userProfile?: User | null;
  loading?: boolean;
} = {}) => ({
  firebaseUser: null as FirebaseUser | null,
  userProfile: null as User | null,
  loading: false,
  refreshProfile: vi.fn(),
  ...overrides,
});

// Wrapper component for tests
const TestWrapper = ({
  authValue,
  children,
  initialEntries = ['/protected'],
}: {
  authValue: ReturnType<typeof createAuthContextValue>;
  children: React.ReactNode;
  initialEntries?: string[];
}) => (
  <AuthContext.Provider value={authValue}>
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/reports" element={<div>Reports Home</div>} />
        <Route path="/" element={<div>Dashboard Home</div>} />
        <Route path="/protected" element={children} />
      </Routes>
    </MemoryRouter>
  </AuthContext.Provider>
);

describe('ProtectedRoute', () => {
  it('shows loading spinner while loading', () => {
    const authValue = createAuthContextValue({ loading: true });

    render(
      <TestWrapper authValue={authValue}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    // Should show loading indicator (CircularProgress), not content or login
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    // Check for MUI CircularProgress by role
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    const authValue = createAuthContextValue({ firebaseUser: null });

    render(
      <TestWrapper authValue={authValue}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows children when authenticated', () => {
    const authValue = createAuthContextValue({
      firebaseUser: mockFirebaseUser as FirebaseUser,
      userProfile: mockUserProfile,
    });

    render(
      <TestWrapper authValue={authValue}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

describe('RoleGuard', () => {
  it('shows loading spinner while loading', () => {
    const authValue = createAuthContextValue({ loading: true });

    render(
      <TestWrapper authValue={authValue}>
        <RoleGuard allowedRoles={['volunteer']}>
          <div>Volunteer Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    expect(screen.queryByText('Volunteer Content')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to login when no user profile', () => {
    const authValue = createAuthContextValue({
      firebaseUser: mockFirebaseUser as FirebaseUser,
      userProfile: null,
    });

    render(
      <TestWrapper authValue={authValue}>
        <RoleGuard allowedRoles={['volunteer']}>
          <div>Volunteer Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Volunteer Content')).not.toBeInTheDocument();
  });

  it('shows pending message for unapproved users', () => {
    const authValue = createAuthContextValue({
      firebaseUser: mockFirebaseUser as FirebaseUser,
      userProfile: mockPendingUserProfile,
    });

    render(
      <TestWrapper authValue={authValue}>
        <RoleGuard allowedRoles={['volunteer']}>
          <div>Volunteer Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    // Should show pending approval message
    expect(screen.getByText(/Account Pending Approval/i)).toBeInTheDocument();
    expect(screen.queryByText('Volunteer Content')).not.toBeInTheDocument();
  });

  it('shows content for approved user with correct role', () => {
    const authValue = createAuthContextValue({
      firebaseUser: mockFirebaseUser as FirebaseUser,
      userProfile: mockUserProfile, // status: 'approved', role: 'volunteer'
    });

    render(
      <TestWrapper authValue={authValue}>
        <RoleGuard allowedRoles={['volunteer']}>
          <div>Volunteer Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Volunteer Content')).toBeInTheDocument();
  });

  it('allows access when user role is in allowedRoles array', () => {
    const authValue = createAuthContextValue({
      firebaseUser: mockFirebaseUser as FirebaseUser,
      userProfile: mockUserProfile, // role: 'volunteer'
    });

    render(
      <TestWrapper authValue={authValue}>
        <RoleGuard allowedRoles={['volunteer', 'supervisor']}>
          <div>Multi-role Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Multi-role Content')).toBeInTheDocument();
  });

  it('redirects volunteer to volunteer home when accessing supervisor route', () => {
    const authValue = createAuthContextValue({
      firebaseUser: mockFirebaseUser as FirebaseUser,
      userProfile: mockUserProfile, // role: 'volunteer'
    });

    render(
      <TestWrapper authValue={authValue}>
        <RoleGuard allowedRoles={['supervisor']}>
          <div>Supervisor Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    // Should redirect to volunteer home, not show supervisor content
    expect(screen.queryByText('Supervisor Content')).not.toBeInTheDocument();
    expect(screen.getByText('Reports Home')).toBeInTheDocument();
  });

  it('redirects supervisor to supervisor home when accessing volunteer route', () => {
    const supervisorProfile = { ...mockUserProfile, role: 'supervisor' as const };
    const authValue = createAuthContextValue({
      firebaseUser: mockFirebaseUser as FirebaseUser,
      userProfile: supervisorProfile,
    });

    render(
      <TestWrapper authValue={authValue}>
        <RoleGuard allowedRoles={['volunteer']}>
          <div>Volunteer Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    // Should redirect to supervisor home
    expect(screen.queryByText('Volunteer Content')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard Home')).toBeInTheDocument();
  });

  it('redirects official to official home when accessing wrong role route', () => {
    const officialProfile = { ...mockUserProfile, role: 'official' as const };
    const authValue = createAuthContextValue({
      firebaseUser: mockFirebaseUser as FirebaseUser,
      userProfile: officialProfile,
    });

    render(
      <TestWrapper authValue={authValue}>
        <RoleGuard allowedRoles={['volunteer']}>
          <div>Volunteer Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    // Should redirect to official home
    expect(screen.queryByText('Volunteer Content')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard Home')).toBeInTheDocument();
  });
});
