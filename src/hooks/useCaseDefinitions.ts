import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { CaseDefinition } from '../types';

/**
 * Hook to load active case definitions from Firestore.
 * Uses onSnapshot for real-time updates and offline caching.
 */
export function useCaseDefinitions() {
    const [definitions, setDefinitions] = useState<CaseDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(
            collection(db, 'caseDefinitions'),
            where('active', '==', true)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const defs = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as CaseDefinition[];
                setDefinitions(defs);
                setLoading(false);
            },
            (err) => {
                console.error('Error loading case definitions:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, []);

    return { definitions, loading, error };
}
