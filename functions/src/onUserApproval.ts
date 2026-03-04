import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
    initializeApp();
}

const db = getFirestore();

interface UserData {
    uid: string;
    email: string;
    displayName: string;
    role: 'volunteer' | 'supervisor' | 'official';
    status: 'pending' | 'approved' | 'rejected';
    region: string;
    approvedBy?: string;
    rejectedBy?: string;
    rejectionReason?: string;
}

interface AuditLog {
    action: 'user_approved' | 'user_rejected';
    targetUserId: string;
    targetUserRole: 'volunteer' | 'supervisor';
    performedBy: string;
    performedByRole: 'supervisor' | 'official';
    region: string;
    previousStatus: 'pending';
    newStatus: 'approved' | 'rejected';
    rejectionReason?: string;
    timestamp: FieldValue;
}

export const onUserApproval = onDocumentUpdated(
    'users/{userId}',
    async (event) => {
        const before = event.data?.before.data() as UserData | undefined;
        const after = event.data?.after.data() as UserData | undefined;
        const userId = event.params.userId;

        if (!before || !after) {
            logger.warn('Missing document data', { userId });
            return;
        }

        // Only process status changes from pending
        if (before.status !== 'pending') {
            return;
        }

        // Check if status changed to approved or rejected
        if (after.status !== 'approved' && after.status !== 'rejected') {
            return;
        }

        const isApproval = after.status === 'approved';
        const performedBy = isApproval ? after.approvedBy : after.rejectedBy;

        if (!performedBy) {
            logger.error('Approval/rejection missing performer ID', { userId });
            return;
        }

        // Validate the approval hierarchy
        const performerDoc = await db.collection('users').doc(performedBy).get();
        if (!performerDoc.exists) {
            logger.error('Performer not found', { performedBy, userId });
            return;
        }

        const performer = performerDoc.data() as UserData;

        // Validate: supervisors approve volunteers, officials approve supervisors
        const validApproval =
            (after.role === 'volunteer' && performer.role === 'supervisor') ||
            (after.role === 'supervisor' && performer.role === 'official');

        if (!validApproval) {
            logger.error('Invalid approval hierarchy', {
                targetRole: after.role,
                performerRole: performer.role,
                userId,
                performedBy,
            });
            return;
        }

        // For volunteers, validate region scoping
        if (after.role === 'volunteer' && performer.region !== after.region) {
            logger.error('Region mismatch for volunteer approval', {
                targetRegion: after.region,
                performerRegion: performer.region,
                userId,
                performedBy,
            });
            return;
        }

        // Create audit log
        const auditLog: AuditLog = {
            action: isApproval ? 'user_approved' : 'user_rejected',
            targetUserId: userId,
            targetUserRole: after.role as 'volunteer' | 'supervisor',
            performedBy,
            performedByRole: performer.role as 'supervisor' | 'official',
            region: after.region,
            previousStatus: 'pending',
            newStatus: after.status,
            timestamp: FieldValue.serverTimestamp(),
        };

        if (!isApproval && after.rejectionReason) {
            auditLog.rejectionReason = after.rejectionReason;
        }

        await db.collection('auditLogs').add(auditLog);

        logger.info('User approval processed', {
            action: auditLog.action,
            targetUserId: userId,
            performedBy,
        });
    }
);
