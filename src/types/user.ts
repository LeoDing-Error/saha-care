/**
 * User roles in the SAHA-Care system.
 * Each role has different access levels and capabilities.
 */
export type UserRole = 'volunteer' | 'supervisor' | 'official';

/**
 * User approval status.
 * Users self-register as "pending" and must be approved by a higher role.
 */
export type UserStatus = 'pending' | 'approved' | 'rejected';

/**
 * Firestore user document.
 */
export interface User {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    status: UserStatus;
    /** UID of the supervisor this user reports to (volunteers only) */
    supervisorId?: string;
    /** Geographic region this user operates in */
    region: string;
    createdAt: Date;
    updatedAt: Date;
}
