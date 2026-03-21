import type { ReportLocation } from '../types';

export type GeoError =
    | 'not-supported'
    | 'permission-denied'
    | 'position-unavailable'
    | 'timeout';

export interface GeoResult {
    location: ReportLocation | null;
    error?: GeoError;
}

/**
 * Check the current geolocation permission state.
 * Returns 'granted', 'prompt', 'denied', or 'unsupported'.
 */
export async function checkGeolocationPermission(): Promise<
    'granted' | 'prompt' | 'denied' | 'unsupported'
> {
    if (!navigator.geolocation) return 'unsupported';

    try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state as 'granted' | 'prompt' | 'denied';
    } catch {
        // Permissions API not supported (some browsers) — assume prompt
        return 'prompt';
    }
}

/**
 * Get the current GPS position via the Geolocation API.
 * Returns a GeoResult with the location or an error type.
 */
export function getCurrentPosition(): Promise<GeoResult> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ location: null, error: 'not-supported' });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    },
                });
            },
            (error) => {
                let geoError: GeoError;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        geoError = 'permission-denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        geoError = 'position-unavailable';
                        break;
                    case error.TIMEOUT:
                        geoError = 'timeout';
                        break;
                    default:
                        geoError = 'position-unavailable';
                }
                resolve({ location: null, error: geoError });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    });
}

/**
 * Get a user-friendly error message for a geolocation error.
 */
export function getGeoErrorMessage(error?: GeoError): string {
    switch (error) {
        case 'not-supported':
            return 'Geolocation is not supported by this browser.';
        case 'permission-denied':
            return 'Location permission denied. Please enter location manually or enable location in browser settings.';
        case 'position-unavailable':
            return 'GPS signal not available. Please try again or enter location manually.';
        case 'timeout':
            return 'Location request timed out. Please try again or enter location manually.';
        default:
            return 'Could not get GPS location. Please enter location manually.';
    }
}
