import { Paper, Typography, Box } from '@mui/material';

const GRADIENT_STOPS = [
    { color: '#bd0026', label: 'High' },
    { color: '#fd8d3c', label: '' },
    { color: '#fecc5c', label: 'Medium' },
    { color: '#ffffb2', label: 'Low' },
];

export default function HeatmapLegend() {
    return (
        <Paper
            elevation={2}
            sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                zIndex: 1000,
                p: 1.5,
                maxWidth: 160,
            }}
        >
            <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                Case Intensity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1 }}>
                <Box
                    sx={{
                        width: 16,
                        borderRadius: 1,
                        background: `linear-gradient(to bottom, ${GRADIENT_STOPS.map((s) => s.color).join(', ')})`,
                    }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {GRADIENT_STOPS.filter((s) => s.label).map((stop) => (
                        <Typography key={stop.label} variant="caption">
                            {stop.label}
                        </Typography>
                    ))}
                </Box>
            </Box>
        </Paper>
    );
}
