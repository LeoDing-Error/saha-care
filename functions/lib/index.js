"use strict";
/**
 * Saha-Care Cloud Functions
 *
 * Server-side logic for user approval, report handling, and data aggregation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateCases = exports.onReportWrite = exports.onUserApproval = void 0;
const firebase_functions_1 = require("firebase-functions");
// Set global options for cost control
(0, firebase_functions_1.setGlobalOptions)({ maxInstances: 10 });
// Export Cloud Functions
var onUserApproval_1 = require("./onUserApproval");
Object.defineProperty(exports, "onUserApproval", { enumerable: true, get: function () { return onUserApproval_1.onUserApproval; } });
var onReportWrite_1 = require("./onReportWrite");
Object.defineProperty(exports, "onReportWrite", { enumerable: true, get: function () { return onReportWrite_1.onReportWrite; } });
var aggregateCases_1 = require("./aggregateCases");
Object.defineProperty(exports, "aggregateCases", { enumerable: true, get: function () { return aggregateCases_1.aggregateCases; } });
//# sourceMappingURL=index.js.map