/**
 * Report Seeder for SAHA-Care
 *
 * Generates realistic disease surveillance reports across Gaza Strip regions
 * with varied diseases, statuses, dates, and geographic coordinates.
 *
 * Usage:
 *   npm run seed:reports              # Seeds to emulator (default)
 *   npm run seed:reports -- --prod    # Seeds to production (requires caution)
 *
 * Prerequisites:
 *   - Firebase emulators running: npm run emulators
 *   - Or production credentials configured (serviceAccountKey.json)
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Configuration ───

const TOTAL_REPORTS = 150;

/** Volunteer user IDs — replace with real UIDs from your Firestore users collection */
const VOLUNTEER_IDS = [
    { uid: 'volunteer-1', name: 'Amira Hassan', region: 'Gaza City' },
    { uid: 'volunteer-2', name: 'Youssef Khalil', region: 'North Gaza' },
    { uid: 'volunteer-3', name: 'Fatima Al-Masri', region: 'Deir al-Balah' },
    { uid: 'volunteer-4', name: 'Omar Nasser', region: 'Khan Younis' },
    { uid: 'volunteer-5', name: 'Layla Saleh', region: 'Rafah' },
    { uid: 'volunteer-6', name: 'Ibrahim Darwish', region: 'Gaza City' },
    { uid: 'volunteer-7', name: 'Nour Abed', region: 'North Gaza' },
    { uid: 'volunteer-8', name: 'Hana Qassem', region: 'Khan Younis' },
];

const SUPERVISOR_IDS = [
    'supervisor-1',
    'supervisor-2',
    'supervisor-3',
];

/** Approximate bounding boxes for each region in Gaza Strip */
const REGION_COORDS: Record<string, { latMin: number; latMax: number; lngMin: number; lngMax: number }> = {
    'North Gaza':    { latMin: 31.50, latMax: 31.55, lngMin: 34.44, lngMax: 34.52 },
    'Gaza City':     { latMin: 31.48, latMax: 31.53, lngMin: 34.42, lngMax: 34.48 },
    'Deir al-Balah': { latMin: 31.38, latMax: 31.45, lngMin: 34.33, lngMax: 34.38 },
    'Khan Younis':   { latMin: 31.30, latMax: 31.38, lngMin: 34.28, lngMax: 34.35 },
    'Rafah':         { latMin: 31.26, latMax: 31.32, lngMin: 34.22, lngMax: 34.28 },
};

/** Location names per region */
const LOCATION_NAMES: Record<string, string[]> = {
    'North Gaza':    ['Beit Hanoun', 'Beit Lahia', 'Jabalia Camp', 'Jabalia Town'],
    'Gaza City':     ['Al-Shati Camp', 'Al-Rimal', 'Al-Daraj', 'Sheikh Radwan', 'Tal al-Hawa'],
    'Deir al-Balah': ['Deir al-Balah City', 'Al-Bureij Camp', 'Al-Maghazi Camp', 'Nuseirat Camp'],
    'Khan Younis':   ['Khan Younis City', 'Khan Younis Camp', 'Abasan', 'Bani Suheila'],
    'Rafah':         ['Rafah City', 'Rafah Camp', 'Tal al-Sultan', 'Al-Shaboura'],
};

/** Disease distribution weights (higher = more common) */
const DISEASES = [
    { disease: 'Acute Watery Diarrhea', weight: 30 },
    { disease: 'Acute Bloody Diarrhea', weight: 8 },
    { disease: 'Severe Acute Respiratory Infection (SARI)', weight: 20 },
    { disease: 'Suspected Measles', weight: 10 },
    { disease: 'Chickenpox (Varicella)', weight: 12 },
    { disease: 'Acute Jaundice Syndrome', weight: 5 },
    { disease: 'Suspected Leishmaniasis', weight: 6 },
    { disease: 'Acute Flaccid Paralysis (AFP)', weight: 2 },
    { disease: 'Suspected Pertussis (Whooping Cough)', weight: 4 },
    { disease: 'Suspected Diphtheria', weight: 3 },
];

// ─── Helper functions ───

