import { useEffect, useMemo, useState } from 'react';
import { Typography, Box, Button, Tabs, Tab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToRegionReports } from '../../services/reports';
import { RegionReportsList } from '../../components/reports';
import ReportSortControls from '../../components/common/ReportSortControls';
import { sortReports } from '../../utils/urgency';
import type { ReportSortField, SortDirection } from '../../utils/urgency';
import type { Report, ReportStatus } from '../../types';

type StatusFilter = 'all' | ReportStatus;

export default function ReviewReportsPage() {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
    const [sortField, setSortField] = useState<ReportSortField>(
        () => (sessionStorage.getItem('reviewSortField') as ReportSortField) || 'urgency'
    );
    const [sortDirection, setSortDirection] = useState<SortDirection>(
        () => (sessionStorage.getItem('reviewSortDirection') as SortDirection) || 'desc'
    );

    useEffect(() => {
        if (!userProfile) return;

        const unsubscribe = subscribeToRegionReports(userProfile.region, (data) => {
            setReports(data);
            setLoading(false);
        });

        return unsubscribe;
    }, [userProfile]);

    useEffect(() => {
        sessionStorage.setItem('reviewSortField', sortField);
        sessionStorage.setItem('reviewSortDirection', sortDirection);
    }, [sortField, sortDirection]);

    const filteredReports = useMemo(() => {
        if (statusFilter === 'all') return reports;
        return reports.filter((r) => r.status === statusFilter);
    }, [reports, statusFilter]);

    const sortedReports = useMemo(
        () => sortReports(filteredReports, sortField, sortDirection),
        [filteredReports, sortField, sortDirection]
    );

    const countByStatus = useMemo(() => {
        const counts = { all: reports.length, pending: 0, verified: 0, rejected: 0 };
        for (const r of reports) {
            counts[r.status]++;
        }
        return counts;
    }, [reports]);

    const handleSortChange = (field: ReportSortField, direction: SortDirection) => {
        setSortField(field);
        setSortDirection(direction);
    };

    if (!userProfile) return null;

    return (
        <Box>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/supervisor')}
                sx={{ mb: 2 }}
            >
                Back to Dashboard
            </Button>

            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                Review Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Region: {userProfile.region}
            </Typography>

            <Tabs
                value={statusFilter}
                onChange={(_, value: StatusFilter) => setStatusFilter(value)}
                sx={{ mb: 2 }}
            >
                <Tab label={`All (${countByStatus.all})`} value="all" />
                <Tab label={`Pending (${countByStatus.pending})`} value="pending" />
                <Tab label={`Verified (${countByStatus.verified})`} value="verified" />
                <Tab label={`Rejected (${countByStatus.rejected})`} value="rejected" />
            </Tabs>

            <ReportSortControls
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
            />

            <RegionReportsList
                reports={sortedReports}
                loading={loading}
                supervisorId={userProfile.uid}
            />
        </Box>
    );
}
