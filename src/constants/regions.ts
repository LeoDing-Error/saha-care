/**
 * Regions available in the Gaza Strip context.
 * Used for user assignment and report scoping.
 */
export const REGIONS = [
    'North Gaza',
    'Gaza City',
    'Deir al-Balah',
    'Khan Younis',
    'Rafah',
] as const;

export type Region = (typeof REGIONS)[number];
