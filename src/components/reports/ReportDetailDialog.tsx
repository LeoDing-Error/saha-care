import { MapPin, Thermometer, Users, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import type { Report } from '../../types';

interface ReportDetailDialogProps {
    report: Report | null;
    open: boolean;
    onClose: () => void;
}

export function ReportDetailDialog({ report, open, onClose }: ReportDetailDialogProps) {
    if (!report) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-500">
                            {report.caseId || report.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span>{report.disease}</span>
                        {report.isImmediateReport && (
                            <Badge className="bg-red-600 text-white">IMMEDIATE</Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Status */}
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

                    {/* Reporter & time */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {report.reporterName || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {report.createdAt.toLocaleString()}
                        </span>
                    </div>

                    {/* Location & vitals */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {report.location?.name ||
                                `${report.location?.lat?.toFixed(4)}, ${report.location?.lng?.toFixed(4)}`}
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

                    {/* Symptoms */}
                    {report.symptoms && report.symptoms.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Symptoms</p>
                            <div className="flex flex-wrap gap-1">
                                {report.symptoms.map((symptom, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                        {symptom}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Verification notes */}
                    {report.verificationNotes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 mb-1">{report.verificationNotes}</p>
                            <p className="text-xs text-gray-500">
                                {report.status === 'verified' ? 'Verified' : 'Rejected'} by{' '}
                                {report.verifiedBy}
                                {report.verifiedAt && ` on ${report.verifiedAt.toLocaleString()}`}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
