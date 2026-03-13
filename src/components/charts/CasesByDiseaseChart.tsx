import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboard } from '../../hooks/useDashboard';
import ChartWrapper from './ChartWrapper';

export default function CasesByDiseaseChart() {
    const { filteredAggregates, loading } = useDashboard();

    const chartData = useMemo(() => {
        const byDisease = new Map<string, { disease: string; caseCount: number; verifiedCount: number }>();

        for (const agg of filteredAggregates) {
            const existing = byDisease.get(agg.disease);
            if (existing) {
                existing.caseCount += agg.caseCount;
                existing.verifiedCount += agg.verifiedCount;
            } else {
                byDisease.set(agg.disease, {
                    disease: agg.disease,
                    caseCount: agg.caseCount,
                    verifiedCount: agg.verifiedCount,
                });
            }
        }

        return Array.from(byDisease.values()).sort((a, b) => b.caseCount - a.caseCount);
    }, [filteredAggregates]);

    return (
        <ChartWrapper title="Cases by Disease" loading={loading} isEmpty={chartData.length === 0}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="disease" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="caseCount" name="Total Cases" fill="#1976d2" />
                    <Bar dataKey="verifiedCount" name="Verified" fill="#2e7d32" />
                </BarChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
