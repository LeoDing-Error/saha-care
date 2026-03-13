import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

if (getApps().length === 0) {
    initializeApp();
}

const db = getFirestore();

const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical'] as const;

interface AlertThreshold {
    count: number;
    windowHours: number;
    severity: string;
    description: string;
}

/**
 * Create or update an alert for a disease+region combination.
 */
async function createAlertIfNeeded(
    disease: string,
    region: string,
    caseCount: number,
    windowHours: number,
    severity: string,
    immediateAlert: boolean
): Promise<void> {
    // Check for existing active alert for this disease+region
    const existingAlerts = await db
        .collection('alerts')
        .where('disease', '==', disease)
        .where('region', '==', region)
        .where('status', '==', 'active')
        .limit(1)
        .get();

    if (!existingAlerts.empty) {
        // Update existing alert if new severity is higher
        const existingAlert = existingAlerts.docs[0];
        const existingData = existingAlert.data();
        const newSeverityIdx = SEVERITY_ORDER.indexOf(severity as typeof SEVERITY_ORDER[number]);
        const existingSeverityIdx = SEVERITY_ORDER.indexOf(existingData.severity);

        await existingAlert.ref.update({
            caseCount,
            severity: newSeverityIdx > existingSeverityIdx ? severity : existingData.severity,
            immediateAlert: existingData.immediateAlert || immediateAlert,
        });

        logger.info('Updated existing alert', { disease, region, caseCount, severity });
    } else {
        // Create new alert
        await db.collection('alerts').add({
            disease,
            region,
            caseCount,
            threshold: caseCount,
            windowHours,
            severity,
            status: 'active',
            immediateAlert,
            createdAt: FieldValue.serverTimestamp(),
        });

        logger.info('Created new alert', { disease, region, caseCount, severity, immediateAlert });
    }
}

/**
 * Triggered when a new report is created.
 * Checks case counts against disease thresholds and creates alerts.
 */
export const onReportWrite = onDocumentCreated(
    'reports/{reportId}',
    async (event) => {
        const report = event.data?.data();
        if (!report) return;

        const { disease, region, isImmediateReport } = report;
        const reportId = event.params.reportId;

        logger.info('Processing new report', { reportId, disease, region });

        // 1. Handle immediate report flags (e.g., bloody diarrhea, measles rash)
        if (isImmediateReport) {
            logger.info('Immediate report flag detected', { reportId, disease });
            await createAlertIfNeeded(disease, region, 1, 168, 'critical', true);
        }

        // 2. Look up case definition for threshold rules
        const caseDefSnapshot = await db
            .collection('caseDefinitions')
            .where('disease', '==', disease)
            .where('active', '==', true)
            .limit(1)
            .get();

        if (caseDefSnapshot.empty) {
            logger.warn('No active case definition found for disease', { disease });
            return;
        }

        const caseDef = caseDefSnapshot.docs[0].data();
        const thresholds: AlertThreshold[] = caseDef.thresholds || [];

        // 3. Check each threshold rule
        for (const threshold of thresholds) {
            const cutoffDate = new Date(Date.now() - threshold.windowHours * 60 * 60 * 1000);
            const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

            // Count reports in the time window for this disease+region
            const reportsInWindow = await db
                .collection('reports')
                .where('disease', '==', disease)
                .where('region', '==', region)
                .where('createdAt', '>=', cutoffTimestamp)
                .get();

            const caseCount = reportsInWindow.size;

            if (caseCount >= threshold.count) {
                logger.info('Threshold exceeded', {
                    disease,
                    region,
                    caseCount,
                    threshold: threshold.count,
                    windowHours: threshold.windowHours,
                    severity: threshold.severity,
                });

                await createAlertIfNeeded(
                    disease,
                    region,
                    caseCount,
                    threshold.windowHours,
                    threshold.severity,
                    false
                );
            }
        }
    }
);
