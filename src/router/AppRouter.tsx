import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ReportFormPage from '../pages/volunteer/ReportFormPage';
import ReportListPage from '../pages/volunteer/ReportListPage';
import { SupervisorHomePage, PendingVolunteersPage } from '../pages/supervisor';
import { OfficialHomePage, PendingSupervisorsPage } from '../pages/official';

export default function AppRouter() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes wrapped in layout */}
            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                {/* Volunteer routes */}
                <Route
                    path="/volunteer"
                    element={
                        <RoleGuard allowedRoles={['volunteer']}>
                            <ReportListPage />
                        </RoleGuard>
                    }
                />
                <Route
                    path="/volunteer/report"
                    element={
                        <RoleGuard allowedRoles={['volunteer']}>
                            <ReportFormPage />
                        </RoleGuard>
                    }
                />

                {/* Supervisor routes */}
                <Route
                    path="/supervisor"
                    element={
                        <RoleGuard allowedRoles={['supervisor']}>
                            <SupervisorHomePage />
                        </RoleGuard>
                    }
                />
                <Route
                    path="/supervisor/pending-users"
                    element={
                        <RoleGuard allowedRoles={['supervisor']}>
                            <PendingVolunteersPage />
                        </RoleGuard>
                    }
                />
                <Route
                    path="/supervisor/reports"
                    element={
                        <RoleGuard allowedRoles={['supervisor']}>
                            <ReportListPage />
                        </RoleGuard>
                    }
                />

                {/* Official routes */}
                <Route
                    path="/official"
                    element={
                        <RoleGuard allowedRoles={['official']}>
                            <OfficialHomePage />
                        </RoleGuard>
                    }
                />
                <Route
                    path="/official/pending-users"
                    element={
                        <RoleGuard allowedRoles={['official']}>
                            <PendingSupervisorsPage />
                        </RoleGuard>
                    }
                />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
