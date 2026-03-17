import { Typography, Box, Grid, IconButton, Tooltip, Chip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardProvider } from '../../contexts/DashboardContext';
import { useDashboard } from '../../hooks/useDashboard';
import { KPICards, CasesByDiseaseChart, CasesOverTimeChart, AlertsPanel, DashboardFilters } from '../../components/charts';
import { ReportMap } from '../../components/maps';

function DashboardContent() {
    const { userProfile } = useAuth();
    const { refresh, loading, lastUpdated } = useDashboard();

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h5" fontWeight={600}>
                    Regional Analytics
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                        icon={<FiberManualRecordIcon sx={{ fontSize: 10 }} />}
                        label={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Connecting...'}
                        size="small"
                        color="success"
                        variant="outlined"
                    />
                    <Tooltip title="Refresh data">
                        <span>
                            <IconButton onClick={refresh} disabled={loading} size="small">
                                <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {userProfile?.region}
            </Typography>

            <DashboardFilters />
            <KPICards />

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <CasesByDiseaseChart />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <AlertsPanel />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <CasesOverTimeChart />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <ReportMap />
                </Grid>
            </Grid>
        </Box>
    );
}

export default function SupervisorDashboardPage() {
    return (
        <DashboardProvider>
            <DashboardContent />
        </DashboardProvider>
    );
}
