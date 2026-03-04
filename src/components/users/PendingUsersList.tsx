import { useState } from 'react';
import { Box, Typography, Alert, Snackbar, CircularProgress } from '@mui/material';
import UserApprovalCard from './UserApprovalCard';
import ApprovalConfirmDialog from './ApprovalConfirmDialog';
import RejectionDialog from './RejectionDialog';
import { approveUser, rejectUser } from '../../services/users';
import type { User } from '../../types';

interface PendingUsersListProps {
    users: User[];
    loading: boolean;
    approverId: string;
    emptyMessage?: string;
}

export default function PendingUsersList({
    users,
    loading,
    approverId,
    emptyMessage = 'No pending users to review.',
}: PendingUsersListProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [dialogType, setDialogType] = useState<'approve' | 'reject' | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleApproveClick = (user: User) => {
        setSelectedUser(user);
        setDialogType('approve');
    };

    const handleRejectClick = (user: User) => {
        setSelectedUser(user);
        setDialogType('reject');
    };

    const handleApproveConfirm = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            await approveUser(selectedUser.uid, approverId);
            setSnackbar({
                open: true,
                message: `${selectedUser.displayName} has been approved`,
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to approve user. Please try again.',
                severity: 'error',
            });
        } finally {
            setActionLoading(false);
            setDialogType(null);
            setSelectedUser(null);
        }
    };

    const handleRejectConfirm = async (reason: string) => {
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            await rejectUser(selectedUser.uid, approverId, reason);
            setSnackbar({
                open: true,
                message: `${selectedUser.displayName} has been rejected`,
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to reject user. Please try again.',
                severity: 'error',
            });
        } finally {
            setActionLoading(false);
            setDialogType(null);
            setSelectedUser(null);
        }
    };

    const handleCancel = () => {
        setDialogType(null);
        setSelectedUser(null);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (users.length === 0) {
        return <Alert severity="info">{emptyMessage}</Alert>;
    }

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {users.length} pending {users.length === 1 ? 'user' : 'users'}
            </Typography>
            
            {users.map((user) => (
                <UserApprovalCard
                    key={user.uid}
                    user={user}
                    onApprove={handleApproveClick}
                    onReject={handleRejectClick}
                    loading={actionLoading}
                />
            ))}

            <ApprovalConfirmDialog
                open={dialogType === 'approve'}
                userName={selectedUser?.displayName || ''}
                onConfirm={handleApproveConfirm}
                onCancel={handleCancel}
                loading={actionLoading}
            />

            <RejectionDialog
                open={dialogType === 'reject'}
                userName={selectedUser?.displayName || ''}
                onConfirm={handleRejectConfirm}
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
