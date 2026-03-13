import { useMemo } from 'react';
import {
    Box,
    ToggleButton,
    ToggleButtonGroup,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { REGIONS } from '../../constants/regions';

export default function DashboardFilters() {
    const { userProfile } = useAuth();
    const { filters, setFilters, reports } = useDashboard();
    const isOfficial = userProfile?.role === 'official';

    // Get distinct diseases from reports
    const diseases = useMemo(() => {
        const set = new Set(reports.map((r) => r.disease));
        return Array.from(set).sort();
    }, [reports]);

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
            {/* Date preset toggle */}
            <ToggleButtonGroup
                value={filters.datePreset}
                exclusive
                onChange={(_, value) => {
                    if (value) setFilters({ datePreset: value });
                }}
                size="small"
            >
                <ToggleButton value="today">Today</ToggleButton>
                <ToggleButton value="7d">7 Days</ToggleButton>
                <ToggleButton value="30d">30 Days</ToggleButton>
                <ToggleButton value="custom">Custom</ToggleButton>
            </ToggleButtonGroup>

            {/* Custom date range inputs */}
            {filters.datePreset === 'custom' && (
                <>
                    <TextField
                        type="date"
                        label="From"
                        size="small"
                        value={filters.dateRange.start.toISOString().split('T')[0]}
                        onChange={(e) => {
                            const start = new Date(e.target.value);
                            start.setHours(0, 0, 0, 0);
                            setFilters({ dateRange: { ...filters.dateRange, start } });
                        }}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        type="date"
                        label="To"
                        size="small"
                        value={filters.dateRange.end.toISOString().split('T')[0]}
                        onChange={(e) => {
                            const end = new Date(e.target.value);
                            end.setHours(23, 59, 59, 999);
                            setFilters({ dateRange: { ...filters.dateRange, end } });
                        }}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                </>
            )}

            {/* Disease filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Disease</InputLabel>
                <Select
                    value={filters.disease}
                    label="Disease"
                    onChange={(e) => setFilters({ disease: e.target.value })}
                >
                    <MenuItem value="all">All Diseases</MenuItem>
                    {diseases.map((d) => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Region filter — officials only */}
            {isOfficial && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Region</InputLabel>
                    <Select
                        value={filters.region}
                        label="Region"
                        onChange={(e) => setFilters({ region: e.target.value })}
                    >
                        <MenuItem value="all">All Regions</MenuItem>
                        {REGIONS.map((r) => (
                            <MenuItem key={r} value={r}>{r}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Status filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}
