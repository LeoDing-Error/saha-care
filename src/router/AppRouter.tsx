import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import { RootLayout } from '../components/RootLayout';
import { useAuth } from '../contexts/AuthContext';

// Auth pages
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';

// App pages (flat layout under /)
import { DashboardPage } from '../pages/DashboardPage';
import { GuidePage } from '../pages/GuidePage';
import { ReportsPage } from '../pages/ReportsPage';
import { ReportFormPage } from '../pages/ReportFormPage';
import { MessagesPage } from '../pages/MessagesPage';
import { VolunteersPage } from '../pages/VolunteersPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

/** Redirects volunteers to /reports; shows Dashboard for other roles */
function IndexRedirect() {
    const { userProfile } = useAuth();
    if (userProfile?.role === 'volunteer') {
        return <Navigate to="/reports" replace />;
    }
    return <DashboardPage />;
}

export const router = createBrowserRouter([
    // Public routes
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },

    // Protected routes — all children render inside RootLayout (Header + Sidebar)
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <RootLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <IndexRedirect /> },
            { path: 'guide', element: <GuidePage /> },
            { path: 'reports', element: <ReportsPage /> },
            { path: 'report/new', element: <ReportFormPage /> },
            { path: 'messages', element: <MessagesPage /> },
            { path: 'volunteers', element: <RoleGuard allowedRoles={['supervisor', 'official']}><VolunteersPage /></RoleGuard> },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'notifications', element: <NotificationsPage /> },
            { path: '*', element: <NotFoundPage /> },
        ],
    },

    // Fallback for anything not matched above
    { path: '*', element: <Navigate to="/login" replace /> },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
