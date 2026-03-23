import { useState } from 'react';
import { RefreshCw, AlertTriangle, MapPin, Activity, ChevronDown, ChevronUp, User, Calendar, MapPinned } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const allAlertsData = [
  {
    disease: 'Acute Watery Diarrhea',
    severity: 'High',
    count: 8,
    threshold: 5,
    timeWindow: '24h',
    status: 'Active',
    immediate: false,
    time: '2 hours ago',
    cases: [
      { id: 'AWD-001', patient: 'Female, 34 yrs', location: 'Block A, Shelter 12', reported: '2 hours ago', volunteer: 'Ahmed K.' },
      { id: 'AWD-002', patient: 'Male, 8 yrs', location: 'Block C, Shelter 45', reported: '3 hours ago', volunteer: 'Fatima M.' },
      { id: 'AWD-003', patient: 'Female, 45 yrs', location: 'Block A, Shelter 18', reported: '4 hours ago', volunteer: 'Ahmed K.' },
      { id: 'AWD-004', patient: 'Male, 12 yrs', location: 'Block B, Shelter 32', reported: '6 hours ago', volunteer: 'Sarah L.' },
      { id: 'AWD-005', patient: 'Female, 6 yrs', location: 'Block A, Shelter 12', reported: '8 hours ago', volunteer: 'Ahmed K.' },
      { id: 'AWD-006', patient: 'Male, 56 yrs', location: 'Block D, Shelter 67', reported: '12 hours ago', volunteer: 'Omar S.' },
      { id: 'AWD-007', patient: 'Female, 29 yrs', location: 'Block C, Shelter 41', reported: '18 hours ago', volunteer: 'Fatima M.' },
      { id: 'AWD-008', patient: 'Male, 3 yrs', location: 'Block B, Shelter 28', reported: '22 hours ago', volunteer: 'Sarah L.' },
    ]
  },
  {
    disease: 'Suspected Measles',
    severity: 'Critical',
    count: 2,
    threshold: 1,
    timeWindow: '48h',
    status: 'Active',
    immediate: true,
    time: '30 min ago',
    cases: [
      { id: 'MEA-001', patient: 'Male, 4 yrs', location: 'Block F, Shelter 89', reported: '30 min ago', volunteer: 'Layla H.' },
      { id: 'MEA-002', patient: 'Female, 6 yrs', location: 'Block F, Shelter 91', reported: '1 day ago', volunteer: 'Layla H.' },
    ]
  },
  {
    disease: 'SARI',
    severity: 'Medium',
    count: 12,
    threshold: 10,
    timeWindow: '7d',
    status: 'Active',
    immediate: false,
    time: '5 hours ago',
    cases: [
      { id: 'SARI-001', patient: 'Male, 67 yrs', location: 'Block E, Shelter 72', reported: '5 hours ago', volunteer: 'Yusuf A.' },
      { id: 'SARI-002', patient: 'Female, 54 yrs', location: 'Block B, Shelter 23', reported: '1 day ago', volunteer: 'Sarah L.' },
      { id: 'SARI-003', patient: 'Male, 71 yrs', location: 'Block A, Shelter 9', reported: '2 days ago', volunteer: 'Ahmed K.' },
      { id: 'SARI-004', patient: 'Female, 43 yrs', location: 'Block D, Shelter 56', reported: '2 days ago', volunteer: 'Omar S.' },
      { id: 'SARI-005', patient: 'Male, 58 yrs', location: 'Block C, Shelter 38', reported: '3 days ago', volunteer: 'Fatima M.' },
      { id: 'SARI-006', patient: 'Female, 62 yrs', location: 'Block E, Shelter 78', reported: '3 days ago', volunteer: 'Yusuf A.' },
      { id: 'SARI-007', patient: 'Male, 49 yrs', location: 'Block B, Shelter 31', reported: '4 days ago', volunteer: 'Sarah L.' },
      { id: 'SARI-008', patient: 'Female, 55 yrs', location: 'Block A, Shelter 15', reported: '4 days ago', volunteer: 'Ahmed K.' },
      { id: 'SARI-009', patient: 'Male, 64 yrs', location: 'Block D, Shelter 61', reported: '5 days ago', volunteer: 'Omar S.' },
      { id: 'SARI-010', patient: 'Female, 70 yrs', location: 'Block C, Shelter 47', reported: '5 days ago', volunteer: 'Fatima M.' },
      { id: 'SARI-011', patient: 'Male, 52 yrs', location: 'Block F, Shelter 84', reported: '6 days ago', volunteer: 'Layla H.' },
      { id: 'SARI-012', patient: 'Female, 68 yrs', location: 'Block E, Shelter 73', reported: '6 days ago', volunteer: 'Yusuf A.' },
    ]
  },
  {
    disease: 'Chickenpox',
    severity: 'Low',
    count: 6,
    threshold: 10,
    timeWindow: '7d',
    status: 'Monitoring',
    immediate: false,
    time: '1 day ago',
    cases: [
      { id: 'CPX-001', patient: 'Male, 7 yrs', location: 'Block G, Shelter 102', reported: '1 day ago', volunteer: 'Noor D.' },
      { id: 'CPX-002', patient: 'Female, 9 yrs', location: 'Block G, Shelter 105', reported: '2 days ago', volunteer: 'Noor D.' },
      { id: 'CPX-003', patient: 'Male, 5 yrs', location: 'Block G, Shelter 102', reported: '3 days ago', volunteer: 'Noor D.' },
      { id: 'CPX-004', patient: 'Female, 11 yrs', location: 'Block H, Shelter 118', reported: '4 days ago', volunteer: 'Hassan R.' },
      { id: 'CPX-005', patient: 'Male, 6 yrs', location: 'Block G, Shelter 108', reported: '5 days ago', volunteer: 'Noor D.' },
      { id: 'CPX-006', patient: 'Female, 8 yrs', location: 'Block H, Shelter 121', reported: '6 days ago', volunteer: 'Hassan R.' },
    ]
  },
  {
    disease: 'Bloody Diarrhea',
    severity: 'Critical',
    count: 1,
    threshold: 1,
    timeWindow: '24h',
    status: 'Active',
    immediate: true,
    time: '15 min ago',
    cases: [
      { id: 'ABD-001', patient: 'Female, 2 yrs', location: 'Block I, Shelter 132', reported: '15 min ago', volunteer: 'Rania T.' },
    ]
  },
  {
    disease: 'Jaundice',
    severity: 'High',
    count: 4,
    threshold: 3,
    timeWindow: '7d',
    status: 'Active',
    immediate: false,
    time: '3 hours ago',
    cases: [
      { id: 'JAU-001', patient: 'Male, 38 yrs', location: 'Block J, Shelter 145', reported: '3 hours ago', volunteer: 'Karim W.' },
      { id: 'JAU-002', patient: 'Female, 42 yrs', location: 'Block J, Shelter 148', reported: '1 day ago', volunteer: 'Karim W.' },
      { id: 'JAU-003', patient: 'Male, 51 yrs', location: 'Block K, Shelter 159', reported: '3 days ago', volunteer: 'Aisha N.' },
      { id: 'JAU-004', patient: 'Female, 36 yrs', location: 'Block J, Shelter 142', reported: '5 days ago', volunteer: 'Karim W.' },
    ]
  },
];

