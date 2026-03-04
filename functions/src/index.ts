/**
 * Saha-Care Cloud Functions
 * 
 * Server-side logic for user approval, report handling, and data aggregation.
 */

import { setGlobalOptions } from 'firebase-functions';

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

// Export Cloud Functions
export { onUserApproval } from './onUserApproval';
