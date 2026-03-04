import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { User } from '../../types';
import { ROLES } from '../../constants';

interface UserApprovalCardProps {
    user: User;
    onApprove: (user: User) => void;
    onReject: (user: User) => void;
    loading: boolean;
}

export default function UserApprovalCard({
    user,
    onApprove,
    onReject,
    loading,
}: UserApprovalCardProps) {
    const formattedDate = user.createdAt instanceof Date
        ? user.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : 'Unknown';

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            {user.displayName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>
                    <Chip label={ROLES[user.role]} size="small" color="primary" variant="outlined" />
                </Box>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={user.region} size="small" variant="outlined" />
                    <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                        Registered {formattedDate}
                    </Typography>
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                <Button
                    size="small"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => onReject(user)}
                    disabled={loading}
                >
                    Reject
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => onApprove(user)}
                    disabled={loading}
                >
                    Approve
                </Button>
            </CardActions>
        </Card>
    );
}
