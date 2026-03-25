import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { createNotification } from './notifications';

if (getApps().length === 0) {
    initializeApp();
}

const db = getFirestore();

/**
 * When a new message is created in a conversation, notify the other participant.
 */
export const onMessageCreate = onDocumentCreated(
    'conversations/{conversationId}/messages/{messageId}',
    async (event) => {
        const data = event.data?.data();
        if (!data) return;

        const { conversationId } = event.params;
        const { senderId, senderName, text } = data;

        // Get the parent conversation to find the other participant
        const convDoc = await db.collection('conversations').doc(conversationId).get();
        if (!convDoc.exists) {
            logger.warn('Conversation not found', { conversationId });
            return;
        }

        const conv = convDoc.data()!;
        const recipientId = conv.volunteerId === senderId ? conv.supervisorId : conv.volunteerId;

        if (!recipientId) {
            logger.warn('Could not determine recipient', { conversationId, senderId });
            return;
        }

        const truncatedText = text && text.length > 100 ? text.substring(0, 100) + '...' : text || '';

        await createNotification({
            userId: recipientId,
            type: 'message',
            title: `New message from ${senderName || 'Unknown'}`,
            description: truncatedText,
            priority: 'medium',
            sourceId: conversationId,
            sourceCollection: 'conversations',
            region: conv.region || '',
        });

        logger.info('Message notification created', { conversationId, recipientId });
    }
);
