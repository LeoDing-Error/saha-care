import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

if (getApps().length === 0) {
    initializeApp();
}

const db = getFirestore();

interface CreateNotificationParams {
    userId: string;
    type: 'alert' | 'report_status' | 'user_status' | 'message';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    sourceId: string;
    sourceCollection: string;
    region: string;
}

/**
 * Create a single notification document in the notifications collection.
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
    await db.collection('notifications').add({
        ...params,
        read: false,
        deleted: false,
        createdAt: FieldValue.serverTimestamp(),
    });
    logger.info('Created notification', { userId: params.userId, type: params.type, title: params.title });
}

/**
 * Notify all approved supervisors in a region + all approved officials.
 */
export async function notifyRegionStaff(
    region: string,
    params: Omit<CreateNotificationParams, 'userId' | 'region'>
): Promise<void> {
    // Get approved supervisors in the region
    const supervisorsSnap = await db.collection('users')
        .where('role', '==', 'supervisor')
        .where('status', '==', 'approved')
        .where('region', '==', region)
        .get();

    // Get all approved officials
    const officialsSnap = await db.collection('users')
        .where('role', '==', 'official')
        .where('status', '==', 'approved')
        .get();

    const userIds = new Set<string>();
    supervisorsSnap.docs.forEach(doc => userIds.add(doc.id));
    officialsSnap.docs.forEach(doc => userIds.add(doc.id));

    const promises = Array.from(userIds).map(userId =>
        createNotification({ ...params, userId, region })
    );

    await Promise.all(promises);
    logger.info('Notified region staff', { region, count: userIds.size });
}
