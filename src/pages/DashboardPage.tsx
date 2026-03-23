import { useState, useEffect } from 'react';
import { RefreshCw, MapPin, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToAlerts } from '../services/dashboard';
import type { Alert } from '../types';

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

export function DashboardPage() {
    const { userProfile } = useAuth();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [expandedAlerts, setExpandedAlerts] = useState<string[]>([]);

    useEffect(() => {
        const region = userProfile?.role === 'official' ? undefined : userProfile?.region;
        const unsub = subscribeToAlerts(region, (data) => {
            setAlerts(data);
            setLoading(false);
        });
        return unsub;
    }, [userProfile?.region, userProfile?.role]);

    const filteredAlerts = alerts.filter((alert) => {
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
                    <span className="text-sm text-gray-500">Last updated: just now</span>
                    <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Disease Map */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            Disease Outbreak Map - {userProfile?.region || 'All Regions'}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="cursor-pointer hover:bg-teal-50">All Diseases</Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-teal-50">AWD</Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-teal-50">SARI</Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-teal-50">Measles</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg h-[500px] flex items-center justify-center border-2 border-gray-200 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <svg viewBox="0 0 800 500" className="w-full h-full">
                                <path d="M 100 100 L 200 80 L 300 120 L 400 90 L 500 110 L 600 95 L 700 120" stroke="#0d9488" strokeWidth="2" fill="none" />
                                <path d="M 100 200 L 250 180 L 400 210 L 550 190 L 700 220" stroke="#0d9488" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                        <div className="absolute top-[30%] left-[25%] w-24 h-24 bg-red-500 rounded-full blur-2xl opacity-40"></div>
                        <div className="absolute top-[50%] left-[60%] w-32 h-32 bg-yellow-400 rounded-full blur-2xl opacity-30"></div>
                        <div className="absolute top-[65%] left-[35%] w-20 h-20 bg-green-400 rounded-full blur-2xl opacity-25"></div>
                        <div className="absolute top-[40%] right-[20%] w-28 h-28 bg-orange-500 rounded-full blur-2xl opacity-35"></div>
                        <div className="absolute top-[30%] left-[25%] animate-pulse">
                            <MapPin className="w-8 h-8 text-red-600 fill-red-200" />
                        </div>
                        <div className="absolute top-[50%] left-[60%]">
                            <MapPin className="w-6 h-6 text-yellow-600 fill-yellow-200" />
                        </div>
                        <div className="absolute top-[65%] left-[35%]">
                            <MapPin className="w-5 h-5 text-green-600 fill-green-200" />
                        </div>
                        <div className="absolute top-[40%] right-[20%] animate-pulse">
                            <MapPin className="w-7 h-7 text-orange-600 fill-orange-200" />
                        </div>
                        <div className="text-center z-10">
                            <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                                <Activity className="h-8 w-8 text-teal-600" />
                            </div>
                            <p className="text-gray-600 font-medium">Interactive Heatmap</p>
                            <p className="text-sm text-gray-500 mt-1">Gaza Strip - {userProfile?.region || 'All Regions'}</p>
                            <p className="text-xs text-gray-500 mt-2">{alerts.length} active alerts tracked</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Report Density:</span>
                            <div className="flex items-center gap-1">
                                <div className="w-8 h-4 bg-green-400 rounded"></div>
                                <span className="text-xs text-gray-500">Low</span>
                                <div className="w-8 h-4 bg-yellow-400 rounded mx-1"></div>
                                <span className="text-xs text-gray-500">Medium</span>
                                <div className="w-8 h-4 bg-orange-500 rounded ml-1"></div>
                                <span className="text-xs text-gray-500">High</span>
                                <div className="w-8 h-4 bg-red-500 rounded ml-1"></div>
                                <span className="text-xs text-gray-500">Critical</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Showing active outbreak zones for selected filters</p>
                    </div>
                </CardContent>
            </Card>

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
                                            <div className="mt-3 bg-white rounded-lg border border-gray-200 p-4">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Region:</span>
                                                        <span className="font-medium">{alert.region}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Window:</span>
                                                        <span className="font-medium">{alert.windowHours}h</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Created:</span>
                                                        <span className="font-medium">{alert.createdAt.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
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
