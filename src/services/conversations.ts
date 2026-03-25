import {
    collection,
    addDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    getDocs,
    getDoc,
    increment,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Conversation, Message, Report } from '../types';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_SUBCOLLECTION = 'messages';
const REPORTS_COLLECTION = 'reports';

/**
 * Subscribe to all conversations for a given user (volunteer or supervisor).
 */
export function subscribeToConversations(
    userId: string,
    callback: (convs: Conversation[]) => void,
    onError?: (error: Error) => void
): Unsubscribe {
    const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participantIds', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const convs = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            lastMessageAt: d.data().lastMessageAt?.toDate() || new Date(),
            reportDate: d.data().reportDate?.toDate() || new Date(),
            createdAt: d.data().createdAt?.toDate() || new Date(),
        })) as Conversation[];
        callback(convs);
    }, (error) => {
        console.error('Failed to load conversations:', error);
        onError?.(error);
    });
}

/**
 * Subscribe to messages within a conversation.
 */
export function subscribeToMessages(
    conversationId: string,
    callback: (msgs: Message[]) => void,
    onError?: (error: Error) => void
): Unsubscribe {
    const q = query(
        collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUBCOLLECTION),
        orderBy('sentAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            sentAt: d.data().sentAt?.toDate() || new Date(),
        })) as Message[];
        callback(msgs);
    }, (error) => {
        console.error('Failed to load messages:', error);
        onError?.(error);
    });
}

/**
 * Send a message in a conversation and update the parent conversation metadata.
 */
export async function sendMessage(
    conversationId: string,
    data: {
        senderId: string;
        senderName: string;
        senderRole: 'volunteer' | 'supervisor';
        text: string;
    },
    otherParticipantId: string
): Promise<void> {
    const messagesRef = collection(
        db,
        CONVERSATIONS_COLLECTION,
        conversationId,
        MESSAGES_SUBCOLLECTION
    );

    await addDoc(messagesRef, {
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: data.senderRole,
        text: data.text,
        sentAt: serverTimestamp(),
        read: false,
    });

    const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(convRef, {
        lastMessage: data.text,
        lastMessageAt: serverTimestamp(),
        [`unreadCounts.${otherParticipantId}`]: increment(1),
    });
}

/**
 * Create a new conversation linked to a report.
 */
export async function createConversation(
    data: Omit<Conversation, 'id' | 'lastMessage' | 'lastMessageAt' | 'unreadCounts' | 'createdAt'>
): Promise<string> {
    const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), {
        ...data,
        unreadCounts: {
            [data.volunteerId]: 0,
            [data.supervisorId]: 0,
        },
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Find an existing conversation for a given report.
 */
export async function findConversationByReport(
    reportId: string
): Promise<Conversation | null> {
    const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('reportId', '==', reportId),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const d = snapshot.docs[0];
    return {
        id: d.id,
        ...d.data(),
        lastMessageAt: d.data().lastMessageAt?.toDate() || new Date(),
        reportDate: d.data().reportDate?.toDate() || new Date(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
    } as Conversation;
}

/**
 * Reset unread count for a user in a conversation.
 */
export async function markConversationRead(
    conversationId: string,
    userId: string
): Promise<void> {
    const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(convRef, {
        [`unreadCounts.${userId}`]: 0,
    });
}

/**
 * Fetch a single report by ID.
 */
export async function getReport(reportId: string): Promise<Report | null> {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    const snapshot = await getDoc(reportRef);
    if (!snapshot.exists()) return null;

    return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate() || new Date(),
        verifiedAt: snapshot.data().verifiedAt?.toDate(),
    } as Report;
}
