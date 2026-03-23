import { useState } from 'react';
import { Filter, CheckCircle, X, AlertTriangle, MapPin, Thermometer, Users, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Report {
  id: string;
  disease: string;
  reporter: string;
  submittedDate: string;
  location: string;
  personsAffected: number;
  temperature?: string;
  symptoms: string[];
  dangerSigns: string[];
  immediate: boolean;
  status: 'pending' | 'verified' | 'rejected';
  actionNotes?: string;
  actionedBy?: string;
  actionedDate?: string;
}

const volunteerReports: Report[] = [
  {
    id: 'VR001',
    disease: 'Acute Watery Diarrhea',
    reporter: 'Fatima Al-Masri',
    submittedDate: '2026-03-20 09:23',
    location: 'Rafah - Al-Shaboura',
    personsAffected: 3,
    symptoms: ['Loose stools', 'Dehydration', 'Vomiting'],
    dangerSigns: ['Severe dehydration'],
    immediate: true,
    status: 'pending'
  },
  {
    id: 'VR002',
    disease: 'Suspected Measles',
    reporter: 'Omar Ibrahim',
    submittedDate: '2026-03-20 08:15',
    location: 'Rafah - Block J',
    personsAffected: 1,
    temperature: '38.9°C',
    symptoms: ['Rash', 'Fever', 'Cough', 'Red eyes'],
    dangerSigns: [],
    immediate: true,
    status: 'pending'
  },
  {
    id: 'VR003',
    disease: 'SARI',
    reporter: 'Layla Hassan',
    submittedDate: '2026-03-19 16:42',
    location: 'Rafah - Yibna',
    personsAffected: 2,
    temperature: '39.1°C',
    symptoms: ['Cough', 'Fever', 'Shortness of breath'],
    dangerSigns: ['Difficulty breathing'],
    immediate: false,
    status: 'verified',
    actionNotes: 'Verified. Patients referred to clinic. Following up.',
    actionedBy: 'Ahmed Hassan',
    actionedDate: '2026-03-19 18:20'
  },
  {
    id: 'VR004',
    disease: 'Acute Jaundice Syndrome',
    reporter: 'Mohammed Zaki',
    submittedDate: '2026-03-19 14:10',
    location: 'Rafah - Canada',
    personsAffected: 1,
    symptoms: ['Yellow eyes', 'Dark urine', 'Abdominal pain'],
    dangerSigns: [],
    immediate: false,
    status: 'verified',
    actionNotes: 'Case confirmed. Water source investigation initiated.',
    actionedBy: 'Ahmed Hassan',
    actionedDate: '2026-03-19 15:30'
  },
  {
    id: 'VR005',
    disease: 'Chickenpox',
    reporter: 'Nour Saleh',
    submittedDate: '2026-03-18 11:22',
    location: 'Rafah - Al-Junina',
    personsAffected: 1,
    symptoms: ['Vesicular rash', 'Fever', 'Itching'],
    dangerSigns: [],
    immediate: false,
    status: 'rejected',
    actionNotes: 'Rash does not match chickenpox criteria. Appears to be allergic reaction.',
    actionedBy: 'Ahmed Hassan',
    actionedDate: '2026-03-18 13:45'
  }
];

const supervisorReports: Report[] = [
  {
    id: 'SR001',
    disease: 'Acute Watery Diarrhea',
    reporter: 'Ahmed Hassan',
    submittedDate: '2026-03-19 10:30',
    location: 'Rafah - Al-Shaboura',
    personsAffected: 5,
    symptoms: ['Loose stools', 'Dehydration'],
    dangerSigns: [],
    immediate: false,
    status: 'verified'
  },
  {
    id: 'SR002',
    disease: 'SARI',
    reporter: 'Ahmed Hassan',
    submittedDate: '2026-03-17 15:20',
    location: 'Rafah - Block J',
    personsAffected: 2,
    temperature: '38.5°C',
    symptoms: ['Cough', 'Fever', 'Chest pain'],
    dangerSigns: [],
    immediate: false,
    status: 'verified'
  }
];

export function ReportsPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<'verify' | 'reject' | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  const pendingCount = volunteerReports.filter(r => r.status === 'pending').length;

  const filteredReports = volunteerReports.filter(report => {
    if (filterStatus === 'all') return true;
    return report.status === filterStatus;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
    } else {
      return (b.immediate ? 1 : 0) - (a.immediate ? 1 : 0);
    }
  });

  const handleAction = (report: Report, type: 'verify' | 'reject') => {
    setSelectedReport(report);
    setActionType(type);
    setActionNotes('');
  };

  const handleConfirmAction = () => {
    console.log(`${actionType} report ${selectedReport?.id} with notes: ${actionNotes}`);
    setSelectedReport(null);
    setActionType(null);
    setActionNotes('');
  };

  const ReportCard = ({ report, showActions = true }: { report: Report; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-gray-900">{report.disease}</h3>
                {report.immediate && (
                  <Badge className="bg-red-600 text-white">IMMEDIATE</Badge>
                )}
                <Badge
                  variant="outline"
                  className={
                    report.status === 'verified' ? 'border-green-500 text-green-700' :
                    report.status === 'rejected' ? 'border-red-500 text-red-700' :
                    'border-orange-500 text-orange-700'
                  }
                >
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {report.reporter}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(report.submittedDate).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {report.location}
                </span>
                {report.personsAffected > 1 && (
                  <Badge variant="secondary">{report.personsAffected} persons affected</Badge>
                )}
                {report.temperature && (
                  <span className="flex items-center gap-1">
                    <Thermometer className="h-4 w-4" />
                    {report.temperature}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {report.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {report.symptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{symptom}</Badge>
                    ))}
                  </div>
                )}

                {report.dangerSigns.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {report.dangerSigns.map((sign, idx) => (
                      <Badge key={idx} className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {sign}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {report.actionNotes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-1">{report.actionNotes}</p>
                  <p className="text-xs text-gray-500">
                    {report.status === 'verified' ? 'Verified' : 'Rejected'} by {report.actionedBy} on {new Date(report.actionedDate!).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {showActions && report.status === 'pending' && (
            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleAction(report, 'verify')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => handleAction(report, 'reject')}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-orange-500">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-reports">My Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-500" />
                <div className="flex gap-2 flex-1">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                    className={filterStatus === 'all' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('pending')}
                    className={filterStatus === 'pending' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    Pending {pendingCount > 0 && <Badge className="ml-2 bg-orange-500">{pendingCount}</Badge>}
                  </Button>
                  <Button
                    variant={filterStatus === 'verified' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('verified')}
                    className={filterStatus === 'verified' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    Verified
                  </Button>
                  <Button
                    variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('rejected')}
                    className={filterStatus === 'rejected' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    Rejected
                  </Button>
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

          <div className="space-y-4">
            {sortedReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>

          {sortedReports.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No {filterStatus !== 'all' ? filterStatus : ''} reports found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-reports" className="space-y-4">
          <div className="space-y-4">
            {supervisorReports.map(report => (
              <ReportCard key={report.id} report={report} showActions={false} />
            ))}
          </div>

          {supervisorReports.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">You haven't submitted any reports yet</p>
                <Button className="bg-blue-600 hover:bg-blue-700">Submit Report</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialogs */}
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
            <Button variant="outline" onClick={() => setActionType(null)}>
              Cancel
            </Button>
            <Button
              className={actionType === 'verify' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={handleConfirmAction}
            >
              Confirm {actionType === 'verify' ? 'Verification' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
