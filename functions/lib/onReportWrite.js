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
exports.onReportWrite = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_2.getFirestore)();
const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical'];
/**
 * Create or update an alert for a disease+region combination.
 */
async function createAlertIfNeeded(disease, region, caseCount, windowHours, severity, immediateAlert) {
    // Check for existing active alert for this disease+region
    const existingAlerts = await db
        .collection('alerts')
        .where('disease', '==', disease)
        .where('region', '==', region)
        .where('status', '==', 'active')
        .limit(1)
        .get();
    if (!existingAlerts.empty) {
        // Update existing alert if new severity is higher
        const existingAlert = existingAlerts.docs[0];
        const existingData = existingAlert.data();
        const newSeverityIdx = SEVERITY_ORDER.indexOf(severity);
        const existingSeverityIdx = SEVERITY_ORDER.indexOf(existingData.severity);
        await existingAlert.ref.update({
            caseCount,
            severity: newSeverityIdx > existingSeverityIdx ? severity : existingData.severity,
            immediateAlert: existingData.immediateAlert || immediateAlert,
        });
        logger.info('Updated existing alert', { disease, region, caseCount, severity });
    }
    else {
        // Create new alert
        await db.collection('alerts').add({
            disease,
            region,
            caseCount,
            threshold: caseCount,
            windowHours,
            severity,
            status: 'active',
            immediateAlert,
            createdAt: firestore_2.FieldValue.serverTimestamp(),
        });
        logger.info('Created new alert', { disease, region, caseCount, severity, immediateAlert });
    }
}
/**
 * Triggered when a new report is created.
 * Checks case counts against disease thresholds and creates alerts.
 */
exports.onReportWrite = (0, firestore_1.onDocumentCreated)('reports/{reportId}', async (event) => {
    var _a;
    const report = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!report)
        return;
    const { disease, region, isImmediateReport } = report;
    const reportId = event.params.reportId;
    logger.info('Processing new report', { reportId, disease, region });
    // 1. Handle immediate report flags (e.g., bloody diarrhea, measles rash)
    if (isImmediateReport) {
        logger.info('Immediate report flag detected', { reportId, disease });
        await createAlertIfNeeded(disease, region, 1, 168, 'critical', true);
    }
    // 2. Look up case definition for threshold rules
    const caseDefSnapshot = await db
        .collection('caseDefinitions')
        .where('disease', '==', disease)
        .where('active', '==', true)
        .limit(1)
        .get();
    if (caseDefSnapshot.empty) {
        logger.warn('No active case definition found for disease', { disease });
        return;
    }
    const caseDef = caseDefSnapshot.docs[0].data();
    const thresholds = caseDef.thresholds || [];
    // 3. Check each threshold rule
    for (const threshold of thresholds) {
        const cutoffDate = new Date(Date.now() - threshold.windowHours * 60 * 60 * 1000);
        const cutoffTimestamp = firestore_2.Timestamp.fromDate(cutoffDate);
        // Count reports in the time window for this disease+region
        const reportsInWindow = await db
            .collection('reports')
            .where('disease', '==', disease)
            .where('region', '==', region)
            .where('createdAt', '>=', cutoffTimestamp)
            .get();
        const caseCount = reportsInWindow.size;
        if (caseCount >= threshold.count) {
            logger.info('Threshold exceeded', {
                disease,
                region,
                caseCount,
                threshold: threshold.count,
                windowHours: threshold.windowHours,
                severity: threshold.severity,
            });
            await createAlertIfNeeded(disease, region, caseCount, threshold.windowHours, threshold.severity, false);
        }
    }
});
//# sourceMappingURL=onReportWrite.js.map