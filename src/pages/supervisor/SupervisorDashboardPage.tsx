import { Typography, Box, Grid } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardProvider } from '../../contexts/DashboardContext';
import { KPICards, CasesByDiseaseChart, CasesOverTimeChart, CasesByStatusChart, AlertsPanel, DashboardFilters } from '../../components/charts';
import { ReportMap } from '../../components/maps';

function DashboardContent() {
    const { userProfile } = useAuth();

    return (
        <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                Regional Analytics
            </Typography>
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
                <Grid size={{ xs: 12, md: 6 }}>
                    <CasesByStatusChart />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
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
