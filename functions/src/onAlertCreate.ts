import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { notifyRegionStaff } from './notifications';

if (getApps().length === 0) {
    initializeApp();
}

/**
 * When a new alert is created, notify all supervisors in the region + all officials.
 */
export const onAlertCreate = onDocumentCreated(
    'alerts/{alertId}',
    async (event) => {
        const data = event.data?.data();
        if (!data) return;

        const { disease, region, severity, caseCount, threshold } = data;
        const alertId = event.params.alertId;

        // Map alert severity to notification priority
        const priority = (severity === 'critical' || severity === 'high') ? 'high'
            : severity === 'medium' ? 'medium'
            : 'low';

        logger.info('Processing new alert for notifications', { alertId, disease, region, severity });

        await notifyRegionStaff(region, {
            type: 'alert',
            title: `${severity.charAt(0).toUpperCase() + severity.slice(1)} Alert: ${disease}`,
            description: `${caseCount} case(s) reported (threshold: ${threshold}). Immediate attention required.`,
            priority: priority as 'high' | 'medium' | 'low',
            sourceId: alertId,
            sourceCollection: 'alerts',
        });
    }
);
