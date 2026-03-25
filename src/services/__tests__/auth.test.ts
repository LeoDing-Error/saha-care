import { describe, it, expect, beforeEach } from 'vitest';
import {
  mockCreateUserWithEmailAndPassword,
  mockSignInWithEmailAndPassword,
  mockSignOut,
  mockUpdateProfile,
  mockSetDoc,
  mockGetDoc,
  mockFirebaseUser,
  mockUserProfile,
  resetFirebaseMocks,
} from '../../test/mocks/firebase';
import { signUp, signIn, signOut, getUserProfile } from '../auth';

describe('Auth Service', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  describe('signUp', () => {
    it('creates user with Firebase Auth and Firestore document', async () => {
      // Mock successful user creation
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
      });
      mockUpdateProfile.mockResolvedValue(undefined);
      mockSetDoc.mockResolvedValue(undefined);

      const result = await signUp(
        'test@example.com',
        'password123',
        'Test User',
        'volunteer',
        'north-gaza'
      );

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled();
      expect(mockUpdateProfile).toHaveBeenCalled();
      expect(mockSetDoc).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.uid).toBe('test-uid-123');
    });

    it('creates user with pending status', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
      });
      mockUpdateProfile.mockResolvedValue(undefined);
      mockSetDoc.mockResolvedValue(undefined);

      await signUp(
        'test@example.com',
        'password123',
        'Test User',
        'volunteer',
        'north-gaza'
      );

      // Check that setDoc was called with status: 'pending'
      const setDocCall = mockSetDoc.mock.calls[0];
      const userData = setDocCall[1];
      expect(userData.status).toBe('pending');
    });

    it('stores correct role and region in user document', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
      });
      mockUpdateProfile.mockResolvedValue(undefined);
      mockSetDoc.mockResolvedValue(undefined);

      await signUp(
        'supervisor@example.com',
        'password123',
        'Supervisor User',
        'supervisor',
        'gaza-city'
      );

      const setDocCall = mockSetDoc.mock.calls[0];
      const userData = setDocCall[1];
      expect(userData.role).toBe('supervisor');
      expect(userData.region).toBe('gaza-city');
      expect(userData.displayName).toBe('Supervisor User');
    });

    it('throws error if Firebase Auth fails', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue(
        new Error('Email already in use')
      );

      await expect(
        signUp(
          'test@example.com',
          'password123',
          'Test User',
          'volunteer',
          'north-gaza'
        )
      ).rejects.toThrow('Email already in use');
    });

    it('throws error if updateProfile fails', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
      });
      mockUpdateProfile.mockRejectedValue(new Error('Profile update failed'));

      await expect(
        signUp(
          'test@example.com',
          'password123',
          'Test User',
          'volunteer',
          'north-gaza'
        )
      ).rejects.toThrow('Profile update failed');
    });
  });

  describe('signIn', () => {
    it('signs in user with email and password', async () => {
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
      });

      const result = await signIn('test@example.com', 'password123');

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.uid).toBe('test-uid-123');
    });

    it('throws error for wrong password', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue(
        new Error('Wrong password')
      );

      await expect(signIn('test@example.com', 'wrongpass')).rejects.toThrow(
        'Wrong password'
      );
    });

    it('throws error for non-existent user', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue(
        new Error('User not found')
      );

      await expect(
        signIn('nonexistent@example.com', 'password123')
      ).rejects.toThrow('User not found');
    });
  });

  describe('signOut', () => {
    it('signs out current user', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await signOut();

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('throws error if sign out fails', async () => {
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));

      await expect(signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('getUserProfile', () => {
    it('fetches user profile from Firestore', async () => {
      // Firestore returns Timestamp objects with toDate(), not plain Dates
      const firestoreData = {
        ...mockUserProfile,
        createdAt: { toDate: () => mockUserProfile.createdAt },
        updatedAt: { toDate: () => mockUserProfile.updatedAt },
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => firestoreData,
        id: 'test-uid-123',
      });

      const profile = await getUserProfile('test-uid-123');

      expect(mockGetDoc).toHaveBeenCalled();
      expect(profile).toBeTruthy();
      expect(profile!.uid).toBe('test-uid-123');
      expect(profile!.email).toBe(mockUserProfile.email);
      expect(profile!.displayName).toBe(mockUserProfile.displayName);
      expect(profile!.role).toBe(mockUserProfile.role);
      expect(profile!.createdAt).toBeInstanceOf(Date);
      expect(profile!.updatedAt).toBeInstanceOf(Date);
    });

    it('returns null if user document does not exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const profile = await getUserProfile('non-existent-uid');

      expect(profile).toBeNull();
    });

    it('includes uid from document id in returned profile', async () => {
      const profileData = {
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'volunteer',
        status: 'approved',
        region: 'north-gaza',
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => profileData,
        id: 'custom-uid-456',
      });

      const profile = await getUserProfile('custom-uid-456');

      expect(profile?.uid).toBe('custom-uid-456');
    });
  });
});
