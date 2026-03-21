import { describe, it, expect } from 'vitest';
import { computeUrgency, urgencyNumericValue, sortReports } from '../urgency';
import type { Report } from '../../types';

/** Helper to create a mock Report with sensible defaults. */
function makeReport(overrides: Partial<Report> = {}): Report {
    return {
        id: 'r1',
        disease: 'Cholera',
        symptoms: ['diarrhea'],
        location: { lat: 31.4, lng: 34.4 },
        status: 'pending',
        reporterId: 'vol1',
        region: 'Gaza City',
        hasDangerSigns: false,
        isImmediateReport: false,
        personsCount: 1,
        answers: [],
        createdAt: new Date('2025-06-01'),
        ...overrides,
    } as Report;
}

// ---------------------------------------------------------------------------
// computeUrgency
// ---------------------------------------------------------------------------
describe('computeUrgency', () => {
    it('returns critical when isImmediateReport is true', () => {
        const report = makeReport({ isImmediateReport: true });
        expect(computeUrgency(report)).toBe('critical');
    });

    it('returns critical when hasDangerSigns is true AND personsCount > 1', () => {
        const report = makeReport({ hasDangerSigns: true, personsCount: 2 });
        expect(computeUrgency(report)).toBe('critical');
    });

    it('returns high when hasDangerSigns is true AND personsCount is 1', () => {
        const report = makeReport({ hasDangerSigns: true, personsCount: 1 });
        expect(computeUrgency(report)).toBe('high');
    });

    it('returns high when personsCount > 3 (no danger signs)', () => {
        const report = makeReport({ hasDangerSigns: false, personsCount: 4 });
        expect(computeUrgency(report)).toBe('high');
    });

    it('returns medium when personsCount > 1 but <= 3 (no danger signs)', () => {
        const report = makeReport({ hasDangerSigns: false, personsCount: 2 });
        expect(computeUrgency(report)).toBe('medium');

        const report3 = makeReport({ hasDangerSigns: false, personsCount: 3 });
        expect(computeUrgency(report3)).toBe('medium');
    });

    it('returns low when personsCount is 1, no danger signs, no immediate flag', () => {
        const report = makeReport({
            hasDangerSigns: false,
            isImmediateReport: false,
            personsCount: 1,
        });
        expect(computeUrgency(report)).toBe('low');
    });
});

// ---------------------------------------------------------------------------
// urgencyNumericValue
// ---------------------------------------------------------------------------
describe('urgencyNumericValue', () => {
    it('maps critical to 4', () => {
        expect(urgencyNumericValue('critical')).toBe(4);
    });

    it('maps high to 3', () => {
        expect(urgencyNumericValue('high')).toBe(3);
    });

    it('maps medium to 2', () => {
        expect(urgencyNumericValue('medium')).toBe(2);
    });

    it('maps low to 1', () => {
        expect(urgencyNumericValue('low')).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// sortReports
// ---------------------------------------------------------------------------
describe('sortReports', () => {
    const lowReport = makeReport({
        id: 'low',
        disease: 'Cholera',
        status: 'verified',
        personsCount: 1,
        hasDangerSigns: false,
        isImmediateReport: false,
        createdAt: new Date('2025-06-03'),
    });

    const highReport = makeReport({
        id: 'high',
        disease: 'Measles',
        status: 'pending',
        personsCount: 5,
        hasDangerSigns: false,
        isImmediateReport: false,
        createdAt: new Date('2025-06-01'),
    });

    const criticalReport = makeReport({
        id: 'critical',
        disease: 'Acute Watery Diarrhea',
        status: 'rejected',
        personsCount: 3,
        hasDangerSigns: true,
        isImmediateReport: true,
        createdAt: new Date('2025-06-02'),
    });

    const reports = [lowReport, highReport, criticalReport];

    it('sorts by urgency descending (highest urgency first)', () => {
        const sorted = sortReports(reports, 'urgency', 'desc');
        expect(sorted.map((r) => r.id)).toEqual(['critical', 'high', 'low']);
    });

    it('sorts by date descending (newest first)', () => {
        const sorted = sortReports(reports, 'date', 'desc');
        expect(sorted.map((r) => r.id)).toEqual(['low', 'critical', 'high']);
    });

    it('sorts by disease ascending (alphabetical)', () => {
        const sorted = sortReports(reports, 'disease', 'asc');
        expect(sorted.map((r) => r.id)).toEqual(['critical', 'low', 'high']);
    });

    it('sorts by status ascending (pending < verified < rejected)', () => {
        const sorted = sortReports(reports, 'status', 'asc');
        expect(sorted.map((r) => r.id)).toEqual(['high', 'low', 'critical']);
    });
});
