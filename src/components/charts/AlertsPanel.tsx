import { CheckCircle } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import type { AlertSeverity } from '../../types';

const SEVERITY_CLASS: Record<AlertSeverity, string> = {
    low: 'bg-blue-100 text-blue-800 border border-blue-300',
    medium: 'bg-amber-100 text-amber-800 border border-amber-300',
    high: 'bg-red-100 text-red-800 border border-red-300',
    critical: 'bg-red-600 text-white border border-red-700',
};

function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function AlertsPanel() {
    const { alerts, loading } = useDashboard();

    return (
        <div className="bg-white rounded-lg shadow border h-full">
            <div className="p-4">
                <h3 className="text-base font-semibold mb-4">Active Alerts</h3>

                {loading ? (
                    <div className="space-y-3">
                        <div className="h-12 bg-gray-200 animate-pulse rounded" />
                        <div className="h-12 bg-gray-200 animate-pulse rounded" />
                        <div className="h-12 bg-gray-200 animate-pulse rounded" />
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p>No active alerts</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {alerts.map((alert) => (
                            <li key={alert.id} className="py-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold">{alert.disease}</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_CLASS[alert.severity]}`}
                                    >
                                        {alert.severity}
                                    </span>
                                    {alert.thresholdType === 'cluster' && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-gray-300 text-gray-600">
                                            Cluster
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {alert.region} &middot; {alert.caseCount} cases &middot; {timeAgo(alert.createdAt)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
