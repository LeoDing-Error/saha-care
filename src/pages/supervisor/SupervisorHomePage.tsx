import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Card,
    CardContent,
    CardActionArea,
    Grid,
    Badge,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToPendingCount } from '../../services/users';

export default function SupervisorHomePage() {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (!userProfile) return;

        const unsubscribe = subscribeToPendingCount(
            'volunteer',
            userProfile.region,
            setPendingCount
        );

        return unsubscribe;
    }, [userProfile]);

    return (
        <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                Supervisor Dashboard
            </Typography>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardActionArea onClick={() => navigate('/supervisor/pending-users')}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Badge badgeContent={pendingCount} color="warning">
                                    <PeopleIcon fontSize="large" color="action" />
                                </Badge>
                                <Box>
                                    <Typography variant="h6">Pending Volunteers</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Review and approve volunteer registrations
                                    </Typography>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardActionArea onClick={() => navigate('/supervisor/reports')}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <AssignmentIcon fontSize="large" color="action" />
                                <Box>
                                    <Typography variant="h6">Review Reports</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Verify submitted case reports
                                    </Typography>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardActionArea onClick={() => navigate('/supervisor/submit-report')}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <NoteAddIcon fontSize="large" color="action" />
                                <Box>
                                    <Typography variant="h6">Submit Report</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Create a supervisory summary report
                                    </Typography>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardActionArea onClick={() => navigate('/supervisor/dashboard')}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <BarChartIcon fontSize="large" color="action" />
                                <Box>
                                    <Typography variant="h6">Regional Analytics</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        View charts and maps for your region
                                    </Typography>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
