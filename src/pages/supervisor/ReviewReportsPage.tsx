import { useEffect, useState } from 'react';
import { Typography, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToRegionReports } from '../../services/reports';
import { RegionReportsList } from '../../components/reports';
import type { Report } from '../../types';

export default function ReviewReportsPage() {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userProfile) return;

        const unsubscribe = subscribeToRegionReports(userProfile.region, (data) => {
            setReports(data);
            setLoading(false);
        });

        return unsubscribe;
    }, [userProfile]);

    if (!userProfile) return null;

    return (
        <Box>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/supervisor')}
                sx={{ mb: 2 }}
            >
                Back to Dashboard
            </Button>

            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                Review Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Region: {userProfile.region}
            </Typography>

            <RegionReportsList
                reports={reports}
                loading={loading}
                supervisorId={userProfile.uid}
            />
        </Box>
    );
}