function randomFloat(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
    return Math.floor(randomFloat(min, max + 1));
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(items: { disease: string; weight: number }[]): string {
    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
    let r = Math.random() * totalWeight;
    for (const item of items) {
        r -= item.weight;
        if (r <= 0) return item.disease;
    }
    return items[items.length - 1].disease;
}

const CASE_ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Generate a human-readable case ID for a given date (same format as src/services/reports.ts) */
function generateCaseId(date: Date): string {
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    let suffix = '';
    for (let i = 0; i < 4; i++) {
        suffix += CASE_ID_CHARS[Math.floor(Math.random() * CASE_ID_CHARS.length)];
    }
    return `SC-${dateStr}-${suffix}`;
}

/** Generate a random date within the last N days */
function randomDate(daysBack: number): Date {
    const now = Date.now();
    const offset = Math.random() * daysBack * 24 * 60 * 60 * 1000;
    return new Date(now - offset);
}

/** Generate simplified assessment answers for a disease */
function generateAnswers(disease: string): { answers: { questionId: string; questionText: string; answer: boolean; numericValue?: number }[]; symptoms: string[] } {
    const answerSets: Record<string, () => { answers: { questionId: string; questionText: string; answer: boolean; numericValue?: number }[]; symptoms: string[] }> = {
        'Acute Watery Diarrhea': () => {
            const stoolCount = randomInt(3, 12);
            return {
                answers: [
                    { questionId: 'awd-q1', questionText: '3+ loose/watery stools in past 24 hours?', answer: true, numericValue: stoolCount },
                    { questionId: 'awd-q2', questionText: 'Blood in stool?', answer: false },
                    { questionId: 'awd-q3', questionText: 'Vomiting?', answer: Math.random() > 0.5 },
                    { questionId: 'awd-q4', questionText: 'Can drink normally?', answer: Math.random() > 0.3 },
                ],
                symptoms: ['Watery diarrhea', ...(Math.random() > 0.5 ? ['Vomiting'] : [])],
            };
        },
        'Acute Bloody Diarrhea': () => ({
            answers: [
                { questionId: 'abd-q1', questionText: 'Visible blood in diarrhea?', answer: true },
                { questionId: 'abd-q2', questionText: 'Days since blood appeared?', answer: true, numericValue: randomInt(1, 5) },
                { questionId: 'abd-q3', questionText: 'Abdominal pain?', answer: Math.random() > 0.3 },
                { questionId: 'abd-q4', questionText: 'Fever?', answer: Math.random() > 0.4 },
            ],
            symptoms: ['Bloody diarrhea', 'Abdominal pain'],
        }),
        'Severe Acute Respiratory Infection (SARI)': () => ({
            answers: [
                { questionId: 'sari-q1', questionText: 'Fever?', answer: true },
                { questionId: 'sari-q2', questionText: 'Cough?', answer: true },
                { questionId: 'sari-q3', questionText: 'Difficulty breathing?', answer: true },
                { questionId: 'sari-q4', questionText: 'Breathing faster than normal?', answer: Math.random() > 0.4, numericValue: randomInt(22, 40) },
            ],
            symptoms: ['Fever', 'Cough', 'Difficulty breathing'],
        }),
        'Suspected Measles': () => ({
            answers: [
                { questionId: 'msl-q1', questionText: 'Fever?', answer: true },
                { questionId: 'msl-q2', questionText: 'Red rash all over body?', answer: true },
                { questionId: 'msl-q3', questionText: 'Cough?', answer: Math.random() > 0.3 },
                { questionId: 'msl-q4', questionText: 'Runny nose?', answer: Math.random() > 0.4 },
                { questionId: 'msl-q5', questionText: 'Red eyes?', answer: Math.random() > 0.5 },
            ],
            symptoms: ['Fever', 'Rash', ...(Math.random() > 0.3 ? ['Cough'] : []), ...(Math.random() > 0.5 ? ['Red eyes'] : [])],
        }),
        'Chickenpox (Varicella)': () => ({
            answers: [
                { questionId: 'cpx-q1', questionText: 'Fever?', answer: true },
                { questionId: 'cpx-q2', questionText: 'Itchy spots/blisters?', answer: true },
                { questionId: 'cpx-q3', questionText: 'Fluid-filled blisters?', answer: Math.random() > 0.3 },
                { questionId: 'cpx-q4', questionText: 'Blisters in different stages?', answer: Math.random() > 0.4 },
            ],
            symptoms: ['Fever', 'Blisters', 'Itching'],
        }),
        'Acute Jaundice Syndrome': () => ({
            answers: [
                { questionId: 'ajs-q1', questionText: 'Yellow eyes?', answer: true },
                { questionId: 'ajs-q2', questionText: 'Yellow skin?', answer: Math.random() > 0.4 },
                { questionId: 'ajs-q3', questionText: 'Dark urine?', answer: Math.random() > 0.3 },
                { questionId: 'ajs-q5', questionText: 'Abdominal pain?', answer: Math.random() > 0.5 },
            ],
            symptoms: ['Jaundice (yellow eyes)', ...(Math.random() > 0.3 ? ['Dark urine'] : [])],
        }),
        'Suspected Leishmaniasis': () => ({
            answers: [
                { questionId: 'lsh-q1', questionText: 'Non-healing skin sore?', answer: true },
                { questionId: 'lsh-q2', questionText: 'Duration of sore?', answer: true, numericValue: randomInt(2, 12) },
                { questionId: 'lsh-q3', questionText: 'Sore painless?', answer: Math.random() > 0.3 },
                { questionId: 'lsh-q4', questionText: 'On face/arms/legs?', answer: Math.random() > 0.3 },
            ],
            symptoms: ['Non-healing skin sore'],
        }),
        'Acute Flaccid Paralysis (AFP)': () => ({
            answers: [
                { questionId: 'afp-q1', questionText: 'Child under 15?', answer: true },
                { questionId: 'afp-q2', questionText: 'Sudden weakness?', answer: true },
                { questionId: 'afp-q3', questionText: 'Limb floppy/limp?', answer: true },
                { questionId: 'afp-q4', questionText: 'Fever at onset?', answer: Math.random() > 0.5 },
            ],
            symptoms: ['Sudden limb weakness', 'Floppy limb'],
        }),
        'Suspected Pertussis (Whooping Cough)': () => ({
            answers: [
                { questionId: 'per-q1', questionText: 'Cough 2+ weeks?', answer: true, numericValue: randomInt(2, 6) },
                { questionId: 'per-q2', questionText: 'Coughing fits?', answer: true },
                { questionId: 'per-q3', questionText: 'Whooping sound?', answer: Math.random() > 0.4 },
                { questionId: 'per-q4', questionText: 'Vomiting after coughing?', answer: Math.random() > 0.5 },
            ],
            symptoms: ['Persistent cough', 'Coughing fits', ...(Math.random() > 0.4 ? ['Whooping sound'] : [])],
        }),
        'Suspected Diphtheria': () => ({
            answers: [
                { questionId: 'dph-q1', questionText: 'Sore throat?', answer: true },
                { questionId: 'dph-q2', questionText: 'Low-grade fever?', answer: Math.random() > 0.3 },
                { questionId: 'dph-q3', questionText: 'Gray membrane in throat?', answer: true },
                { questionId: 'dph-q5', questionText: 'Swollen neck?', answer: Math.random() > 0.5 },
            ],
            symptoms: ['Sore throat', 'Gray throat membrane', ...(Math.random() > 0.5 ? ['Swollen neck'] : [])],
        }),
    };

    const generator = answerSets[disease];
    if (generator) return generator();

    // Fallback
    return {
        answers: [{ questionId: 'generic-q1', questionText: 'Primary symptom present?', answer: true }],
        symptoms: ['Primary symptom'],
    };
}

/** Determine danger signs based on disease and randomness */
function generateDangerSigns(disease: string): { dangerSigns: string[]; hasDangerSigns: boolean; isImmediateReport: boolean } {
    const dangerChance = 0.15; // 15% of reports have danger signs
    const hasDangerSigns = Math.random() < dangerChance;

    if (!hasDangerSigns) {
        return { dangerSigns: [], hasDangerSigns: false, isImmediateReport: false };
    }

    const commonDangerSigns = [
        'Unable to drink or breastfeed',
        'Severe vomiting',
        'Difficulty breathing',
        'Severe dehydration',
    ];

    const dangerSigns = [pick(commonDangerSigns)];

    // Some critical diseases trigger immediate reports
    const immediateDiseases = ['Acute Bloody Diarrhea', 'Suspected Measles', 'Acute Flaccid Paralysis (AFP)', 'Suspected Diphtheria'];
    const isImmediateReport = immediateDiseases.includes(disease) && Math.random() > 0.5;

    return { dangerSigns, hasDangerSigns: true, isImmediateReport };
}

// ─── Report Generation ───

interface SeedReport {
    caseId: string;
    disease: string;
    answers: { questionId: string; questionText: string; answer: boolean; numericValue?: number }[];
    symptoms: string[];
    temp?: number;
    dangerSigns: string[];
    location: { lat: number; lng: number; name: string };
    status: 'pending' | 'verified' | 'rejected';
    reporterId: string;
    reporterName: string;
    region: string;
    hasDangerSigns: boolean;
    isImmediateReport: boolean;
    personsCount: number;
    patientAgeMonths?: number;
    createdAt: Date;
    verifiedBy?: string;
    verifiedAt?: Date;
    verificationNotes?: string;
}

function generateReports(count: number): SeedReport[] {
    const reports: SeedReport[] = [];

    for (let i = 0; i < count; i++) {
        const disease = weightedPick(DISEASES);
        const volunteer = pick(VOLUNTEER_IDS);
        const region = volunteer.region;
        const coords = REGION_COORDS[region];
        const locationNames = LOCATION_NAMES[region];

        const { answers, symptoms } = generateAnswers(disease);
        const { dangerSigns, hasDangerSigns, isImmediateReport } = generateDangerSigns(disease);

        const createdAt = randomDate(60); // Reports spanning last 60 days
        const hasTemp = Math.random() > 0.3;

        // Status distribution: 60% verified, 25% pending, 15% rejected
        const statusRoll = Math.random();
        let status: 'pending' | 'verified' | 'rejected';
        if (statusRoll < 0.60) status = 'verified';
        else if (statusRoll < 0.85) status = 'pending';
        else status = 'rejected';

        const report: SeedReport = {
            caseId: generateCaseId(createdAt),
            disease,
            answers,
            symptoms,
            ...(hasTemp ? { temp: parseFloat(randomFloat(36.5, 40.5).toFixed(1)) } : {}),
            dangerSigns,
            location: {
                lat: parseFloat(randomFloat(coords.latMin, coords.latMax).toFixed(6)),
                lng: parseFloat(randomFloat(coords.lngMin, coords.lngMax).toFixed(6)),
                name: pick(locationNames),
            },
            status,
            reporterId: volunteer.uid,
            reporterName: volunteer.name,
            region,
            hasDangerSigns,
            isImmediateReport,
            personsCount: Math.random() > 0.7 ? randomInt(2, 8) : 1,
            patientAgeMonths: Math.random() > 0.3 ? randomInt(1, 720) : undefined,
            createdAt,
        };

        // Add verification metadata for verified/rejected reports
        if (status === 'verified' || status === 'rejected') {
            report.verifiedBy = pick(SUPERVISOR_IDS);
            report.verifiedAt = new Date(createdAt.getTime() + randomInt(1, 48) * 60 * 60 * 1000); // 1-48h after creation
            if (status === 'rejected') {
                report.verificationNotes = pick([
                    'Duplicate report',
                    'Insufficient symptom data',
                    'Location could not be confirmed',
                    'Case does not meet case definition criteria',
                ]);
            }
        }

        reports.push(report);
    }

    // Sort by date (oldest first for seeding order)
    reports.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return reports;
}

// ─── Firebase Admin Setup & Seeding Logic ───

async function checkEmulatorRunning(): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:8080/', { method: 'GET' });
        return response.ok || response.status === 404;
    } catch {
        return false;
    }
}

