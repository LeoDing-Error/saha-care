import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mockOnSnapshot,
  mockUpdateDoc,
  mockDeleteField,
  resetFirebaseMocks,
} from '../../test/mocks/firebase';
import {
  subscribeToPendingVolunteers,
  subscribeToPendingSupervisors,
  subscribeToActiveVolunteers,
  subscribeToRejectedVolunteers,
  approveUser,
  rejectUser,
  reconsiderUser,
} from '../users';

describe('Users Service', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  describe('subscribeToPendingVolunteers', () => {
    it('subscribes to pending volunteers in a region', () => {
      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);
      const callback = vi.fn();
      
      const unsubscribe = subscribeToPendingVolunteers('north-gaza', callback);
      
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('subscribeToPendingSupervisors', () => {
    it('subscribes to all pending supervisors', () => {
      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);
      const callback = vi.fn();
      
      const unsubscribe = subscribeToPendingSupervisors(callback);
      
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('approveUser', () => {
    it('updates user status to approved', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      
      await approveUser('user-123', 'approver-456');
      
      expect(mockUpdateDoc).toHaveBeenCalled();
      const updateCall = mockUpdateDoc.mock.calls[0];
      expect(updateCall[1].status).toBe('approved');
      expect(updateCall[1].approvedBy).toBe('approver-456');
    });
  });

  describe('rejectUser', () => {
    it('updates user status to rejected with reason', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      
      await rejectUser('user-123', 'rejecter-456', 'Incomplete documentation');
      
      expect(mockUpdateDoc).toHaveBeenCalled();
      const updateCall = mockUpdateDoc.mock.calls[0];
      expect(updateCall[1].status).toBe('rejected');
      expect(updateCall[1].rejectedBy).toBe('rejecter-456');
      expect(updateCall[1].rejectionReason).toBe('Incomplete documentation');
    });

    it('throws if rejection reason is too short', async () => {
      await expect(
        rejectUser('user-123', 'rejecter-456', 'short')
      ).rejects.toThrow('Rejection reason must be at least 10 characters');
    });
  });

  describe('subscribeToActiveVolunteers', () => {
    it('subscribes to approved volunteers in a region', () => {
      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);
      const callback = vi.fn();

      const unsubscribe = subscribeToActiveVolunteers('north-gaza', callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('calls callback with mapped users on snapshot', () => {
      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockImplementation((_, onNext) => {
        const mockSnapshot = {
          docs: [{
            id: 'vol-1',
            data: () => ({
              displayName: 'Test Vol',
              email: 'test@test.com',
              role: 'volunteer',
              status: 'approved',
              region: 'north-gaza',
              createdAt: { toDate: () => new Date('2026-01-01') },
              updatedAt: { toDate: () => new Date('2026-01-02') },
              approvedAt: { toDate: () => new Date('2026-01-03') },
            }),
          }],
        };
        onNext(mockSnapshot);
        return mockUnsubscribe;
      });
      const callback = vi.fn();

      subscribeToActiveVolunteers('north-gaza', callback);

      expect(callback).toHaveBeenCalledTimes(1);
      const users = callback.mock.calls[0][0];
      expect(users).toHaveLength(1);
      expect(users[0].uid).toBe('vol-1');
      expect(users[0].displayName).toBe('Test Vol');
      expect(users[0].approvedAt).toEqual(new Date('2026-01-03'));
    });

    it('calls callback with empty array on error', () => {
      mockOnSnapshot.mockImplementation((_, _onNext, onError) => {
        onError(new Error('permission denied'));
        return vi.fn();
      });
      const callback = vi.fn();

      subscribeToActiveVolunteers('north-gaza', callback);

      expect(callback).toHaveBeenCalledWith([]);
    });
  });

  describe('subscribeToRejectedVolunteers', () => {
    it('subscribes to rejected volunteers in a region', () => {
      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);
      const callback = vi.fn();

      const unsubscribe = subscribeToRejectedVolunteers('north-gaza', callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('calls callback with mapped users including rejection details', () => {
      mockOnSnapshot.mockImplementation((_, onNext) => {
        const mockSnapshot = {
          docs: [{
            id: 'vol-2',
            data: () => ({
              displayName: 'Rejected Vol',
              email: 'rej@test.com',
              role: 'volunteer',
              status: 'rejected',
              region: 'north-gaza',
              createdAt: { toDate: () => new Date('2026-01-01') },
              updatedAt: { toDate: () => new Date('2026-01-02') },
              rejectedAt: { toDate: () => new Date('2026-01-04') },
              rejectionReason: 'Incomplete docs',
            }),
          }],
        };
        onNext(mockSnapshot);
        return vi.fn();
      });
      const callback = vi.fn();

      subscribeToRejectedVolunteers('north-gaza', callback);

      expect(callback).toHaveBeenCalledTimes(1);
      const users = callback.mock.calls[0][0];
      expect(users).toHaveLength(1);
      expect(users[0].uid).toBe('vol-2');
      expect(users[0].rejectedAt).toEqual(new Date('2026-01-04'));
      expect(users[0].rejectionReason).toBe('Incomplete docs');
    });

    it('calls callback with empty array on error', () => {
      mockOnSnapshot.mockImplementation((_, _onNext, onError) => {
        onError(new Error('permission denied'));
        return vi.fn();
      });
      const callback = vi.fn();

      subscribeToRejectedVolunteers('north-gaza', callback);

      expect(callback).toHaveBeenCalledWith([]);
    });
  });

  describe('reconsiderUser', () => {
    it('sets status to pending and clears rejection fields', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await reconsiderUser('user-789');

      expect(mockUpdateDoc).toHaveBeenCalled();
      const updateCall = mockUpdateDoc.mock.calls[0];
      expect(updateCall[1].status).toBe('pending');
      expect(updateCall[1].rejectedBy).toBe(mockDeleteField());
      expect(updateCall[1].rejectedAt).toBe(mockDeleteField());
      expect(updateCall[1].rejectionReason).toBe(mockDeleteField());
    });
  });
});
