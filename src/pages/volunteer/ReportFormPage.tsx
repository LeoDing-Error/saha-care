import { useNavigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import ReportForm from '../../components/forms/ReportForm';
import { useAuth } from '../../contexts/AuthContext';

export default function ReportFormPage() {
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const homePath = userProfile?.role === 'supervisor' ? '/supervisor' : '/volunteer';

    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
                Submit Case Report
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Complete all steps to submit a new case report for your region.
            </Typography>
            <ReportForm onSuccess={() => navigate(homePath)} />
        </Box>
    );
}
