/**
 * Delete All Alerts Script for SAHA-Care
 *
 * Deletes all documents in the `alerts` collection from Firestore.
 * Used to clear stale alerts before re-seeding so that onAlertCreate
 * triggers fire (they only fire on document creation, not updates).
 *
 * Usage:
 *   npm run delete:alerts              # Deletes from emulator (default)
 *   npm run delete:alerts -- --prod    # Deletes from production (requires caution)
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { homedir, tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Firebase Admin Setup (same pattern as seedGazaCityAlerts.ts) ───

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

async function checkEmulatorRunning(): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:8080/', { method: 'GET' });
        return response.ok || response.status === 404;
    } catch {
        return false;
    }
}

async function deleteAllAlerts(db: Firestore): Promise<number> {
    const alertsRef = db.collection('alerts');
    const snapshot = await alertsRef.get();

    if (snapshot.empty) {
        console.log('No alerts found — collection is already empty.');
        return 0;
    }

    // Firestore batches support max 500 operations
    const batchSize = 500;
    let deleted = 0;
    const docs = snapshot.docs;

    for (let i = 0; i < docs.length; i += batchSize) {
        const batch = db.batch();
        const chunk = docs.slice(i, i + batchSize);
        for (const doc of chunk) {
            batch.delete(doc.ref);
        }
        await batch.commit();
        deleted += chunk.length;
    }

    return deleted;
}

async function main(): Promise<void> {
    console.log('='.repeat(60));
    console.log('SAHA-Care — Delete All Alerts');
    console.log('='.repeat(60));
    console.log('');

    const args = process.argv.slice(2);
    const useProd = args.includes('--prod');

    if (useProd) {
        console.log('WARNING: Deleting alerts from PRODUCTION Firestore');
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
            console.log('Or delete from production (use with caution):');
            console.log('  npm run delete:alerts -- --prod');
            process.exit(1);
        }
        console.log('Using Firebase Emulator (localhost:8080)');
    }

    const db = initializeFirebaseAdmin(!useProd);

    try {
        const count = await deleteAllAlerts(db);
        console.log('');
        console.log(`Deleted ${count} alert document(s).`);
        console.log('='.repeat(60));
    } catch (error) {
        console.error('Error deleting alerts:', error);
        process.exit(1);
    }
}

main();
