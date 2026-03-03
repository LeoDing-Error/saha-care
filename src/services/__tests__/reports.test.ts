import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mockAddDoc,
  mockOnSnapshot,
  resetFirebaseMocks,
} from '../../test/mocks/firebase';
import { createReport, subscribeToMyReports } from '../reports';

describe('Reports Service', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  describe('createReport', () => {
    it('creates report with pending status', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-report-id' });

      const reportData = {
        disease: 'acute-watery-diarrhea',
        symptoms: ['loose-stools'],
        temp: 38.5,
        dangerSigns: [],
        location: { lat: 31.5, lng: 34.45, name: 'Gaza City' },
        reporterId: 'test-uid-123',
        reporterName: 'Test User',
        region: 'north-gaza',
      };

      const result = await createReport(reportData);

      expect(mockAddDoc).toHaveBeenCalled();
      expect(result).toBe('new-report-id');
    });

    it('includes all required fields in report', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-report-id' });

      const reportData = {
        disease: 'measles',
        symptoms: ['fever', 'rash'],
        location: { lat: 31.5, lng: 34.45 },
        reporterId: 'test-uid-123',
        reporterName: 'Test User',
        region: 'north-gaza',
      };

      await createReport(reportData);

      const addDocCall = mockAddDoc.mock.calls[0];
      const savedReport = addDocCall[1];

      expect(savedReport.disease).toBe('measles');
      expect(savedReport.symptoms).toEqual(['fever', 'rash']);
      expect(savedReport.status).toBe('pending');
      expect(savedReport.reporterId).toBe('test-uid-123');
      expect(savedReport.reporterName).toBe('Test User');
      expect(savedReport.region).toBe('north-gaza');
    });

    it('includes optional fields when provided', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-report-id' });

      const reportData = {
        disease: 'acute-watery-diarrhea',
        symptoms: ['loose-stools', 'dehydration'],
        temp: 39.2,
        dangerSigns: ['severe-dehydration', 'unable-to-drink'],
        location: { lat: 31.5, lng: 34.45, name: 'Rafah' },
        reporterId: 'test-uid-123',
        reporterName: 'Test User',
        region: 'south-gaza',
      };

      await createReport(reportData);

      const addDocCall = mockAddDoc.mock.calls[0];
      const savedReport = addDocCall[1];

      expect(savedReport.temp).toBe(39.2);
      expect(savedReport.dangerSigns).toEqual([
        'severe-dehydration',
        'unable-to-drink',
      ]);
      expect(savedReport.location.name).toBe('Rafah');
    });

    it('adds createdAt timestamp to report', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-report-id' });

      const reportData = {
        disease: 'cholera',
        symptoms: ['watery-diarrhea'],
        location: { lat: 31.5, lng: 34.45 },
        reporterId: 'test-uid-123',
        reporterName: 'Test User',
        region: 'north-gaza',
      };

      await createReport(reportData);

      const addDocCall = mockAddDoc.mock.calls[0];
      const savedReport = addDocCall[1];

      expect(savedReport.createdAt).toBeDefined();
    });

    it('throws error if Firestore fails', async () => {
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      const reportData = {
        disease: 'measles',
        symptoms: ['fever'],
        location: { lat: 31.5, lng: 34.45 },
        reporterId: 'test-uid-123',
        reporterName: 'Test User',
        region: 'north-gaza',
      };

      await expect(createReport(reportData)).rejects.toThrow('Firestore error');
    });
  });

  describe('subscribeToMyReports', () => {
    it('subscribes to user reports with callback', () => {
      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const callback = vi.fn();
      const unsubscribe = subscribeToMyReports('test-uid-123', callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('returns unsubscribe function', () => {
      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const callback = vi.fn();
      const unsubscribe = subscribeToMyReports('test-uid-123', callback);

      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('processes snapshot data and calls callback with reports', () => {
      const mockUnsubscribe = vi.fn();
      let capturedSnapshotCallback: ((snapshot: unknown) => void) | undefined;

      mockOnSnapshot.mockImplementation(
        (_query: unknown, callback: (snapshot: unknown) => void) => {
          capturedSnapshotCallback = callback;
          return mockUnsubscribe;
        }
      );

      const callback = vi.fn();
      subscribeToMyReports('test-uid-123', callback);

      // Simulate a snapshot update
      const mockSnapshot = {
        docs: [
          {
            id: 'report-1',
            data: () => ({
              disease: 'measles',
              symptoms: ['fever'],
              location: { lat: 31.5, lng: 34.45 },
              status: 'pending',
              reporterId: 'test-uid-123',
              region: 'north-gaza',
              createdAt: { toDate: () => new Date('2024-01-01') },
            }),
          },
        ],
      };

      capturedSnapshotCallback?.(mockSnapshot);

      expect(callback).toHaveBeenCalled();
      const reports = callback.mock.calls[0][0];
      expect(reports).toHaveLength(1);
      expect(reports[0].id).toBe('report-1');
      expect(reports[0].disease).toBe('measles');
    });

    it('handles reports without verifiedAt timestamp', () => {
      const mockUnsubscribe = vi.fn();
      let capturedSnapshotCallback: ((snapshot: unknown) => void) | undefined;

      mockOnSnapshot.mockImplementation(
        (_query: unknown, callback: (snapshot: unknown) => void) => {
          capturedSnapshotCallback = callback;
          return mockUnsubscribe;
        }
      );

      const callback = vi.fn();
      subscribeToMyReports('test-uid-123', callback);

      const mockSnapshot = {
        docs: [
          {
            id: 'report-1',
            data: () => ({
              disease: 'measles',
              symptoms: ['fever'],
              location: { lat: 31.5, lng: 34.45 },
              status: 'pending',
              reporterId: 'test-uid-123',
              region: 'north-gaza',
              createdAt: { toDate: () => new Date() },
              verifiedAt: undefined,
            }),
          },
        ],
      };

      capturedSnapshotCallback?.(mockSnapshot);

      const reports = callback.mock.calls[0][0];
      expect(reports[0].verifiedAt).toBeUndefined();
    });
  });
});
