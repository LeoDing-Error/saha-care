/**
 * WHO-Aligned Case Definition Seeder for SAHA-Care
 * Uses Firebase Client SDK (works with .env.local credentials)
 *
 * Usage:
 *   npx tsx scripts/seedCaseDefinitionsClient.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// ─── Types (mirror src/types/caseDefinition.ts) ───

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type QuestionInputType = 'none' | 'number';
type QuestionCategory = 'core' | 'associated' | 'severity' | 'history';

interface AssessmentQuestion {
    id: string;
    text: string;
    category: QuestionCategory;
    required: boolean;
    inputType: QuestionInputType;
    inputLabel?: string;
    inputUnit?: string;
    yesNote?: string;
    isDangerSign: boolean;
    isImmediateReport: boolean;
    reclassifyTo?: string;
}

interface AlertThreshold {
    count: number;
    windowHours: number;
    severity: AlertSeverity;
    description: string;
}

interface CaseDefinition {
    id: string;
    disease: string;
    definition: string;
    questions: AssessmentQuestion[];
    dangerSigns: string[];
    guidance: string;
    active: boolean;
    thresholds: AlertThreshold[];
    prioritySurveillance: boolean;
}

// ─── Universal danger signs (included in every disease) ───

const UNIVERSAL_DANGER_SIGNS = [
    'Unable to drink or breastfeed',
    'Severe vomiting (cannot keep anything down)',
    'Convulsions or seizures',
    'Unconscious or very difficult to wake',
    'Difficulty breathing or very fast breathing',
    'Chest pulling in (chest indrawing)',
    'Blue lips or face (cyanosis)',
    'Blood in stool',
    'Not urinating for >6 hours (child) or >12 hours (adult)',
    'Severe dehydration (very dry mouth, sunken eyes, skin pinch slow return)',
];

// ─── All 10 Disease Case Definitions ───

const CASE_DEFINITIONS: Omit<CaseDefinition, 'id'>[] = [
    // ── 1. Acute Watery Diarrhea ──
    {
        disease: 'Acute Watery Diarrhea',
        definition: '3 or more loose or watery stools in a 24-hour period (no blood)',
        questions: [
            {
                id: 'awd-q1',
                text: 'Has the person had 3 or more loose/watery stools in the past 24 hours?',
                category: 'core',
                required: true,
                inputType: 'number',
                inputLabel: 'Number of stools per day',
                inputUnit: 'stools/day',
                yesNote: 'Count stools per day',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'awd-q2',
                text: 'Is there blood in the stool?',
                category: 'core',
                required: false,
                inputType: 'none',
                yesNote: 'If YES → reclassify as Bloody Diarrhea',
                isDangerSign: false,
                isImmediateReport: false,
                reclassifyTo: 'acute-bloody-diarrhea',
            },
            {
                id: 'awd-q3',
                text: 'Is the person vomiting?',
                category: 'associated',
                required: false,
                inputType: 'none',
                yesNote: 'Monitor dehydration risk',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'awd-q4',
                text: 'Can the person drink normally?',
                category: 'severity',
                required: false,
                inputType: 'none',
                yesNote: 'If NO → DANGER SIGN',
                isDangerSign: true,
                isImmediateReport: false,
            },
            {
                id: 'awd-q5',
                text: 'Are they urinating less than usual?',
                category: 'severity',
                required: false,
                inputType: 'none',
                yesNote: 'Possible dehydration',
                isDangerSign: false,
                isImmediateReport: false,
            },
        ],
        dangerSigns: [
            ...UNIVERSAL_DANGER_SIGNS,
            'Unable to drink normally',
            'Persistent vomiting (cannot keep fluids down)',
        ],
        guidance:
            'Recommend Oral Rehydration Salts (ORS) after each loose stool:\n' +
            '• Children under 2 years: 50–100 ml\n' +
            '• Children 2–10 years: 100–200 ml\n' +
            '• Adults: at least 200–250 ml\n\n' +
            'Refer to seek clinical care if: any danger signs appear, diarrhea persists for more than 3 days, blood appears in stool, unable to keep ORS down due to vomiting.',
        active: true,
        thresholds: [
            { count: 5, windowHours: 24, severity: 'high', description: '5+ cases in the same region or camp within 24 hours' },
        ],
        prioritySurveillance: false,
    },

    // ── 2. Acute Bloody Diarrhea ──
    {
        disease: 'Acute Bloody Diarrhea',
        definition: 'Diarrhea/loose stools with any blood visible',
        questions: [
            {
                id: 'abd-q1',
                text: 'Is there visible blood in the diarrhea?',
                category: 'core',
                required: true,
                inputType: 'none',
                yesNote: 'IMMEDIATE REPORT',
                isDangerSign: false,
                isImmediateReport: true,
            },
            {
                id: 'abd-q2',
                text: 'How many days has it been since blood appeared?',
                category: 'history',
                required: false,
                inputType: 'number',
                inputLabel: 'Days since blood appeared',
                inputUnit: 'days',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'abd-q3',
                text: 'Is the person having abdominal pain?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'abd-q4',
                text: 'Is there fever?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'abd-q5',
                text: 'Can the person drink normally?',
                category: 'severity',
                required: false,
                inputType: 'none',
                yesNote: 'If NO → DANGER SIGN',
                isDangerSign: true,
                isImmediateReport: false,
            },
        ],
        dangerSigns: [
            ...UNIVERSAL_DANGER_SIGNS,
            'Unable to drink normally',
        ],
        guidance:
            'Refer immediately to medical assessment. Offer ORS if available.',
        active: true,
        thresholds: [
            { count: 1, windowHours: 168, severity: 'critical', description: 'Immediate alert — 1 confirmed case (potential cholera risk)' },
        ],
        prioritySurveillance: false,
    },

    // ── 3. Severe Acute Respiratory Infection (SARI) ──
    {
        disease: 'Severe Acute Respiratory Infection (SARI)',
        definition: 'Fever AND cough AND shortness of breath or difficulty breathing',
        questions: [
            {
                id: 'sari-q1',
                text: 'Does the person have fever?',
                category: 'core',
                required: true,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'sari-q2',
                text: 'Do they have cough?',
                category: 'core',
                required: true,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'sari-q3',
                text: 'Do they have difficulty breathing?',
                category: 'core',
                required: true,
                inputType: 'none',
                yesNote: 'DANGER SIGN',
                isDangerSign: true,
                isImmediateReport: false,
            },
            {
                id: 'sari-q4',
                text: 'Are they breathing faster than normal?',
                category: 'severity',
                required: false,
                inputType: 'number',
                inputLabel: 'Breaths per minute',
                inputUnit: 'breaths/min',
                yesNote: 'Count breaths per minute',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'sari-q5',
                text: 'Is their chest pulling in (retractions)?',
                category: 'severity',
                required: false,
                inputType: 'none',
                yesNote: 'DANGER SIGN',
                isDangerSign: true,
                isImmediateReport: false,
            },
            {
                id: 'sari-q6',
                text: 'Can they speak in full sentences?',
                category: 'severity',
                required: false,
                inputType: 'none',
                yesNote: 'If NO → severe',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'sari-q7',
                text: 'Are their lips or face turning blue?',
                category: 'severity',
                required: false,
                inputType: 'none',
                yesNote: 'EMERGENCY',
                isDangerSign: true,
                isImmediateReport: true,
            },
        ],
        dangerSigns: [
            ...UNIVERSAL_DANGER_SIGNS,
            'Chest indrawing (retractions)',
            'Blue lips or face',
            'Unable to speak in full sentences',
        ],
        guidance:
            'Refer immediately to medical assessment. Keep child upright to help breathing. Offer small sips of fluids if available.',
        active: true,
        thresholds: [
            { count: 1, windowHours: 168, severity: 'critical', description: 'Immediate alert — 1 confirmed case' },
        ],
        prioritySurveillance: false,
    },

    // ── 4. Suspected Measles ──
    {
        disease: 'Suspected Measles',
        definition: 'Fever AND rash AND at least one of: cough, runny nose, or red eyes',
        questions: [
            {
                id: 'msl-q1',
                text: 'Does the person have fever?',
                category: 'core',
                required: true,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'msl-q2',
                text: 'Do they have a red rash all over the body?',
                category: 'core',
                required: true,
                inputType: 'none',
                yesNote: 'IMMEDIATE REPORT',
                isDangerSign: false,
                isImmediateReport: true,
            },
            {
                id: 'msl-q3',
                text: 'Do they have cough?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'msl-q4',
                text: 'Do they have runny nose?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'msl-q5',
                text: 'Do they have red eyes?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'msl-q6',
                text: 'Has the rash started on the face and moved down?',
                category: 'associated',
                required: false,
                inputType: 'none',
                yesNote: 'Typical measles pattern',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'msl-q7',
                text: 'Is the person vaccinated against measles?',
                category: 'history',
                required: false,
                inputType: 'none',
                yesNote: 'If NO → higher risk',
                isDangerSign: false,
                isImmediateReport: false,
            },
        ],
        dangerSigns: [
            ...UNIVERSAL_DANGER_SIGNS,
            'Signs of pneumonia (fast breathing, chest indrawing)',
            'Confusion or seizures',
            'Severe rash or mouth ulcers preventing eating/drinking',
            'Eye complications (corneal clouding)',
        ],
        guidance:
            'Encourage isolation (highly contagious — isolate for 4 days after rash appears). Vitamin A supplementation. Plenty of fluids. Keep eyes clean with wet cloth.\n\n' +
            'Refer to seek care if: difficulty breathing, cannot drink, confusion or seizures, severe rash, any danger sign.',
        active: true,
        thresholds: [
            { count: 1, windowHours: 168, severity: 'critical', description: 'Immediate alert — 1 suspected case' },
        ],
        prioritySurveillance: true,
    },

    // ── 5. Chickenpox (Varicella) ──
    {
        disease: 'Chickenpox (Varicella)',
        definition: 'Fluid-filled blisters, fever, and usually headache',
        questions: [
            {
                id: 'cpx-q1',
                text: 'Does the person have fever?',
                category: 'core',
                required: true,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'cpx-q2',
                text: 'Do they have itchy spots that turned into blisters?',
                category: 'core',
                required: true,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'cpx-q3',
                text: 'Do the blisters have fluid inside?',
                category: 'core',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'cpx-q4',
                text: 'Are the blisters in different stages (new spots, blisters, scabs)?',
                category: 'associated',
                required: false,
                inputType: 'none',
                yesNote: 'Typical chickenpox pattern',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'cpx-q5',
                text: 'Is the rash mostly on the face, chest, and back?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'cpx-q6',
                text: 'Is the person scratching intensely?',
                category: 'severity',
                required: false,
                inputType: 'none',
                yesNote: 'Risk of secondary infection',
                isDangerSign: false,
                isImmediateReport: false,
            },
        ],
        dangerSigns: [
            ...UNIVERSAL_DANGER_SIGNS,
            'Blisters become infected (red, swollen, pus)',
            'Confusion or stiff neck',
        ],
        guidance:
            'Isolate until blisters have crusted over (typically 5–7 days). Plenty of fluids. Cool compress for itching. Paracetamol for fever (if available).\n\n' +
            'Refer to clinical care if: blisters become infected, difficulty breathing, confusion or stiff neck, any danger sign.',
        active: true,
        thresholds: [
            { count: 5, windowHours: 168, severity: 'medium', description: '5+ cases in region within 1 week' },
        ],
        prioritySurveillance: false,
    },

    // ── 6. Acute Jaundice Syndrome ──
    {
        disease: 'Acute Jaundice Syndrome',
        definition: 'Yellow discoloration of eyes or skin',
        questions: [
            {
                id: 'ajs-q1',
                text: "Are the person's eyes yellow?",
                category: 'core',
                required: true,
                inputType: 'none',
                yesNote: 'REPORT',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'ajs-q2',
                text: 'Is their skin yellow?',
                category: 'core',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'ajs-q3',
                text: 'Is their urine dark (like tea or cola)?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'ajs-q4',
                text: 'Are their stools pale or clay-colored?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'ajs-q5',
                text: 'Do they have abdominal pain?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'ajs-q6',
                text: 'Do they have fever?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'ajs-q7',
                text: 'Have they been vomiting?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
        ],
        dangerSigns: [
            ...UNIVERSAL_DANGER_SIGNS,
            'Altered consciousness or confusion',
            'Bleeding (gums, nose, vomiting blood)',
            'Severe abdominal pain',
            'Rapidly worsening jaundice',
        ],
        guidance:
            'Refer immediately to medical assessment. Encourage rest and fluids.',
        active: true,
        thresholds: [
            { count: 2, windowHours: 168, severity: 'high', description: '1 above baseline or 2+ cases in one week (risk of hepatitis outbreak)' },
        ],
        prioritySurveillance: false,
    },

    // ── 7. Suspected Leishmaniasis (Skin Sores) ──
    {
        disease: 'Suspected Leishmaniasis',
        definition: 'One or more skin sores/ulcers that do not heal, usually painless',
        questions: [
            {
                id: 'lsh-q1',
                text: "Does the person have a skin sore that won't heal?",
                category: 'core',
                required: true,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'lsh-q2',
                text: 'How long has the sore been there?',
                category: 'history',
                required: false,
                inputType: 'number',
                inputLabel: 'Duration of sore',
                inputUnit: 'weeks',
                yesNote: 'If >2 weeks → suspect leishmaniasis',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'lsh-q3',
                text: 'Is the sore painless?',
                category: 'core',
                required: false,
                inputType: 'none',
                yesNote: 'Typical symptom of leishmaniasis',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'lsh-q4',
                text: 'Is it on the face, arms, or legs?',
                category: 'associated',
                required: false,
                inputType: 'none',
                yesNote: 'Common locations for leishmaniasis',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'lsh-q5',
                text: 'Does it have a raised edge and central crater?',
                category: 'associated',
                required: false,
                inputType: 'none',
                yesNote: 'Typical appearance',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'lsh-q6',
                text: 'Has the person been in areas with sandflies?',
                category: 'history',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
        ],
        dangerSigns: [
            ...UNIVERSAL_DANGER_SIGNS,
        ],
        guidance:
            'Refer if sores are not healing (>2 weeks). Cover sores with dressing (if available) and keep as clean as possible.',
        active: true,
        thresholds: [
            { count: 5, windowHours: 168, severity: 'medium', description: '5+ cases in region within 1 week' },
        ],
        prioritySurveillance: false,
    },

    // ── 8. Acute Flaccid Paralysis (AFP) — Polio Surveillance ──
    {
        disease: 'Acute Flaccid Paralysis (AFP)',
        definition: 'Sudden onset of weakness in one or more limbs in children under 15',
        questions: [
            {
                id: 'afp-q1',
                text: 'Is the person a child under 15 years?',
                category: 'core',
                required: true,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'afp-q2',
                text: 'Did the weakness start suddenly?',
                category: 'core',
                required: true,
                inputType: 'none',
                yesNote: 'IMMEDIATE REPORT',
                isDangerSign: false,
                isImmediateReport: true,
            },
            {
                id: 'afp-q3',
                text: 'Is the affected limb floppy or limp (not stiff)?',
                category: 'core',
                required: true,
                inputType: 'none',
                yesNote: 'Key symptom — floppy/limp, not stiff',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'afp-q4',
                text: 'Is there fever at the start of weakness?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'afp-q5',
                text: 'Is there pain in the affected limb?',
                category: 'associated',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'afp-q6',
                text: 'Has the child been vaccinated against polio?',
                category: 'history',
                required: false,
                inputType: 'none',
                yesNote: 'If NO → higher risk',
                isDangerSign: false,
                isImmediateReport: false,
            },
        ],
        dangerSigns: [
            ...UNIVERSAL_DANGER_SIGNS,
        ],
        guidance:
            'Refer immediately to medical assessment.',
        active: true,
        thresholds: [
            { count: 1, windowHours: 168, severity: 'critical', description: 'Immediate alert — 1 case (polio surveillance)' },
        ],
        prioritySurveillance: true,
    },

    // ── 9. Suspected Pertussis (Whooping Cough) ──
    {
        disease: 'Suspected Pertussis (Whooping Cough)',
        definition: 'Child with severe coughing fits for 2+ weeks, coughing until they vomit or make a "whoop" sound; face may turn red/purple during fits',
        questions: [
            {
                id: 'per-q1',
                text: 'Has the person had a cough for 2 weeks or more?',
                category: 'core',
                required: true,
                inputType: 'number',
                inputLabel: 'Number of weeks coughing',
                inputUnit: 'weeks',
                yesNote: 'Count weeks',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'per-q2',
                text: 'Does the coughing come in sudden, uncontrollable fits (paroxysms)?',
                category: 'core',
                required: true,
                inputType: 'none',
                yesNote: 'Key symptom',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'per-q3',
                text: 'Does the person make a "whooping" sound when breathing in after coughing?',
                category: 'core',
                required: false,
                inputType: 'none',
                yesNote: 'Key symptom',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'per-q4',
                text: 'Does the person vomit immediately after coughing?',
                category: 'associated',
                required: false,
                inputType: 'none',
                yesNote: 'Key symptom',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'per-q5',
                text: "Does the person's face turn red or purple during coughing fits?",
                category: 'severity',
                required: false,
                inputType: 'none',
                yesNote: 'Severe episode',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'per-q6',
                text: 'Is the coughing worse at night?',
                category: 'associated',
                required: false,
                inputType: 'none',
                yesNote: 'Typical pattern',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'per-q7',
                text: 'Does the person have a fever?',
                category: 'associated',
                required: false,
                inputType: 'none',
                yesNote: 'Usually minimal or no fever in pertussis',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'per-q8',
                text: 'Is the person an infant under 6 months?',
                category: 'severity',
                required: false,
                inputType: 'none',
                yesNote: 'High risk',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'per-q9',
                text: 'For infants only: Does the baby stop breathing or turn blue during/after coughing?',
                category: 'severity',
                required: false,
                inputType: 'none',
                yesNote: 'DANGER SIGN — REFER IMMEDIATELY',
                isDangerSign: true,
                isImmediateReport: true,
            },
            {
                id: 'per-q10',
                text: 'Has the person been vaccinated against pertussis (DTP)?',
                category: 'history',
                required: false,
                inputType: 'none',
                yesNote: 'If NO → higher risk',
                isDangerSign: false,
                isImmediateReport: false,
            },
        ],
        dangerSigns: [
            ...UNIVERSAL_DANGER_SIGNS,
            'Baby stops breathing or turns blue during/after coughing (apnea)',
        ],
        guidance:
            'Refer for medical assessment, especially infants under 6 months. Isolate from other children. Ensure adequate hydration.',
        active: true,
        thresholds: [
            { count: 1, windowHours: 168, severity: 'high', description: '1 case in non-endemic area' },
            { count: 5, windowHours: 168, severity: 'critical', description: '5+ cases in same region or camp within 1 week' },
        ],
        prioritySurveillance: true,
    },

    // ── 10. Suspected Diphtheria ──
    {
        disease: 'Suspected Diphtheria',
        definition: 'Sore throat, fever, thick gray patch in throat, swollen neck; difficulty breathing or swallowing',
        questions: [
            {
                id: 'dph-q1',
                text: 'Does the person have a sore throat?',
                category: 'core',
                required: true,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'dph-q2',
                text: 'Do they have a low-grade fever?',
                category: 'core',
                required: false,
                inputType: 'none',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'dph-q3',
                text: 'Can you see a thick, grayish-white patch or membrane in their throat or on tonsils?',
                category: 'core',
                required: true,
                inputType: 'none',
                yesNote: 'IMMEDIATE ALERT — Key symptom',
                isDangerSign: false,
                isImmediateReport: true,
            },
            {
                id: 'dph-q4',
                text: 'If you try to wipe it away, does it bleed?',
                category: 'core',
                required: false,
                inputType: 'none',
                yesNote: 'Confirms membrane',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'dph-q5',
                text: 'Does the person have swollen neck ("bull neck" appearance)?',
                category: 'core',
                required: false,
                inputType: 'none',
                yesNote: 'IMMEDIATE ALERT — Key symptom',
                isDangerSign: false,
                isImmediateReport: true,
            },
            {
                id: 'dph-q6',
                text: 'Do they have difficulty breathing?',
                category: 'severity',
                required: false,
                inputType: 'none',
                yesNote: 'DANGER SIGN',
                isDangerSign: true,
                isImmediateReport: false,
            },
            {
                id: 'dph-q7',
                text: 'Do they have difficulty swallowing?',
                category: 'severity',
                required: false,
                inputType: 'none',
                yesNote: 'DANGER SIGN',
                isDangerSign: true,
                isImmediateReport: false,
            },
            {
                id: 'dph-q8',
                text: 'Do they have a skin sore or ulcer that won\'t heal (grayish membrane on skin)?',
                category: 'associated',
                required: false,
                inputType: 'none',
                yesNote: 'Cutaneous diphtheria',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'dph-q9',
                text: 'Is their voice hoarse or muffled?',
                category: 'associated',
                required: false,
                inputType: 'none',
                yesNote: 'Possible airway involvement',
                isDangerSign: false,
                isImmediateReport: false,
            },
            {
                id: 'dph-q10',
                text: 'Has the person been vaccinated against diphtheria (DTP)?',
                category: 'history',
                required: false,
                inputType: 'none',
                yesNote: 'If NO → higher risk',
                isDangerSign: false,
                isImmediateReport: false,
            },
        ],
        dangerSigns: [
            ...UNIVERSAL_DANGER_SIGNS,
            'Difficulty breathing',
            'Difficulty swallowing',
            'Swollen neck (bull neck)',
        ],
        guidance:
            'Refer immediately to medical assessment. Isolate patient. This is a medical emergency if airway is compromised.',
        active: true,
        thresholds: [
            { count: 1, windowHours: 168, severity: 'critical', description: 'Immediate alert — 1 suspected case' },
        ],
        prioritySurveillance: true,
    },
];

// ─── Main ───

async function main() {
    console.log('============================================================');
    console.log('SAHA-Care Case Definition Seeder (Client SDK)');
    console.log('10 Disease Case Definitions (GH Partner Spec)');
    console.log('============================================================\n');

    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

    if (!apiKey || !projectId) {
        console.error('ERROR: Missing Firebase configuration.');
        console.error('Make sure .env.local exists with VITE_FIREBASE_* variables.');
        process.exit(1);
    }

    console.log(`Project ID: ${projectId}`);
    console.log('');

    const firebaseConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('Seeding case definitions...\n');

    for (const definition of CASE_DEFINITIONS) {
        const id = definition.disease
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const fullDefinition: CaseDefinition = { id, ...definition };
        const docRef = doc(db, 'caseDefinitions', id);

        await setDoc(docRef, fullDefinition);

        console.log(`  [+] ${definition.disease}`);
        console.log(`      Questions: ${definition.questions.length}`);
        console.log(`      Danger signs: ${definition.dangerSigns.length}`);
        console.log(`      Thresholds: ${definition.thresholds.map((t) => `${t.count} cases/${t.windowHours}h → ${t.severity}`).join(', ')}`);
        console.log(`      Priority: ${definition.prioritySurveillance ? 'YES' : 'no'}`);
        console.log('');
    }

    console.log(`Successfully seeded ${CASE_DEFINITIONS.length} case definitions.`);
    console.log('\nView in Firebase Console:');
    console.log(`  https://console.firebase.google.com/project/${projectId}/firestore/data/caseDefinitions`);
    console.log('');

    process.exit(0);
}

main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
