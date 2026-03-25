import {
    collection,
    addDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    type Unsubscribe,
    type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Report, ReportLocation, QuestionAnswer } from '../types';

const REPORTS_COLLECTION = 'reports';

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
            result[key] = value.map(item =>
                item !== null && typeof item === 'object' && !Array.isArray(item)
                    ? stripUndefined(item as Record<string, unknown>)
                    : item
            );
        } else if (value !== null && typeof value === 'object') {
            result[key] = stripUndefined(value as Record<string, unknown>);
        } else {
            result[key] = value;
        }
    }
    return result;
}

const CASE_ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCaseId(): string {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    let suffix = '';
    for (let i = 0; i < 4; i++) {
        suffix += CASE_ID_CHARS[Math.floor(Math.random() * CASE_ID_CHARS.length)];
    }
    return `SC-${date}-${suffix}`;
}

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
}): Promise<{ id: string; caseId: string }> {
    const caseId = generateCaseId();
    // Strip undefined values — Firestore rejects them
    const cleanData = stripUndefined(data as unknown as Record<string, unknown>);
    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
        ...cleanData,
        caseId,
        status: 'pending',
        createdAt: serverTimestamp(),
    });
    return { id: docRef.id, caseId };
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
 * Subscribe to reports for a specific disease (dashboard drill-down).
 */
export function subscribeToReportsByDisease(
    disease: string,
    region: string | undefined,
    callback: (reports: Report[]) => void
): Unsubscribe {
    const constraints: QueryConstraint[] = [
        where('disease', '==', disease),
    ];
    if (region) {
        constraints.push(where('region', '==', region));
    }
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(50));

    const q = query(
        collection(db, REPORTS_COLLECTION),
        ...constraints
    );

    return onSnapshot(q, (snapshot) => {
        const reports = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate() || new Date(),
            verifiedAt: d.data().verifiedAt?.toDate(),
        })) as Report[];
        callback(reports);
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
