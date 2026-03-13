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
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { subscribeToPendingCount } from '../../services/users';

export default function OfficialHomePage() {
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const unsubscribe = subscribeToPendingCount(
            'supervisor',
            undefined, // Officials see all regions
            setPendingCount
        );

        return unsubscribe;
    }, []);

    return (
        <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                Official Dashboard
            </Typography>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Card>
                        <CardActionArea onClick={() => navigate('/official/pending-users')}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Badge badgeContent={pendingCount} color="warning">
                                    <SupervisorAccountIcon fontSize="large" color="action" />
                                </Badge>
                                <Box>
                                    <Typography variant="h6">Pending Supervisors</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Review and approve supervisor registrations
                                    </Typography>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Card>
                        <CardActionArea onClick={() => navigate('/official/dashboard')}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <DashboardIcon fontSize="large" color="action" />
                                <Box>
                                    <Typography variant="h6">Analytics Dashboard</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        View charts, maps, and surveillance data
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
