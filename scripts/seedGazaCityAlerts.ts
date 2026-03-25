/**
 * Gaza City Alert Seed Script for SAHA-Care
 *
 * Generates concentrated disease reports in Gaza City designed to trigger
 * all alert thresholds (both immediate and cluster) via Cloud Functions.
 *
 * All reports are tightly clustered around Al-Shati Camp (~31.505, 34.45)
 * within ~1km radius, and dated within the last 24 hours.
 *
 * Usage:
 *   npm run seed:gaza-alerts              # Seeds to emulator (default)
 *   npm run seed:gaza-alerts -- --prod    # Seeds to production (requires caution)
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { homedir } from 'os';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Configuration ───

const REGION = 'Gaza City';

/** Cluster center: Al-Shati Camp area */
const CENTER_LAT = 31.505;
const CENTER_LNG = 34.45;

/** Keep all reports within ~1km of center (well within 2km proximity check) */
const SPREAD_LAT = 0.004; // ~0.45km
const SPREAD_LNG = 0.005; // ~0.45km

const VOLUNTEER_IDS = [
    { uid: 'volunteer-1', name: 'Amira Hassan' },
    { uid: 'volunteer-6', name: 'Ibrahim Darwish' },
];

const SUPERVISOR_IDS = ['supervisor-1', 'supervisor-2'];

const LOCATION_NAMES = ['Al-Shati Camp', 'Al-Rimal', 'Al-Daraj', 'Sheikh Radwan'];

// ─── Helpers ───

