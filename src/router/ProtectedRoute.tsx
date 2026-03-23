import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wraps routes that require authentication.
 * Renders a loading spinner while auth state is resolving,
 * then redirects to /login if the user is not signed in.
 *
 * When used as a layout route (no children prop), renders <Outlet />.
 * When used with an explicit children prop, renders children.
 */
interface ProtectedRouteProps {
    children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { firebaseUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!firebaseUser) {
        return <Navigate to="/login" replace />;
    }

    return <>{children ?? <Outlet />}</>;
}
