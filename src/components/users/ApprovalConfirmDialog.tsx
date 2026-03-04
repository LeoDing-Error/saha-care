import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
} from '@mui/material';

interface ApprovalConfirmDialogProps {
    open: boolean;
    userName: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}

export default function ApprovalConfirmDialog({
    open,
    userName,
    onConfirm,
    onCancel,
    loading,
}: ApprovalConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>Approve {userName}?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    This will grant {userName} access to the application. They will be
                    able to submit reports and use all features for their role.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="success"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    Approve
                </Button>
            </DialogActions>
        </Dialog>
    );
}
