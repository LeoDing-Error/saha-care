export type NotificationType = 'alert' | 'report_status' | 'user_status' | 'message';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface AppNotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    description: string;
    priority: NotificationPriority;
    read: boolean;
    deleted: boolean;
    sourceId: string;
    sourceCollection: string;
    region: string;
    createdAt: Date;
}