function initializeFirebaseAdmin(useEmulator: boolean): Firestore {
    const serviceAccountPath = join(__dirname, '..', 'serviceAccountKey.json');
    const hasServiceAccount = existsSync(serviceAccountPath);

    if (useEmulator) {
        process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
        initializeApp({ projectId: 'saha-care-demo' });
        console.log('Initialized Firebase Admin with emulator');
    } else if (hasServiceAccount) {
        const serviceAccount = JSON.parse(
            readFileSync(serviceAccountPath, 'utf-8')
        ) as ServiceAccount;
        initializeApp({ credential: cert(serviceAccount) });
        console.log('Initialized Firebase Admin with service account');
    } else {
        console.error('ERROR: No serviceAccountKey.json found.');
        console.error('');
        console.error('To seed production, download a service account key:');
        console.error('  1. Go to Firebase Console → Project Settings → Service Accounts');
        console.error('  2. Click "Generate new private key"');
        console.error('  3. Save as serviceAccountKey.json in the project root');
        console.error('');
        process.exit(1);
    }

    return getFirestore();
}

async function seedReports(db: Firestore): Promise<void> {
    const coll = db.collection('reports');
    const reports = generateReports(TOTAL_REPORTS);

    console.log(`\nSeeding ${reports.length} reports...\n`);

    // Summary counters
    const diseaseCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = { pending: 0, verified: 0, rejected: 0 };

    const batch_size = 500; // Firestore batch limit
    let batch = db.batch();
    let batchCount = 0;

    for (const report of reports) {
        const docRef = coll.doc(); // Auto-generated ID

        // Build the Firestore document
        const firestoreDoc: Record<string, unknown> = {
            caseId: report.caseId,
            disease: report.disease,
            answers: report.answers,
            symptoms: report.symptoms,
            dangerSigns: report.dangerSigns,
            location: report.location,
            status: report.status,
            reporterId: report.reporterId,
            reporterName: report.reporterName,
            region: report.region,
            hasDangerSigns: report.hasDangerSigns,
            isImmediateReport: report.isImmediateReport,
            personsCount: report.personsCount,
            createdAt: Timestamp.fromDate(report.createdAt),
        };

        if (report.temp !== undefined) firestoreDoc.temp = report.temp;
        if (report.patientAgeMonths !== undefined) firestoreDoc.patientAgeMonths = report.patientAgeMonths;
        if (report.verifiedBy) firestoreDoc.verifiedBy = report.verifiedBy;
        if (report.verifiedAt) firestoreDoc.verifiedAt = Timestamp.fromDate(report.verifiedAt);
        if (report.verificationNotes) firestoreDoc.verificationNotes = report.verificationNotes;

        batch.set(docRef, firestoreDoc);
        batchCount++;

        // Track counts
        diseaseCounts[report.disease] = (diseaseCounts[report.disease] || 0) + 1;
        regionCounts[report.region] = (regionCounts[report.region] || 0) + 1;
        statusCounts[report.status]++;

        if (batchCount >= batch_size) {
            await batch.commit();
            console.log(`  Committed batch of ${batchCount} reports`);
            batch = db.batch();
            batchCount = 0;
        }
    }

    // Commit remaining
    if (batchCount > 0) {
        await batch.commit();
        console.log(`  Committed final batch of ${batchCount} reports`);
    }

    // Print summary
    console.log('\n── Summary ──\n');

    console.log('By Disease:');
    Object.entries(diseaseCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([disease, count]) => {
            console.log(`  ${disease}: ${count}`);
        });

    console.log('\nBy Region:');
    Object.entries(regionCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([region, count]) => {
            console.log(`  ${region}: ${count}`);
        });

    console.log('\nBy Status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
    });

    console.log(`\nTotal: ${reports.length} reports`);
    const dateRange = reports.length > 0
        ? `${reports[0].createdAt.toISOString().split('T')[0]} to ${reports[reports.length - 1].createdAt.toISOString().split('T')[0]}`
        : 'N/A';
    console.log(`Date range: ${dateRange}`);
}

