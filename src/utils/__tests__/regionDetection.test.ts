import { describe, it, expect } from 'vitest';
import { detectRegionFromCoordinates } from '../regionDetection';

describe('detectRegionFromCoordinates', () => {
    // A longitude that falls within the Gaza Strip for all tests.
    const gazaLng = 34.45;

    it('detects North Gaza for lat ~31.55', () => {
        expect(detectRegionFromCoordinates(31.55, gazaLng)).toBe('North Gaza');
    });

    it('detects Gaza City for lat ~31.47', () => {
        expect(detectRegionFromCoordinates(31.47, gazaLng)).toBe('Gaza City');
    });

    it('detects Deir al-Balah for lat ~31.40', () => {
        expect(detectRegionFromCoordinates(31.40, gazaLng)).toBe('Deir al-Balah');
    });

    it('detects Khan Younis for lat ~31.33', () => {
        expect(detectRegionFromCoordinates(31.33, gazaLng)).toBe('Khan Younis');
    });

    it('detects Rafah for lat ~31.25', () => {
        expect(detectRegionFromCoordinates(31.25, gazaLng)).toBe('Rafah');
    });

    it('returns null for coordinates outside the Gaza Strip', () => {
        // Latitude and longitude far from Gaza
        expect(detectRegionFromCoordinates(32.0, 35.0)).toBeNull();
    });

    it('returns null when longitude is outside Gaza bounds', () => {
        // Valid latitude but longitude too far west
        expect(detectRegionFromCoordinates(31.45, 33.0)).toBeNull();
    });

    it('returns null when latitude is outside Gaza bounds', () => {
        // Valid longitude but latitude too far north
        expect(detectRegionFromCoordinates(32.0, 34.45)).toBeNull();
    });
});
