import { CircleMarker, Popup } from 'react-leaflet';
import { Typography, Chip, Box } from '@mui/material';
import type { Report } from '../../types';

// Consistent color palette for diseases
const DISEASE_COLORS: Record<string, string> = {
    'Acute Watery Diarrhea': '#1976d2',
    'Bloody Diarrhea': '#d32f2f',
    'Acute Respiratory Infection': '#ed6c02',
    'Measles': '#9c27b0',
    'Meningitis': '#2e7d32',
    'Acute Jaundice Syndrome': '#f9a825',
    'Acute Flaccid Paralysis': '#00695c',
    'Neonatal Tetanus': '#5d4037',
};

const DEFAULT_COLORS = ['#0288d1', '#c62828', '#ef6c00', '#7b1fa2', '#388e3c', '#fbc02d', '#00796b', '#4e342e'];

export function getDiseaseColor(disease: string): string {
    if (DISEASE_COLORS[disease]) return DISEASE_COLORS[disease];
    // Deterministic fallback based on string hash
    let hash = 0;
    for (let i = 0; i < disease.length; i++) {
        hash = disease.charCodeAt(i) + ((hash << 5) - hash);
    }
    return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length];
}

const STATUS_CHIP_COLOR: Record<string, 'warning' | 'success' | 'error'> = {
    pending: 'warning',
    verified: 'success',
    rejected: 'error',
};

interface DiseaseMarkerProps {
    report: Report;
}

export default function DiseaseMarker({ report }: DiseaseMarkerProps) {
    const color = getDiseaseColor(report.disease);

    return (
        <CircleMarker
            center={[report.location.lat, report.location.lng]}
            radius={8}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
        >
            <Popup>
                <Box sx={{ minWidth: 160 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {report.disease}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                        {report.createdAt.toLocaleDateString()}
                    </Typography>
                    <Chip
                        label={report.status}
                        size="small"
                        color={STATUS_CHIP_COLOR[report.status] || 'default'}
                        sx={{ mt: 0.5 }}
                    />
                    {report.location.name && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {report.location.name}
                        </Typography>
                    )}
                </Box>
            </Popup>
        </CircleMarker>
    );
}
