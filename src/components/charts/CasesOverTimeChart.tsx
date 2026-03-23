import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboard } from '../../hooks/useDashboard';
import ChartWrapper from './ChartWrapper';
import type { AggregatePeriod } from '../../types';

export default function CasesOverTimeChart() {
    const { filteredAggregates, filteredReports, loading, filters, setFilters } = useDashboard();

    const chartData = useMemo(() => {
        const byDate = new Map<string, { date: string; caseCount: number; verifiedCount: number }>();

        // Use aggregates if available, otherwise compute from reports
        if (filteredAggregates.length > 0) {
            for (const agg of filteredAggregates) {
                // Doc ID format: {disease-slug}_{region-slug}_{period}_{date-key}
                const parts = agg.id.split('_');
                const dateKey = parts[parts.length - 1];
                if (!dateKey) continue;

                const existing = byDate.get(dateKey);
                if (existing) {
                    existing.caseCount += agg.caseCount;
                    existing.verifiedCount += agg.verifiedCount;
                } else {
                    byDate.set(dateKey, {
                        date: dateKey,
                        caseCount: agg.caseCount,
                        verifiedCount: agg.verifiedCount,
                    });
                }
            }
        } else {
            for (const report of filteredReports) {
                const dateKey = report.createdAt.toISOString().split('T')[0];
                const existing = byDate.get(dateKey);
                if (existing) {
                    existing.caseCount += 1;
                    if (report.status === 'verified') existing.verifiedCount += 1;
                } else {
                    byDate.set(dateKey, {
                        date: dateKey,
                        caseCount: 1,
                        verifiedCount: report.status === 'verified' ? 1 : 0,
                    });
                }
            }
        }

        return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    }, [filteredAggregates, filteredReports]);

    const handleGranularity = (value: AggregatePeriod) => {
        setFilters({ period: value });
    };

    const granularityToggle = (
        <div className="flex rounded border border-gray-300 overflow-hidden text-sm">
            {(['day', 'week'] as AggregatePeriod[]).map((period, i) => (
                <button
                    key={period}
                    type="button"
                    onClick={() => handleGranularity(period)}
                    className={[
                        'px-3 py-1',
                        i > 0 ? 'border-l border-gray-300' : '',
                        filters.period === period
                            ? 'bg-teal-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50',
                    ].join(' ')}
                >
                    {period === 'day' ? 'Daily' : 'Weekly'}
                </button>
            ))}
        </div>
    );

    return (
        <ChartWrapper
            title="Cases Over Time"
            loading={loading}
            isEmpty={chartData.length === 0}
            action={granularityToggle}
        >
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="caseCount" name="Total Cases" stroke="#1976d2" strokeWidth={2} />
                    <Line type="monotone" dataKey="verifiedCount" name="Verified" stroke="#2e7d32" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
