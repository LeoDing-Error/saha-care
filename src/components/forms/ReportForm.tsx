import { useState } from 'react';
import {
    Stepper,
    Step,
    StepLabel,
    Button,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormGroup,
    FormControlLabel,
    Checkbox,
    TextField,
    Alert,
    Paper,
    Chip,
    CircularProgress,
    Radio,
    RadioGroup,
    InputAdornment,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useCaseDefinitions } from '../../hooks/useCaseDefinitions';
import { createReport } from '../../services/reports';
import { getCurrentPosition } from '../../utils/location';
import { useAuth } from '../../contexts/AuthContext';
import type { CaseDefinition, AssessmentQuestion, ReportLocation, QuestionAnswer } from '../../types';

const STEPS = ['Select Disease', 'Assessment Questions', 'Temperature & Danger Signs', 'Location & Submit'];

interface AnswerState {
    answer: boolean | null;
    numericValue?: number;
}

export default function ReportForm({ onSuccess }: { onSuccess?: () => void }) {
    const { userProfile } = useAuth();
    const { definitions, loading: defsLoading } = useCaseDefinitions();

    const [activeStep, setActiveStep] = useState(0);
    const [selectedDisease, setSelectedDisease] = useState<CaseDefinition | null>(null);
    const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
    const [temperature, setTemperature] = useState('');
    const [selectedDangerSigns, setSelectedDangerSigns] = useState<string[]>([]);
    const [location, setLocation] = useState<ReportLocation | null>(null);
    const [locationName, setLocationName] = useState('');
    const [gpsLoading, setGpsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [personsCount, setPersonsCount] = useState(1);
    const [reclassifiedFrom, setReclassifiedFrom] = useState<string | null>(null);

    const handleDiseaseSelect = (diseaseId: string) => {
        const def = definitions.find((d) => d.id === diseaseId);
        if (def) {
            setSelectedDisease(def);
            setAnswers({});
            setSelectedDangerSigns([]);
            setPersonsCount(1);
            setReclassifiedFrom(null);
        }
    };

    const handleAnswerChange = (questionId: string, value: boolean) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: { ...prev[questionId], answer: value },
        }));
    };

    const handleNumericChange = (questionId: string, value: number) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: { ...prev[questionId], numericValue: isNaN(value) ? undefined : value },
        }));
    };

    const handleReclassify = (newDiseaseId: string) => {
        const newDef = definitions.find((d) => d.id === newDiseaseId);
        if (newDef && selectedDisease) {
            setReclassifiedFrom(selectedDisease.disease);
            setSelectedDisease(newDef);
            setAnswers({});
            setSelectedDangerSigns([]);
            setActiveStep(0);
        }
    };

    const handleDangerSignToggle = (sign: string) => {
        setSelectedDangerSigns((prev) =>
            prev.includes(sign) ? prev.filter((s) => s !== sign) : [...prev, sign]
        );
    };

    const handleGPS = async () => {
        setGpsLoading(true);
        const pos = await getCurrentPosition();
        if (pos) {
            setLocation(pos);
        } else {
            setError('Could not get GPS location. Please enter location manually.');
        }
        setGpsLoading(false);
    };

    const handleSubmit = async () => {
        if (!selectedDisease || !userProfile) return;

        const reportLocation: ReportLocation = location
            ? { ...location, ...(locationName ? { name: locationName } : {}) }
            : { lat: 0, lng: 0, name: locationName };

        if (!reportLocation.lat && !reportLocation.name) {
            setError('Please provide a location (GPS or manual)');
            return;
        }

        // Build structured answers
        const questionAnswers: QuestionAnswer[] = selectedDisease.questions
            .filter((q) => answers[q.id]?.answer !== null && answers[q.id]?.answer !== undefined)
            .map((q) => {
                const qa: QuestionAnswer = {
                    questionId: q.id,
                    questionText: q.text,
                    answer: answers[q.id].answer!,
                };
                if (answers[q.id].numericValue !== undefined) {
                    qa.numericValue = answers[q.id].numericValue;
                }
                return qa;
            });

        // Derive flat symptoms list (question texts where answer is "Yes")
        const symptoms = questionAnswers
            .filter((a) => a.answer)
            .map((a) => a.questionText);

        // Compute flags
        const hasDangerSigns = selectedDangerSigns.length > 0 ||
            selectedDisease.questions.some(
                (q) => q.isDangerSign && answers[q.id]?.answer === true
            );

        const isImmediateReport = selectedDisease.questions.some(
            (q) => q.isImmediateReport && answers[q.id]?.answer === true
        );

        setSubmitting(true);
        setError('');

        try {
            await createReport({
                disease: selectedDisease.disease,
                answers: questionAnswers,
                symptoms,
                temp: temperature ? parseFloat(temperature) : undefined,
                dangerSigns: selectedDangerSigns.length > 0 ? selectedDangerSigns : undefined,
                location: reportLocation,
                reporterId: userProfile.uid,
                reporterName: userProfile.displayName,
                region: userProfile.region,
                hasDangerSigns,
                isImmediateReport,
                personsCount,
                reclassifiedFrom: reclassifiedFrom || undefined,
            });
            onSuccess?.();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to submit report';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const canProceed = () => {
        switch (activeStep) {
            case 0:
                return selectedDisease !== null;
            case 1: {
                if (!selectedDisease) return false;
                // All required questions must be answered (Yes or No)
                const requiredQuestions = selectedDisease.questions.filter((q) => q.required);
                return requiredQuestions.every((q) => answers[q.id]?.answer !== null && answers[q.id]?.answer !== undefined);
            }
            case 2:
                return true; // temperature and danger signs are optional
            case 3:
                return location !== null || locationName.trim() !== '';
            default:
                return false;
        }
    };

    // Check if any answered question triggers an immediate report
    const hasImmediateFlags = selectedDisease?.questions.some(
        (q) => q.isImmediateReport && answers[q.id]?.answer === true
    ) ?? false;

    // Check if any answered question triggers a danger sign
    const hasDangerFlags = selectedDisease?.questions.some(
        (q) => q.isDangerSign && answers[q.id]?.answer === true
    ) ?? false;

    if (defsLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                {STEPS.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {reclassifiedFrom && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Reclassified from: {reclassifiedFrom}
                </Alert>
            )}

            {/* Step 1: Disease Selection */}
            {activeStep === 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Select Disease
                    </Typography>
                    {definitions.length === 0 ? (
                        <Alert severity="warning">
                            No case definitions available. Contact your supervisor.
                        </Alert>
                    ) : (
                        <FormControl fullWidth>
                            <InputLabel id="disease-select-label">Disease</InputLabel>
                            <Select
                                id="disease-select"
                                labelId="disease-select-label"
                                label="Disease"
                                value={selectedDisease?.id || ''}
                                onChange={(e) => handleDiseaseSelect(e.target.value)}
                            >
                                {definitions.map((def) => (
                                    <MenuItem key={def.id} value={def.id}>
                                        {def.disease}
                                        {def.prioritySurveillance && ' *'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    {selectedDisease && (
                        <>
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Case Definition
                                </Typography>
                                {selectedDisease.definition}
                            </Alert>
                            <Alert severity="success" sx={{ mt: 1 }} icon={false}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Clinical Guidance
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                    {selectedDisease.guidance}
                                </Typography>
                            </Alert>
                            <TextField
                                id="persons-count"
                                label="Number of Persons Affected"
                                type="number"
                                fullWidth
                                value={personsCount}
                                onChange={(e) => setPersonsCount(Math.max(1, parseInt(e.target.value) || 1))}
                                inputProps={{ min: 1 }}
                                sx={{ mt: 2 }}
                                helperText="How many people are affected in this report (minimum 1)"
                            />
                        </>
                    )}
                </Box>
            )}

            {/* Step 2: Assessment Questions */}
            {activeStep === 1 && selectedDisease && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Assessment — {selectedDisease.disease}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Answer each question Yes or No based on clinical observation.
                    </Typography>

                    {selectedDisease.questions.map((question: AssessmentQuestion) => (
                        <Paper
                            key={question.id}
                            variant="outlined"
                            sx={{
                                mb: 2,
                                p: 2,
                                borderColor: answers[question.id]?.answer === true && question.isDangerSign
                                    ? 'error.main'
                                    : answers[question.id]?.answer === true && question.isImmediateReport
                                        ? 'warning.main'
                                        : 'divider',
                                borderWidth: (answers[question.id]?.answer === true && (question.isDangerSign || question.isImmediateReport)) ? 2 : 1,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body1" sx={{ flex: 1 }}>
                                    {question.text}
                                </Typography>
                                {question.required && (
                                    <Chip label="Required" size="small" color="warning" />
                                )}
                                {question.isDangerSign && (
                                    <Chip
                                        icon={<WarningAmberIcon />}
                                        label="Danger Sign"
                                        size="small"
                                        color="error"
                                    />
                                )}
                            </Box>

                            <RadioGroup
                                row
                                value={answers[question.id]?.answer === true ? 'yes' : answers[question.id]?.answer === false ? 'no' : ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value === 'yes')}
                            >
                                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="no" control={<Radio />} label="No" />
                            </RadioGroup>

                            {/* Follow-up numeric input */}
                            {answers[question.id]?.answer === true && question.inputType === 'number' && (
                                <TextField
                                    label={question.inputLabel}
                                    type="number"
                                    size="small"
                                    sx={{ mt: 1 }}
                                    InputProps={{
                                        endAdornment: question.inputUnit ? (
                                            <InputAdornment position="end">{question.inputUnit}</InputAdornment>
                                        ) : undefined,
                                    }}
                                    value={answers[question.id]?.numericValue ?? ''}
                                    onChange={(e) => handleNumericChange(question.id, parseFloat(e.target.value))}
                                />
                            )}

                            {/* Yes note */}
                            {answers[question.id]?.answer === true && question.yesNote && (
                                <Alert
                                    severity={question.isDangerSign ? 'error' : question.isImmediateReport ? 'warning' : 'info'}
                                    sx={{ mt: 1 }}
                                >
                                    {question.yesNote}
                                </Alert>
                            )}

                            {/* Reclassification prompt */}
                            {answers[question.id]?.answer === true && question.reclassifyTo && (
                                <Alert severity="warning" sx={{ mt: 1 }}>
                                    This answer suggests reclassification to a different disease.
                                    <Button
                                        size="small"
                                        color="warning"
                                        sx={{ ml: 1 }}
                                        onClick={() => handleReclassify(question.reclassifyTo!)}
                                    >
                                        Switch Disease
                                    </Button>
                                </Alert>
                            )}
                        </Paper>
                    ))}

                    {hasImmediateFlags && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            This case requires IMMEDIATE reporting. Please complete the form and submit as soon as possible.
                        </Alert>
                    )}

                    {hasDangerFlags && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Danger signs detected from assessment. Ensure the patient is referred for immediate care.
                        </Alert>
                    )}
                </Box>
            )}

            {/* Step 3: Temperature & Danger Signs */}
            {activeStep === 2 && selectedDisease && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Temperature & Danger Signs
                    </Typography>
                    <TextField
                        id="report-temperature"
                        label="Temperature (\u00B0C)"
                        type="number"
                        fullWidth
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        inputProps={{ step: 0.1, min: 35, max: 43 }}
                        sx={{ mb: 3 }}
                        helperText="Patient temperature in Celsius (optional)"
                    />
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                        Danger Signs
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Check any danger signs observed in the patient.
                    </Typography>
                    <FormGroup>
                        {selectedDisease.dangerSigns.map((sign) => (
                            <FormControlLabel
                                key={sign}
                                control={
                                    <Checkbox
                                        checked={selectedDangerSigns.includes(sign)}
                                        onChange={() => handleDangerSignToggle(sign)}
                                        color="error"
                                    />
                                }
                                label={sign}
                            />
                        ))}
                    </FormGroup>
                    {selectedDangerSigns.length > 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Danger signs detected. Ensure the patient is referred for immediate care.
                        </Alert>
                    )}
                </Box>
            )}

            {/* Step 4: Location & Submit */}
            {activeStep === 3 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Location
                    </Typography>
                    <Button
                        id="gps-capture-btn"
                        variant="outlined"
                        startIcon={gpsLoading ? <CircularProgress size={20} /> : <MyLocationIcon />}
                        onClick={handleGPS}
                        disabled={gpsLoading}
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        {gpsLoading ? 'Getting Location\u2026' : location ? 'GPS Captured \u2713' : 'Capture GPS Location'}
                    </Button>
                    {location && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                        </Typography>
                    )}
                    <TextField
                        id="location-name"
                        label="Location Name (e.g., Shelter #5, Al-Shifa area)"
                        fullWidth
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        helperText={location ? 'Optional \u2014 GPS already captured' : 'Required if GPS unavailable'}
                        sx={{ mb: 3 }}
                    />
                </Box>
            )}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((prev) => prev - 1)}
                >
                    Back
                </Button>
                {activeStep < STEPS.length - 1 ? (
                    <Button
                        variant="contained"
                        disabled={!canProceed()}
                        onClick={() => setActiveStep((prev) => prev + 1)}
                    >
                        Next
                    </Button>
                ) : (
                    <Button
                        id="submit-report-btn"
                        variant="contained"
                        color="primary"
                        disabled={!canProceed() || submitting}
                        onClick={handleSubmit}
                    >
                        {submitting ? 'Submitting\u2026' : 'Submit Report'}
                    </Button>
                )}
            </Box>
        </Paper>
    );
}
