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

/**
 * Symptom entry within a case definition.
 */
interface Symptom {
    id: string;
    name: string;
    required: boolean;
}

/**
 * WHO-aligned case definition for a disease.
 */
interface CaseDefinition {
    id: string;
    disease: string;
    symptoms: Symptom[];
    dangerSigns: string[];
    guidance: string;
    active: boolean;
    threshold: number;
}

/**
 * WHO-aligned case definitions for priority diseases in humanitarian settings.
 */
const CASE_DEFINITIONS: Omit<CaseDefinition, 'id'>[] = [
    {
        disease: 'Acute Watery Diarrhea (AWD)',
        symptoms: [
            { id: 'awd-1', name: '3 or more loose/watery stools in 24 hours', required: true },
            { id: 'awd-2', name: 'Onset within last 7 days', required: true },
            { id: 'awd-3', name: 'Signs of dehydration (thirst, dry mouth)', required: false },
            { id: 'awd-4', name: 'Decreased urine output', required: false },
            { id: 'awd-5', name: 'Weakness or lethargy', required: false },
        ],
        dangerSigns: [
            'Severe dehydration (unable to stand)',
            'Sunken eyes',
            'Skin pinch returns slowly (>2 seconds)',
            'Unable to drink or drinking poorly',
            'Altered consciousness or confusion',
            'Persistent vomiting (cannot keep fluids down)',
        ],
        guidance:
            'Start Oral Rehydration Solution (ORS) immediately. Give frequent small sips. Continue breastfeeding for infants. Monitor hydration status closely. Refer IMMEDIATELY if any danger signs present. Advise on handwashing and safe water practices.',
        active: true,
        threshold: 10,
    },
    {
        disease: 'Measles',
        symptoms: [
            { id: 'msl-1', name: 'Fever (38°C or higher)', required: true },
            { id: 'msl-2', name: 'Generalized maculopapular rash', required: true },
            { id: 'msl-3', name: 'Cough', required: false },
            { id: 'msl-4', name: 'Runny nose (coryza)', required: false },
            { id: 'msl-5', name: 'Red/watery eyes (conjunctivitis)', required: false },
            { id: 'msl-6', name: 'Koplik spots (white spots in mouth)', required: false },
        ],
        dangerSigns: [
            'Signs of pneumonia (fast breathing, chest indrawing)',
            'Encephalitis (convulsions, altered consciousness)',
            'Severe malnutrition',
            'Mouth ulcers preventing eating/drinking',
            'Eye complications (corneal clouding)',
            'Severe dehydration',
        ],
        guidance:
            'ISOLATE patient from others. Give Vitamin A supplementation. Ensure adequate hydration and nutrition. Monitor for complications. Report case immediately for outbreak response. Refer if ANY danger signs present. Check vaccination status of household contacts.',
        active: true,
        threshold: 5,
    },
    {
        disease: 'Acute Respiratory Infection (ARI)',
        symptoms: [
            { id: 'ari-1', name: 'Cough', required: true },
            { id: 'ari-2', name: 'Difficulty breathing', required: false },
            { id: 'ari-3', name: 'Fast breathing for age', required: false },
            { id: 'ari-4', name: 'Fever', required: false },
            { id: 'ari-5', name: 'Runny or blocked nose', required: false },
            { id: 'ari-6', name: 'Sore throat', required: false },
        ],
        dangerSigns: [
            'Chest indrawing (lower chest wall sucks in when breathing)',
            'Stridor (harsh breathing sound when calm)',
            'Unable to drink or breastfeed',
            'Convulsions',
            'Unusually sleepy or difficult to wake',
            'Severe malnutrition',
            'Central cyanosis (blue lips/tongue)',
        ],
        guidance:
            'Assess breathing rate for age (fast breathing: <2mo >=60, 2-12mo >=50, 1-5yr >=40). If bacterial pneumonia suspected, start antibiotics per protocol. Ensure hydration. Keep warm but not overheated. Clear nose for infants before feeding. Refer IMMEDIATELY if danger signs present.',
        active: true,
        threshold: 15,
    },
    {
        disease: 'Suspected Cholera',
        symptoms: [
            { id: 'chl-1', name: 'Acute watery diarrhea (rice-water appearance)', required: true },
            { id: 'chl-2', name: 'Rapid onset (within hours)', required: true },
            { id: 'chl-3', name: 'Profuse vomiting', required: false },
            { id: 'chl-4', name: 'Rapid dehydration', required: false },
            { id: 'chl-5', name: 'Leg cramps', required: false },
            { id: 'chl-6', name: 'No fever or low-grade fever', required: false },
        ],
        dangerSigns: [
            'Severe dehydration (sunken eyes, no tears, dry mouth)',
            'Shock (weak pulse, cold extremities, low blood pressure)',
            'Altered consciousness or unresponsive',
            'Unable to drink',
            'Rapid weak pulse',
            'Very reduced or no urine output',
        ],
        guidance:
            'URGENT: Begin aggressive rehydration IMMEDIATELY with ORS or IV fluids. This is a medical emergency. Refer to cholera treatment facility. Notify surveillance immediately. Collect stool sample if possible. Implement infection control measures. Ensure safe disposal of feces and vomit.',
        active: true,
        threshold: 1,
    },
    {
        disease: 'Acute Jaundice Syndrome',
        symptoms: [
            { id: 'ajs-1', name: 'Yellow discoloration of eyes (scleral icterus)', required: true },
            { id: 'ajs-2', name: 'Yellow discoloration of skin', required: false },
            { id: 'ajs-3', name: 'Dark urine (tea/cola colored)', required: false },
            { id: 'ajs-4', name: 'Pale or clay-colored stools', required: false },
            { id: 'ajs-5', name: 'Fever', required: false },
            { id: 'ajs-6', name: 'Fatigue and weakness', required: false },
            { id: 'ajs-7', name: 'Loss of appetite', required: false },
            { id: 'ajs-8', name: 'Nausea or vomiting', required: false },
        ],
        dangerSigns: [
            'Altered consciousness or confusion',
            'Bleeding (gums, nose, vomiting blood, blood in stool)',
            'Severe abdominal pain',
            'Rapidly worsening jaundice',
            'Swelling of abdomen (ascites)',
            'Very dark urine with reduced output',
        ],
        guidance:
            'Refer for hepatitis testing and liver function assessment. Advise rest and adequate hydration. Avoid alcohol and unnecessary medications. Implement hygiene precautions (Hepatitis A/E are fecal-oral). Refer IMMEDIATELY if danger signs present. Report for surveillance.',
        active: true,
        threshold: 5,
    },
];

async function main() {
    console.log('============================================================');
    console.log('SAHA-Care Case Definition Seeder (Client SDK)');
    console.log('============================================================\n');

    // Check for required environment variables
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

    if (!apiKey || !projectId) {
        console.error('ERROR: Missing Firebase configuration.');
        console.error('Make sure .env.local exists with VITE_FIREBASE_* variables.');
        process.exit(1);
    }

    console.log(`Project ID: ${projectId}`);
    console.log('');

    // Initialize Firebase
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
        // Generate a URL-safe ID from the disease name
        const id = definition.disease
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const fullDefinition: CaseDefinition = { id, ...definition };
        const docRef = doc(db, 'caseDefinitions', id);

        await setDoc(docRef, fullDefinition);

        console.log(`  [+] ${definition.disease}`);
        console.log(`      Symptoms: ${definition.symptoms.length}`);
        console.log(`      Danger signs: ${definition.dangerSigns.length}`);
        console.log(`      Threshold: ${definition.threshold} cases`);
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
