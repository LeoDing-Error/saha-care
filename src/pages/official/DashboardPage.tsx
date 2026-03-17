import { Typography, Box, Grid, IconButton, Tooltip, Chip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { DashboardProvider } from '../../contexts/DashboardContext';
import { useDashboard } from '../../hooks/useDashboard';
import { KPICards, CasesByDiseaseChart, CasesOverTimeChart, AlertsPanel, DashboardFilters } from '../../components/charts';
import { ReportMap } from '../../components/maps';

function DashboardContent() {
    const { refresh, loading, lastUpdated } = useDashboard();

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                    Analytics Dashboard
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

export default function DashboardPage() {
    return (
        <DashboardProvider>
            <DashboardContent />
        </DashboardProvider>
    );
}
