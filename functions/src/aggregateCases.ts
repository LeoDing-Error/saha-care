import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

if (getApps().length === 0) {
    initializeApp();
}

const db = getFirestore();

/**
 * Slugify a string for use as a document ID segment.
 */
function slugify(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Get the Monday of the week for a given date (ISO week).
 */
function getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
}

/**
 * Triggered when a report is created, updated, or deleted.
 * Maintains pre-computed aggregate documents for dashboard performance.
 */
export const aggregateCases = onDocumentWritten(
    'reports/{reportId}',
    async (event) => {
        const after = event.data?.after?.data();
        const before = event.data?.before?.data();

        // Ignore deletions
        if (!after) return;

        const { disease, region, status } = after;
        const reportId = event.params.reportId;

        const now = new Date();
        const dayKey = now.toISOString().split('T')[0]; // "2026-03-12"
        const weekKey = getWeekStart(now); // Monday of current week

        const diseaseSlug = slugify(disease);
        const regionSlug = slugify(region);

        // Daily aggregate
        const dayDocId = `${diseaseSlug}_${regionSlug}_day_${dayKey}`;
        const dayRef = db.collection('aggregates').doc(dayDocId);

        // Weekly aggregate
        const weekDocId = `${diseaseSlug}_${regionSlug}_week_${weekKey}`;
        const weekRef = db.collection('aggregates').doc(weekDocId);

        if (!before) {
            // New report created — increment case count
            logger.info('Aggregating new report', { reportId, disease, region });

            const baseData = {
                disease,
                region,
                lastUpdated: FieldValue.serverTimestamp(),
            };

            const isVerified = status === 'verified';

            await dayRef.set(
                {
                    ...baseData,
                    period: 'day',
                    caseCount: FieldValue.increment(1),
                    verifiedCount: FieldValue.increment(isVerified ? 1 : 0),
                },
                { merge: true }
            );

            await weekRef.set(
                {
                    ...baseData,
                    period: 'week',
                    caseCount: FieldValue.increment(1),
                    verifiedCount: FieldValue.increment(isVerified ? 1 : 0),
                },
                { merge: true }
            );
        } else if (before.status !== 'verified' && status === 'verified') {
            // Report just verified — increment verified count only
            logger.info('Aggregating verified report', { reportId, disease, region });

            const updateData = {
                verifiedCount: FieldValue.increment(1),
                lastUpdated: FieldValue.serverTimestamp(),
            };

            await dayRef.set(
                { disease, region, period: 'day', ...updateData },
                { merge: true }
            );

            await weekRef.set(
                { disease, region, period: 'week', ...updateData },
                { merge: true }
            );
        }
    }
);
