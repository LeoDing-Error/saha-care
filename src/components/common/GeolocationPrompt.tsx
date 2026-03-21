import { Alert, AlertTitle } from '@mui/material';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface GeolocationPromptProps {
    permissionState: 'granted' | 'prompt' | 'denied' | 'unsupported';
}

export default function GeolocationPrompt({ permissionState }: GeolocationPromptProps) {
    if (permissionState === 'granted') return null;

    if (permissionState === 'denied') {
        return (
            <Alert severity="warning" icon={<LocationOffIcon />} sx={{ mb: 2 }}>
                <AlertTitle>Location Permission Denied</AlertTitle>
                Location access was denied. You can enable it in your browser&apos;s site
                settings, or enter a location name manually below.
            </Alert>
        );
    }

    if (permissionState === 'unsupported') {
        return (
            <Alert severity="info" icon={<LocationOffIcon />} sx={{ mb: 2 }}>
                <AlertTitle>GPS Not Available</AlertTitle>
                Your browser does not support geolocation. Please enter a location name
                manually below.
            </Alert>
        );
    }

    // 'prompt' state
    return (
        <Alert severity="info" icon={<LocationOnIcon />} sx={{ mb: 2 }}>
            Saha-Care needs your location to tag reports accurately. Tap &quot;Capture GPS
            Location&quot; and allow access when your browser asks.
        </Alert>
    );
}
