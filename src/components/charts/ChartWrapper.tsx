import type { ReactNode } from 'react';
import { Card, CardContent, Typography, Skeleton, Alert, Box } from '@mui/material';

interface ChartWrapperProps {
    title: string;
    subtitle?: string;
    loading: boolean;
    height?: number;
    children: ReactNode;
    action?: ReactNode;
    isEmpty?: boolean;
}

export default function ChartWrapper({
    title,
    subtitle,
    loading,
    height = 300,
    children,
    action,
    isEmpty = false,
}: ChartWrapperProps) {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    {action}
                </Box>

                {loading ? (
                    <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 1 }} />
                ) : isEmpty ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No data available for the selected filters.
                    </Alert>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}
