import { useEffect, useState } from 'react';
import { Typography, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToPendingSupervisors } from '../../services/users';
import { PendingUsersList } from '../../components/users';
import type { User } from '../../types';

export default function PendingSupervisorsPage() {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToPendingSupervisors((data) => {
            setUsers(data);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    if (!userProfile) return null;

    return (
        <Box>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/official')}
                sx={{ mb: 2 }}
            >
                Back to Dashboard
            </Button>
            
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                Pending Supervisors
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                All regions
            </Typography>

            <PendingUsersList
                users={users}
                loading={loading}
                approverId={userProfile.uid}
                emptyMessage="No pending supervisors to review."
            />
        </Box>
    );
}
