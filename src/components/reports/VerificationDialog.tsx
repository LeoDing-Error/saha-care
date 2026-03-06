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

interface VerificationDialogProps {
    open: boolean;
    mode: 'verify' | 'reject';
    diseaseName: string;
    onConfirm: (notes: string) => void;
    onCancel: () => void;
    loading: boolean;
}

export default function VerificationDialog({
    open,
    mode,
    diseaseName,
    onConfirm,
    onCancel,
    loading,
}: VerificationDialogProps) {
    const [notes, setNotes] = useState('');

    const handleConfirm = () => {
        onConfirm(notes);
        setNotes('');
    };

    const handleCancel = () => {
        setNotes('');
        onCancel();
    };

    const isVerify = mode === 'verify';

    return (
        <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
            <DialogTitle>{isVerify ? 'Verify' : 'Reject'} Report: {diseaseName}?</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    {isVerify
                        ? 'Confirm that this report has been reviewed and is accurate.'
                        : 'Please provide a reason for rejecting this report.'}
                </DialogContentText>
                <TextField
                    autoFocus
                    label={isVerify ? 'Notes (optional)' : 'Rejection Reason (optional)'}
                    fullWidth
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color={isVerify ? 'success' : 'error'}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {isVerify ? 'Verify' : 'Reject'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
