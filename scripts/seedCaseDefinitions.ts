/**
 * WHO-Aligned Case Definition Seeder for SAHA-Care
 *
 * Seeds Firestore with priority disease case definitions
 * aligned with WHO guidelines for humanitarian settings.
 *
 * Usage:
 *   npm run seed:cases              # Seeds to emulator (default)
 *   npm run seed:cases -- --prod    # Seeds to production (requires caution)
 *
 * Prerequisites:
 *   - Firebase emulators running: npm run emulators
 *   - Or production credentials configured
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
 * Based on WHO EWARS (Early Warning Alert and Response System) guidelines.
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
        threshold: 1, // Single case requires immediate alert in cholera-free areas
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

/**
 * Check if Firebase emulators are running
 */
async function checkEmulatorRunning(): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:8080/', { method: 'GET' });
        return response.ok || response.status === 404; // Firestore emulator returns 404 for root
    } catch {
        return false;
    }
}

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebaseAdmin(useEmulator: boolean): Firestore {
    // Check for service account file for production
    const serviceAccountPath = join(__dirname, '..', 'serviceAccountKey.json');
    const hasServiceAccount = existsSync(serviceAccountPath);

    if (useEmulator) {
        // Set emulator environment variables BEFORE initializing
        process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

        initializeApp({
            projectId: 'saha-care-demo',
        });

        console.log('Initialized Firebase Admin with emulator');
    } else if (hasServiceAccount) {
        const serviceAccount = JSON.parse(
            readFileSync(serviceAccountPath, 'utf-8')
        ) as ServiceAccount;

        initializeApp({
            credential: cert(serviceAccount),
        });

        console.log('Initialized Firebase Admin with service account');
    } else {
        // Try default credentials (works in Cloud environments)
        initializeApp();
        console.log('Initialized Firebase Admin with default credentials');
    }

    return getFirestore();
}

/**
 * Seed case definitions to Firestore
 */
async function seedCaseDefinitions(db: Firestore): Promise<void> {
    const collection = db.collection('caseDefinitions');

    console.log('\nSeeding case definitions...\n');

    for (const definition of CASE_DEFINITIONS) {
        // Generate a URL-safe ID from the disease name
        const id = definition.disease
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const docRef = collection.doc(id);
        const fullDefinition: CaseDefinition = { id, ...definition };

        await docRef.set(fullDefinition);

        console.log(`  [+] ${definition.disease}`);
        console.log(`      Symptoms: ${definition.symptoms.length}`);
        console.log(`      Danger signs: ${definition.dangerSigns.length}`);
        console.log(`      Threshold: ${definition.threshold} cases`);
        console.log('');
    }

    console.log(`Successfully seeded ${CASE_DEFINITIONS.length} case definitions.`);
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
    console.log('='.repeat(60));
    console.log('SAHA-Care Case Definition Seeder');
    console.log('WHO-Aligned Disease Surveillance Definitions');
    console.log('='.repeat(60));
    console.log('');

    // Parse command line arguments
    const args = process.argv.slice(2);
    const useProd = args.includes('--prod');

    if (useProd) {
        console.log('WARNING: Seeding to PRODUCTION Firestore');
        console.log('Press Ctrl+C within 5 seconds to cancel...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
    } else {
        // Check if emulators are running
        const emulatorRunning = await checkEmulatorRunning();

        if (!emulatorRunning) {
            console.log('ERROR: Firebase emulator is not running.');
            console.log('');
            console.log('Start the emulators first:');
            console.log('  npm run emulators');
            console.log('');
            console.log('Or seed to production (use with caution):');
            console.log('  npm run seed:cases -- --prod');
            console.log('');
            process.exit(1);
        }

        console.log('Using Firebase Emulator (localhost:8080)');
    }

    const db = initializeFirebaseAdmin(!useProd);

    try {
        await seedCaseDefinitions(db);

        console.log('');
        console.log('='.repeat(60));
        console.log('Seeding complete!');
        console.log('');
        console.log('View in Firestore Emulator UI:');
        console.log('  http://localhost:4000/firestore');
        console.log('='.repeat(60));
    } catch (error) {
        console.error('Error seeding case definitions:', error);
        process.exit(1);
    }
}

// Run the seeder
main();
