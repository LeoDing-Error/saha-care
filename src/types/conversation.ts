export interface Conversation {
    id: string;
    reportId: string;
    reportDisease: string;
    reportDate: Date;
    volunteerId: string;
    volunteerName: string;
    supervisorId: string;
    supervisorName: string;
    participantIds: string[];
    region: string;
    lastMessage: string;
    lastMessageAt: Date;
    unreadCounts: Record<string, number>;
    createdAt: Date;
}

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: 'volunteer' | 'supervisor';
    text: string;
    sentAt: Date;
    read: boolean;
}
