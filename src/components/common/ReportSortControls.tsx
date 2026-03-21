import { Box, FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { ReportSortField, SortDirection } from '../../utils/urgency';

interface ReportSortControlsProps {
    sortField: ReportSortField;
    sortDirection: SortDirection;
    onSortChange: (field: ReportSortField, direction: SortDirection) => void;
}

const SORT_OPTIONS: { field: ReportSortField; label: string }[] = [
    { field: 'urgency', label: 'Urgency' },
    { field: 'date', label: 'Date' },
    { field: 'disease', label: 'Disease' },
    { field: 'status', label: 'Status' },
];

export default function ReportSortControls({ sortField, sortDirection, onSortChange }: ReportSortControlsProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="sort-field-label">Sort by</InputLabel>
                <Select
                    labelId="sort-field-label"
                    label="Sort by"
                    value={sortField}
                    onChange={(e) => onSortChange(e.target.value as ReportSortField, sortDirection)}
                >
                    {SORT_OPTIONS.map((opt) => (
                        <MenuItem key={opt.field} value={opt.field}>
                            {opt.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Tooltip title={sortDirection === 'desc' ? 'Descending' : 'Ascending'}>
                <IconButton
                    size="small"
                    onClick={() => onSortChange(sortField, sortDirection === 'desc' ? 'asc' : 'desc')}
                >
                    {sortDirection === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                </IconButton>
            </Tooltip>
        </Box>
    );
}
