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
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { useCaseDefinitions } from '../../hooks/useCaseDefinitions';
import { createReport } from '../../services/reports';
import { getCurrentPosition } from '../../utils/location';
import { useAuth } from '../../contexts/AuthContext';
import type { CaseDefinition, ReportLocation } from '../../types';

const STEPS = ['Select Disease', 'Symptoms', 'Temperature & Danger Signs', 'Location & Submit'];

export default function ReportForm({ onSuccess }: { onSuccess?: () => void }) {
    const { userProfile } = useAuth();
    const { definitions, loading: defsLoading } = useCaseDefinitions();

    const [activeStep, setActiveStep] = useState(0);
    const [selectedDisease, setSelectedDisease] = useState<CaseDefinition | null>(null);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [temperature, setTemperature] = useState('');
    const [selectedDangerSigns, setSelectedDangerSigns] = useState<string[]>([]);
    const [location, setLocation] = useState<ReportLocation | null>(null);
    const [locationName, setLocationName] = useState('');
    const [gpsLoading, setGpsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleDiseaseSelect = (diseaseId: string) => {
        const def = definitions.find((d) => d.id === diseaseId);
        if (def) {
            setSelectedDisease(def);
            setSelectedSymptoms([]);
            setSelectedDangerSigns([]);
        }
    };

    const handleSymptomToggle = (symptomName: string) => {
        setSelectedSymptoms((prev) =>
            prev.includes(symptomName)
                ? prev.filter((s) => s !== symptomName)
                : [...prev, symptomName]
        );
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
            ? { ...location, name: locationName || undefined }
            : { lat: 0, lng: 0, name: locationName };

        if (!reportLocation.lat && !reportLocation.name) {
            setError('Please provide a location (GPS or manual)');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await createReport({
                disease: selectedDisease.disease,
                symptoms: selectedSymptoms,
                temp: temperature ? parseFloat(temperature) : undefined,
                dangerSigns: selectedDangerSigns.length > 0 ? selectedDangerSigns : undefined,
                location: reportLocation,
                reporterId: userProfile.uid,
                reporterName: userProfile.displayName,
                region: userProfile.region,
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
            case 1:
                return selectedSymptoms.length > 0;
            case 2:
                return true; // temperature and danger signs are optional
            case 3:
                return location !== null || locationName.trim() !== '';
            default:
                return false;
        }
    };

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
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    {selectedDisease && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            {selectedDisease.guidance}
                        </Alert>
                    )}
                </Box>
            )}

            {/* Step 2: Symptoms */}
            {activeStep === 1 && selectedDisease && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Symptom Checklist — {selectedDisease.disease}
                    </Typography>
                    <FormGroup>
                        {selectedDisease.symptoms.map((symptom) => (
                            <FormControlLabel
                                key={symptom.id}
                                control={
                                    <Checkbox
                                        checked={selectedSymptoms.includes(symptom.name)}
                                        onChange={() => handleSymptomToggle(symptom.name)}
                                    />
                                }
                                label={
                                    <Box>
                                        {symptom.name}
                                        {symptom.required && (
                                            <Chip label="Required" size="small" color="warning" sx={{ ml: 1 }} />
                                        )}
                                    </Box>
                                }
                            />
                        ))}
                    </FormGroup>
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
                        label="Temperature (°C)"
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
                        {gpsLoading ? 'Getting Location…' : location ? 'GPS Captured ✓' : 'Capture GPS Location'}
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
                        helperText={location ? 'Optional — GPS already captured' : 'Required if GPS unavailable'}
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
                        {submitting ? 'Submitting…' : 'Submit Report'}
                    </Button>
                )}
            </Box>
        </Paper>
    );
}
