import { useState, useEffect } from 'react';
import { Filter, CheckCircle, X, MapPin, Thermometer, Users, Clock, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToRegionReports, subscribeToMyReports, verifyReport, rejectReport } from '../services/reports';
import type { Report } from '../types';

export function ReportsPage() {
    const { userProfile, firebaseUser } = useAuth();
    const [regionReports, setRegionReports] = useState<Report[]>([]);
    const [myReports, setMyReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [actionType, setActionType] = useState<'verify' | 'reject' | null>(null);
    const [actionNotes, setActionNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userProfile?.region) return;
        const unsub = subscribeToRegionReports(userProfile.region, (reports) => {
            setRegionReports(reports);
            setLoading(false);
        });
        return unsub;
    }, [userProfile?.region]);

    useEffect(() => {
        if (!firebaseUser?.uid) return;
        const unsub = subscribeToMyReports(firebaseUser.uid, (reports) => {
            setMyReports(reports);
        });
        return unsub;
    }, [firebaseUser?.uid]);

    const pendingCount = regionReports.filter((r) => r.status === 'pending').length;

    const filteredReports = regionReports.filter((report) => {
        if (filterStatus === 'all') return true;
        return report.status === filterStatus;
    });

    const sortedReports = [...filteredReports].sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt.getTime() - a.createdAt.getTime();
        if (sortBy === 'oldest') return a.createdAt.getTime() - b.createdAt.getTime();
        return (b.isImmediateReport ? 1 : 0) - (a.isImmediateReport ? 1 : 0);
    });

    const handleAction = (report: Report, type: 'verify' | 'reject') => {
        setSelectedReport(report);
        setActionType(type);
        setActionNotes('');
    };

    const handleConfirmAction = async () => {
        if (!selectedReport || !firebaseUser?.uid) return;
        setActionLoading(true);
        try {
            if (actionType === 'verify') {
                await verifyReport(selectedReport.id, firebaseUser.uid, actionNotes || undefined);
            } else {
                await rejectReport(selectedReport.id, firebaseUser.uid, actionNotes || undefined);
            }
        } catch (err) {
            console.error('Action failed:', err);
        } finally {
            setActionLoading(false);
            setSelectedReport(null);
            setActionType(null);
            setActionNotes('');
        }
    };

    const handleMessage = (report: Report) => {
        if (!firebaseUser || !userProfile) return;
        const params = new URLSearchParams({
            reportId: report.id,
            reportDisease: report.disease,
            reportDate: report.createdAt.toISOString(),
            volunteerId: report.reporterId,
            volunteerName: report.reporterName || 'Unknown',
            region: report.region,
        });
        navigate(`/messages?${params.toString()}`);
    };

    const isFakeReporterId = (reporterId: string) => {
        // Firebase UIDs are typically 28+ chars; placeholder IDs like "volunteer-1" are short
        return !reporterId || reporterId.length < 20 || /^(volunteer|supervisor|user)-\d+$/.test(reporterId);
    };

    const ReportCard = ({ report, showActions = true }: { report: Report; showActions?: boolean }) => {
        const fakeReporter = isFakeReporterId(report.reporterId);
        return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <span className="text-xs font-mono text-gray-500 mb-1">{report.caseId || report.id.slice(0, 8).toUpperCase()}</span>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium text-gray-900">{report.disease}</h3>
                                {report.isImmediateReport && <Badge className="bg-red-600 text-white">IMMEDIATE</Badge>}
                                <Badge variant="outline" className={
                                    report.status === 'verified' ? 'border-green-500 text-green-700' :
                                    report.status === 'rejected' ? 'border-red-500 text-red-700' :
                                    'border-orange-500 text-orange-700'
                                }>
                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {report.reporterName || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {report.createdAt.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {report.location?.name || `${report.location?.lat?.toFixed(4)}, ${report.location?.lng?.toFixed(4)}`}
                                </span>
                                {report.personsCount > 1 && (
                                    <Badge variant="secondary">{report.personsCount} persons affected</Badge>
                                )}
                                {report.temp && (
                                    <span className="flex items-center gap-1">
                                        <Thermometer className="h-4 w-4" />
                                        {report.temp}°C
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                {report.symptoms && report.symptoms.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {report.symptoms.map((symptom, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">{symptom}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {report.verificationNotes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700 mb-1">{report.verificationNotes}</p>
                                    <p className="text-xs text-gray-500">
                                        {report.status === 'verified' ? 'Verified' : 'Rejected'} by {report.verifiedBy}
                                        {report.verifiedAt && ` on ${report.verifiedAt.toLocaleString()}`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className={`border-teal-500 text-teal-600 hover:bg-teal-50${fakeReporter ? ' opacity-50 cursor-not-allowed' : ''}`}
                            disabled={fakeReporter}
                            title={fakeReporter ? 'Cannot message — report created with test data' : ''}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!fakeReporter) handleMessage(report);
                            }}
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                        </Button>
                    </div>
                    {showActions && report.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAction(report, 'verify')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify
                            </Button>
                            <Button variant="outline" className="flex-1 border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleAction(report, 'reject')}>
                                <X className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl text-gray-900">Reports</h1>
                <p className="text-sm text-gray-500 mt-1">Review volunteer reports and view your submitted reports</p>
            </div>

            <Tabs defaultValue="review" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="review" className="relative">
                        Review Reports
                        {pendingCount > 0 && <Badge className="ml-2 bg-orange-500">{pendingCount}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="my-reports">My Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="review" className="space-y-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Filter className="h-5 w-5 text-gray-500" />
                                <div className="flex gap-2 flex-1">
                                    {(['all', 'pending', 'verified', 'rejected'] as const).map((status) => (
                                        <Button key={status} variant={filterStatus === status ? 'default' : 'outline'} size="sm"
                                            onClick={() => setFilterStatus(status)}
                                            className={filterStatus === status ? 'bg-teal-600 hover:bg-teal-700' : ''}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                            {status === 'pending' && pendingCount > 0 && <Badge className="ml-2 bg-orange-500">{pendingCount}</Badge>}
                                        </Button>
                                    ))}
                                </div>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest First</SelectItem>
                                        <SelectItem value="oldest">Oldest First</SelectItem>
                                        <SelectItem value="urgent">Most Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading reports...</div>
                    ) : (
                        <div className="space-y-4">
                            {sortedReports.map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                            {sortedReports.length === 0 && (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <p className="text-gray-500">No {filterStatus !== 'all' ? filterStatus : ''} reports found</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="my-reports" className="space-y-4">
                    <div className="space-y-4">
                        {myReports.map((report) => (
                            <ReportCard key={report.id} report={report} showActions={false} />
                        ))}
                        {myReports.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-gray-500 mb-4">You haven't submitted any reports yet</p>
                                    <Button className="bg-blue-600 hover:bg-blue-700">Submit Report</Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={actionType !== null} onOpenChange={() => setActionType(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'verify' ? 'Verify Report' : 'Reject Report'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="notes">
                                {actionType === 'verify' ? 'Add verification notes (optional)' : 'Add rejection notes (optional)'}
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder={actionType === 'verify' ? 'e.g., Contacted volunteer, case confirmed...' : 'e.g., Symptoms do not match case definition...'}
                                value={actionNotes}
                                onChange={(e) => setActionNotes(e.target.value)}
                                className="mt-2"
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
                        <Button
                            className={actionType === 'verify' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            onClick={handleConfirmAction}
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Processing...' : `Confirm ${actionType === 'verify' ? 'Verification' : 'Rejection'}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
