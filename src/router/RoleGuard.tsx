import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Container, Paper, Typography, Alert } from '@mui/material';
import type { UserRole } from '../types';

interface RoleGuardProps {
    /** Roles allowed to access this route */
    allowedRoles: UserRole[];
    children: React.ReactNode;
}

/**
 * Guards routes by user role and approval status.
 * - If the user's role is not in allowedRoles → redirect to their home
 * - If the user's status is "pending" → show a pending approval message
 */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const { userProfile, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!userProfile) {
        return <Navigate to="/login" replace />;
    }

    // Show pending approval message
    if (userProfile.status === 'pending') {
        return (
            <Container maxWidth="sm">
                <Box sx={{ mt: 8 }}>
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h5" gutterBottom fontWeight={600}>
                            Account Pending Approval
                        </Typography>
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Your account is awaiting approval from a{' '}
                            {userProfile.role === 'volunteer' ? 'supervisor' : 'health official'} in your region.
                            You will be able to access the app once your account is approved.
                        </Alert>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Region: {userProfile.region} · Role: {userProfile.role}
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        );
    }

    // Check role access
    if (!allowedRoles.includes(userProfile.role)) {
        // Redirect to the appropriate home based on user's actual role
        const roleHome: Record<UserRole, string> = {
            volunteer: '/volunteer',
            supervisor: '/supervisor',
            official: '/official',
        };
        return <Navigate to={roleHome[userProfile.role]} replace />;
    }

    return <>{children}</>;
}
