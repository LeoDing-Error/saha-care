import { Snackbar, Alert } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

/**
 * Displays a persistent snackbar when the user goes offline.
 * Automatically dismisses when connectivity returns.
 */
export default function OfflineIndicator() {
    const isOnline = useOfflineStatus();

    return (
        <Snackbar
            open={!isOnline}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert
                severity="warning"
                icon={<WifiOffIcon />}
                sx={{ width: '100%' }}
            >
                You are offline. Reports will sync when connectivity returns.
            </Alert>
        </Snackbar>
    );
}
