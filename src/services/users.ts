import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '../types';

const USERS_COLLECTION = 'users';

/**
 * Subscribe to pending volunteers in a specific region.
 * Used by supervisors to see users awaiting approval.
 */
export function subscribeToPendingVolunteers(
    region: string,
    callback: (users: User[]) => void
): Unsubscribe {
    const q = query(
        collection(db, USERS_COLLECTION),
        where('role', '==', 'volunteer'),
        where('status', '==', 'pending'),
        where('region', '==', region),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
            ...doc.data(),
            uid: doc.id,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as User[];
        callback(users);
    });
}

/**
 * Subscribe to all pending supervisors.
 * Used by officials to see supervisors awaiting approval.
 */
export function subscribeToPendingSupervisors(
    callback: (users: User[]) => void
): Unsubscribe {
    const q = query(
        collection(db, USERS_COLLECTION),
        where('role', '==', 'supervisor'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
            ...doc.data(),
            uid: doc.id,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as User[];
        callback(users);
    });
}

/**
 * Approve a user (change status from pending to approved).
 */
export async function approveUser(
    userId: string,
    approverId: string
): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
        status: 'approved',
        approvedBy: approverId,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

/**
 * Reject a user with a required reason.
 */
export async function rejectUser(
    userId: string,
    rejecterId: string,
    reason: string
): Promise<void> {
    if (reason.length < 10) {
        throw new Error('Rejection reason must be at least 10 characters');
    }

    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
        status: 'rejected',
        rejectedBy: rejecterId,
        rejectedAt: serverTimestamp(),
        rejectionReason: reason,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Subscribe to count of pending users (for badge display).
 */
export function subscribeToPendingCount(
    role: 'volunteer' | 'supervisor',
    region: string | undefined,
    callback: (count: number) => void
): Unsubscribe {
    const constraints = [
        where('role', '==', role),
        where('status', '==', 'pending'),
    ];
    if (region) {
        constraints.push(where('region', '==', region));
    }

    const q = query(collection(db, USERS_COLLECTION), ...constraints);

    return onSnapshot(q, (snapshot) => {
        callback(snapshot.size);
    });
}
