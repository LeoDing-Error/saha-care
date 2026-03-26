import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    deleteField,
    type Unsubscribe,
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from './firebase';
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
    }, (error) => {
        console.error('subscribeToPendingVolunteers error:', error);
        // Clear loading state by returning empty array
        callback([]);
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
    }, (error) => {
        console.error('subscribeToPendingSupervisors error:', error);
        callback([]);
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
 * Update a user's display name in Firestore and Firebase Auth.
 */
export async function updateUserDisplayName(
    userId: string,
    displayName: string
): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
        displayName,
        updatedAt: serverTimestamp(),
    });
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
    }
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
    }, (error) => {
        console.error('subscribeToPendingCount error:', error);
        callback(0);
    });
}

/**
 * Subscribe to approved volunteers in a specific region.
 * Used by supervisors to see currently active volunteers.
 */
export function subscribeToActiveVolunteers(
    region: string,
    callback: (users: User[]) => void
): Unsubscribe {
    const q = query(
        collection(db, USERS_COLLECTION),
        where('role', '==', 'volunteer'),
        where('status', '==', 'approved'),
        where('region', '==', region),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
            ...doc.data(),
            uid: doc.id,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            approvedAt: doc.data().approvedAt?.toDate(),
        })) as User[];
        callback(users);
    }, (error) => {
        console.error('subscribeToActiveVolunteers error:', error);
        callback([]);
    });
}

/**
 * Subscribe to rejected volunteers in a specific region.
 * Used by supervisors to review previously rejected volunteers.
 */
export function subscribeToRejectedVolunteers(
    region: string,
    callback: (users: User[]) => void
): Unsubscribe {
    const q = query(
        collection(db, USERS_COLLECTION),
        where('role', '==', 'volunteer'),
        where('status', '==', 'rejected'),
        where('region', '==', region),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
            ...doc.data(),
            uid: doc.id,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            rejectedAt: doc.data().rejectedAt?.toDate(),
            rejectionReason: doc.data().rejectionReason,
        })) as User[];
        callback(users);
    }, (error) => {
        console.error('subscribeToRejectedVolunteers error:', error);
        callback([]);
    });
}

/**
 * Move a rejected user back to pending so they can be reconsidered.
 */
export async function reconsiderUser(userId: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
        status: 'pending',
        updatedAt: serverTimestamp(),
        rejectedBy: deleteField(),
        rejectedAt: deleteField(),
        rejectionReason: deleteField(),
    });
}
