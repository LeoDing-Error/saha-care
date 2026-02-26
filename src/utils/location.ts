import type { ReportLocation } from '../types';

/**
 * Get the current GPS position via the Geolocation API.
 * Returns null if geolocation is not available or the user denies permission.
 */
export function getCurrentPosition(): Promise<ReportLocation | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn('Geolocation is not supported by this browser');
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.warn('Geolocation error:', error.message);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000, // Accept a cached position up to 1 minute old
            }
        );
    });
}