function randomFloat(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
    return Math.floor(randomFloat(min, max + 1));
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

const CASE_ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCaseId(date: Date): string {
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    let suffix = '';
    for (let i = 0; i < 4; i++) {
        suffix += CASE_ID_CHARS[Math.floor(Math.random() * CASE_ID_CHARS.length)];
    }
    return `SC-${dateStr}-${suffix}`;
}

/** Random date within the last 24 hours */
function recentDate(): Date {
    const now = Date.now();
    const offset = Math.random() * 24 * 60 * 60 * 1000;
    return new Date(now - offset);
}

/** Generate a location tightly clustered around the center */
function clusterLocation(): { lat: number; lng: number; name: string } {
    return {
        lat: parseFloat((CENTER_LAT + randomFloat(-SPREAD_LAT, SPREAD_LAT)).toFixed(6)),
        lng: parseFloat((CENTER_LNG + randomFloat(-SPREAD_LNG, SPREAD_LNG)).toFixed(6)),
        name: pick(LOCATION_NAMES),
    };
}

/** Simplified answers per disease (same structure as seedReports.ts) */
function generateAnswers(disease: string): { answers: { questionId: string; questionText: string; answer: boolean; numericValue?: number }[]; symptoms: string[] } {
    const answerSets: Record<string, () => { answers: { questionId: string; questionText: string; answer: boolean; numericValue?: number }[]; symptoms: string[] }> = {
        'Acute Watery Diarrhea': () => ({
            answers: [
                { questionId: 'awd-q1', questionText: '3+ loose/watery stools in past 24 hours?', answer: true, numericValue: randomInt(3, 12) },
                { questionId: 'awd-q2', questionText: 'Blood in stool?', answer: false },
                { questionId: 'awd-q3', questionText: 'Vomiting?', answer: Math.random() > 0.5 },
            ],
            symptoms: ['Watery diarrhea', 'Dehydration'],
        }),
        'Acute Bloody Diarrhea': () => ({
            answers: [
                { questionId: 'abd-q1', questionText: 'Visible blood in diarrhea?', answer: true },
                { questionId: 'abd-q2', questionText: 'Days since blood appeared?', answer: true, numericValue: randomInt(1, 3) },
            ],
            symptoms: ['Bloody diarrhea', 'Abdominal pain'],
        }),
        'Severe Acute Respiratory Infection (SARI)': () => ({
            answers: [
                { questionId: 'sari-q1', questionText: 'Fever?', answer: true },
                { questionId: 'sari-q2', questionText: 'Cough?', answer: true },
                { questionId: 'sari-q3', questionText: 'Difficulty breathing?', answer: true },
            ],
            symptoms: ['Fever', 'Cough', 'Difficulty breathing'],
        }),
        'Suspected Measles': () => ({
            answers: [
                { questionId: 'msl-q1', questionText: 'Fever?', answer: true },
                { questionId: 'msl-q2', questionText: 'Red rash all over body?', answer: true },
            ],
            symptoms: ['Fever', 'Rash'],
        }),
        'Chickenpox (Varicella)': () => ({
            answers: [
                { questionId: 'cpx-q1', questionText: 'Fever?', answer: true },
                { questionId: 'cpx-q2', questionText: 'Itchy spots/blisters?', answer: true },
            ],
            symptoms: ['Fever', 'Blisters', 'Itching'],
        }),
        'Acute Jaundice Syndrome': () => ({
            answers: [
                { questionId: 'ajs-q1', questionText: 'Yellow eyes?', answer: true },
                { questionId: 'ajs-q2', questionText: 'Yellow skin?', answer: true },
            ],
            symptoms: ['Jaundice (yellow eyes)'],
        }),
        'Suspected Leishmaniasis': () => ({
            answers: [
                { questionId: 'lsh-q1', questionText: 'Non-healing skin sore?', answer: true },
                { questionId: 'lsh-q2', questionText: 'Duration of sore?', answer: true, numericValue: randomInt(2, 8) },
            ],
            symptoms: ['Non-healing skin sore'],
        }),
        'Acute Flaccid Paralysis (AFP)': () => ({
            answers: [
                { questionId: 'afp-q1', questionText: 'Child under 15?', answer: true },
                { questionId: 'afp-q2', questionText: 'Sudden weakness?', answer: true },
            ],
            symptoms: ['Sudden limb weakness', 'Floppy limb'],
        }),
        'Suspected Pertussis (Whooping Cough)': () => ({
            answers: [
                { questionId: 'per-q1', questionText: 'Cough 2+ weeks?', answer: true, numericValue: randomInt(2, 6) },
                { questionId: 'per-q2', questionText: 'Coughing fits?', answer: true },
            ],
            symptoms: ['Persistent cough', 'Coughing fits'],
        }),
        'Suspected Diphtheria': () => ({
            answers: [
                { questionId: 'dph-q1', questionText: 'Sore throat?', answer: true },
                { questionId: 'dph-q3', questionText: 'Gray membrane in throat?', answer: true },
            ],
            symptoms: ['Sore throat', 'Gray throat membrane'],
        }),
    };
    const gen = answerSets[disease];
    return gen ? gen() : { answers: [{ questionId: 'gen-q1', questionText: 'Symptom present?', answer: true }], symptoms: ['Primary symptom'] };
}

// ─── Report Spec ───
// Each entry defines a batch of reports for a specific disease with targeted properties.

interface ReportSpec {
    disease: string;
    count: number;
    status: 'pending' | 'verified';
    hasDangerSigns?: boolean;
    isImmediateReport?: boolean;
    patientAgeMonths?: number | 'under5' | 'infant';
}

const REPORT_SPECS: ReportSpec[] = [
    // Acute Watery Diarrhea: 12 verified (5 with age < 60 months for under-5 cluster)
    { disease: 'Acute Watery Diarrhea', count: 5, status: 'verified', patientAgeMonths: 'under5' },
    { disease: 'Acute Watery Diarrhea', count: 7, status: 'verified' },

    // Acute Bloody Diarrhea: 1 pending (immediate) + 2 verified (cluster)
    { disease: 'Acute Bloody Diarrhea', count: 1, status: 'pending', isImmediateReport: true },
    { disease: 'Acute Bloody Diarrhea', count: 2, status: 'verified' },

    // SARI: 4 verified with danger signs (cluster threshold = 3)
    { disease: 'Severe Acute Respiratory Infection (SARI)', count: 4, status: 'verified', hasDangerSigns: true },

    // Suspected Measles: 1 pending (immediate) + 2 verified (cluster)
    { disease: 'Suspected Measles', count: 1, status: 'pending', isImmediateReport: true },
    { disease: 'Suspected Measles', count: 2, status: 'verified' },

    // Chickenpox: 11 verified (cluster threshold = 10)
    { disease: 'Chickenpox (Varicella)', count: 11, status: 'verified' },

    // Acute Jaundice: 4 verified (cluster threshold = 3)
    { disease: 'Acute Jaundice Syndrome', count: 4, status: 'verified' },

    // Leishmaniasis: 6 verified (cluster threshold = 5)
    { disease: 'Suspected Leishmaniasis', count: 6, status: 'verified' },

    // AFP: 1 pending (immediate threshold = 1)
    { disease: 'Acute Flaccid Paralysis (AFP)', count: 1, status: 'pending', isImmediateReport: true },

    // Pertussis: 1 pending infant (immediate) + 5 verified (cluster)
    { disease: 'Suspected Pertussis (Whooping Cough)', count: 1, status: 'pending', isImmediateReport: true, patientAgeMonths: 'infant' },
    { disease: 'Suspected Pertussis (Whooping Cough)', count: 5, status: 'verified' },

    // Diphtheria: 1 pending (immediate) + 2 verified (cluster)
    { disease: 'Suspected Diphtheria', count: 1, status: 'pending', isImmediateReport: true },
    { disease: 'Suspected Diphtheria', count: 2, status: 'verified' },

    // Danger signs reports (from any disease, to trigger cross-disease alert)
    { disease: 'Acute Watery Diarrhea', count: 2, status: 'pending', hasDangerSigns: true },
];

// ─── Report Generation ───

interface SeedReport {
    caseId: string;
    disease: string;
    answers: { questionId: string; questionText: string; answer: boolean; numericValue?: number }[];
    symptoms: string[];
    temp?: number;
    dangerSigns: string[];
    location: { lat: number; lng: number; name: string };
    status: 'pending' | 'verified';
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
}

function generateReports(): SeedReport[] {
    const reports: SeedReport[] = [];

    for (const spec of REPORT_SPECS) {
        for (let i = 0; i < spec.count; i++) {
            const createdAt = recentDate();
            const volunteer = pick(VOLUNTEER_IDS);
            const { answers, symptoms } = generateAnswers(spec.disease);
            const hasDangerSigns = spec.hasDangerSigns ?? false;

            let patientAgeMonths: number | undefined;
            if (spec.patientAgeMonths === 'under5') {
                patientAgeMonths = randomInt(6, 59); // under 60 months
            } else if (spec.patientAgeMonths === 'infant') {
                patientAgeMonths = randomInt(1, 11); // under 12 months
            } else if (typeof spec.patientAgeMonths === 'number') {
                patientAgeMonths = spec.patientAgeMonths;
            } else {
                patientAgeMonths = randomInt(12, 600); // general population
            }

            const report: SeedReport = {
                caseId: generateCaseId(createdAt),
                disease: spec.disease,
                answers,
                symptoms,
                temp: parseFloat(randomFloat(36.5, 40.0).toFixed(1)),
                dangerSigns: hasDangerSigns ? [pick(['Unable to drink or breastfeed', 'Severe vomiting', 'Difficulty breathing', 'Severe dehydration'])] : [],
                location: clusterLocation(),
                status: spec.status,
                reporterId: volunteer.uid,
                reporterName: volunteer.name,
                region: REGION,
                hasDangerSigns,
                isImmediateReport: spec.isImmediateReport ?? false,
                personsCount: 1,
                patientAgeMonths,
                createdAt,
            };

            if (spec.status === 'verified') {
                report.verifiedBy = pick(SUPERVISOR_IDS);
                report.verifiedAt = new Date(createdAt.getTime() + randomInt(1, 6) * 60 * 60 * 1000);
            }

            reports.push(report);
        }
    }

    // Sort oldest first
    reports.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return reports;
}

// ─── Firebase Admin Setup & Seeding ───

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
        // Fall back to Firebase CLI refresh token via ADC
        const firebaseConfigPath = resolve(homedir(), '.config/configstore/firebase-tools.json');
        if (existsSync(firebaseConfigPath)) {
            const firebaseConfig = JSON.parse(readFileSync(firebaseConfigPath, 'utf-8'));
            const token = firebaseConfig?.tokens?.refresh_token;
            if (token) {
                // Write a temporary ADC file from the Firebase CLI refresh token
                const adcData = {
                    type: 'authorized_user',
                    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
                    client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
                    refresh_token: token,
                };
                const tmpAdcPath = join(tmpdir(), `firebase-adc-${Date.now()}.json`);
                writeFileSync(tmpAdcPath, JSON.stringify(adcData));
                process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpAdcPath;
                // Clean up on exit
                process.on('exit', () => { try { unlinkSync(tmpAdcPath); } catch {} });

                initializeApp({ projectId: 'saha-care' });
                console.log('Initialized Firebase Admin with Firebase CLI credentials');
            } else {
                console.error('ERROR: No credentials found. Run `firebase login` first.');
                process.exit(1);
            }
        } else {
            console.error('ERROR: No credentials found. Run `firebase login` or place serviceAccountKey.json in project root.');
            process.exit(1);
        }
    }

    return getFirestore();
}

