import { Paper, Typography, Box } from '@mui/material';
import { getDiseaseColor } from './DiseaseMarker';

interface MapLegendProps {
    diseases: string[];
}

export default function MapLegend({ diseases }: MapLegendProps) {
    return (
        <Paper
            elevation={2}
            sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                zIndex: 1000,
                p: 1.5,
                maxWidth: 200,
            }}
        >
            <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                Diseases
            </Typography>
            {diseases.map((disease) => (
                <Box key={disease} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getDiseaseColor(disease),
                            flexShrink: 0,
                        }}
                    />
                    <Typography variant="caption" noWrap>{disease}</Typography>
                </Box>
            ))}
        </Paper>
    );
}
