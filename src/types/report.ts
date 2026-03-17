/**
 * Report verification status.
 * Reports move through: pending → verified/rejected
 */
export type ReportStatus = 'pending' | 'verified' | 'rejected';

/**
 * Geographic location captured with a report.
 */
export interface ReportLocation {
    lat: number;
    lng: number;
    /** Human-readable location name (manual fallback) */
    name?: string;
}

/**
 * A single answer to an assessment question.
 * Stored in the report for detailed clinical review.
 */
export interface QuestionAnswer {
    questionId: string;
    /** The question text (denormalized for offline readability) */
    questionText: string;
    answer: boolean;
    /** Numeric follow-up value if applicable */
    numericValue?: number;
}

/**
 * Firestore report document.
 * Submitted by volunteers, verified by supervisors.
 */
export interface Report {
    id: string;
    /** Disease identifier — references caseDefinitions */
    disease: string;
    /** Structured answers to assessment questions */
    answers: QuestionAnswer[];
    /** Flat list of "Yes" answer question texts (derived, for display compatibility) */
    symptoms: string[];
    /** Patient temperature in °C */
    temp?: number;
    /** Whether any danger signs were observed */
    dangerSigns?: string[];
    /** Report location (GPS or manual) */
    location: ReportLocation;
    /** Verification status */
    status: ReportStatus;
    /** UID of the volunteer who created the report */
    reporterId: string;
    /** Display name of the reporter (denormalized for list views) */
    reporterName?: string;
    /** Region where the report was filed */
    region: string;
    /** UID of the supervisor who verified/rejected */
    verifiedBy?: string;
    /** Optional notes from the verifier */
    verificationNotes?: string;
    /** Whether any danger sign was flagged (computed on submit) */
    hasDangerSigns: boolean;
    /** Whether this report was flagged for immediate alert */
    isImmediateReport: boolean;
    /** Number of persons affected in this report (minimum 1) */
    personsCount: number;
    /** If reclassification was triggered, the original disease */
    reclassifiedFrom?: string;
    createdAt: Date;
    verifiedAt?: Date;
}
