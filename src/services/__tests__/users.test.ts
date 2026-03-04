import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mockOnSnapshot,
  mockUpdateDoc,
  resetFirebaseMocks,
} from '../../test/mocks/firebase';
import {
  subscribeToPendingVolunteers,
  subscribeToPendingSupervisors,
  approveUser,
  rejectUser,
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
});
