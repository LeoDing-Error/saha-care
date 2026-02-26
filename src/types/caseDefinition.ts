/**
 * Symptom entry within a case definition.
 */
export interface Symptom {
    id: string;
    name: string;
    /** Whether this symptom is required for a suspected case */
    required: boolean;
}

/**
 * WHO-aligned case definition for a disease.
 * Used to structure the report form and drive alert thresholds.
 */
export interface CaseDefinition {
    id: string;
    /** Disease name (e.g., "Acute Watery Diarrhea", "Measles") */
    disease: string;
    /** Symptom checklist for this disease */
    symptoms: Symptom[];
    /** Signs indicating severe/life-threatening condition */
    dangerSigns: string[];
    /** Clinical guidance text shown to the reporter */
    guidance: string;
    /** Whether this case definition is currently active */
    active: boolean;
    /** Alert threshold: number of cases per region that triggers an alert */
    threshold: number;
}
