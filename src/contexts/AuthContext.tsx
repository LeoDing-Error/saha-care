import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, getUserProfile, subscribeToUserProfile } from '../services/auth';
import type { User } from '../types';

interface AuthContextType {
    /** Firebase Auth user (null if not signed in) */
    firebaseUser: FirebaseUser | null;
    /** Firestore user profile (null if not loaded or not signed in) */
    userProfile: User | null;
    /** Whether auth state is still loading */
    loading: boolean;
    /** Refresh the user profile from Firestore */
    refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    firebaseUser: null,
    userProfile: null,
    loading: true,
    refreshProfile: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshProfile = async () => {
        if (firebaseUser) {
            const profile = await getUserProfile(firebaseUser.uid);
            setUserProfile(profile);
        }
    };

    useEffect(() => {
        let profileUnsub: (() => void) | null = null;

        let timeout: ReturnType<typeof setTimeout> | null = null;

        const authUnsub = onAuthChange((user) => {
            setFirebaseUser(user);
            // Clean up previous profile listener and timeout
            if (profileUnsub) {
                profileUnsub();
                profileUnsub = null;
            }
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            if (user) {
                // Live listener — reacts to role/status changes in real-time
                try {
                    profileUnsub = subscribeToUserProfile(user.uid, (profile) => {
                        if (timeout) {
                            clearTimeout(timeout);
                            timeout = null;
                        }
                        setUserProfile(profile);
                        setLoading(false);
                    });
                } catch (err) {
                    console.error('Failed to subscribe to user profile:', err);
                    setUserProfile(null);
                    setLoading(false);
                    return;
                }
                // Fallback: if profile never loads, stop spinning after 10s
                timeout = setTimeout(() => {
                    setLoading((prev) => {
                        if (prev) console.warn('Auth loading timed out — forcing completion');
                        return false;
                    });
                }, 10_000);
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => {
            authUnsub();
            if (profileUnsub) profileUnsub();
            if (timeout) clearTimeout(timeout);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ firebaseUser, userProfile, loading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth state from any component.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
