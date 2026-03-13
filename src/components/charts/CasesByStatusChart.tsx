import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboard } from '../../hooks/useDashboard';
import ChartWrapper from './ChartWrapper';

const STATUS_COLORS: Record<string, string> = {
    pending: '#ed6c02',
    verified: '#2e7d32',
    rejected: '#d32f2f',
};

export default function CasesByStatusChart() {
    const { filteredReports, loading } = useDashboard();

    const chartData = useMemo(() => {
        const counts: Record<string, number> = { pending: 0, verified: 0, rejected: 0 };
        for (const report of filteredReports) {
            if (counts[report.status] !== undefined) {
                counts[report.status]++;
            }
        }
        return Object.entries(counts)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    }, [filteredReports]);

    return (
        <ChartWrapper title="Cases by Status" loading={loading} isEmpty={chartData.length === 0} height={250}>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}`}
                    >
                        {chartData.map((entry) => (
                            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#757575'} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
