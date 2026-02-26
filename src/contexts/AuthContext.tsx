import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, getUserProfile } from '../services/auth';
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

const AuthContext = createContext<AuthContextType>({
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
        const unsubscribe = onAuthChange(async (user) => {
            setFirebaseUser(user);
            if (user) {
                try {
                    const profile = await getUserProfile(user.uid);
                    setUserProfile(profile);
                } catch (err) {
                    console.error('Failed to load user profile:', err);
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
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
