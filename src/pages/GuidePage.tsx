import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Activity, Bug, AlertTriangle, Wind, Info, Eye, Zap, Search, type LucideIcon } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface GuideDisease {
    disease: string;
    definition: string;
    recommendations: string[];
    prioritySurveillance: boolean;
    reportDisease: string;
}

const GUIDE_DISEASES: GuideDisease[] = [
    {
        disease: 'Acute Watery Diarrhea',
        definition: '3 or more loose or watery stools in one day, with no blood.',
        recommendations: [
            'Give ORS after each loose stool (children under 2: 50–100 ml, children 2–10: 100–200 ml, adults: 200–250 ml).',
            'See a doctor if diarrhea lasts more than 3 days, blood appears in stool, or person cannot keep fluids down.',
        ],
        prioritySurveillance: true,
        reportDisease: 'Acute Watery Diarrhea',
    },
    {
        disease: 'Acute Bloody Diarrhea',
        definition: 'Loose stools with visible blood.',
        recommendations: [
            'See a doctor right away.',
            'Give ORS if available.',
        ],
        prioritySurveillance: true,
        reportDisease: 'Acute Bloody Diarrhea',
    },
    {
        disease: 'Severe Acute Respiratory Infection (SARI)',
        definition: 'Fever with cough and trouble breathing.',
        recommendations: [
            'See a doctor right away.',
            'Keep the person sitting upright to help with breathing.',
            'Offer small sips of water.',
        ],
        prioritySurveillance: true,
        reportDisease: 'Severe Acute Respiratory Infection (SARI)',
    },
    {
        disease: 'Suspected Measles',
        definition: 'Fever with a red rash, plus cough, runny nose, or red eyes.',
        recommendations: [
            'Keep the person away from others (very contagious — stay isolated for 4 days after rash starts).',
            'Give Vitamin A if available.',
            'Drink plenty of fluids.',
            'Gently clean eyes with a damp cloth.',
            'See a doctor if breathing gets difficult, person cannot drink, or rash gets worse.',
        ],
        prioritySurveillance: true,
        reportDisease: 'Suspected Measles',
    },
    {
        disease: 'Chickenpox (Varicella)',
        definition: 'Itchy blisters filled with fluid, fever, and headache.',
        recommendations: [
            'Keep the person away from others until blisters have dried and crusted (about 5–7 days).',
            'Drink plenty of fluids.',
            'Use a cool damp cloth on blisters to ease itching.',
            'Give paracetamol for fever if available.',
            'See a doctor if blisters look infected (red, swollen, or have pus).',
        ],
        prioritySurveillance: false,
        reportDisease: 'Chickenpox (Varicella)',
    },
    {
        disease: 'Acute Jaundice Syndrome',
        definition: 'Yellow color in the eyes or skin.',
        recommendations: [
            'See a doctor right away.',
            'Rest and drink plenty of fluids.',
        ],
        prioritySurveillance: true,
        reportDisease: 'Acute Jaundice Syndrome',
    },
    {
        disease: 'Suspected Leishmaniasis',
        definition: 'Skin sores that do not heal, usually not painful.',
        recommendations: [
            'See a doctor if sores have not healed after 2 weeks.',
            'Cover sores with a clean bandage and keep them clean.',
        ],
        prioritySurveillance: false,
        reportDisease: 'Suspected Leishmaniasis',
    },
    {
        disease: 'Acute Flaccid Paralysis (AFP)',
        definition: 'Sudden weakness or limpness in one or more arms or legs in a child under 15.',
        recommendations: [
            'See a doctor right away.',
        ],
        prioritySurveillance: true,
        reportDisease: 'Acute Flaccid Paralysis (AFP)',
    },
    {
        disease: 'Suspected Pertussis (Whooping Cough)',
        definition: 'Severe coughing fits lasting 2 or more weeks; person may vomit after coughing or make a "whoop" sound when breathing in.',
        recommendations: [
            'See a doctor, especially for babies under 6 months.',
            'Keep the person away from other children.',
            'Make sure they drink enough fluids.',
        ],
        prioritySurveillance: false,
        reportDisease: 'Suspected Pertussis (Whooping Cough)',
    },
    {
        disease: 'Suspected Diphtheria',
        definition: 'Sore throat, fever, thick gray patch in the throat, swollen neck, and trouble breathing or swallowing.',
        recommendations: [
            'See a doctor right away.',
            'Keep the person away from others.',
            'This is an emergency if breathing is blocked.',
        ],
        prioritySurveillance: true,
        reportDisease: 'Suspected Diphtheria',
    },
];

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
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDiseases = GUIDE_DISEASES.filter((d) => {
        const term = searchTerm.toLowerCase();
        return (
            d.disease.toLowerCase().includes(term) ||
            d.definition.toLowerCase().includes(term) ||
            d.recommendations.some((r) => r.toLowerCase().includes(term))
        );
    });

    const handleReportCase = (entry: GuideDisease) => {
        navigate('/report/new', { state: { selectedDisease: { disease: entry.reportDisease } } });
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
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search by disease or symptom..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDiseases.map((entry) => {
                        const { icon: Icon, bg, color } = getDiseaseIcon(entry.disease);
                        return (
                            <Card key={entry.disease} className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                                            <Icon className={`w-6 h-6 ${color}`} />
                                        </div>
                                        {entry.prioritySurveillance && (
                                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs px-2 py-0.5">HIGH PRIORITY</Badge>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{entry.disease}</h3>
                                    <div className="mb-4">
                                        <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Case Definition</h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">{entry.definition}</p>
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Recommendations</h4>
                                        <ul className="space-y-1">
                                            {entry.recommendations.map((rec, idx) => (
                                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-auto" onClick={() => handleReportCase(entry)}>
                                        <Activity className="w-4 h-4 mr-2" />
                                        REPORT CASE
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
