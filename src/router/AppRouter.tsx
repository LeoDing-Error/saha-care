import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ReportFormPage from '../pages/volunteer/ReportFormPage';
import ReportListPage from '../pages/volunteer/ReportListPage';

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

                {/* Supervisor routes (placeholder) */}
                <Route
                    path="/supervisor"
                    element={
                        <RoleGuard allowedRoles={['supervisor']}>
                            <div>Supervisor Dashboard — Coming in Sprint 2</div>
                        </RoleGuard>
                    }
                />

                {/* Official routes (placeholder) */}
                <Route
                    path="/official"
                    element={
                        <RoleGuard allowedRoles={['official']}>
                            <div>Official Dashboard — Coming in Sprint 3</div>
                        </RoleGuard>
                    }
                />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
