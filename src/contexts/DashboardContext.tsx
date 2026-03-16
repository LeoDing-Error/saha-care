import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToAggregates, subscribeToAlerts, subscribeToDashboardReports } from '../services/dashboard';
import type { Aggregate, AggregatePeriod, Alert, Report, ReportStatus } from '../types';

export interface DashboardFilters {
    dateRange: { start: Date; end: Date };
    datePreset: 'today' | '7d' | '30d' | 'custom';
    disease: string | 'all';
    region: string | 'all';
    status: ReportStatus | 'all';
    period: AggregatePeriod;
}

interface KPIs {
    totalReports: number;
    verifiedCount: number;
    pendingCount: number;
    rejectedCount: number;
    activeDiseases: number;
    reportsToday: number;
    activeAlerts: number;
}

interface DashboardContextType {
    filters: DashboardFilters;
    setFilters: (updates: Partial<DashboardFilters>) => void;
    resetFilters: () => void;
    aggregates: Aggregate[];
    alerts: Alert[];
    reports: Report[];
    filteredReports: Report[];
    filteredAggregates: Aggregate[];
    loading: boolean;
    kpis: KPIs;
    lastUpdated: Date | null;
    refresh: () => void;
}

function getDefaultFilters(): DashboardFilters {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    return {
        dateRange: { start, end },
        datePreset: '30d',
        disease: 'all',
        region: 'all',
        status: 'all',
        period: 'day',
    };
}

function computeDateRange(preset: string): { start: Date; end: Date } {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();

    switch (preset) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            break;
        case '7d':
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            break;
        case '30d':
            start.setDate(start.getDate() - 30);
            start.setHours(0, 0, 0, 0);
            break;
        default:
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
    }

    return { start, end };
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const { userProfile } = useAuth();
    const [filters, setFiltersState] = useState<DashboardFilters>(getDefaultFilters);
    const [aggregates, setAggregates] = useState<Aggregate[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback(() => {
        setLoading(true);
        setRefreshKey((k) => k + 1);
    }, []);

    // Determine effective region for Firestore queries
    const queryRegion = useMemo(() => {
        if (!userProfile) return undefined;
        if (userProfile.role === 'supervisor') return userProfile.region;
        // Official: use filter if a specific region is selected
        if (filters.region !== 'all') return filters.region;
        return undefined;
    }, [userProfile, filters.region]);

    const setFilters = useCallback((updates: Partial<DashboardFilters>) => {
        setFiltersState((prev) => {
            const next = { ...prev, ...updates };
            // Auto-compute dateRange when preset changes
            if (updates.datePreset && updates.datePreset !== 'custom') {
                next.dateRange = computeDateRange(updates.datePreset);
            }
            return next;
        });
    }, []);

    const resetFilters = useCallback(() => {
        setFiltersState(getDefaultFilters());
    }, []);

    // Subscribe to aggregates
    useEffect(() => {
        const unsubscribe = subscribeToAggregates(filters.period, queryRegion, (data) => {
            setAggregates(data);
            setLastUpdated(new Date());
        });
        return unsubscribe;
    }, [filters.period, queryRegion, refreshKey]);

    // Subscribe to alerts
    useEffect(() => {
        const unsubscribe = subscribeToAlerts(queryRegion, (data) => {
            setAlerts(data);
            setLastUpdated(new Date());
        });
        return unsubscribe;
    }, [queryRegion, refreshKey]);

    // Subscribe to reports
    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToDashboardReports(queryRegion, (data) => {
            setReports(data);
            setLoading(false);
            setLastUpdated(new Date());
        });
        return unsubscribe;
    }, [queryRegion, refreshKey]);

    // Client-side filtered reports
    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            // Safely convert createdAt to a timestamp for comparison
            const reportTime = report.createdAt instanceof Date
                ? report.createdAt.getTime()
                : new Date(report.createdAt).getTime();
            if (isNaN(reportTime)) return true; // Include reports with invalid dates rather than hiding them
            if (reportTime < filters.dateRange.start.getTime() || reportTime > filters.dateRange.end.getTime()) return false;
            if (filters.disease !== 'all' && report.disease !== filters.disease) return false;
            if (filters.status !== 'all' && report.status !== filters.status) return false;
            return true;
        });
    }, [reports, filters.dateRange, filters.disease, filters.status]);

    // Client-side filtered aggregates
    const filteredAggregates = useMemo(() => {
        return aggregates.filter((agg) => {
            if (filters.disease !== 'all' && agg.disease !== filters.disease) return false;
            // Filter aggregates by date range using the date key from the document ID
            const parts = agg.id.split('_');
            const dateKey = parts[parts.length - 1];
            if (dateKey) {
                const aggDate = new Date(dateKey);
                if (!isNaN(aggDate.getTime())) {
                    if (aggDate < filters.dateRange.start || aggDate > filters.dateRange.end) return false;
                }
            }
            return true;
        });
    }, [aggregates, filters.disease, filters.dateRange]);

    // Compute KPIs from filtered data
    const kpis = useMemo<KPIs>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
            totalReports: filteredReports.length,
            verifiedCount: filteredReports.filter((r) => r.status === 'verified').length,
            pendingCount: filteredReports.filter((r) => r.status === 'pending').length,
            rejectedCount: filteredReports.filter((r) => r.status === 'rejected').length,
            activeDiseases: new Set(filteredReports.map((r) => r.disease)).size,
            reportsToday: filteredReports.filter((r) => r.createdAt >= today).length,
            activeAlerts: alerts.length,
        };
    }, [filteredReports, alerts]);

    return (
        <DashboardContext.Provider value={{
            filters,
            setFilters,
            resetFilters,
            aggregates,
            alerts,
            reports,
            filteredReports,
            filteredAggregates,
            loading,
            kpis,
            lastUpdated,
            refresh,
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

/**
 * Hook to access dashboard state from any component within DashboardProvider.
 */
export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
