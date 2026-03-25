import { useNavigate } from 'react-router-dom';
import { Droplet, Activity, Bug, AlertTriangle, Wind, Info, Eye, Zap, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useCaseDefinitions } from '../hooks/useCaseDefinitions';
import type { CaseDefinition } from '../types';

const protocolSteps = [
    { number: '01', title: 'Identify', description: 'Cross-check patient symptoms with the case definitions below.' },
    { number: '02', title: 'Stabilize', description: 'Administer immediate first-line aid (e.g., ORS) where applicable.' },
    { number: '03', title: 'Digitize', description: 'Use the REPORT CASE button to sync data with central health HQ.' },
    { number: '04', title: 'Follow Up', description: 'Ensure the patient reaches a professional medical facility.' },
];

const diseaseIconMap: Record<string, { icon: LucideIcon; bg: string; color: string }> = {
    'acute watery diarrhea': { icon: Droplet, bg: 'bg-gray-100', color: 'text-gray-600' },
    'bloody diarrhea': { icon: Droplet, bg: 'bg-red-100', color: 'text-red-600' },
    'severe acute respiratory': { icon: Wind, bg: 'bg-cyan-100', color: 'text-cyan-600' },
    measles: { icon: Activity, bg: 'bg-green-100', color: 'text-green-600' },
    chickenpox: { icon: Bug, bg: 'bg-yellow-100', color: 'text-yellow-600' },
    varicella: { icon: Bug, bg: 'bg-yellow-100', color: 'text-yellow-600' },
    jaundice: { icon: Eye, bg: 'bg-amber-100', color: 'text-amber-600' },
    leishmaniasis: { icon: Bug, bg: 'bg-orange-100', color: 'text-orange-600' },
    'flaccid paralysis': { icon: Zap, bg: 'bg-purple-100', color: 'text-purple-600' },
    pertussis: { icon: Wind, bg: 'bg-teal-100', color: 'text-teal-600' },
    'whooping cough': { icon: Wind, bg: 'bg-teal-100', color: 'text-teal-600' },
    diphtheria: { icon: AlertTriangle, bg: 'bg-red-100', color: 'text-red-600' },
};

function getDiseaseIcon(disease: string) {
    const key = disease.toLowerCase();
    for (const [k, v] of Object.entries(diseaseIconMap)) {
        if (key.includes(k)) return v;
    }
    return { icon: Activity, bg: 'bg-gray-100', color: 'text-gray-600' };
}

export function GuidePage() {
    const navigate = useNavigate();
    const { definitions, loading } = useCaseDefinitions();

    const handleReportCase = (disease: CaseDefinition) => {
        navigate('/report/new', { state: { selectedDisease: disease } });
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl text-gray-900">Guide</h1>
                <p className="text-sm text-gray-500 mt-1">Reporting Protocol & Disease Surveillance Reference</p>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <Info className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl text-gray-900">Reporting Protocol</h2>
                            <p className="text-sm text-gray-600">Standard Operating Procedure for field volunteers</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {protocolSteps.map((step) => (
                            <div key={step.number} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-4xl font-light text-gray-300 mb-2">{step.number}</div>
                                <h3 className="font-medium text-gray-900 mb-1">{step.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-2xl text-gray-900 mb-2">Disease Surveillance Guide</h2>
                <p className="text-gray-600 mb-6">Quick reference and reporting tool for field volunteers.</p>
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading disease definitions...</div>
                ) : definitions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No disease definitions available.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {definitions.map((disease) => {
                            const { icon: Icon, bg, color } = getDiseaseIcon(disease.disease);
                            const recommendations = disease.guidance.split(',').map((r) => r.trim()).filter(Boolean);
                            return (
                                <Card key={disease.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                                                <Icon className={`w-6 h-6 ${color}`} />
                                            </div>
                                            {disease.prioritySurveillance && (
                                                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs px-2 py-0.5">HIGH PRIORITY</Badge>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{disease.disease}</h3>
                                        <div className="mb-4">
                                            <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Case Definition</h4>
                                            <p className="text-sm text-gray-700 leading-relaxed">{disease.definition}</p>
                                        </div>
                                        <div className="mb-6">
                                            <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Recommendations</h4>
                                            <ul className="space-y-1">
                                                {recommendations.map((rec, idx) => (
                                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                                        <span>{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-auto" onClick={() => handleReportCase(disease)}>
                                            <Activity className="w-4 h-4 mr-2" />
                                            REPORT CASE
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
