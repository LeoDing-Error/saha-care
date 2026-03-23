import { Bell, MessageSquare, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useState } from 'react';

interface Notification {
  id: string;
  type: 'message' | 'alert' | 'info';
  title: string;
  description: string;
  from?: string;
  timestamp: string;
  read: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'alert',
      title: 'High Priority: Cholera Outbreak Alert',
      description: 'Multiple suspected cases reported in Khan Younis. Immediate verification required.',
      timestamp: '5 minutes ago',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message from Volunteer',
      description: 'Sarah Ahmed sent a clarification request on Report #2847',
      from: 'Sarah Ahmed',
      timestamp: '12 minutes ago',
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'alert',
      title: 'Report Submission Deadline',
      description: 'Weekly summary report due in 2 hours',
      timestamp: '1 hour ago',
      read: false,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'message',
      title: 'Volunteer Registration Pending',
      description: 'Mohammed Ibrahim from Rafah Region has submitted registration',
      from: 'Mohammed Ibrahim',
      timestamp: '2 hours ago',
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'info',
      title: 'Report Verified Successfully',
      description: 'Your verification of Report #2845 (Measles) has been submitted',
      timestamp: '3 hours ago',
      read: true,
      priority: 'low'
    },
    {
      id: '6',
      type: 'message',
      title: 'Question from Volunteer',
      description: 'Layla Hassan asked about case definition for Acute Watery Diarrhea',
      from: 'Layla Hassan',
      timestamp: '4 hours ago',
      read: true,
      priority: 'medium'
    },
    {
      id: '7',
      type: 'alert',
      title: 'System Sync Completed',
      description: 'All offline reports have been synchronized successfully',
      timestamp: '5 hours ago',
      read: true,
      priority: 'low'
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string, priority?: string) => {
    if (type === 'alert') {
      return priority === 'high' ? (
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
      ) : (
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <Bell className="w-5 h-5 text-orange-600" />
        </div>
      );
    }
    if (type === 'message') {
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={markAllAsRead}
            className="h-10"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
          All ({notifications.length})
        </Button>
        <Button variant="outline" size="sm">
          Messages ({notifications.filter(n => n.type === 'message').length})
        </Button>
        <Button variant="outline" size="sm">
          Alerts ({notifications.filter(n => n.type === 'alert').length})
        </Button>
        <Button variant="outline" size="sm">
          Unread ({unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
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
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'} transition-all hover:shadow-md cursor-pointer`}
              onClick={() => markAsRead(notification.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {notification.from ? (
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-teal-100 text-teal-700 text-sm">
                        {notification.from.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    getIcon(notification.type, notification.priority)
                  )}

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
                          <span className="text-xs text-gray-500">{notification.timestamp}</span>
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
