"use strict";
/**
 * Saha-Care Cloud Functions
 *
 * Server-side logic for user approval, report handling, and data aggregation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserApproval = void 0;
const firebase_functions_1 = require("firebase-functions");
// Set global options for cost control
(0, firebase_functions_1.setGlobalOptions)({ maxInstances: 10 });
// Export Cloud Functions
var onUserApproval_1 = require("./onUserApproval");
Object.defineProperty(exports, "onUserApproval", { enumerable: true, get: function () { return onUserApproval_1.onUserApproval; } });
//# sourceMappingURL=index.js.map