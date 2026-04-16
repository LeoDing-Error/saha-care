import { CheckCircle2, Clock, MapPin, Thermometer, Users, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { getReportDisplayTags, type DiseaseQuestionLookup } from '../../utils/reportTags';
import type { Report } from '../../types';

interface ReportDetailDialogProps {
    report: Report | null;
    questionLookup?: DiseaseQuestionLookup;
    open: boolean;
    onClose: () => void;
}

export function ReportDetailDialog({ report, questionLookup, open, onClose }: ReportDetailDialogProps) {
    if (!report) return null;

    const sortedAnswers = Array.isArray(report.answers) ? report.answers : [];
    const { symptoms, dangerSigns } = getReportDisplayTags(report, questionLookup);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
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
                    {symptoms.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Symptoms</p>
                            <div className="flex flex-wrap gap-1">
                                {symptoms.map((symptom, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                        {symptom}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Danger signs */}
                    {dangerSigns.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Danger Signs</p>
                            <div className="flex flex-wrap gap-1">
                                {dangerSigns.map((sign, idx) => (
                                    <Badge key={idx} className="bg-red-100 text-red-700 hover:bg-red-100">
                                        {sign}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Structured assessment answers */}
                    {sortedAnswers.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Assessment Responses</p>
                            <div className="space-y-2">
                                {sortedAnswers.map((item) => (
                                    <div
                                        key={item.questionId}
                                        className="rounded-lg border border-gray-200 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm text-gray-800">{item.questionText}</p>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    item.answer
                                                        ? 'border-green-600 text-green-700'
                                                        : 'border-gray-300 text-gray-600'
                                                }
                                            >
                                                {item.answer ? (
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        No
                                                    </span>
                                                )}
                                            </Badge>
                                        </div>
                                        {typeof item.numericValue === 'number' && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                Recorded value: <span className="font-medium text-gray-900">{item.numericValue}</span>
                                            </p>
                                        )}
                                    </div>
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
