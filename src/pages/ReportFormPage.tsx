import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, MapPin, AlertTriangle, CheckCircle, ChevronRight, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { useCaseDefinitions } from '../hooks/useCaseDefinitions';
import { createReport } from '../services/reports';
import LocationPickerMap from '../components/maps/LocationPickerMap';
import type { CaseDefinition, AssessmentQuestion, ReportLocation } from '../types';

interface LocalDisease {
    id: string;
    name: string;
    summary: string;
    priority: boolean;
    questions: { id: string; text: string; shortLabel?: string; isDangerSign: boolean; hasNumericInput?: boolean; numericLabel?: string; unit?: string }[];
}

const fallbackDiseases: LocalDisease[] = [
    {
        id: 'awd', name: 'Acute Watery Diarrhea', summary: 'Three or more loose/liquid stools per day with no visible blood', priority: false,
        questions: [
            { id: 'q1', text: 'Does the patient have 3+ loose stools in the past 24 hours?', isDangerSign: false },
            { id: 'q2', text: 'Are the stools watery in consistency?', isDangerSign: false },
            { id: 'q3', text: 'Does the patient show signs of dehydration?', isDangerSign: false },
            { id: 'q4', text: 'Is the patient unable to drink or keep fluids down?', isDangerSign: true },
            { id: 'q5', text: 'Has the patient not urinated in over 6 hours (child) or 12 hours (adult)?', isDangerSign: true },
        ]
    },
    {
        id: 'measles', name: 'Suspected Measles', summary: 'Generalized rash with fever and cough/runny nose/red eyes', priority: true,
        questions: [
            { id: 'q1', text: 'Does the patient have a generalized rash lasting 3+ days?', isDangerSign: false },
            { id: 'q2', text: 'Does the patient have fever ≥38°C?', isDangerSign: false, hasNumericInput: true, numericLabel: 'Temperature', unit: '°C' },
            { id: 'q3', text: 'Does the patient have a cough?', isDangerSign: false },
            { id: 'q4', text: 'Does the patient have red eyes (conjunctivitis)?', isDangerSign: false },
            { id: 'q5', text: 'Does the patient have difficulty breathing?', isDangerSign: true },
            { id: 'q6', text: 'Does the patient have convulsions or seizures?', isDangerSign: true },
        ]
    },
    {
        id: 'sari', name: 'Severe Acute Respiratory Infection (SARI)', summary: 'Acute respiratory illness with fever and cough requiring hospitalization', priority: false,
        questions: [
            { id: 'q1', text: 'Does the patient have fever ≥38°C?', isDangerSign: false, hasNumericInput: true, numericLabel: 'Temperature', unit: '°C' },
            { id: 'q2', text: 'Does the patient have a cough?', isDangerSign: false },
            { id: 'q3', text: 'Does the patient have shortness of breath?', isDangerSign: false },
            { id: 'q4', text: 'Does the patient have difficulty breathing or chest indrawing?', isDangerSign: true },
            { id: 'q5', text: 'Does the patient have blue lips or face (cyanosis)?', isDangerSign: true },
        ]
    },
];

function caseDefToLocal(def: CaseDefinition): LocalDisease {
    return {
        id: def.id,
        name: def.disease,
        summary: def.definition,
        priority: def.prioritySurveillance,
        questions: def.questions.map((q: AssessmentQuestion) => ({
            id: q.id,
            text: q.text,
            shortLabel: q.shortLabel,
            isDangerSign: q.isDangerSign,
            hasNumericInput: q.inputType === 'number',
            numericLabel: q.inputLabel,
            unit: q.inputUnit,
        })),
    };
}