async function main(): Promise<void> {
    console.log('='.repeat(60));
    console.log('SAHA-Care Report Seeder');
    console.log(`Generating ${TOTAL_REPORTS} realistic disease reports`);
    console.log('='.repeat(60));
    console.log('');

    const args = process.argv.slice(2);
    const useProd = args.includes('--prod');

    if (useProd) {
        console.log('WARNING: Seeding to PRODUCTION Firestore');
        console.log('Press Ctrl+C within 5 seconds to cancel...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
    } else {
        const emulatorRunning = await checkEmulatorRunning();
        if (!emulatorRunning) {
            console.log('ERROR: Firebase emulator is not running.');
            console.log('');
            console.log('Start the emulators first:');
            console.log('  npm run emulators');
            console.log('');
            console.log('Or seed to production (use with caution):');
            console.log('  npm run seed:reports -- --prod');
            console.log('');
            process.exit(1);
        }
        console.log('Using Firebase Emulator (localhost:8080)');
    }

    const db = initializeFirebaseAdmin(!useProd);

    try {
        await seedReports(db);

        console.log('');
        console.log('='.repeat(60));
        console.log('Seeding complete!');
        if (!useProd) {
            console.log('');
            console.log('View in Firestore Emulator UI:');
            console.log('  http://localhost:4000/firestore');
        }
        console.log('='.repeat(60));
    } catch (error) {
        console.error('Error seeding reports:', error);
        process.exit(1);
    }
}

main();
