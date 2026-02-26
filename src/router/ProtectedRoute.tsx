import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Wraps routes that require authentication.
 * Redirects to /login if the user is not signed in.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { firebaseUser, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!firebaseUser) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
