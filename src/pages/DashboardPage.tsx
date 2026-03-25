import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToAlerts } from '../services/dashboard';
import type { Alert } from '../types';
import ReportMap from '../components/maps/ReportMap';
import { DashboardProvider, useDashboard } from '../contexts/DashboardContext';
import { AlertReportsList } from '../components/reports/AlertReportsList';
import { getDiseaseColor } from '../components/maps/DiseaseMarker';

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
}

function formatWindowHours(hours: number): string {
    if (hours <= 24) return '24h';
    if (hours <= 48) return '48h';
    return '7d';
}

const severityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-300',
    high: 'bg-orange-100 text-orange-700 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-blue-100 text-blue-700 border-blue-300',
};

function DiseaseMapSection({ region }: { region?: string }) {
    const { reports, filters, setFilters } = useDashboard();

    const diseases = useMemo(() => {
        const set = new Set(reports.map((r) => r.disease));
        return Array.from(set).sort();
    }, [reports]);

    const activeDisease = filters.disease;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle>
                        Disease Outbreak Map - {region || 'All Regions'}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                        <Badge
                            variant="outline"
                            className={`cursor-pointer transition-colors ${
                                activeDisease === 'all'
                                    ? 'bg-teal-100 border-teal-500 text-teal-700'
                                    : 'hover:bg-teal-50'
                            }`}
                            onClick={() => setFilters({ disease: 'all' })}
                        >
                            All Diseases
                        </Badge>
                        {diseases.map((disease) => (
                            <Badge
                                key={disease}
                                variant="outline"
                                className={`cursor-pointer transition-colors ${
                                    activeDisease === disease
                                        ? 'bg-teal-100 border-teal-500 text-teal-700'
                                        : 'hover:bg-teal-50'
                                }`}
                                onClick={() => setFilters({ disease })}
                            >
                                <span
                                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                                    style={{ backgroundColor: getDiseaseColor(disease) }}
                                />
                                {disease}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ReportMap />
            </CardContent>
        </Card>
    );
}

export function DashboardPage() {
    const { userProfile } = useAuth();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [expandedAlerts, setExpandedAlerts] = useState<string[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const handleRefresh = useCallback(() => {
        setLoading(true);
        setRefreshKey((k) => k + 1);
    }, []);

    useEffect(() => {
        const region = userProfile?.role === 'official' ? undefined : userProfile?.region;
        const unsub = subscribeToAlerts(region, (data) => {
            setAlerts(data);
            setLoading(false);
            setLastUpdated(new Date());
        });
        return unsub;
    }, [userProfile?.region, userProfile?.role, refreshKey]);

    const filteredAlerts = alerts.filter((alert) => {
        if (alert.disease === 'Danger Signs (Any Disease)') return false;
        const windowLabel = formatWindowHours(alert.windowHours);
        const matchesTime =
            timeFilter === 'all' ||
            (timeFilter === '24h' && windowLabel === '24h') ||
            (timeFilter === '48h' && (windowLabel === '24h' || windowLabel === '48h')) ||
            (timeFilter === '7d' && windowLabel === '7d');
        const matchesSeverity =
            severityFilter === 'all' || alert.severity === severityFilter.toLowerCase();
        return matchesTime && matchesSeverity;
    });

    const toggleAlert = (id: string) => {
        setExpandedAlerts((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {userProfile?.region || 'All Regions'}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                        Last updated: {lastUpdated ? formatTimeAgo(lastUpdated) : 'just now'}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Disease Map */}
            <DashboardProvider>
                <DiseaseMapSection region={userProfile?.region} />
            </DashboardProvider>

            {/* Active Alerts */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Active Alerts</CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Time:</span>
                                <div className="flex gap-1">
                                    {['all', '24h', '48h', '7d'].map((t) => (
                                        <Button key={t} variant={timeFilter === t ? 'default' : 'outline'} size="sm"
                                            onClick={() => setTimeFilter(t)}
                                            className={timeFilter === t ? 'bg-teal-600 hover:bg-teal-700' : ''}>
                                            {t === 'all' ? 'All' : t}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Severity:</span>
                                <div className="flex gap-1">
                                    {[
                                        { key: 'all', label: 'All', color: 'bg-teal-600 hover:bg-teal-700' },
                                        { key: 'critical', label: 'Critical', color: 'bg-red-600 hover:bg-red-700' },
                                        { key: 'high', label: 'High', color: 'bg-orange-600 hover:bg-orange-700' },
                                        { key: 'medium', label: 'Medium', color: 'bg-yellow-600 hover:bg-yellow-700' },
                                        { key: 'low', label: 'Low', color: 'bg-blue-600 hover:bg-blue-700' },
                                    ].map((s) => (
                                        <Button key={s.key} variant={severityFilter === s.key ? 'default' : 'outline'} size="sm"
                                            onClick={() => setSeverityFilter(s.key)}
                                            className={severityFilter === s.key ? s.color : ''}>
                                            {s.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading alerts...</div>
                    ) : (
                        <div className="space-y-3">
                            {filteredAlerts.length > 0 ? (
                                filteredAlerts.map((alert) => (
                                    <div key={alert.id} className={`p-4 rounded-lg border-2 ${severityColors[alert.severity] || severityColors.low}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium">{alert.disease}</h4>
                                                    {alert.immediateAlert && <Badge className="bg-red-600 text-white">IMMEDIATE</Badge>}
                                                    <Badge variant="outline" className="capitalize">{alert.severity}</Badge>
                                                    <span className="text-xs text-gray-500">{formatTimeAgo(alert.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="font-medium">{alert.caseCount} cases</span>
                                                    <span className="text-gray-600">/ threshold: {alert.threshold}</span>
                                                    <span className="text-gray-600">in {formatWindowHours(alert.windowHours)}</span>
                                                </div>
                                            </div>
                                            <Badge className={alert.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                                {alert.status === 'active' ? 'Active' : 'Resolved'}
                                            </Badge>
                                        </div>
                                        <div className="mt-3">
                                            <Button variant="outline" size="sm" onClick={() => toggleAlert(alert.id)}>
                                                {expandedAlerts.includes(alert.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                {expandedAlerts.includes(alert.id) ? 'Hide' : 'Show'} Details
                                            </Button>
                                        </div>
                                        {expandedAlerts.includes(alert.id) && (
                                            <AlertReportsList alert={alert} />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">No alerts match the selected filters</div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-500">Total Alerts</p>
                        <p className="text-3xl text-gray-900 mt-1">{alerts.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-500">Filtered Alerts</p>
                        <p className="text-3xl text-gray-900 mt-1">{filteredAlerts.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-500">Critical Cases</p>
                        <p className="text-3xl text-red-600 mt-1">{alerts.filter((a) => a.severity === 'critical').length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-500">Immediate Alerts</p>
                        <p className="text-3xl text-gray-900 mt-1">{alerts.filter((a) => a.immediateAlert).length}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