export function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedAlerts, setExpandedAlerts] = useState<number[]>([]);

  // Filter alerts based on selected filters
  const filteredAlerts = allAlertsData.filter(alert => {
    const matchesTime = timeFilter === 'all' ||
      (timeFilter === '24h' && alert.timeWindow === '24h') ||
      (timeFilter === '48h' && (alert.timeWindow === '24h' || alert.timeWindow === '48h')) ||
      (timeFilter === '7d' && alert.timeWindow === '7d');

    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;

    return matchesTime && matchesSeverity;
  });

  const toggleAlert = (index: number) => {
    if (expandedAlerts.includes(index)) {
      setExpandedAlerts(expandedAlerts.filter(i => i !== index));
    } else {
      setExpandedAlerts([...expandedAlerts, index]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Rafah Region</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">Last updated: 2 min ago</span>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Disease Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Disease Outbreak Map - Rafah Region</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-teal-50">All Diseases</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-teal-50">AWD</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-teal-50">SARI</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-teal-50">Measles</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg h-[500px] flex items-center justify-center border-2 border-gray-200 relative overflow-hidden">
            {/* Map Placeholder */}
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 800 500" className="w-full h-full">
                <path d="M 100 100 L 200 80 L 300 120 L 400 90 L 500 110 L 600 95 L 700 120" stroke="#0d9488" strokeWidth="2" fill="none" />
                <path d="M 100 200 L 250 180 L 400 210 L 550 190 L 700 220" stroke="#0d9488" strokeWidth="2" fill="none" />
                <path d="M 100 300 L 300 280 L 500 310 L 700 290" stroke="#0d9488" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {/* Heat spots */}
            <div className="absolute top-[30%] left-[25%] w-24 h-24 bg-red-500 rounded-full blur-2xl opacity-40"></div>
            <div className="absolute top-[50%] left-[60%] w-32 h-32 bg-yellow-400 rounded-full blur-2xl opacity-30"></div>
            <div className="absolute top-[65%] left-[35%] w-20 h-20 bg-green-400 rounded-full blur-2xl opacity-25"></div>
            <div className="absolute top-[40%] right-[20%] w-28 h-28 bg-orange-500 rounded-full blur-2xl opacity-35"></div>

            {/* Map pins */}
            <div className="absolute top-[30%] left-[25%] animate-pulse">
              <MapPin className="w-8 h-8 text-red-600 fill-red-200" />
            </div>
            <div className="absolute top-[50%] left-[60%]">
              <MapPin className="w-6 h-6 text-yellow-600 fill-yellow-200" />
            </div>
            <div className="absolute top-[65%] left-[35%]">
              <MapPin className="w-5 h-5 text-green-600 fill-green-200" />
            </div>
            <div className="absolute top-[40%] right-[20%] animate-pulse">
              <MapPin className="w-7 h-7 text-orange-600 fill-orange-200" />
            </div>

            <div className="text-center z-10">
              <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Activity className="h-8 w-8 text-teal-600" />
              </div>
              <p className="text-gray-600 font-medium">Interactive Heatmap</p>
              <p className="text-sm text-gray-500 mt-1">Gaza Strip - Rafah Region</p>
              <p className="text-xs text-gray-500 mt-2">247 reports tracked across the region</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Report Density:</span>
              <div className="flex items-center gap-1">
                <div className="w-8 h-4 bg-green-400 rounded"></div>
                <span className="text-xs text-gray-500">Low</span>
                <div className="w-8 h-4 bg-yellow-400 rounded mx-1"></div>
                <span className="text-xs text-gray-500">Medium</span>
                <div className="w-8 h-4 bg-orange-500 rounded ml-1"></div>
                <span className="text-xs text-gray-500">High</span>
                <div className="w-8 h-4 bg-red-500 rounded ml-1"></div>
                <span className="text-xs text-gray-500">Critical</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">Showing active outbreak zones for selected filters</p>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts with Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Alerts</CardTitle>
            <div className="flex items-center gap-3">
              {/* Time Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Time:</span>
                <div className="flex gap-1">
                  <Button
                    variant={timeFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeFilter('all')}
                    className={timeFilter === 'all' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    All
                  </Button>
                  <Button
                    variant={timeFilter === '24h' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeFilter('24h')}
                    className={timeFilter === '24h' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    24h
                  </Button>
                  <Button
                    variant={timeFilter === '48h' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeFilter('48h')}
                    className={timeFilter === '48h' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    48h
                  </Button>
                  <Button
                    variant={timeFilter === '7d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeFilter('7d')}
                    className={timeFilter === '7d' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    7d
                  </Button>
                </div>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Severity:</span>
                <div className="flex gap-1">
                  <Button
                    variant={severityFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSeverityFilter('all')}
                    className={severityFilter === 'all' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    All
                  </Button>
                  <Button
                    variant={severityFilter === 'Critical' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSeverityFilter('Critical')}
                    className={severityFilter === 'Critical' ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    Critical
                  </Button>
                  <Button
                    variant={severityFilter === 'High' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSeverityFilter('High')}
                    className={severityFilter === 'High' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                  >
                    High
                  </Button>
                  <Button
                    variant={severityFilter === 'Medium' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSeverityFilter('Medium')}
                    className={severityFilter === 'Medium' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={severityFilter === 'Low' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSeverityFilter('Low')}
                    className={severityFilter === 'Low' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    Low
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => {
                const severityColors = {
                  Critical: 'bg-red-100 text-red-700 border-red-300',
                  High: 'bg-orange-100 text-orange-700 border-orange-300',
                  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                  Low: 'bg-blue-100 text-blue-700 border-blue-300',
                };

                return (
                  <div key={index} className={`p-4 rounded-lg border-2 ${severityColors[alert.severity as keyof typeof severityColors]}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{alert.disease}</h4>
                          {alert.immediate && (
                            <Badge className="bg-red-600 text-white">IMMEDIATE</Badge>
                          )}
                          <Badge variant="outline">{alert.severity}</Badge>
                          <span className="text-xs text-gray-500">{alert.time}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium">{alert.count} cases</span>
                          <span className="text-gray-600">/ threshold: {alert.threshold}</span>
                          <span className="text-gray-600">in {alert.timeWindow}</span>
                        </div>
                      </div>
                      <Badge className={alert.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {alert.status}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAlert(index)}
                      >
                        {expandedAlerts.includes(index) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        {expandedAlerts.includes(index) ? 'Hide' : 'Show'} Cases
                      </Button>
                    </div>
                    {expandedAlerts.includes(index) && (
                      <div className="mt-3">
                        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                          <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                            <h5 className="text-sm font-medium text-gray-900">Individual Cases</h5>
                            <Badge variant="outline" className="bg-white">{alert.cases.length} total</Badge>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {alert.cases.map((caseItem, caseIndex) => (
                              <div key={caseIndex} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">{caseItem.id}</Badge>
                                      <span className="text-sm font-medium text-gray-900">{caseItem.patient}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <MapPinned className="h-3 w-3" />
                                        <span>{caseItem.location}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{caseItem.reported}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        <span>{caseItem.volunteer}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No alerts match the selected filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Reports</p>
            <p className="text-3xl text-gray-900 mt-1">247</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Active Alerts</p>
            <p className="text-3xl text-gray-900 mt-1">{filteredAlerts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Critical Cases</p>
            <p className="text-3xl text-red-600 mt-1">{filteredAlerts.filter(a => a.severity === 'Critical').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Last 24h</p>
            <p className="text-3xl text-gray-900 mt-1">18</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