async function seedReports(db: Firestore): Promise<void> {
    const coll = db.collection('reports');
    const reports = generateReports();

    console.log(`\nSeeding ${reports.length} Gaza City reports...\n`);

    const diseaseCounts: Record<string, { pending: number; verified: number }> = {};
    let dangerSignsCount = 0;

    const batch = db.batch();

    for (const report of reports) {
        const docRef = coll.doc();

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

        batch.set(docRef, firestoreDoc);

        // Track counts
        if (!diseaseCounts[report.disease]) {
            diseaseCounts[report.disease] = { pending: 0, verified: 0 };
        }
        diseaseCounts[report.disease][report.status]++;
        if (report.hasDangerSigns) dangerSignsCount++;
    }

    await batch.commit();
    console.log(`Committed ${reports.length} reports\n`);

    // Print summary
    console.log('── Summary ──\n');
    console.log('Disease                                    | Pending | Verified | Total');
    console.log('-------------------------------------------|---------|----------|------');
    let totalPending = 0;
    let totalVerified = 0;
    for (const [disease, counts] of Object.entries(diseaseCounts).sort(([, a], [, b]) => (b.pending + b.verified) - (a.pending + a.verified))) {
        const total = counts.pending + counts.verified;
        totalPending += counts.pending;
        totalVerified += counts.verified;
        console.log(`${disease.padEnd(43)}| ${String(counts.pending).padEnd(8)}| ${String(counts.verified).padEnd(9)}| ${total}`);
    }
    console.log('-------------------------------------------|---------|----------|------');
    console.log(`${'TOTAL'.padEnd(43)}| ${String(totalPending).padEnd(8)}| ${String(totalVerified).padEnd(9)}| ${reports.length}`);
    console.log(`\nReports with danger signs: ${dangerSignsCount}`);
    console.log(`Region: ${REGION} (all reports)`);
    console.log(`Cluster center: ~${CENTER_LAT}, ${CENTER_LNG} (Al-Shati Camp)`);
}

async function main(): Promise<void> {
    console.log('='.repeat(60));
    console.log('SAHA-Care Gaza City Alert Seeder');
    console.log('Targeted reports to trigger all alert thresholds');
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
            console.log('  npm run seed:gaza-alerts -- --prod');
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
        if (useProd) {
            console.log('Cloud Functions will process reports and generate alerts.');
        } else {
            console.log('View in Firestore Emulator UI: http://localhost:4000/firestore');
        }
        console.log('='.repeat(60));
    } catch (error) {
        console.error('Error seeding reports:', error);
        process.exit(1);
    }
}

main();
