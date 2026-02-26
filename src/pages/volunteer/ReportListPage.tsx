import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    List,
    ListItem,
    CircularProgress,
    Alert,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { subscribeToMyReports } from '../../services/reports';
import { useAuth } from '../../contexts/AuthContext';
import type { Report } from '../../types';

const STATUS_COLORS: Record<string, 'default' | 'success' | 'error' | 'warning'> = {
    pending: 'warning',
    verified: 'success',
    rejected: 'error',
};

export default function ReportListPage() {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userProfile) return;

        const unsubscribe = subscribeToMyReports(userProfile.uid, (data) => {
            setReports(data);
            setLoading(false);
        });

        return unsubscribe;
    }, [userProfile]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                    My Reports
                </Typography>
                <Button
                    id="new-report-btn"
                    variant="contained"
                    startIcon={<AddCircleIcon />}
                    onClick={() => navigate('/volunteer/report')}
                >
                    New Report
                </Button>
            </Box>

            {reports.length === 0 ? (
                <Alert severity="info">
                    You haven't submitted any reports yet. Click "New Report" to get started.
                </Alert>
            ) : (
                <List disablePadding>
                    {reports.map((report) => (
                        <ListItem key={report.id} disablePadding sx={{ mb: 2 }}>
                            <Card sx={{ width: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={600}>
                                                {report.disease}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {report.createdAt instanceof Date
                                                    ? report.createdAt.toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })
                                                    : 'Pending sync…'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {report.location?.name || `${report.location?.lat?.toFixed(4)}, ${report.location?.lng?.toFixed(4)}`}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={report.status}
                                            color={STATUS_COLORS[report.status] || 'default'}
                                            size="small"
                                        />
                                    </Box>
                                    {report.symptoms.length > 0 && (
                                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {report.symptoms.map((s) => (
                                                <Chip key={s} label={s} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                    )}
                                    {report.verificationNotes && (
                                        <Alert severity={report.status === 'rejected' ? 'error' : 'success'} sx={{ mt: 1 }}>
                                            {report.verificationNotes}
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
}
