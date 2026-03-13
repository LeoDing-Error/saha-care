import { Card, CardContent, Typography, Grid, Skeleton, Box } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BugReportIcon from '@mui/icons-material/BugReport';
import TodayIcon from '@mui/icons-material/Today';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                <Box sx={{ color: color || 'action.active' }}>{icon}</Box>
                <Box>
                    {loading ? (
                        <Skeleton width={60} height={32} />
                    ) : (
                        <Typography variant="h5" fontWeight={700}>
                            {value}
                        </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                        {label}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

export default function KPICards() {
    const { kpis, loading } = useDashboard();

    const cards = [
        { label: 'Total Reports', value: kpis.totalReports, icon: <AssignmentIcon fontSize="large" />, color: '#1976d2' },
        { label: 'Verified', value: kpis.verifiedCount, icon: <CheckCircleIcon fontSize="large" />, color: '#2e7d32' },
        { label: 'Pending', value: kpis.pendingCount, icon: <PendingIcon fontSize="large" />, color: '#ed6c02' },
        { label: 'Active Diseases', value: kpis.activeDiseases, icon: <BugReportIcon fontSize="large" />, color: '#9c27b0' },
        { label: 'Reports Today', value: kpis.reportsToday, icon: <TodayIcon fontSize="large" />, color: '#0288d1' },
        { label: 'Active Alerts', value: kpis.activeAlerts, icon: <WarningAmberIcon fontSize="large" />, color: kpis.activeAlerts > 0 ? '#d32f2f' : '#757575' },
    ];

    return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            {cards.map((card) => (
                <Grid key={card.label} size={{ xs: 6, sm: 4, md: 2 }}>
                    <KPICard {...card} loading={loading} />
                </Grid>
            ))}
        </Grid>
    );
}
