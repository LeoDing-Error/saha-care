import type { Region } from '../constants/regions';

/**
 * Approximate latitude boundaries for Gaza Strip regions (north to south).
 * Gaza Strip is ~45 km long and ~12 km wide. Latitude is the primary discriminator.
 */
const REGION_BOUNDS: { region: Region; latCenter: number; latMin: number; latMax: number }[] = [
    { region: 'North Gaza', latCenter: 31.55, latMin: 31.50, latMax: 31.60 },
    { region: 'Gaza City', latCenter: 31.47, latMin: 31.42, latMax: 31.53 },
    { region: 'Deir al-Balah', latCenter: 31.40, latMin: 31.35, latMax: 31.45 },
    { region: 'Khan Younis', latCenter: 31.33, latMin: 31.28, latMax: 31.38 },
    { region: 'Rafah', latCenter: 31.25, latMin: 31.20, latMax: 31.30 },
];

/**
 * Detect the Gaza Strip region from GPS coordinates.
 * Uses latitude-based matching since the strip is very narrow.
 * Returns null if coordinates are outside the Gaza Strip.
 */
export function detectRegionFromCoordinates(lat: number, lng: number): Region | null {
    // Quick bounds check: Gaza Strip is roughly lng 34.2–34.6, lat 31.2–31.6
    if (lng < 34.1 || lng > 34.7 || lat < 31.15 || lat > 31.65) {
        return null;
    }

    // Find the region whose center is closest to the given latitude
    let closest: { region: Region; distance: number } | null = null;
    for (const bound of REGION_BOUNDS) {
        const distance = Math.abs(lat - bound.latCenter);
        if (!closest || distance < closest.distance) {
            closest = { region: bound.region, distance };
        }
    }

    return closest?.region ?? null;
}
