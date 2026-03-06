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
import type { SupervisorReport } from '../types';

const COLLECTION = 'supervisorReports';

/**
 * Create a new supervisor summary report.
 */
export async function createSupervisorReport(data: {
    title: string;
    description: string;
    region: string;
    authorId: string;
    authorName: string;
}): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Subscribe to supervisor reports created by a specific supervisor.
 */
export function subscribeToMySupervisorReports(
    authorId: string,
    callback: (reports: SupervisorReport[]) => void
): Unsubscribe {
    const q = query(
        collection(db, COLLECTION),
        where('authorId', '==', authorId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const reports = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as SupervisorReport[];
        callback(reports);
    });
}
