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
        disease: 'Acute Watery Diarrhea',
        answers: [
          {
            questionId: 'awd-q1',
            questionText: 'Has the person had 3 or more loose/watery stools in the past 24 hours?',
            answer: true,
            numericValue: 5,
          },
        ],
        symptoms: ['Has the person had 3 or more loose/watery stools in the past 24 hours?'],
        temp: 38.5,
        dangerSigns: [],
        location: { lat: 31.5, lng: 34.45, name: 'Gaza City' },
        reporterId: 'test-uid-123',
        reporterName: 'Test User',
        region: 'north-gaza',
        hasDangerSigns: false,
        isImmediateReport: false,
        personsCount: 1,
      };

      const result = await createReport(reportData);

      expect(mockAddDoc).toHaveBeenCalled();
      expect(result).toBe('new-report-id');
    });

    it('includes all required fields in report', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-report-id' });

      const reportData = {
        disease: 'Suspected Measles',
        answers: [
          { questionId: 'msl-q1', questionText: 'Does the person have fever?', answer: true },
          { questionId: 'msl-q2', questionText: 'Do they have a red rash?', answer: true },
        ],
        symptoms: ['Does the person have fever?', 'Do they have a red rash?'],
        location: { lat: 31.5, lng: 34.45 },
        reporterId: 'test-uid-123',
        reporterName: 'Test User',
        region: 'north-gaza',
        hasDangerSigns: false,
        isImmediateReport: true,
        personsCount: 3,
      };

      await createReport(reportData);

      const addDocCall = mockAddDoc.mock.calls[0];
      const savedReport = addDocCall[1];

      expect(savedReport.disease).toBe('Suspected Measles');
      expect(savedReport.answers).toHaveLength(2);
      expect(savedReport.symptoms).toEqual(['Does the person have fever?', 'Do they have a red rash?']);
      expect(savedReport.status).toBe('pending');
      expect(savedReport.reporterId).toBe('test-uid-123');
      expect(savedReport.reporterName).toBe('Test User');
      expect(savedReport.region).toBe('north-gaza');
      expect(savedReport.isImmediateReport).toBe(true);
      expect(savedReport.personsCount).toBe(3);
    });

    it('includes optional fields when provided', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-report-id' });

      const reportData = {
        disease: 'Acute Watery Diarrhea',
        answers: [
          { questionId: 'awd-q1', questionText: 'Loose stools?', answer: true },
        ],
        symptoms: ['Loose stools?'],
        temp: 39.2,
        dangerSigns: ['Severe dehydration', 'Unable to drink'],
        location: { lat: 31.5, lng: 34.45, name: 'Rafah' },
        reporterId: 'test-uid-123',
        reporterName: 'Test User',
        region: 'south-gaza',
        hasDangerSigns: true,
        isImmediateReport: false,
        personsCount: 2,
        reclassifiedFrom: 'Some other disease',
      };

      await createReport(reportData);

      const addDocCall = mockAddDoc.mock.calls[0];
      const savedReport = addDocCall[1];

      expect(savedReport.temp).toBe(39.2);
      expect(savedReport.dangerSigns).toEqual(['Severe dehydration', 'Unable to drink']);
      expect(savedReport.location.name).toBe('Rafah');
      expect(savedReport.hasDangerSigns).toBe(true);
      expect(savedReport.reclassifiedFrom).toBe('Some other disease');
    });

    it('adds createdAt timestamp to report', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-report-id' });

      const reportData = {
        disease: 'Acute Bloody Diarrhea',
        answers: [
          { questionId: 'abd-q1', questionText: 'Blood in stool?', answer: true },
        ],
        symptoms: ['Blood in stool?'],
        location: { lat: 31.5, lng: 34.45 },
        reporterId: 'test-uid-123',
        reporterName: 'Test User',
        region: 'north-gaza',
        hasDangerSigns: false,
        isImmediateReport: true,
        personsCount: 1,
      };

      await createReport(reportData);

      const addDocCall = mockAddDoc.mock.calls[0];
      const savedReport = addDocCall[1];

      expect(savedReport.createdAt).toBeDefined();
    });

    it('throws error if Firestore fails', async () => {
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      const reportData = {
        disease: 'Suspected Measles',
        answers: [
          { questionId: 'msl-q1', questionText: 'Fever?', answer: true },
        ],
        symptoms: ['Fever?'],
        location: { lat: 31.5, lng: 34.45 },
        reporterId: 'test-uid-123',
        reporterName: 'Test User',
        region: 'north-gaza',
        hasDangerSigns: false,
        isImmediateReport: false,
        personsCount: 1,
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

      const mockSnapshot = {
        docs: [
          {
            id: 'report-1',
            data: () => ({
              disease: 'Suspected Measles',
              answers: [{ questionId: 'msl-q1', questionText: 'Fever?', answer: true }],
              symptoms: ['Fever?'],
              location: { lat: 31.5, lng: 34.45 },
              status: 'pending',
              reporterId: 'test-uid-123',
              region: 'north-gaza',
              hasDangerSigns: false,
              isImmediateReport: false,
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
      expect(reports[0].disease).toBe('Suspected Measles');
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
              disease: 'Suspected Measles',
              answers: [],
              symptoms: [],
              location: { lat: 31.5, lng: 34.45 },
              status: 'pending',
              reporterId: 'test-uid-123',
              region: 'north-gaza',
              hasDangerSigns: false,
              isImmediateReport: false,
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
