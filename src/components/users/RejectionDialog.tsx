import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
} from '@mui/material';

const MIN_REASON_LENGTH = 10;

interface RejectionDialogProps {
    open: boolean;
    userName: string;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    loading: boolean;
}

export default function RejectionDialog({
    open,
    userName,
    onConfirm,
    onCancel,
    loading,
}: RejectionDialogProps) {
    const [reason, setReason] = useState('');

    const isValid = reason.length >= MIN_REASON_LENGTH;

    const handleConfirm = () => {
        if (isValid) {
            onConfirm(reason);
            setReason('');
        }
    };

    const handleCancel = () => {
        setReason('');
        onCancel();
    };

    return (
        <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
            <DialogTitle>Reject {userName}?</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Please provide a reason for rejecting this user. They will see this
                    reason and may re-register with updated information.
                </DialogContentText>
                <TextField
                    autoFocus
                    label="Rejection Reason"
                    fullWidth
                    multiline
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    helperText={`${reason.length}/${MIN_REASON_LENGTH} characters minimum`}
                    error={reason.length > 0 && !isValid}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="error"
                    disabled={loading || !isValid}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    Reject
                </Button>
            </DialogActions>
        </Dialog>
    );
}