export function ReportFormPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userProfile, firebaseUser } = useAuth();
    const { definitions } = useCaseDefinitions();

    const diseases: LocalDisease[] = definitions.length > 0
        ? definitions.map(caseDefToLocal)
        : fallbackDiseases;

    const preselectedDisease = location.state?.selectedDisease;
    const preselected = preselectedDisease
        ? diseases.find((d) => d.id === preselectedDisease.id || d.name === preselectedDisease.disease) || null
        : null;

    const [step, setStep] = useState(preselected ? 2 : 1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDisease, setSelectedDisease] = useState<LocalDisease | null>(preselected);
    const [answers, setAnswers] = useState<Record<string, { answer: boolean; value?: string }>>({});
    const [personsAffected, setPersonsAffected] = useState('1');
    const [locationData, setLocationData] = useState({
        name: '',
        latitude: '31.2653',
        longitude: '34.3050',
        region: userProfile?.region || 'Rafah',
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    const handleMapLocationSelect = (location: ReportLocation) => {
        setLocationData((prev) => ({
            ...prev,
            latitude: location.lat.toFixed(6),
            longitude: location.lng.toFixed(6),
        }));
    };

    const filteredDiseases = diseases.filter((d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDiseaseSelect = (disease: LocalDisease) => {
        setSelectedDisease(disease);
        setAnswers({});
        setStep(2);
    };

    const handleAnswerChange = (questionId: string, answer: boolean, value?: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: { answer, value } }));
    };

    const getDetectedSymptoms = () => {
        if (!selectedDisease) return [];
        return selectedDisease.questions
            .filter((q) => answers[q.id]?.answer && !q.isDangerSign)
            .map((q) => q.shortLabel || q.text);
    };

    const getDetectedDangerSigns = () => {
        if (!selectedDisease) return [];
        return selectedDisease.questions
            .filter((q) => answers[q.id]?.answer && q.isDangerSign)
            .map((q) => q.shortLabel || q.text);
    };

    const hasImmediateFlag = getDetectedDangerSigns().length > 0;

    const handleSubmit = async () => {
        if (!selectedDisease || !firebaseUser || !userProfile) return;
        setSubmitLoading(true);
        try {
            const questionAnswers = selectedDisease.questions.map((q) => ({
                questionId: q.id,
                questionText: q.text,
                answer: answers[q.id]?.answer || false,
                numericValue: answers[q.id]?.value ? parseFloat(answers[q.id].value!) : undefined,
            }));

            const tempQuestion = selectedDisease.questions.find((q) => q.hasNumericInput && q.unit === '°C');
            const temp = tempQuestion && answers[tempQuestion.id]?.value
                ? parseFloat(answers[tempQuestion.id].value!)
                : undefined;

            const { caseId } = await createReport({
                disease: selectedDisease.name,
                answers: questionAnswers,
                symptoms: getDetectedSymptoms(),
                temp,
                dangerSigns: getDetectedDangerSigns(),
                location: {
                    lat: parseFloat(locationData.latitude),
                    lng: parseFloat(locationData.longitude),
                    name: locationData.name || undefined,
                },
                reporterId: firebaseUser.uid,
                reporterName: userProfile.displayName,
                region: locationData.region,
                hasDangerSigns: hasImmediateFlag,
                isImmediateReport: hasImmediateFlag,
                personsCount: parseInt(personsAffected) || 1,
            });
            toast.success(`Report submitted — Case ${caseId}`);
            navigate('/');
        } catch (err) {
            console.error('Failed to submit report:', err);
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl text-gray-900">New Report</h1>
                <p className="text-sm text-gray-500 mt-1">Submit a disease surveillance report</p>
            </div>

            {step > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {['Disease', 'Assessment', 'Location', 'Review'].map((label, idx) => (
                        <div key={idx} className="flex items-center">
                            <div className={`flex items-center gap-2 ${idx + 1 <= step ? 'text-teal-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx + 1 <= step ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>{idx + 1}</div>
                                <span className="text-sm">{label}</span>
                            </div>
                            {idx < 3 && <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />}
                        </div>
                    ))}
                </div>
            )}

            {step === 1 && (
                <Card>
                    <CardHeader><CardTitle>Select the disease you want to report</CardTitle></CardHeader>
                    <CardContent>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="Search diseases..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {filteredDiseases.map((disease) => (
                                <Card key={disease.id} className="cursor-pointer hover:border-teal-500 hover:shadow-md transition-all" onClick={() => handleDiseaseSelect(disease)}>
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-medium text-gray-900">{disease.name}</h3>
                                            {disease.priority && <Badge className="bg-purple-100 text-purple-700 text-xs">Priority</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-600">{disease.summary}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 2 && selectedDisease && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{selectedDisease.name}</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                                    <Pencil className="h-4 w-4 mr-2" />Change
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedDisease.questions.map((question) => (
                                <div key={question.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        {question.isDangerSign && <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />}
                                        <Label className="text-base">{question.text}</Label>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Switch checked={answers[question.id]?.answer === true}
                                                onCheckedChange={(checked) => handleAnswerChange(question.id, checked, answers[question.id]?.value)} />
                                            <span className="text-sm">{answers[question.id]?.answer ? 'Yes' : 'No'}</span>
                                        </div>
                                        {question.hasNumericInput && answers[question.id]?.answer && (
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm">{question.numericLabel}:</Label>
                                                <Input type="number" step="0.1" placeholder="0.0" className="w-20"
                                                    value={answers[question.id]?.value || ''}
                                                    onChange={(e) => handleAnswerChange(question.id, true, e.target.value)} />
                                                <span className="text-sm text-gray-500">{question.unit}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 border-t">
                                <Label htmlFor="persons">Number of persons affected</Label>
                                <Input id="persons" type="number" min="1" value={personsAffected} onChange={(e) => setPersonsAffected(e.target.value)} className="mt-2 w-32" />
                            </div>
                            {hasImmediateFlag && (
                                <Alert className="border-red-500 bg-red-50">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">Danger signs detected. This case requires IMMEDIATE attention and referral.</AlertDescription>
                                </Alert>
                            )}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Symptoms detected:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {getDetectedSymptoms().map((s, idx) => (<Badge key={idx} variant="secondary">{s}</Badge>))}
                                            {getDetectedSymptoms().length === 0 && <span className="text-gray-500">None</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Danger signs:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {getDetectedDangerSigns().map((s, idx) => (
                                                <Badge key={idx} className="bg-red-100 text-red-700"><AlertTriangle className="h-3 w-3 mr-1" />{s}</Badge>
                                            ))}
                                            {getDetectedDangerSigns().length === 0 && <span className="text-gray-500">None</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setStep(3)}>
                            Continue to Location<ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Location Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <LocationPickerMap
                                initialPosition={{
                                    lat: parseFloat(locationData.latitude),
                                    lng: parseFloat(locationData.longitude),
                                }}
                                onLocationSelect={handleMapLocationSelect}
                            />
                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="location-name">Location Name (Optional)</Label>
                                    <Input id="location-name" placeholder="e.g., Al-Shaboura Camp" value={locationData.name}
                                        onChange={(e) => setLocationData((prev) => ({ ...prev, name: e.target.value }))} className="mt-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input id="latitude" value={locationData.latitude}
                                            onChange={(e) => setLocationData((prev) => ({ ...prev, latitude: e.target.value }))} className="mt-2" />
                                    </div>
                                    <div>
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input id="longitude" value={locationData.longitude}
                                            onChange={(e) => setLocationData((prev) => ({ ...prev, longitude: e.target.value }))} className="mt-2" />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="region">Region</Label>
                                    <Input id="region" value={locationData.region} disabled className="mt-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setStep(4)}>
                            Continue to Review<ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {step === 4 && selectedDisease && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Review & Submit</CardTitle>
                                {hasImmediateFlag && <Badge className="bg-red-600 text-white">IMMEDIATE REPORT</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="text-sm text-gray-500 mb-1">Disease</h4>
                                <p className="text-gray-900">{selectedDisease.name}</p>
                                <Button variant="link" className="p-0 h-auto text-teal-600" onClick={() => setStep(1)}>Edit</Button>
                            </div>
                            <div>
                                <h4 className="text-sm text-gray-500 mb-2">Clinical Assessment</h4>
                                <div className="space-y-2">
                                    {selectedDisease.questions.map((q) => (
                                        answers[q.id]?.answer && (
                                            <div key={q.id} className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                                <span className="text-sm text-gray-700">
                                                    {q.text}{answers[q.id]?.value && ` (${answers[q.id].value}${q.unit})`}
                                                </span>
                                            </div>
                                        )
                                    ))}
                                </div>
                                <Button variant="link" className="p-0 h-auto text-teal-600 mt-2" onClick={() => setStep(2)}>Edit</Button>
                            </div>
                            <div>
                                <h4 className="text-sm text-gray-500 mb-1">Persons Affected</h4>
                                <p className="text-gray-900">{personsAffected}</p>
                            </div>
                            <div>
                                <h4 className="text-sm text-gray-500 mb-2">Location</h4>
                                <div className="flex items-start gap-2 mb-2">
                                    <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-gray-900">{locationData.name || 'Current Location'}</p>
                                        <p className="text-gray-600">{locationData.latitude}, {locationData.longitude}</p>
                                        <p className="text-gray-600">{locationData.region}</p>
                                    </div>
                                </div>
                                <Button variant="link" className="p-0 h-auto text-teal-600" onClick={() => setStep(3)}>Edit</Button>
                            </div>
                            <Alert className="bg-blue-50 border-blue-200">
                                <AlertDescription className="text-blue-800">Report will sync automatically when online</AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={submitLoading}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {submitLoading ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
