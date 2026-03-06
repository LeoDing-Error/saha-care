import { useState } from 'react';
import { Box, Typography, Alert, Snackbar, CircularProgress } from '@mui/material';
import ReportReviewCard from './ReportReviewCard';
import VerificationDialog from './VerificationDialog';
import { verifyReport, rejectReport } from '../../services/reports';
import type { Report } from '../../types';

interface RegionReportsListProps {
    reports: Report[];
    loading: boolean;
    supervisorId: string;
}

export default function RegionReportsList({
    reports,
    loading,
    supervisorId,
}: RegionReportsListProps) {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [dialogType, setDialogType] = useState<'verify' | 'reject' | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleVerifyClick = (report: Report) => {
        setSelectedReport(report);
        setDialogType('verify');
    };

    const handleRejectClick = (report: Report) => {
        setSelectedReport(report);
        setDialogType('reject');
    };

    const handleConfirm = async (notes: string) => {
        if (!selectedReport || !dialogType) return;
        setActionLoading(true);
        try {
            if (dialogType === 'verify') {
                await verifyReport(selectedReport.id, supervisorId, notes || undefined);
            } else {
                await rejectReport(selectedReport.id, supervisorId, notes || undefined);
            }
            setSnackbar({
                open: true,
                message: `Report ${dialogType === 'verify' ? 'verified' : 'rejected'} successfully`,
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: `Failed to ${dialogType} report. Please try again.`,
                severity: 'error',
            });
        } finally {
            setActionLoading(false);
            setDialogType(null);
            setSelectedReport(null);
        }
    };

    const handleCancel = () => {
        setDialogType(null);
        setSelectedReport(null);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (reports.length === 0) {
        return <Alert severity="info">No reports in your region.</Alert>;
    }

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {reports.length} {reports.length === 1 ? 'report' : 'reports'}
            </Typography>

            {reports.map((report) => (
                <ReportReviewCard
                    key={report.id}
                    report={report}
                    onVerify={handleVerifyClick}
                    onReject={handleRejectClick}
                    loading={actionLoading}
                />
            ))}

            <VerificationDialog
                open={dialogType !== null}
                mode={dialogType || 'verify'}
                diseaseName={selectedReport?.disease || ''}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                loading={actionLoading}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                message={snackbar.message}
            />
        </Box>
    );
}
