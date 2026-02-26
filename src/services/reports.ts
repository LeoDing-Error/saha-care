import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Report, ReportLocation } from '../types';

const REPORTS_COLLECTION = 'reports';

/**
 * Create a new case report.
 */
export async function createReport(data: {
    disease: string;
    symptoms: string[];
    temp?: number;
    dangerSigns?: string[];
    location: ReportLocation;
    reporterId: string;
    reporterName: string;
    region: string;
}): Promise<string> {
    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Subscribe to reports for a specific volunteer.
 */
export function subscribeToMyReports(
    reporterId: string,
    callback: (reports: Report[]) => void
): Unsubscribe {
    const q = query(
        collection(db, REPORTS_COLLECTION),
        where('reporterId', '==', reporterId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const reports = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            verifiedAt: doc.data().verifiedAt?.toDate(),
        })) as Report[];
        callback(reports);
    });
}

/**
 * Subscribe to reports for a region (supervisor view).
 */
export function subscribeToRegionReports(
    region: string,
    callback: (reports: Report[]) => void
): Unsubscribe {
    const q = query(
        collection(db, REPORTS_COLLECTION),
        where('region', '==', region),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const reports = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            verifiedAt: doc.data().verifiedAt?.toDate(),
        })) as Report[];
        callback(reports);
    });
}
