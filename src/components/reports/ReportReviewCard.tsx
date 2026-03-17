import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Chip,
    Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { Report } from '../../types';

const STATUS_COLORS: Record<string, 'default' | 'success' | 'error' | 'warning'> = {
    pending: 'warning',
    verified: 'success',
    rejected: 'error',
};

interface ReportReviewCardProps {
    report: Report;
    onVerify: (report: Report) => void;
    onReject: (report: Report) => void;
    loading: boolean;
}

export default function ReportReviewCard({
    report,
    onVerify,
    onReject,
    loading,
}: ReportReviewCardProps) {
    const formattedDate = report.createdAt instanceof Date
        ? report.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'Pending sync…';

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            {report.disease}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Reported by {report.reporterName || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {formattedDate}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {report.location?.name || `${report.location?.lat?.toFixed(4)}, ${report.location?.lng?.toFixed(4)}`}
                        </Typography>
                    </Box>
                    <Chip
                        label={report.status}
                        color={STATUS_COLORS[report.status] || 'default'}
                        size="small"
                    />
                </Box>
                {report.personsCount > 1 && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Persons affected: {report.personsCount}
                    </Typography>
                )}
                {report.temp && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Temperature: {report.temp}°C
                    </Typography>
                )}
                {report.symptoms.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {report.symptoms.map((s) => (
                            <Chip key={s} label={s} size="small" variant="outlined" />
                        ))}
                    </Box>
                )}
                {report.dangerSigns && report.dangerSigns.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {report.dangerSigns.map((s) => (
                            <Chip key={s} label={s} size="small" color="error" variant="outlined" />
                        ))}
                    </Box>
                )}
                {report.verificationNotes && (
                    <Alert severity={report.status === 'rejected' ? 'error' : 'success'} sx={{ mt: 1 }}>
                        {report.verificationNotes}
                    </Alert>
                )}
            </CardContent>
            {report.status === 'pending' && (
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Button
                        size="small"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => onReject(report)}
                        disabled={loading}
                    >
                        Reject
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => onVerify(report)}
                        disabled={loading}
                    >
                        Verify
                    </Button>
                </CardActions>
            )}
        </Card>
    );
}
