import { describe, it, expect } from 'vitest';
import type { CaseDefinition, Report } from '../../types';
import {
    getAnswerDisplayLabel,
    buildDiseaseQuestionLookup,
    cleanQuestionTextToLabel,
    getReportDisplayTags,
} from '../reportTags';

function makeCaseDefinition(overrides: Partial<CaseDefinition> = {}): CaseDefinition {
    return {
        id: 'afp',
        disease: 'Acute Flaccid Paralysis',
        definition: 'Sudden onset weakness in limbs',
        questions: [
            {
                id: 'afp-q1',
                text: 'Is the affected limb floppy or limp (not stiff)?',
                shortLabel: 'Floppy limb',
                category: 'core',
                required: true,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'afp-q2',
                text: 'Can the patient drink normally?',
                shortLabel: 'Unable to drink',
                category: 'severity',
                required: false,
                inputType: 'none',
                isDangerSign: true,
                isImmediateReport: false,
            },
        ],
        dangerSigns: [],
        guidance: '',
        active: true,
        thresholds: [],
        prioritySurveillance: true,
        ...overrides,
    };
}

function makeReport(overrides: Partial<Report> = {}): Report {
    return {
        id: 'r1',
        disease: 'Acute Flaccid Paralysis',
        answers: [],
        symptoms: [],
        dangerSigns: [],
        location: { lat: 31.5, lng: 34.45 },
        status: 'pending',
        reporterId: 'vol-1',
        region: 'North Gaza',
        hasDangerSigns: false,
        isImmediateReport: false,
        personsCount: 1,
        createdAt: new Date('2026-01-01'),
        ...overrides,
    };
}

describe('reportTags utilities', () => {
    it('prefers question shortLabel and preserves danger-sign classification', () => {
        const lookup = buildDiseaseQuestionLookup([makeCaseDefinition()]);
        const report = makeReport({
            answers: [
                { questionId: 'afp-q1', questionText: 'Is the affected limb floppy or limp (not stiff)?', answer: true },
                { questionId: 'afp-q2', questionText: 'Can the patient drink normally?', answer: true },
            ],
            symptoms: ['Is the affected limb floppy or limp (not stiff)?'],
            dangerSigns: ['Can the patient drink normally?'],
        });

        const tags = getReportDisplayTags(report, lookup);
        expect(tags.symptoms).toEqual(['Floppy limb']);
        expect(tags.dangerSigns).toEqual(['Unable to drink']);
    });

    it('falls back to cleaned question text when shortLabel is missing', () => {
        const definition = makeCaseDefinition({
            questions: [
                {
                    id: 'afp-q1',
                    text: 'Is the affected limb floppy or limp (not stiff)?',
                    category: 'core',
                    required: true,
                    inputType: 'none',
                    isDangerSign: false,
                    isImmediateReport: false,
                },
            ],
        });
        const lookup = buildDiseaseQuestionLookup([definition]);
        const report = makeReport({
            answers: [
                { questionId: 'afp-q1', questionText: 'Is the affected limb floppy or limp (not stiff)?', answer: true },
            ],
        });

        const tags = getReportDisplayTags(report, lookup);
        expect(tags.symptoms).toEqual(['Affected limb floppy or limp (not stiff)']);
        expect(tags.dangerSigns).toEqual([]);
    });

    it('cleans legacy stored tags when answers are missing', () => {
        const lookup = buildDiseaseQuestionLookup([makeCaseDefinition()]);
        const report = makeReport({
            answers: [],
            symptoms: ['Does the patient have severe vomiting?'],
            dangerSigns: ['Is there blood in stool?'],
        });

        const tags = getReportDisplayTags(report, lookup);
        expect(tags.symptoms).toEqual(['Have severe vomiting']);
        expect(tags.dangerSigns).toEqual(['Blood in stool']);
    });

    it('keeps overlapping unresolved tags in dangerSigns only', () => {
        const lookup = buildDiseaseQuestionLookup([makeCaseDefinition()]);
        const report = makeReport({
            answers: [{ questionId: 'unknown-q1', questionText: 'Is there blood in stool?', answer: true }],
            symptoms: ['Is there blood in stool?'],
            dangerSigns: ['Is there blood in stool?'],
        });

        const tags = getReportDisplayTags(report, lookup);
        expect(tags.symptoms).toEqual([]);
        expect(tags.dangerSigns).toEqual(['Blood in stool']);
    });

    it('normalizes question text to concise labels', () => {
        expect(cleanQuestionTextToLabel('Is the affected limb floppy or limp (not stiff)?')).toBe(
            'Affected limb floppy or limp (not stiff)'
        );
        expect(cleanQuestionTextToLabel('Can the patient drink normally?')).toBe('Drink normally');
    });

    it('falls back to global questionId mapping when disease name does not match', () => {
        const lookup = buildDiseaseQuestionLookup([makeCaseDefinition()]);
        const report = makeReport({
            disease: 'Pertussis',
            answers: [
                { questionId: 'afp-q1', questionText: 'Is the affected limb floppy or limp (not stiff)?', answer: true },
            ],
            symptoms: ['Is the affected limb floppy or limp (not stiff)?'],
        });

        const tags = getReportDisplayTags(report, lookup);
        expect(tags.symptoms).toEqual(['Floppy limb']);
    });

    it('returns concise answer label from shortLabel when available', () => {
        const lookup = buildDiseaseQuestionLookup([makeCaseDefinition()]);

        const label = getAnswerDisplayLabel(
            'Acute Flaccid Paralysis',
            { questionId: 'afp-q2', questionText: 'Can the patient drink normally?' },
            lookup
        );

        expect(label).toBe('Unable to drink');
    });

    it('uses stored tags only when lookup metadata is unavailable', () => {
        const report = makeReport({
            answers: [
                { questionId: 'afp-q2', questionText: 'Can the patient drink normally?', answer: true },
            ],
            symptoms: ['Can the patient drink normally?'],
            dangerSigns: ['Unable to drink'],
        });

        const tags = getReportDisplayTags(report, { byDisease: {}, byQuestionId: {} });
        expect(tags.symptoms).toEqual(['Can the patient drink normally?']);
        expect(tags.dangerSigns).toEqual(['Unable to drink']);
    });
});
