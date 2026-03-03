import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';

/**
 * Firebase configuration.
 * Replace these values with your actual Firebase project config.
 * In production, use environment variables via import.meta.env.
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to emulators in development mode (only if USE_EMULATORS env var is set)
// To use emulators, run: VITE_USE_EMULATORS=true npm run dev
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true' && window.location.hostname === 'localhost') {
    // Only connect once - check if already connected
    // @ts-expect-error - _delegate is internal but needed to check emulator state
    if (!db._delegate?._settings?.host?.includes('localhost:8080')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('Connected to Firebase emulators');
    }
}

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        // Multiple tabs open — persistence can only be enabled in one tab at a time
        console.warn('Firestore persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
        // The current browser does not support persistence
        console.warn('Firestore persistence not supported in this browser');
    }
});

export default app;
