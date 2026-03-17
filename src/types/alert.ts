/**
 * Alert severity levels.
 */
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Alert status.
 */
export type AlertStatus = 'active' | 'resolved';

/**
 * Firestore alert document.
 * Auto-created by the onReportWrite Cloud Function when case counts
 * exceed the threshold for a disease in a region.
 */
export interface Alert {
    id: string;
    /** Disease that triggered the alert */
    disease: string;
    /** Region where the threshold was exceeded */
    region: string;
    /** Current case count in this region */
    caseCount: number;
    /** Threshold that was exceeded */
    threshold: number;
    /** Time window of the threshold that was exceeded (in hours) */
    windowHours: number;
    /** Computed severity based on threshold rule */
    severity: AlertSeverity;
    /** Whether the alert is still active */
    status: AlertStatus;
    /** Whether this was triggered by an immediate-report flag */
    immediateAlert: boolean;
    createdAt: Date;
    resolvedAt?: Date;
}

/**
 * Aggregate rollup document.
 * Maintained by the aggregateCases Cloud Function for dashboard performance.
 */
export type AggregatePeriod = 'day' | 'week';

export interface Aggregate {
    id: string;
    disease: string;
    region: string;
    period: AggregatePeriod;
    caseCount: number;
    verifiedCount: number;
    /** Total persons affected across all reports in this aggregate */
    personsCount: number;
    lastUpdated: Date;
}
