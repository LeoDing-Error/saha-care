"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserApproval = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
// Initialize Firebase Admin if not already initialized
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_2.getFirestore)();
exports.onUserApproval = (0, firestore_1.onDocumentUpdated)('users/{userId}', async (event) => {
    var _a, _b;
    const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
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
    const performer = performerDoc.data();
    // Validate: supervisors approve volunteers, officials approve supervisors
    const validApproval = (after.role === 'volunteer' && performer.role === 'supervisor') ||
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
    const auditLog = {
        action: isApproval ? 'user_approved' : 'user_rejected',
        targetUserId: userId,
        targetUserRole: after.role,
        performedBy,
        performedByRole: performer.role,
        region: after.region,
        previousStatus: 'pending',
        newStatus: after.status,
        timestamp: firestore_2.FieldValue.serverTimestamp(),
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
});
//# sourceMappingURL=onUserApproval.js.map