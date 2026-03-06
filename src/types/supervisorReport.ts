/**
 * Firestore supervisor report document.
 * Submitted by supervisors as summary/narrative reports.
 */
export interface SupervisorReport {
    id: string;
    title: string;
    description: string;
    region: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
}
