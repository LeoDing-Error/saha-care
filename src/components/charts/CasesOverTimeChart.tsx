import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useDashboard } from '../../hooks/useDashboard';
import ChartWrapper from './ChartWrapper';
import type { AggregatePeriod } from '../../types';

export default function CasesOverTimeChart() {
    const { filteredAggregates, loading, filters, setFilters } = useDashboard();

    const chartData = useMemo(() => {
        // Group aggregates by date key (extracted from doc ID)
        const byDate = new Map<string, { date: string; caseCount: number; verifiedCount: number }>();

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

        return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    }, [filteredAggregates]);

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
