import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

interface RoleGuardProps {
    /** Roles allowed to access this route */
    allowedRoles: UserRole[];
    children: React.ReactNode;
}

/**
 * Guards routes by user role and approval status.
 * - While loading → spinner
 * - No userProfile → redirect to /login
 * - Status "pending" → show a pending-approval message
 * - Role not in allowedRoles → redirect to the user's home route
 */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const { userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div role="progressbar" className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!userProfile) {
        return <Navigate to="/login" replace />;
    }

    // Pending approval screen
    if (userProfile.status === 'pending') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
                <div className="max-w-sm w-full bg-white rounded-xl shadow-md p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Account Pending Approval</h2>
                    <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
                        Your account is awaiting approval from a{' '}
                        {userProfile.role === 'volunteer' ? 'supervisor' : 'health official'} in your region. You will
                        be able to access the app once your account is approved.
                    </div>
                    <p className="mt-4 text-xs text-gray-400">
                        Region: {userProfile.region} &middot; Role: {userProfile.role}
                    </p>
                </div>
            </div>
        );
    }

    // Check role access
    if (!allowedRoles.includes(userProfile.role)) {
        // Redirect to the appropriate home based on the user's actual role
        const roleHome: Record<UserRole, string> = {
            volunteer: '/volunteer',
            supervisor: '/supervisor',
            official: '/official',
        };
        return <Navigate to={roleHome[userProfile.role]} replace />;
    }

    return <>{children}</>;
}
