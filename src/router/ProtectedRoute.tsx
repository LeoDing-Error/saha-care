import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../services/auth';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { firebaseUser, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div role="progressbar" className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!firebaseUser) {
        return <Navigate to="/login" replace />;
    }

    // Block users whose profile hasn't loaded yet
    if (!userProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div role="progressbar" className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Block pending users
    if (userProfile.status === 'pending') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
                <div className="max-w-sm w-full bg-white rounded-xl shadow-md p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Account Pending Approval</h2>
                    <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
                        Your account is awaiting approval from a{' '}
                        {userProfile.role === 'volunteer' ? 'supervisor' : 'health official'} in your region.
                        You will be able to access the app once your account is approved.
                    </div>
                    <p className="mt-4 text-xs text-gray-400">
                        Region: {userProfile.region} &middot; Role: {userProfile.role}
                    </p>
                    <button
                        onClick={() => signOut()}
                        className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        );
    }

    // Block rejected users
    if (userProfile.status === 'rejected') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
                <div className="max-w-sm w-full bg-white rounded-xl shadow-md p-8 text-center">
                    <h2 className="text-xl font-semibold text-red-700">Account Rejected</h2>
                    <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                        Your account has been rejected. Please contact your regional coordinator for more information.
                    </div>
                    <p className="mt-4 text-xs text-gray-400">
                        Region: {userProfile.region} &middot; Role: {userProfile.role}
                    </p>
                    <button
                        onClick={() => signOut()}
                        className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        );
    }

    return <>{children ?? <Outlet />}</>;
}
