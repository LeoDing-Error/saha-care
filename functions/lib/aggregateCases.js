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
exports.aggregateCases = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_2.getFirestore)();
/**
 * Slugify a string for use as a document ID segment.
 */
function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
/**
 * Get the Monday of the week for a given date (ISO week).
 */
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
}
/**
 * Triggered when a report is created, updated, or deleted.
 * Maintains pre-computed aggregate documents for dashboard performance.
 */
exports.aggregateCases = (0, firestore_1.onDocumentWritten)('reports/{reportId}', async (event) => {
    var _a, _b, _c, _d;
    const after = (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after) === null || _b === void 0 ? void 0 : _b.data();
    const before = (_d = (_c = event.data) === null || _c === void 0 ? void 0 : _c.before) === null || _d === void 0 ? void 0 : _d.data();
    // Ignore deletions
    if (!after)
        return;
    const { disease, region, status } = after;
    const reportId = event.params.reportId;
    const now = new Date();
    const dayKey = now.toISOString().split('T')[0]; // "2026-03-12"
    const weekKey = getWeekStart(now); // Monday of current week
    const diseaseSlug = slugify(disease);
    const regionSlug = slugify(region);
    // Daily aggregate
    const dayDocId = `${diseaseSlug}_${regionSlug}_day_${dayKey}`;
    const dayRef = db.collection('aggregates').doc(dayDocId);
    // Weekly aggregate
    const weekDocId = `${diseaseSlug}_${regionSlug}_week_${weekKey}`;
    const weekRef = db.collection('aggregates').doc(weekDocId);
    if (!before) {
        // New report created — increment case count
        logger.info('Aggregating new report', { reportId, disease, region });
        const baseData = {
            disease,
            region,
            lastUpdated: firestore_2.FieldValue.serverTimestamp(),
        };
        const isVerified = status === 'verified';
        await dayRef.set(Object.assign(Object.assign({}, baseData), { period: 'day', caseCount: firestore_2.FieldValue.increment(1), verifiedCount: firestore_2.FieldValue.increment(isVerified ? 1 : 0) }), { merge: true });
        await weekRef.set(Object.assign(Object.assign({}, baseData), { period: 'week', caseCount: firestore_2.FieldValue.increment(1), verifiedCount: firestore_2.FieldValue.increment(isVerified ? 1 : 0) }), { merge: true });
    }
    else if (before.status !== 'verified' && status === 'verified') {
        // Report just verified — increment verified count only
        logger.info('Aggregating verified report', { reportId, disease, region });
        const updateData = {
            verifiedCount: firestore_2.FieldValue.increment(1),
            lastUpdated: firestore_2.FieldValue.serverTimestamp(),
        };
        await dayRef.set(Object.assign({ disease, region, period: 'day' }, updateData), { merge: true });
        await weekRef.set(Object.assign({ disease, region, period: 'week' }, updateData), { merge: true });
    }
});
//# sourceMappingURL=aggregateCases.js.map