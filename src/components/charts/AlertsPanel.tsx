import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    Chip,
    Box,
    Skeleton,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useDashboard } from '../../hooks/useDashboard';
import type { AlertSeverity } from '../../types';

const SEVERITY_COLOR: Record<AlertSeverity, 'info' | 'warning' | 'error'> = {
    low: 'info',
    medium: 'warning',
    high: 'error',
    critical: 'error',
};

function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function AlertsPanel() {
    const { alerts, loading } = useDashboard();

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Active Alerts
                </Typography>

                {loading ? (
                    <>
                        <Skeleton height={48} />
                        <Skeleton height={48} />
                        <Skeleton height={48} />
                    </>
                ) : alerts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 48, mb: 1, color: 'success.main' }} />
                        <Typography>No active alerts</Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {alerts.map((alert) => (
                            <ListItem key={alert.id} divider sx={{ px: 0 }}>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {alert.disease}
                                            </Typography>
                                            <Chip
                                                label={alert.severity}
                                                size="small"
                                                color={SEVERITY_COLOR[alert.severity]}
                                                variant={alert.severity === 'critical' ? 'filled' : 'outlined'}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            {alert.region} &middot; {alert.caseCount} cases &middot; {timeAgo(alert.createdAt)}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
}
