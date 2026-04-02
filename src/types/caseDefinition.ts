import type { AlertSeverity } from './alert';

/**
 * Types of follow-up input when a question is answered "Yes"
 */
export type QuestionInputType = 'none' | 'number';

/**
 * Category for grouping assessment questions in the UI.
 */
export type QuestionCategory = 'core' | 'associated' | 'severity' | 'history';

/**
 * A single assessment question within a case definition.
 * Used to structure the report form as Yes/No questions
 * with optional follow-up inputs and clinical flags.
 */
export interface AssessmentQuestion {
    id: string;
    /** The Yes/No question text shown to the volunteer */
    text: string;
    /** Concise label used for symptom badges in reports */
    shortLabel?: string;
    /** Category grouping for UI organization */
    category: QuestionCategory;
    /** Whether a "Yes" answer is required for a suspected case */
    required: boolean;
    /** Type of follow-up input when answered "Yes" */
    inputType: QuestionInputType;
    /** Label for the follow-up input field (e.g., "Number of stools per day") */
    inputLabel?: string;
    /** Unit suffix for numeric inputs (e.g., "days", "weeks") */
    inputUnit?: string;
    /** Note/action shown to volunteer when they answer "Yes" */
    yesNote?: string;
    /** Whether a "Yes" answer indicates a danger sign */
    isDangerSign: boolean;
    /** Whether a "Yes" answer should trigger an immediate report flag */
    isImmediateReport: boolean;
    /** Disease ID to reclassify to if "Yes" (e.g., AWD → Bloody Diarrhea) */
    reclassifyTo?: string;
}

/**
 * Whether a threshold fires on report creation or after verification clustering.
 */
export type ThresholdType = 'immediate' | 'cluster';

/**
 * Alert threshold rule for a disease.
 * Supports time-windowed thresholds per the GH partner's specifications.
 */
export interface AlertThreshold {
    /** Number of cases that triggers the alert */
    count: number;
    /** Time window in hours (24 = per day, 168 = per week) */
    windowHours: number;
    /** Severity level when this threshold is met */
    severity: AlertSeverity;
    /** Description for display (e.g., "5+ cases in same region within 24 hours") */
    description: string;
    /** Whether this threshold fires on creation (immediate) or verification (cluster) */
    type: ThresholdType;
    /** Cluster: only count verified reports */
    requireVerified?: boolean;
    /** Cluster: geo-distance in km instead of region-wide */
    proximityKm?: number;
    /** Filter to hasDangerSigns === true */
    requireDangerSigns?: boolean;
    /** Filter to patientAgeMonths < this value */
    maxAgeMonths?: number;
}

/**
 * WHO-aligned case definition for a disease.
 * Used to structure the report form and drive alert thresholds.
 */
export interface CaseDefinition {
    id: string;
    /** Disease name (e.g., "Acute Watery Diarrhea") */
    disease: string;
    /** Short clinical definition from the case definition spec */
    definition: string;
    /** Assessment questions for clinical evaluation */
    questions: AssessmentQuestion[];
    /** Signs indicating severe/life-threatening condition */
    dangerSigns: string[];
    /** Clinical guidance text shown to the reporter */
    guidance: string;
    /** Whether this case definition is currently active */
    active: boolean;
    /** Alert thresholds with time windows and severity levels */
    thresholds: AlertThreshold[];
    /** Whether this disease is a priority surveillance target */
    prioritySurveillance: boolean;
}
