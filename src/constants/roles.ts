import type { UserRole } from '../types';

/**
 * User roles and their display labels.
 */
export const ROLES: Record<UserRole, string> = {
    volunteer: 'Volunteer',
    supervisor: 'Supervisor',
    official: 'Official',
};

/**
 * Roles available for self-registration.
 * Officials are pre-provisioned — they cannot self-register.
 */
export const REGISTRATION_ROLES: UserRole[] = ['volunteer', 'supervisor'];

/**
 * Mapping of which role can approve which.
 */
export const APPROVAL_HIERARCHY: Record<UserRole, UserRole | null> = {
    volunteer: 'supervisor',
    supervisor: 'official',
    official: null, // officials are pre-provisioned
};
