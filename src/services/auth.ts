import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile,
    type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserRole } from '../types';

/**
 * Register a new user with email/password.
 * Creates both a Firebase Auth account and a Firestore user document
 * with status "pending" (requires approval from higher role).
 */
export async function signUp(
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    region: string
): Promise<FirebaseUser> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    // Set display name on the Auth profile
    await updateProfile(user, { displayName });

    // Create the Firestore user document
    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        displayName,
        role,
        status: 'pending',
        region,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return user;
}

/**
 * Sign in with email and password.
 */
export async function signIn(email: string, password: string): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}

/**
 * Fetch the Firestore user document for the given UID.
 */
export async function getUserProfile(uid: string) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return { ...snap.data(), uid: snap.id } as import('../types').User;
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
}
