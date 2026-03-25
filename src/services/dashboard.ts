import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Timestamp,
    type Unsubscribe,
    type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Aggregate, AggregatePeriod, Alert, Report } from '../types';

const AGGREGATES_COLLECTION = 'aggregates';
const ALERTS_COLLECTION = 'alerts';
const REPORTS_COLLECTION = 'reports';

/**
 * Subscribe to aggregate documents for dashboard charts.
 * Officials: region=undefined → all regions.
 * Supervisors: region=their region → scoped.
 */
export function subscribeToAggregates(
    period: AggregatePeriod,
    region: string | undefined,
    callback: (aggregates: Aggregate[]) => void
): Unsubscribe {
    const constraints: QueryConstraint[] = [
        where('period', '==', period),
    ];
    if (region) {
        constraints.push(where('region', '==', region));
    }

    const q = query(
        collection(db, AGGREGATES_COLLECTION),
        ...constraints
    );

    return onSnapshot(q, (snapshot) => {
        const aggregates = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
        })) as Aggregate[];
        callback(aggregates);
    }, (error) => {
        console.error('Error subscribing to aggregates:', error);
        callback([]);
    });
}

/**
 * Subscribe to active alerts.
 * Officials: region=undefined → all regions.
 * Supervisors: region=their region → scoped.
 */
export function subscribeToAlerts(
    region: string | undefined,
    callback: (alerts: Alert[]) => void
): Unsubscribe {
    const constraints: QueryConstraint[] = [
        where('status', '==', 'active'),
    ];
    if (region) {
        constraints.push(where('region', '==', region));
    }
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(
        collection(db, ALERTS_COLLECTION),
        ...constraints
    );

    return onSnapshot(q, (snapshot) => {
        const alerts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            resolvedAt: doc.data().resolvedAt?.toDate(),
        })) as Alert[];
        callback(alerts);
    }, (error) => {
        console.error('Error subscribing to alerts:', error);
        callback([]);
    });
}

/**
 * Subscribe to reports for the dashboard (all statuses).
 * Officials: region=undefined → all regions.
 * Supervisors: region=their region → scoped.
 */
export function subscribeToDashboardReports(
    region: string | undefined,
    dateRange: { start: Date; end: Date },
    _disease: string | undefined,
    _status: string | undefined,
    callback: (reports: Report[]) => void
): Unsubscribe {
    const constraints: QueryConstraint[] = [];
    if (region) {
        constraints.push(where('region', '==', region));
    }
    constraints.push(where('createdAt', '>=', Timestamp.fromDate(dateRange.start)));
    constraints.push(where('createdAt', '<=', Timestamp.fromDate(dateRange.end)));
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(500));

    const q = query(
        collection(db, REPORTS_COLLECTION),
        ...constraints
    );

    return onSnapshot(q, (snapshot) => {
        const reports = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            verifiedAt: doc.data().verifiedAt?.toDate(),
        })) as Report[];
        callback(reports);
    }, (error) => {
        console.error('Error subscribing to dashboard reports:', error);
        callback([]);
    });
}
