import { Typography, Box, Grid } from '@mui/material';
import { DashboardProvider } from '../../contexts/DashboardContext';
import { KPICards, CasesByDiseaseChart, CasesOverTimeChart, CasesByStatusChart, AlertsPanel, DashboardFilters } from '../../components/charts';
import { ReportMap } from '../../components/maps';

function DashboardContent() {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                Analytics Dashboard
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

export default function DashboardPage() {
    return (
        <DashboardProvider>
            <DashboardContent />
        </DashboardProvider>
    );
}
