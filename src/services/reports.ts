import {
    collection,
    addDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Report, ReportLocation, QuestionAnswer } from '../types';

const REPORTS_COLLECTION = 'reports';

/**
 * Create a new case report.
 */
export async function createReport(data: {
    disease: string;
    answers: QuestionAnswer[];
    symptoms: string[];
    temp?: number;
    dangerSigns?: string[];
    location: ReportLocation;
    reporterId: string;
    reporterName: string;
    region: string;
    hasDangerSigns: boolean;
    isImmediateReport: boolean;
    personsCount: number;
    patientAgeMonths?: number;
    reclassifiedFrom?: string;
}): Promise<string> {
    // Strip undefined values — Firestore rejects them
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );
    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
        ...cleanData,
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

/**
 * Verify a pending report (supervisor action).
 */
export async function verifyReport(
    reportId: string,
    verifierId: string,
    notes?: string
): Promise<void> {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, {
        status: 'verified',
        verifiedBy: verifierId,
        verificationNotes: notes || null,
        verifiedAt: serverTimestamp(),
    });
}

/**
 * Reject a pending report (supervisor action).
 */
export async function rejectReport(
    reportId: string,
    rejecterId: string,
    notes?: string
): Promise<void> {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, {
        status: 'rejected',
        verifiedBy: rejecterId,
        verificationNotes: notes || null,
        verifiedAt: serverTimestamp(),
    });
}
