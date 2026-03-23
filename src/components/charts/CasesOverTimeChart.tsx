import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
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
                // Prefer explicit dateKey field; fall back to parsing doc ID
                const dateKey = agg.dateKey || agg.id.split('_').pop();
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

    const handleGranularity = (_: React.MouseEvent<HTMLElement>, value: AggregatePeriod | null) => {
        if (value) {
            setFilters({ period: value });
        }
    };

    const granularityToggle = (
        <ToggleButtonGroup
            value={filters.period}
            exclusive
            onChange={handleGranularity}
            size="small"
        >
            <ToggleButton value="day">Daily</ToggleButton>
            <ToggleButton value="week">Weekly</ToggleButton>
        </ToggleButtonGroup>
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
