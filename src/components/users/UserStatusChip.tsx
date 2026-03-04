import { Chip } from '@mui/material';
import type { UserStatus } from '../../types';

const STATUS_COLORS: Record<UserStatus, 'warning' | 'success' | 'error'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
};

interface UserStatusChipProps {
    status: UserStatus;
}

export default function UserStatusChip({ status }: UserStatusChipProps) {
    return (
        <Chip
            label={status}
            color={STATUS_COLORS[status]}
            size="small"
        />
    );
}
