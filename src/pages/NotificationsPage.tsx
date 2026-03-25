import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useNotifications } from '../contexts/NotificationContext';
import { formatTimeAgo } from '../utils/formatTime';
import type { AppNotification } from '../types';

type FilterTab = 'all' | 'messages' | 'alerts' | 'unread';

export function NotificationsPage() {
    const navigate = useNavigate();
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const filteredNotifications = notifications.filter((n) => {
        switch (activeTab) {
            case 'messages': return n.type === 'message';
            case 'alerts': return n.type === 'alert';
            case 'unread': return !n.read;
            default: return true;
        }
    });

    const getIcon = (notification: AppNotification) => {
        if (notification.type === 'alert') {
            return notification.priority === 'high' ? (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
            ) : (
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-600" />
                </div>
            );
        }
        if (notification.type === 'message') {
            return (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
            );
        }
        return (
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
        );
    };

    const handleClick = async (notification: AppNotification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        if (notification.type === 'message' && notification.sourceId) {
            navigate(`/messages?conversationId=${notification.sourceId}`);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-4xl">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-9 w-24" />
                    ))}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    const tabs: { key: FilterTab; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: notifications.length },
        { key: 'messages', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
        { key: 'alerts', label: 'Alerts', count: notifications.filter(n => n.type === 'alert').length },
        { key: 'unread', label: 'Unread', count: unreadCount },
    ];

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl text-gray-900">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                            : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={markAllAsRead} className="h-10">
                        Mark All as Read
                    </Button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {tabs.map((tab) => (
                    <Button
                        key={tab.key}
                        variant={activeTab === tab.key ? 'default' : 'outline'}
                        size="sm"
                        className={activeTab === tab.key ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label} ({tab.count})
                    </Button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600">No notifications</p>
                            <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredNotifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'} transition-all hover:shadow-md cursor-pointer`}
                            onClick={() => handleClick(notification)}
                        >
                            <CardContent className="py-4">
                                <div className="flex items-start gap-4">
                                    {getIcon(notification)}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </span>
                                                    {notification.priority === 'high' && (
                                                        <Badge className="bg-red-100 text-red-700 text-xs hover:bg-red-100">
                                                            High Priority
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 hover:bg-red-50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                            >
                                                <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
