import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { AppNotification } from '../types';
import {
    subscribeToNotifications,
    subscribeToUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification as deleteNotificationService,
} from '../services/notifications';
import { subscribeToConversations } from '../services/conversations';
import { toast } from 'sonner';

interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    totalUnreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    totalUnreadCount: 0,
    loading: true,
    markAsRead: async () => {},
    markAllAsRead: async () => {},
    deleteNotification: async () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { firebaseUser } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [conversationUnread, setConversationUnread] = useState(0);
    const [loading, setLoading] = useState(true);
    const prevIdsRef = useRef<Set<string>>(new Set());
    const initialLoadRef = useRef(true);

    const userId = firebaseUser?.uid;

    // Subscribe to notifications list
    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsub = subscribeToNotifications(userId, (notifs) => {
            setNotifications(notifs);
            setLoading(false);

            // Toast on new arrivals (skip initial load)
            if (initialLoadRef.current) {
                initialLoadRef.current = false;
                prevIdsRef.current = new Set(notifs.map(n => n.id));
                return;
            }

            const prevIds = prevIdsRef.current;
            const newNotifs = notifs.filter(n => !prevIds.has(n.id) && !n.read);
            newNotifs.forEach(n => {
                toast(n.title, { description: n.description });
            });
            prevIdsRef.current = new Set(notifs.map(n => n.id));
        });

        return () => {
            unsub();
            initialLoadRef.current = true;
        };
    }, [userId]);

    // Subscribe to unread count
    useEffect(() => {
        if (!userId) {
            setUnreadCount(0);
            return;
        }

        const unsub = subscribeToUnreadCount(userId, setUnreadCount);
        return unsub;
    }, [userId]);

    // Subscribe to conversation unread counts
    useEffect(() => {
        if (!userId) {
            setConversationUnread(0);
            return;
        }

        const unsub = subscribeToConversations(userId, (convs) => {
            const total = convs.reduce((sum, conv) => {
                return sum + (conv.unreadCounts?.[userId] || 0);
            }, 0);
            setConversationUnread(total);
        });

        return unsub;
    }, [userId]);

    const totalUnreadCount = unreadCount + conversationUnread;

    const markAsRead = async (id: string) => {
        await markNotificationRead(id);
    };

    const markAllAsRead = async () => {
        if (!userId) return;
        await markAllNotificationsRead(userId);
    };

    const handleDelete = async (id: string) => {
        await deleteNotificationService(id);
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                totalUnreadCount,
                loading,
                markAsRead,
                markAllAsRead,
                deleteNotification: handleDelete,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
