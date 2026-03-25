import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { createNotification } from './notifications';

if (getApps().length === 0) {
    initializeApp();
}

const db = getFirestore();

const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical'] as const;

type ThresholdType = 'immediate' | 'cluster';

interface AlertThreshold {
    count: number;
    windowHours: number;
    severity: string;
    description: string;
    type: ThresholdType;
    requireVerified?: boolean;
    proximityKm?: number;
    requireDangerSigns?: boolean;
    maxAgeMonths?: number;
}

/**
 * Haversine distance in km between two lat/lng points.
 */
function haversineKm(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Create or update an alert. Dedup logic differs for immediate vs cluster alerts.
 */
async function createAlertIfNeeded(
    disease: string,
    region: string,
    caseCount: number,
    thresholdCount: number,
    windowHours: number,
    severity: string,
    immediateAlert: boolean,
    thresholdType: ThresholdType,
    clusterCenter?: { lat: number; lng: number },
    contributingReportIds?: string[]
): Promise<void> {
    // Query existing active alerts for this disease+region
    const existingAlerts = await db
        .collection('alerts')
        .where('disease', '==', disease)
        .where('region', '==', region)
        .where('status', '==', 'active')
        .get();

    // For cluster alerts with clusterCenter, check proximity-based dedup
    if (thresholdType === 'cluster' && clusterCenter) {
        for (const doc of existingAlerts.docs) {
            const data = doc.data();
            if (data.thresholdType === 'cluster' && data.clusterCenter) {
                const dist = haversineKm(
                    clusterCenter.lat, clusterCenter.lng,
                    data.clusterCenter.lat, data.clusterCenter.lng
                );
                if (dist <= 2) {
                    // Update existing cluster alert if higher severity
                    const newIdx = SEVERITY_ORDER.indexOf(severity as typeof SEVERITY_ORDER[number]);
                    const existIdx = SEVERITY_ORDER.indexOf(data.severity);
                    await doc.ref.update({
                        caseCount,
                        severity: newIdx > existIdx ? severity : data.severity,
                        contributingReportIds: contributingReportIds || data.contributingReportIds,
                    });
                    logger.info('Updated existing cluster alert', { disease, region, caseCount });
                    return;
                }
            }
        }
    } else {
        // Immediate alerts: dedup by disease+region (existing behavior)
        if (!existingAlerts.empty) {
            const existingAlert = existingAlerts.docs[0];
            const existingData = existingAlert.data();
            const newIdx = SEVERITY_ORDER.indexOf(severity as typeof SEVERITY_ORDER[number]);
            const existIdx = SEVERITY_ORDER.indexOf(existingData.severity);
            await existingAlert.ref.update({
                caseCount,
                severity: newIdx > existIdx ? severity : existingData.severity,
                immediateAlert: existingData.immediateAlert || immediateAlert,
            });
            logger.info('Updated existing immediate alert', { disease, region, caseCount });
            return;
        }
    }

    // Create new alert
    const alertDoc: Record<string, unknown> = {
        disease,
        region,
        caseCount,
        threshold: thresholdCount,
        windowHours,
        severity,
        status: 'active',
        immediateAlert,
        thresholdType,
        createdAt: FieldValue.serverTimestamp(),
    };
    if (clusterCenter) alertDoc.clusterCenter = clusterCenter;
    if (contributingReportIds) alertDoc.contributingReportIds = contributingReportIds;

    await db.collection('alerts').add(alertDoc);
    logger.info('Created new alert', { disease, region, severity, thresholdType });
}

/**
 * Triggered on any report write (create or update).
 * - New report: evaluate immediate thresholds + cross-disease danger-signs alert
 * - Status changed to verified: evaluate cluster thresholds
 */
export const onReportWrite = onDocumentWritten(
    'reports/{reportId}',
    async (event) => {
        const before = event.data?.before?.data();
        const after = event.data?.after?.data();
        if (!after) return;

        const reportId = event.params.reportId;
        const { disease, region, hasDangerSigns, location } = after;
        const isNewReport = !before;
        const justVerified = before && before.status !== 'verified' && after.status === 'verified';
        const justRejected = before && before.status !== 'rejected' && after.status === 'rejected';

        // Skip non-interesting updates
        if (!isNewReport && !justVerified && !justRejected) return;

        logger.info('Processing report', { reportId, disease, region, isNewReport, justVerified, justRejected });

        // ── Notify reporter when report status changes ──
        if ((justVerified || justRejected) && after.reporterId) {
            const newStatus = justVerified ? 'verified' : 'rejected';
            await createNotification({
                userId: after.reporterId,
                type: 'report_status',
                title: `Report ${newStatus}`,
                description: `Your ${disease} report has been ${newStatus} by a supervisor.`,
                priority: 'medium',
                sourceId: reportId,
                sourceCollection: 'reports',
                region: region || '',
            });
        }

        // ── Cross-disease danger-signs alert (new reports only) ──
        if (isNewReport && hasDangerSigns) {
            logger.info('Danger signs detected, creating cross-disease alert', { reportId });
            await createAlertIfNeeded(
                'Danger Signs (Any Disease)', region, 1, 1, 0, 'critical', true, 'immediate'
            );
        }

        // ── Look up case definition ──
        const caseDefSnapshot = await db
            .collection('caseDefinitions')
            .where('disease', '==', disease)
            .where('active', '==', true)
            .limit(1)
            .get();

        if (caseDefSnapshot.empty) {
            logger.warn('No active case definition found', { disease });
            return;
        }

        const caseDef = caseDefSnapshot.docs[0].data();
        const thresholds: AlertThreshold[] = caseDef.thresholds || [];

        for (const threshold of thresholds) {
            // Gate: immediate thresholds on create, cluster thresholds on verify
            if (threshold.type === 'immediate' && !isNewReport) continue;
            if (threshold.type === 'cluster' && !justVerified) continue;

            // ── Immediate threshold ──
            if (threshold.type === 'immediate') {
                // Check if this report matches the threshold filters
                if (threshold.requireDangerSigns && !after.hasDangerSigns) continue;
                if (threshold.maxAgeMonths && (!after.patientAgeMonths || after.patientAgeMonths >= threshold.maxAgeMonths)) continue;

                if (threshold.count === 1) {
                    // Single-case immediate alert
                    await createAlertIfNeeded(
                        disease, region, 1, 1, threshold.windowHours,
                        threshold.severity, true, 'immediate'
                    );
                } else {
                    // Count-based immediate (rare, but supported)
                    const cutoff = Timestamp.fromDate(new Date(Date.now() - threshold.windowHours * 3600000));
                    const snap = await db.collection('reports')
                        .where('disease', '==', disease)
                        .where('region', '==', region)
                        .where('status', 'in', ['pending', 'verified'])
                        .where('createdAt', '>=', cutoff)
                        .get();
                    if (snap.size >= threshold.count) {
                        await createAlertIfNeeded(
                            disease, region, snap.size, threshold.count, threshold.windowHours,
                            threshold.severity, false, 'immediate'
                        );
                    }
                }
                continue;
            }

            // ── Cluster threshold ──
            const cutoff = Timestamp.fromDate(new Date(Date.now() - threshold.windowHours * 3600000));

            // Query verified reports in the time window
            const snap = await db.collection('reports')
                .where('disease', '==', disease)
                .where('region', '==', region)
                .where('status', '==', 'verified')
                .where('createdAt', '>=', cutoff)
                .get();

            // In-memory filtering
            const triggerLat = location?.lat;
            const triggerLng = location?.lng;
            if (!triggerLat || !triggerLng) continue;

            const proximityKm = threshold.proximityKm || 2;

            const matchingDocs = snap.docs.filter((doc) => {
                const d = doc.data();
                // Proximity filter
                if (d.location?.lat && d.location?.lng) {
                    if (haversineKm(triggerLat, triggerLng, d.location.lat, d.location.lng) > proximityKm) {
                        return false;
                    }
                } else {
                    return false;
                }
                // Danger signs filter
                if (threshold.requireDangerSigns && !d.hasDangerSigns) return false;
                // Age filter
                if (threshold.maxAgeMonths && (!d.patientAgeMonths || d.patientAgeMonths >= threshold.maxAgeMonths)) return false;
                return true;
            });

            if (matchingDocs.length >= threshold.count) {
                const reportIds = matchingDocs.map((d) => d.id);
                await createAlertIfNeeded(
                    disease, region, matchingDocs.length, threshold.count, threshold.windowHours,
                    threshold.severity, false, 'cluster',
                    { lat: triggerLat, lng: triggerLng },
                    reportIds
                );
            }
        }
    }
);
