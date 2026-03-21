import type { Report } from '../types';

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export type ReportSortField = 'urgency' | 'date' | 'disease' | 'status';
export type SortDirection = 'asc' | 'desc';

/**
 * Derive urgency level from existing report fields.
 * No schema changes needed — uses isImmediateReport, hasDangerSigns, personsCount.
 */
export function computeUrgency(report: Report): UrgencyLevel {
    if (report.isImmediateReport) return 'critical';
    if (report.hasDangerSigns && report.personsCount > 1) return 'critical';
    if (report.hasDangerSigns) return 'high';
    if (report.personsCount > 3) return 'high';
    if (report.personsCount > 1) return 'medium';
    return 'low';
}

export function urgencyNumericValue(level: UrgencyLevel): number {
    switch (level) {
        case 'critical': return 4;
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
    }
}

export function urgencyColor(level: UrgencyLevel): string {
    switch (level) {
        case 'critical': return '#d32f2f';
        case 'high': return '#ed6c02';
        case 'medium': return '#eab308';
        case 'low': return '#2e7d32';
    }
}

export function urgencyLabel(level: UrgencyLevel): string {
    switch (level) {
        case 'critical': return 'Critical';
        case 'high': return 'High';
        case 'medium': return 'Medium';
        case 'low': return 'Low';
    }
}

/**
 * Sort reports by a given field and direction.
 */
export function sortReports(
    reports: Report[],
    field: ReportSortField,
    direction: SortDirection
): Report[] {
    const multiplier = direction === 'desc' ? -1 : 1;
    return [...reports].sort((a, b) => {
        switch (field) {
            case 'urgency':
                return multiplier * (urgencyNumericValue(computeUrgency(a)) - urgencyNumericValue(computeUrgency(b)));
            case 'date': {
                const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
                const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
                return multiplier * (aTime - bTime);
            }
            case 'disease':
                return multiplier * a.disease.localeCompare(b.disease);
            case 'status': {
                const statusOrder: Record<string, number> = { pending: 0, verified: 1, rejected: 2 };
                return multiplier * ((statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0));
            }
            default:
                return 0;
        }
    });
}
