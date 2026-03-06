import { useState } from 'react';
import {
    Typography,
    Box,
    Button,
    TextField,
    Paper,
    Alert,
    CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createSupervisorReport } from '../../services/supervisorReports';

export default function SubmitSupervisorReportPage() {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!userProfile) return null;

    const canSubmit = title.trim().length > 0 && description.trim().length > 0;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setError('');

        try {
            await createSupervisorReport({
                title: title.trim(),
                description: description.trim(),
                region: userProfile.region,
                authorId: userProfile.uid,
                authorName: userProfile.displayName,
            });
            navigate('/supervisor');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to submit report';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/supervisor')}
                sx={{ mb: 2 }}
            >
                Back to Dashboard
            </Button>

            <Typography variant="h5" fontWeight={600} gutterBottom>
                Submit Supervisor Report
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create a summary report for your region ({userProfile.region}).
            </Typography>

            <Paper elevation={2} sx={{ p: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <TextField
                    label="Report Title"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mb: 3 }}
                    required
                />

                <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mb: 3 }}
                    required
                    helperText="Provide a narrative summary of observations, trends, or issues in your region."
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!canSubmit || submitting}
                        onClick={handleSubmit}
                        startIcon={submitting ? <CircularProgress size={16} /> : null}
                    >
                        {submitting ? 'Submitting…' : 'Submit Report'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
