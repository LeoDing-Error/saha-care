import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { REGIONS } from '../../constants/regions';

const DATE_PRESETS = [
    { value: 'today', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'custom', label: 'Custom' },
] as const;

export default function DashboardFilters() {
    const { userProfile } = useAuth();
    const { filters, setFilters, reports } = useDashboard();
    const isOfficial = userProfile?.role === 'official';

    // Get distinct diseases from reports
    const diseases = useMemo(() => {
        const set = new Set(reports.map((r) => r.disease));
        return Array.from(set).sort();
    }, [reports]);

    return (
        <div className="flex flex-wrap gap-3 mb-6 items-center">
            {/* Date preset toggle */}
            <div className="flex rounded border border-gray-300 overflow-hidden text-sm">
                {DATE_PRESETS.map((preset, i) => (
                    <button
                        key={preset.value}
                        type="button"
                        onClick={() => setFilters({ datePreset: preset.value })}
                        className={[
                            'px-3 py-1.5',
                            i > 0 ? 'border-l border-gray-300' : '',
                            filters.datePreset === preset.value
                                ? 'bg-teal-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50',
                        ].join(' ')}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* Custom date range inputs */}
            {filters.datePreset === 'custom' && (
                <>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-xs text-gray-500">From</label>
                        <input
                            type="date"
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            value={filters.dateRange.start.toISOString().split('T')[0]}
                            onChange={(e) => {
                                const start = new Date(e.target.value);
                                start.setHours(0, 0, 0, 0);
                                setFilters({ dateRange: { ...filters.dateRange, start } });
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-xs text-gray-500">To</label>
                        <input
                            type="date"
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            value={filters.dateRange.end.toISOString().split('T')[0]}
                            onChange={(e) => {
                                const end = new Date(e.target.value);
                                end.setHours(23, 59, 59, 999);
                                setFilters({ dateRange: { ...filters.dateRange, end } });
                            }}
                        />
                    </div>
                </>
            )}

            {/* Disease filter */}
            <select
                className="text-sm border border-gray-300 rounded px-2 py-1.5 min-w-[150px]"
                value={filters.disease}
                onChange={(e) => setFilters({ disease: e.target.value })}
            >
                <option value="all">All Diseases</option>
                {diseases.map((d) => (
                    <option key={d} value={d}>{d}</option>
                ))}
            </select>

            {/* Region filter — officials only */}
            {isOfficial && (
                <select
                    className="text-sm border border-gray-300 rounded px-2 py-1.5 min-w-[150px]"
                    value={filters.region}
                    onChange={(e) => setFilters({ region: e.target.value })}
                >
                    <option value="all">All Regions</option>
                    {REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            )}

            {/* Status filter */}
            <select
                className="text-sm border border-gray-300 rounded px-2 py-1.5 min-w-[120px]"
                value={filters.status}
                onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
            >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>
    );
}
