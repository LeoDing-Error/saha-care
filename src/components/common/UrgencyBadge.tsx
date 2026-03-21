import { Chip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { computeUrgency, urgencyColor, urgencyLabel } from '../../utils/urgency';
import type { Report } from '../../types';

interface UrgencyBadgeProps {
    report: Report;
}

export default function UrgencyBadge({ report }: UrgencyBadgeProps) {
    const level = computeUrgency(report);
    const color = urgencyColor(level);
    const label = urgencyLabel(level);
    const showIcon = level === 'critical' || level === 'high';

    return (
        <Chip
            icon={showIcon ? <WarningAmberIcon sx={{ fontSize: 16 }} /> : undefined}
            label={label}
            size="small"
            sx={{
                bgcolor: color,
                color: '#fff',
                fontWeight: 600,
                '& .MuiChip-icon': { color: '#fff' },
            }}
        />
    );
}
