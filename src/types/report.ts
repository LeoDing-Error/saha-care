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
 * Firestore report document.
 * Submitted by volunteers, verified by supervisors.
 */
export interface Report {
    id: string;
    /** Disease identifier — references caseDefinitions */
    disease: string;
    /** Selected symptoms from the case definition checklist */
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
    createdAt: Date;
    verifiedAt?: Date;
}
