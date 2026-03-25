import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    doc,
    updateDoc,
    writeBatch,
    getDocs,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { AppNotification } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Subscribe to notifications for a user (non-deleted, ordered by createdAt DESC, limit 50).
 */
export function subscribeToNotifications(
    userId: string,
    callback: (notifications: AppNotification[]) => void,
    onError?: (error: Error) => void
): Unsubscribe {
    const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('deleted', '==', false),
        orderBy('createdAt', 'desc'),
        limit(50)
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate() || new Date(),
        })) as AppNotification[];
        callback(notifications);
    }, onError);
}

/**
 * Subscribe to unread notification count for a user.
 */
export function subscribeToUnreadCount(
    userId: string,
    callback: (count: number) => void,
    onError?: (error: Error) => void
): Unsubscribe {
    const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false),
        where('deleted', '==', false)
    );

    return onSnapshot(q, (snapshot) => {
        callback(snapshot.size);
    }, onError);
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(id: string): Promise<void> {
    const ref = doc(db, NOTIFICATIONS_COLLECTION, id);
    await updateDoc(ref, { read: true });
}

/**
 * Mark all unread notifications as read for a user.
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
    const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false),
        where('deleted', '==', false)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
        batch.update(d.ref, { read: true });
    });
    await batch.commit();
}

/**
 * Soft-delete a notification.
 */
export async function deleteNotification(id: string): Promise<void> {
    const ref = doc(db, NOTIFICATIONS_COLLECTION, id);
    await updateDoc(ref, { deleted: true });
}
