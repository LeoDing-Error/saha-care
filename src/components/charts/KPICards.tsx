import { ClipboardList, CheckCircle, Clock, Bug, CalendarDays, TriangleAlert, Users } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

interface KPICardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
    loading: boolean;
}

function KPICard({ label, value, icon, color, loading }: KPICardProps) {
    return (
        <div className="bg-white rounded-lg shadow border h-full">
            <div className="flex items-center gap-4 p-4">
                <div style={{ color: color || '#757575' }}>{icon}</div>
                <div>
                    {loading ? (
                        <div className="w-14 h-7 bg-gray-200 animate-pulse rounded" />
                    ) : (
                        <p className="text-2xl font-bold leading-none">{value}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                </div>
            </div>
        </div>
    );
}

export default function KPICards() {
    const { kpis, loading } = useDashboard();

    const cards = [
        { label: 'Total Reports', value: kpis.totalReports, icon: <ClipboardList size={32} />, color: '#1976d2' },
        { label: 'Verified', value: kpis.verifiedCount, icon: <CheckCircle size={32} />, color: '#2e7d32' },
        { label: 'Pending', value: kpis.pendingCount, icon: <Clock size={32} />, color: '#ed6c02' },
        { label: 'Active Diseases', value: kpis.activeDiseases, icon: <Bug size={32} />, color: '#9c27b0' },
        { label: 'Reports Today', value: kpis.reportsToday, icon: <CalendarDays size={32} />, color: '#0288d1' },
        { label: 'Persons Affected', value: kpis.totalPersons, icon: <Users size={32} />, color: '#00695c' },
        { label: 'Active Alerts', value: kpis.activeAlerts, icon: <TriangleAlert size={32} />, color: kpis.activeAlerts > 0 ? '#d32f2f' : '#757575' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {cards.map((card) => (
                <KPICard key={card.label} {...card} loading={loading} />
            ))}
        </div>
    );
}
