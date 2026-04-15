import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table';
import { subscribeToReportsByDisease } from '../../services/reports';
import { ReportDetailDialog } from './ReportDetailDialog';
import type { Alert, Report } from '../../types';

interface AlertReportsListProps {
    alert: Alert;
}

export function AlertReportsList({ alert }: AlertReportsListProps) {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [selectedReportSnapshot, setSelectedReportSnapshot] = useState<Report | null>(null);

    useEffect(() => {
        setLoading(true);
        const unsub = subscribeToReportsByDisease(alert.disease, alert.region, (data) => {
            setReports(data);
            setLoading(false);
        });
        return unsub;
    }, [alert.disease, alert.region]);

    const selectedReport =
        reports.find((report) => report.id === selectedReportId) ??
        (selectedReportSnapshot?.id === selectedReportId ? selectedReportSnapshot : null);

    if (loading) {
        return (
            <div className="mt-3 bg-white rounded-lg border border-gray-200 p-4 text-center text-sm text-gray-500">
                Loading reports...
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="mt-3 bg-white rounded-lg border border-gray-200 p-4 text-center text-sm text-gray-500">
                No reports found for {alert.disease}
            </div>
        );
    }

    return (
        <div className="mt-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Case ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report) => (
                        <TableRow key={report.id}>
                            <TableCell className="font-mono text-xs">
                                {report.caseId || report.id.slice(0, 8).toUpperCase()}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={
                                        report.status === 'verified'
                                            ? 'border-green-500 text-green-700'
                                            : report.status === 'rejected'
                                              ? 'border-red-500 text-red-700'
                                              : 'border-orange-500 text-orange-700'
                                    }
                                >
                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </Badge>
                            </TableCell>
                            <TableCell>{report.reporterName || 'Unknown'}</TableCell>
                            <TableCell>
                                {report.location?.name ||
                                    `${report.location?.lat?.toFixed(4)}, ${report.location?.lng?.toFixed(4)}`}
                            </TableCell>
                            <TableCell className="text-gray-600">
                                {report.createdAt.toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedReportId(report.id);
                                        setSelectedReportSnapshot(report);
                                    }}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Report
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <ReportDetailDialog
                report={selectedReport}
                open={selectedReportId !== null}
                onClose={() => {
                    setSelectedReportId(null);
                    setSelectedReportSnapshot(null);
                }}
            />
        </div>
    );
}
