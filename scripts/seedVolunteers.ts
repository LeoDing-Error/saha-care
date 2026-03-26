/**
 * Volunteer & Supervisor User Seeder for SAHA-Care
 *
 * Creates user documents for the 8 fallback volunteers and 3 supervisors
 * referenced by seedReports.ts and seedGazaCityAlerts.ts.
 *
 * Usage:
 *   npm run seed:users              # Seeds to emulator (default)
 *   npm run seed:users -- --prod    # Seeds to production (requires caution)
 *
 * Prerequisites:
 *   - Firebase emulators running: npm run emulators
 *   - Or production credentials configured (serviceAccountKey.json)
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { homedir, tmpdir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── User Data ───

const OFFICIAL_UID = 'official-1';

const SUPERVISORS = [
    { uid: 'supervisor-1', displayName: 'Dr. Mahmoud Al-Rantisi', email: 'mahmoud.rantisi@saha-care.org', region: 'Gaza City' },
    { uid: 'supervisor-2', displayName: 'Dr. Salwa Abu Nada', email: 'salwa.abunada@saha-care.org', region: 'North Gaza' },
    { uid: 'supervisor-3', displayName: 'Dr. Khaled Barhoum', email: 'khaled.barhoum@saha-care.org', region: 'Deir al-Balah' },
];

const VOLUNTEERS = [
    { uid: 'volunteer-1', displayName: 'Amira Hassan', email: 'amira.hassan@saha-care.org', region: 'Gaza City', supervisorId: 'supervisor-1' },
    { uid: 'volunteer-2', displayName: 'Youssef Khalil', email: 'youssef.khalil@saha-care.org', region: 'North Gaza', supervisorId: 'supervisor-2' },
    { uid: 'volunteer-3', displayName: 'Fatima Al-Masri', email: 'fatima.almasri@saha-care.org', region: 'Deir al-Balah', supervisorId: 'supervisor-3' },
    { uid: 'volunteer-4', displayName: 'Omar Nasser', email: 'omar.nasser@saha-care.org', region: 'Khan Younis', supervisorId: 'supervisor-2' },
    { uid: 'volunteer-5', displayName: 'Layla Saleh', email: 'layla.saleh@saha-care.org', region: 'Rafah', supervisorId: 'supervisor-3' },
    { uid: 'volunteer-6', displayName: 'Ibrahim Darwish', email: 'ibrahim.darwish@saha-care.org', region: 'Gaza City', supervisorId: 'supervisor-1' },
    { uid: 'volunteer-7', displayName: 'Nour Abed', email: 'nour.abed@saha-care.org', region: 'North Gaza', supervisorId: 'supervisor-2' },
    { uid: 'volunteer-8', displayName: 'Hana Qassem', email: 'hana.qassem@saha-care.org', region: 'Khan Younis', supervisorId: 'supervisor-2' },
];

// ─── Firebase Init ───

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
                const adcData = {
                    type: 'authorized_user',
                    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
                    client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
                    refresh_token: token,
                };
                const tmpAdcPath = join(tmpdir(), `firebase-adc-${Date.now()}.json`);
                writeFileSync(tmpAdcPath, JSON.stringify(adcData));
                process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpAdcPath;
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

// ─── Seeding ───

async function seedUsers(db: Firestore): Promise<void> {
    const usersCollection = db.collection('users');
    const approvedAt = Timestamp.fromDate(new Date('2025-01-15T10:00:00Z'));
    const createdAt = Timestamp.fromDate(new Date('2025-01-10T08:00:00Z'));
    const updatedAt = approvedAt;

    // Seed supervisors
    console.log('Seeding supervisors...');
    for (const sup of SUPERVISORS) {
        await usersCollection.doc(sup.uid).set({
            uid: sup.uid,
            email: sup.email,
            displayName: sup.displayName,
            role: 'supervisor',
            status: 'approved',
            region: sup.region,
            createdAt,
            updatedAt,
            approvedBy: OFFICIAL_UID,
            approvedAt,
        });
        console.log(`  ✓ ${sup.uid} — ${sup.displayName} (${sup.region})`);
    }

    // Seed volunteers
    console.log('');
    console.log('Seeding volunteers...');
    for (const vol of VOLUNTEERS) {
        await usersCollection.doc(vol.uid).set({
            uid: vol.uid,
            email: vol.email,
            displayName: vol.displayName,
            role: 'volunteer',
            status: 'approved',
            region: vol.region,
            supervisorId: vol.supervisorId,
            createdAt,
            updatedAt,
            approvedBy: vol.supervisorId,
            approvedAt,
        });
        console.log(`  ✓ ${vol.uid} — ${vol.displayName} (${vol.region}, supervisor: ${vol.supervisorId})`);
    }

    console.log('');
    console.log(`Seeded ${SUPERVISORS.length} supervisors and ${VOLUNTEERS.length} volunteers.`);
}

// ─── Main ───

async function main(): Promise<void> {
    console.log('='.repeat(60));
    console.log('SAHA-Care User Seeder');
    console.log('Creates volunteer & supervisor user documents');
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
            console.log('  npm run seed:users -- --prod');
            console.log('');
            process.exit(1);
        }
        console.log('Using Firebase Emulator (localhost:8080)');
    }

    const db = initializeFirebaseAdmin(!useProd);

    try {
        await seedUsers(db);

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
        console.error('Error seeding users:', error);
        process.exit(1);
    }
}

main();
